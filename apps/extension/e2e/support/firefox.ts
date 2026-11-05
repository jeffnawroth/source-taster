// SPDX-License-Identifier: AGPL-3.0-or-later
// Native Firefox sidebar driver over W3C WebDriver BiDi. The sidebar runs in
// the extension process and is not a BiDi browsing context, so the test acts
// like a user: trusted pointer and key input on the browser window, reading
// the sidebar through the browser's own accessibility tree.
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { until } from "./chromium.ts";

export const firefoxBinary =
  process.env.SOURCE_TASTER_FIREFOX_BINARY ??
  "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";

async function freePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address() as { port: number };
  server.close();
  await once(server, "close");
  return port;
}

export interface Accessible {
  role: string;
  name: string;
  value: string;
  /** Centre in browser-window CSS pixels. */
  x: number;
  y: number;
}

/** The sidebar's accessible tree, flattened, with the live accessibles kept
 * alongside for scrolling and text. */
const accessibleTree = `
  const service = Cc["@mozilla.org/accessibilityService;1"].getService(Ci.nsIAccessibilityService);
  const panel = document.getElementById("sidebar")?.contentDocument?.getElementById("webext-panels-browser");
  const nodes = [], objects = [];
  const centre = (node) => {
    const x = {}, y = {}, w = {}, h = {};
    try { node.getBoundsInCSSPixels(x, y, w, h); } catch { return [0, 0]; }
    return [x.value + w.value / 2 - window.mozInnerScreenX, y.value + h.value / 2 - window.mozInnerScreenY];
  };
  const walk = (node) => {
    if (!node) return;
    let value = "";
    try { value = node.value ?? ""; } catch {}
    const [x, y] = centre(node);
    nodes.push({ role: service.getStringRole(node.role), name: node.name ?? "", value, x, y });
    objects.push(node);
    for (let child = node.firstChild; child; child = child.nextSibling) walk(child);
  };
  if (panel) walk(service.getAccessibleFor(panel));
  const matches = (node, role, name) =>
    node.role === role &&
    (typeof name === "string" ? node.name === name : new RegExp(name.source, name.flags).test(node.name));
`;
const matcher = (name: string | RegExp) =>
  JSON.stringify(
    typeof name === "string"
      ? name
      : { source: name.source, flags: name.flags },
  );

export interface NativeFirefox {
  /** Test-owned page selection followed by the real native context-menu click. */
  selectFromPage(
    url: string,
    selector: string,
    menuLabel: string,
  ): Promise<void>;
  version: string;
  extensionId: string;
  /** Trusted pointer click on the extension's toolbar button. */
  clickToolbarButton(): Promise<void>;
  sidebar(): Promise<{ open: boolean; url: string | null }>;
  tree(): Promise<Accessible[]>;
  /** Scrolls the first matching accessible into view and returns its centre. */
  find(
    role: string,
    name: string | RegExp,
    timeout?: number,
  ): Promise<Accessible>;
  /** Text of all leaves below the first matching accessible. */
  text(role: string, name: string | RegExp): Promise<string>;
  click(node: Accessible): Promise<void>;
  type(text: string): Promise<void>;
  screenshot(path: string): Promise<void>;
  /** Answers the browser's own optional-permission prompt the way a user
   * would, by pressing its Allow or Deny button. */
  answerPermissionPrompt(allow: boolean): Promise<void>;
  /** Optional data collection types the browser currently holds as granted. */
  grantedDataCollection(): Promise<string[]>;
  /** Withdraws a granted data collection type the way the add-on settings do. */
  revokeDataCollection(type: string): Promise<void>;
  close(): Promise<void>;
}

export async function launchFirefox(extension: string): Promise<NativeFirefox> {
  const profile = await mkdtemp(join(tmpdir(), "st92-firefox-profile-"));
  const port = await freePort();
  const firefox: ChildProcess = spawn(
    firefoxBinary,
    [
      "-profile",
      profile,
      "-no-remote",
      "-headless",
      `--remote-debugging-port=${port}`,
      // Chrome-scope evaluation reads the sidebar's accessible tree.
      "--remote-allow-system-access",
      "about:blank",
    ],
    {
      env: { ...process.env, MOZ_REMOTE_ALLOW_SYSTEM_ACCESS: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";
  firefox.stdout!.on("data", (b) => (output += String(b)));
  firefox.stderr!.on("data", (b) => (output += String(b)));
  const close = async () => {
    socket?.close();
    if (firefox.exitCode === null && firefox.signalCode === null) {
      const exited = once(firefox, "exit");
      firefox.kill("SIGTERM");
      await exited;
    }
    await rm(profile, { recursive: true, force: true });
  };
  let socket: WebSocket | undefined;
  try {
    await until(
      () => {
        if (firefox.exitCode !== null) throw new Error(output);
        return output.includes("WebDriver BiDi listening");
      },
      "Firefox did not start WebDriver BiDi",
      30_000,
    );
    socket = new WebSocket(`ws://127.0.0.1:${port}/session`);
    const ws = socket;
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });
    let next = 0;
    const pending = new Map<
      number,
      (message: { result?: unknown; error?: string; message?: string }) => void
    >();
    ws.onmessage = (event) => {
      const message = JSON.parse(String(event.data)) as {
        id?: number;
        result?: unknown;
        error?: string;
        message?: string;
      };
      if (message.id !== undefined) pending.get(message.id)?.(message);
    };
    const send = async <T>(method: string, params: object = {}) => {
      const id = ++next;
      const message = await new Promise<{
        result?: unknown;
        error?: string;
        message?: string;
      }>((resolve) => {
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
      pending.delete(id);
      if (message.error)
        throw new Error(`${method}: ${message.error} ${message.message}`);
      return message.result as T;
    };
    const session = await send<{ capabilities: { browserVersion: string } }>(
      "session.new",
      { capabilities: {} },
    );
    const { extension: extensionId } = await send<{ extension: string }>(
      "webExtension.install",
      { extensionData: { type: "path", path: extension } },
    );
    const { contexts } = await send<{ contexts: { context: string }[] }>(
      "browsingContext.getTree",
      { "moz:scope": "chrome" },
    );
    const window = contexts[0]!.context;
    const evaluate = async <T>(expression: string) => {
      const { result, exceptionDetails } = await send<{
        result?: { value?: unknown };
        exceptionDetails?: { text: string };
      }>("script.evaluate", {
        expression,
        target: { context: window },
        awaitPromise: true,
      });
      if (exceptionDetails) throw new Error(exceptionDetails.text);
      return JSON.parse(result!.value as string) as T;
    };
    const pointer = (x: number, y: number) =>
      send("input.performActions", {
        context: window,
        actions: [
          {
            type: "pointer",
            id: "mouse",
            parameters: { pointerType: "mouse" },
            actions: [
              { type: "pointerMove", x: Math.round(x), y: Math.round(y) },
              { type: "pointerDown", button: 0 },
              { type: "pointerUp", button: 0 },
            ],
          },
        ],
      });
    const tree = () =>
      evaluate<Accessible[]>(
        `(() => { ${accessibleTree} return JSON.stringify(nodes); })()`,
      );
    return {
      async selectFromPage(url, selector, menuLabel) {
        const { contexts } = await send<{ contexts: { context: string }[] }>(
          "browsingContext.getTree",
        );
        const content = contexts[0]!.context;
        await send("browsingContext.navigate", {
          context: content,
          url,
          wait: "complete",
        });
        const { result } = await send<{ result: { value: string } }>(
          "script.evaluate",
          {
            target: { context: content },
            awaitPromise: true,
            expression: `(async () => {
            let node;
            for (let tries = 0; tries < 150; tries++) {
              node = document.querySelector(${JSON.stringify(selector)});
              if (node) break;
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            if (!node) throw new Error("The test selection surface did not render");
            node.scrollIntoView();
            node.focus();
            if (node instanceof HTMLTextAreaElement) node.select();
            else {
              const range = document.createRange(); range.selectNodeContents(node);
              const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
            }
            const r = node.getBoundingClientRect();
            return JSON.stringify({ x: r.x + 8, y: r.y + 8 });
          })()`,
          },
        );
        const { x, y } = JSON.parse(result.value) as { x: number; y: number };
        await send("input.performActions", {
          context: content,
          actions: [
            {
              type: "pointer",
              id: "menu-mouse",
              parameters: { pointerType: "mouse" },
              actions: [
                { type: "pointerMove", x: Math.round(x), y: Math.round(y) },
                { type: "pointerDown", button: 2 },
                { type: "pointerUp", button: 2 },
              ],
            },
          ],
        });
        const [menuX, menuY] = await until(
          () =>
            evaluate<[number, number] | false>(`(() => {
          const menu = document.getElementById("contentAreaContextMenu");
          if (menu?.state !== "open") return "false";
          const item = [...menu.querySelectorAll("menuitem")].find(n => n.getAttribute("label") === ${JSON.stringify(menuLabel)});
          if (!item) return "false";
          const r = item.getBoundingClientRect();
          return JSON.stringify([r.x + r.width / 2, r.y + r.height / 2]);
        })()`),
          "Native selection context-menu entry was not shown",
        );
        await pointer(menuX, menuY);
      },
      version: session.capabilities.browserVersion,
      extensionId,
      async clickToolbarButton() {
        const [x, y] = await until(
          () =>
            evaluate<[number, number] | false>(`(() => {
              const button = document.querySelector("[id$='-browser-action']");
              if (!button) return "false";
              const r = button.getBoundingClientRect();
              return JSON.stringify([r.x + r.width / 2, r.y + r.height / 2]);
            })()`),
          "The extension toolbar button is not shown",
        );
        await pointer(x, y);
      },
      sidebar: () =>
        evaluate(`JSON.stringify({
          open: SidebarController.isOpen,
          url: document.getElementById("sidebar")?.contentDocument
            ?.getElementById("webext-panels-browser")?.currentURI?.spec ?? null,
        })`),
      tree,
      async find(role, name, timeout = 15_000) {
        return until(
          () =>
            evaluate<Accessible | false>(`(async () => {
              ${accessibleTree}
              const index = nodes.findIndex((n) => matches(n, ${JSON.stringify(role)}, ${matcher(name)}));
              if (index < 0) return "false";
              objects[index].scrollTo(Ci.nsIAccessibleScrollType.SCROLL_TYPE_ANYWHERE);
              await new Promise((r) => setTimeout(r, 300));
              const [x, y] = centre(objects[index]);
              return JSON.stringify({ ...nodes[index], x, y });
            })()`),
          `No ${role} named ${String(name)} in the sidebar`,
          timeout,
        );
      },
      text: (role, name) =>
        evaluate<string>(`(() => {
          ${accessibleTree}
          const index = nodes.findIndex((n) => matches(n, ${JSON.stringify(role)}, ${matcher(name)}));
          if (index < 0) return JSON.stringify("");
          const leaves = [];
          const collect = (node) => {
            if (service.getStringRole(node.role) === "text leaf") leaves.push(node.name ?? "");
            for (let child = node.firstChild; child; child = child.nextSibling) collect(child);
          };
          collect(objects[index]);
          return JSON.stringify(leaves.join("\\n"));
        })()`),
      async click(node) {
        await pointer(node.x, node.y);
      },
      async type(text) {
        await send("input.performActions", {
          context: window,
          actions: [
            {
              type: "key",
              id: "keyboard",
              actions: [...text].flatMap((value) => [
                { type: "keyDown", value },
                { type: "keyUp", value },
              ]),
            },
          ],
        });
      },
      async answerPermissionPrompt(allow) {
        await until(
          () =>
            evaluate<boolean>(`(() => {
              const prompt = document.getElementById("addon-webext-permissions-notification");
              const button = prompt?.querySelector(${JSON.stringify(allow ? ".popup-notification-primary-button" : ".popup-notification-secondary-button")});
              if (!button) return "false";
              button.click();
              return "true";
            })()`),
          "The browser's permission prompt was not shown",
        );
      },
      grantedDataCollection: () =>
        evaluate<string[]>(`(async () => {
          const { ExtensionPermissions } = ChromeUtils.importESModule("resource://gre/modules/ExtensionPermissions.sys.mjs");
          return JSON.stringify((await ExtensionPermissions.get(${JSON.stringify(extensionId)})).data_collection);
        })()`),
      async revokeDataCollection(type) {
        await evaluate(`(async () => {
          const { ExtensionPermissions } = ChromeUtils.importESModule("resource://gre/modules/ExtensionPermissions.sys.mjs");
          // The extension is the emitter, as for the add-on settings page: it
          // updates its live permissions and fires permissions.onRemoved.
          const extension = WebExtensionPolicy.getByID(${JSON.stringify(extensionId)}).extension;
          await ExtensionPermissions.remove(${JSON.stringify(extensionId)}, { permissions: [], origins: [], data_collection: [${JSON.stringify(type)}] }, extension);
          return JSON.stringify(true);
        })()`);
      },
      async screenshot(path) {
        const { data } = await send<{ data: string }>(
          "browsingContext.captureScreenshot",
          { context: window },
        );
        await writeFile(path, Buffer.from(data, "base64"));
      },
      close,
    };
  } catch (error) {
    await close();
    throw error;
  }
}
