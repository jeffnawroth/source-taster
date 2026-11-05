// SPDX-License-Identifier: AGPL-3.0-or-later
// Native Chromium side panel driver. Playwright does not expose the side panel
// as a Page, so the real panel target is attached over the browser CDP pipe.
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import {
  chromium,
  type BrowserContext,
  type CDPSession,
  type Worker,
} from "@playwright/test";

const axeSource = readFile(
  createRequire(import.meta.url).resolve("axe-core/axe.min.js"),
  "utf8",
);
export const wcagTags = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22a",
  "wcag22aa",
];
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function until<T>(
  probe: () => Promise<T | undefined | false> | T | undefined | false,
  message: string,
  timeout = 15_000,
): Promise<T> {
  const end = Date.now() + timeout;
  let last: unknown;
  while (Date.now() < end) {
    try {
      const value = await probe();
      if (value) return value;
    } catch (error) {
      last = error;
    }
    await wait(100);
  }
  const reason = last instanceof Error ? last.message : JSON.stringify(last);
  throw new Error(`${message}${last ? `: ${reason}` : ""}`);
}

export interface Request {
  url: string;
  method: string;
  headers: Record<string, string>;
  postData?: string;
}
export interface Response {
  url: string;
  status: number;
}

export class Panel {
  readonly requests: Request[] = [];
  readonly responses: Response[] = [];
  private next = 0;
  private readonly pending = new Map<
    number,
    { resolve(value: unknown): void; reject(error: Error): void }
  >();
  private readonly listener: (event: {
    sessionId: string;
    message: string;
  }) => void;
  private readonly browser: CDPSession;
  readonly sessionId: string;
  readonly targetId: string;
  readonly url: string;
  constructor(
    browser: CDPSession,
    sessionId: string,
    targetId: string,
    url: string,
  ) {
    this.browser = browser;
    this.sessionId = sessionId;
    this.targetId = targetId;
    this.url = url;
    this.listener = (event) => {
      if (event.sessionId !== this.sessionId) return;
      const message = JSON.parse(event.message) as {
        id?: number;
        method?: string;
        params?: Record<string, never>;
        result?: unknown;
        error?: { message: string };
      };
      if (message.id !== undefined) {
        const call = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) call?.reject(new Error(message.error.message));
        else call?.resolve(message.result);
      } else if (message.method === "Network.requestWillBeSent") {
        const request = (message.params as unknown as { request: Request })
          .request;
        this.requests.push(request);
      } else if (message.method === "Network.responseReceived") {
        const response = (message.params as unknown as { response: Response })
          .response;
        this.responses.push({ url: response.url, status: response.status });
      }
    };
    browser.on("Target.receivedMessageFromTarget", this.listener);
  }
  static async attach(browser: CDPSession, targetId: string, url: string) {
    const { sessionId } = await browser.send("Target.attachToTarget", {
      targetId,
      flatten: false,
    });
    const panel = new Panel(browser, sessionId, targetId, url);
    await panel.send("Network.enable");
    await panel.send("Runtime.enable");
    return panel;
  }
  send<T = unknown>(method: string, params: object = {}): Promise<T> {
    const id = ++this.next;
    const result = new Promise<unknown>((resolve, reject) =>
      this.pending.set(id, { resolve, reject }),
    );
    void this.browser
      .send("Target.sendMessageToTarget", {
        sessionId: this.sessionId,
        message: JSON.stringify({ id, method, params }),
      })
      .catch((error: Error) => this.pending.get(id)?.reject(error));
    return result as Promise<T>;
  }
  async evaluate<T>(expression: string): Promise<T> {
    const { result, exceptionDetails } = await this.send<{
      result: { value: T };
      exceptionDetails?: { exception?: { description?: string }; text: string };
    }>("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (exceptionDetails)
      throw new Error(
        exceptionDetails.exception?.description ?? exceptionDetails.text,
      );
    return result.value;
  }
  /** Accessible role and exact name, resolved by the browser accessibility tree. */
  async query(role: string, name?: string | RegExp) {
    const { root } = await this.send<{ root: { backendNodeId: number } }>(
      "DOM.getDocument",
      { depth: 0 },
    );
    const { nodes } = await this.send<{
      nodes: {
        ignored: boolean;
        name?: { value: string };
        backendDOMNodeId?: number;
      }[];
    }>("Accessibility.queryAXTree", {
      backendNodeId: root.backendNodeId,
      role,
      ...(typeof name === "string" ? { accessibleName: name } : {}),
    });
    return nodes
      .filter(
        (node) =>
          !node.ignored &&
          node.backendDOMNodeId !== undefined &&
          (!(name instanceof RegExp) || name.test(node.name?.value ?? "")),
      )
      .map((node) => node.backendDOMNodeId!);
  }
  async find(role: string, name?: string | RegExp, timeout = 15_000) {
    return until(
      async () => (await this.query(role, name))[0],
      `No ${role} named ${String(name)} in the side panel`,
      timeout,
    );
  }
  async call<T>(backendNodeId: number, fn: string, args: unknown[] = []) {
    const { object } = await this.send<{ object: { objectId: string } }>(
      "DOM.resolveNode",
      { backendNodeId },
    );
    const { result, exceptionDetails } = await this.send<{
      result: { value: T };
      exceptionDetails?: { text: string };
    }>("Runtime.callFunctionOn", {
      objectId: object.objectId,
      functionDeclaration: fn,
      arguments: args.map((value) => ({ value })),
      awaitPromise: true,
      returnByValue: true,
    });
    if (exceptionDetails) throw new Error(exceptionDetails.text);
    return result.value;
  }
  async text(role: string, name?: string | RegExp) {
    return this.call<string>(
      await this.find(role, name),
      "function () { return this.innerText; }",
    );
  }
  /** Backend node of the element a page expression returns. */
  async locate(expression: string, timeout = 15_000) {
    return until(
      async () => {
        const { result } = await this.send<{ result: { objectId?: string } }>(
          "Runtime.evaluate",
          { expression },
        );
        if (!result.objectId) return undefined;
        const { node } = await this.send<{ node: { backendNodeId: number } }>(
          "DOM.describeNode",
          { objectId: result.objectId },
        );
        return node.backendNodeId;
      },
      `Nothing matched ${expression}`,
      timeout,
    );
  }
  /** A trusted pointer click at the element's rendered centre. */
  async click(role: string, name?: string | RegExp) {
    await this.press(() => this.find(role, name));
  }
  async clickNode(node: number) {
    await this.press(() => Promise.resolve(node));
  }
  /**
   * Playwright-style actionability before a trusted press. The panel lays out
   * asynchronously (fetches and renders move controls for a while after they
   * first appear), so a centre measured once and pressed a few CDP round trips
   * later can land on whatever moved underneath it. Wait, bounded, until the
   * node's centre has held still across two animation frames and the point
   * hits the node itself; the press is then sent exactly once.
   */
  private async press(resolve: () => Promise<number>) {
    const { x, y } = await until(async () => {
      const node = await resolve();
      await this.send("DOM.scrollIntoViewIfNeeded", { backendNodeId: node });
      const before = await this.centre(node);
      // A hidden panel never paints; the timeout keeps this bounded.
      await this.evaluate(
        `new Promise((done) => { const t = setTimeout(done, 300); requestAnimationFrame(() => requestAnimationFrame(() => { clearTimeout(t); done(0); })); })`,
      );
      const after = await this.centre(node);
      if (!before || !after || before.x !== after.x || before.y !== after.y)
        return false;
      const hit = await this.call<boolean>(
        node,
        `function (x, y) {
            const top = document.elementFromPoint(x, y);
            return !!top && (top === this || this.contains(top));
          }`,
        [after.x, after.y],
      );
      return hit && after;
    }, "The pointer target never held still where it can be clicked");
    await this.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    for (const type of ["mousePressed", "mouseReleased"])
      await this.send("Input.dispatchMouseEvent", {
        type,
        x,
        y,
        button: "left",
        clickCount: 1,
      });
  }
  /** Rendered centre of the node's first box, or undefined while it has none. */
  private async centre(node: number) {
    const { quads } = await this.send<{ quads: number[][] }>(
      "DOM.getContentQuads",
      { backendNodeId: node },
    );
    const quad = quads[0];
    if (!quad) return undefined;
    return {
      x: (quad[0]! + quad[2]! + quad[4]! + quad[6]!) / 4,
      y: (quad[1]! + quad[3]! + quad[5]! + quad[7]!) / 4,
    };
  }
  /** Focus by click, replace the value, then insert text as trusted input. */
  async fill(role: string, name: string | RegExp | undefined, text: string) {
    await this.click(role, name);
    await this.call(
      await this.find(role, name),
      "function () { this.select(); }",
    );
    await this.send("Input.insertText", { text });
  }
  /** Same semantics as Playwright selectOption for a native select. */
  async select(role: string, name: string | RegExp, value: string) {
    await this.call(
      await this.find(role, name),
      `function (value) {
        this.focus();
        this.value = value;
        this.dispatchEvent(new Event("input", { bubbles: true }));
        this.dispatchEvent(new Event("change", { bubbles: true }));
      }`,
      [value],
    );
  }
  async waitForText(
    role: string,
    name: string | RegExp | undefined,
    text: string | RegExp | ((value: string) => boolean),
    timeout = 15_000,
  ) {
    return until(
      async () => {
        const value = await this.text(role, name);
        const matches =
          typeof text === "string"
            ? value.includes(text)
            : text instanceof RegExp
              ? text.test(value)
              : text(value);
        return matches && value;
      },
      `${role} ${String(name)} never contained ${String(text)}`,
      timeout,
    );
  }
  async axe(tags = wcagTags) {
    await this.evaluate(`${await axeSource};0`);
    return this.evaluate<{ id: string; nodes: string[] }[]>(
      `axe.run(document, { runOnly: { type: "tag", values: ${JSON.stringify(tags)} } })
        .then((r) => r.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => String(n.target)) })))`,
    );
  }
  async screenshot(path: string) {
    const { data } = await this.send<{ data: string }>(
      "Page.captureScreenshot",
      {
        format: "png",
      },
    );
    await writeFile(path, Buffer.from(data, "base64"));
  }
  async reload() {
    await this.send("Page.reload");
    await wait(200);
    await until(
      () => this.evaluate<boolean>(`document.readyState === "complete"`),
      "Side panel did not reload",
    );
  }
  detach() {
    this.browser.off("Target.receivedMessageFromTarget", this.listener);
    for (const call of this.pending.values())
      call.reject(new Error("Side panel detached"));
    this.pending.clear();
  }
}

export interface NativeChromium {
  context: BrowserContext;
  id: string;
  origin: string;
  browser: CDPSession;
  version: string;
  serviceWorker(): Promise<Worker>;
  /** Dispatches the extension toolbar action on the active tab target. */
  triggerAction(): Promise<void>;
  openPanel(): Promise<Panel>;
  panelTargets(): Promise<{ targetId: string; url: string }[]>;
  contexts(): Promise<{ contextType: string; documentUrl?: string }[]>;
  storage(): Promise<Record<string, unknown>>;
  setStorage(values: Record<string, unknown>): Promise<void>;
  close(): Promise<void>;
}

export async function launchChromium(
  extension: string,
  profile: string,
  locale = "en-GB",
): Promise<NativeChromium> {
  const context = await chromium.launchPersistentContext(profile, {
    channel: "chromium",
    headless: true,
    locale,
    args: [
      `--disable-extensions-except=${extension}`,
      `--load-extension=${extension}`,
      "--enable-unsafe-extension-debugging",
      // Page emulation does not reach the side panel; set the browser language.
      `--lang=${locale}`,
    ],
  });
  try {
    const serviceWorker = async () =>
      context
        .serviceWorkers()
        .find((w) => w.url().endsWith("/background.js")) ??
      (await context.waitForEvent("serviceworker", { timeout: 15_000 }));
    const id = new URL((await serviceWorker()).url()).host;
    const origin = `chrome-extension://${id}`;
    const browser = await context.browser()!.newBrowserCDPSession();
    const { product } = (await browser.send("Browser.getVersion")) as {
      product: string;
    };
    // The action is not dispatched on the never-navigated initial blank tab.
    const tab = context.pages()[0] ?? (await context.newPage());
    await tab.goto(
      "data:text/html,<title>Source Taster native test tab</title>",
    );
    const panelTargets = async () =>
      (
        (await browser.send("Target.getTargets")) as {
          targetInfos: { targetId: string; type: string; url: string }[];
        }
      ).targetInfos
        .filter((t) => t.type === "page" && t.url === `${origin}/panel.html`)
        .map(({ targetId, url }) => ({ targetId, url }));
    const triggerAction = async () => {
      const { targetInfos } = (await browser.send("Target.getTargets", {
        filter: [{ type: "tab" }],
      })) as {
        targetInfos: {
          targetId: string;
          embedderData?: { tabActive?: boolean };
        }[];
      };
      // The side panel host is also a tab-type target; act on the browser tab.
      const active = targetInfos.find((t) => t.embedderData?.tabActive);
      await browser.send("Extensions.triggerAction", {
        id,
        targetId: active!.targetId,
      });
    };
    return {
      context,
      id,
      origin,
      browser,
      version: product,
      serviceWorker,
      triggerAction,
      panelTargets,
      async openPanel() {
        // A user click right after startup races the async registration too;
        // tests click once the browser reports the action opens the panel.
        await until(
          async () =>
            (await serviceWorker()).evaluate(
              async () =>
                (
                  await (
                    globalThis as unknown as {
                      chrome: {
                        sidePanel: {
                          getPanelBehavior(): Promise<{
                            openPanelOnActionClick?: boolean;
                          }>;
                        };
                      };
                    }
                  ).chrome.sidePanel.getPanelBehavior()
                ).openPanelOnActionClick,
            ),
          "The toolbar action never opened the side panel",
        );
        const before = new Set((await panelTargets()).map((t) => t.targetId));
        await triggerAction();
        const target = await until(
          async () =>
            (await panelTargets()).find((t) => !before.has(t.targetId)),
          "Toolbar action did not open the native side panel",
        );
        const panel = await Panel.attach(browser, target.targetId, target.url);
        await until(
          () => panel.evaluate<boolean>(`document.readyState === "complete"`),
          "Side panel did not load",
        );
        return panel;
      },
      async contexts() {
        return (await serviceWorker()).evaluate(() =>
          (
            globalThis as unknown as {
              chrome: {
                runtime: {
                  getContexts(
                    filter: object,
                  ): Promise<{ contextType: string; documentUrl?: string }[]>;
                };
              };
            }
          ).chrome.runtime.getContexts({}),
        );
      },
      // Fixtures read and seed real extension storage from the trusted background.
      async storage() {
        return (await serviceWorker()).evaluate(() =>
          (
            globalThis as unknown as {
              chrome: {
                storage: {
                  local: { get(keys: null): Promise<Record<string, unknown>> };
                };
              };
            }
          ).chrome.storage.local.get(null),
        );
      },
      async setStorage(values) {
        await (
          await serviceWorker()
        ).evaluate(
          (values) =>
            (
              globalThis as unknown as {
                chrome: {
                  storage: {
                    local: { set(values: object): Promise<void> };
                  };
                };
              }
            ).chrome.storage.local.set(values),
          values,
        );
      },
      close: () => context.close(),
    };
  } catch (error) {
    await context.close();
    throw error;
  }
}
