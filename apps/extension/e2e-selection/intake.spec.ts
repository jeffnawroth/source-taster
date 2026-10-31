// SPDX-License-Identifier: AGPL-3.0-or-later
import { createServer, type Server } from "node:http";
import { once } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { buildExtension } from "../e2e/support/build.ts";
import { launchChromium, Panel, until } from "../e2e/support/chromium.ts";

const port = process.env.SOURCE_TASTER_E2E_WEB_PORT ?? "5293";
const origin = `http://127.0.0.1:${port}`;
let server: Server;
let build: Awaited<ReturnType<typeof buildExtension>>;

// Chrome's headless debugging protocol cannot choose OS context-menu entries.
// In a test-owned package only, capture the browser's public event boundary,
// forwarding every API to Chrome. The test delivers a selectionText event with
// a debugger user gesture; real native sidePanel.open and runtime ports run.
const boundaryProbe = `
globalThis.selectionEdge = { registrations: [], clicked: null, inClick: false, openedInClick: false };
if (chrome.contextMenus) {
  const create = chrome.contextMenus.create.bind(chrome.contextMenus);
  chrome.contextMenus.create = (item, ...rest) => {
    selectionEdge.registrations.push(item);
    return create(item, ...rest);
  };
  const add = chrome.contextMenus.onClicked.addListener.bind(chrome.contextMenus.onClicked);
  chrome.contextMenus.onClicked.addListener = (listener) => {
    selectionEdge.clicked = listener;
    return add(listener);
  };
}
chrome.action.onClicked.addListener(() => {
  selectionEdge.inClick = true;
  selectionEdge.clicked(...selectionEdge.event);
  selectionEdge.inClick = false;
});
const open = chrome.sidePanel.open.bind(chrome.sidePanel);
chrome.sidePanel.open = (...args) => {
  selectionEdge.openedInClick = selectionEdge.inClick;
  return open(...args).catch((error) => { selectionEdge.openError = String(error); throw error; });
};
`;

test.beforeAll(async () => {
  server = createServer((req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(req.url === "/frame"
      ? '<p id="selection">Frame Reference (2024). Native intake.</p>'
      : '<p id="selection">Page Reference (2024). Native intake.</p><textarea aria-label="Source field">Field Reference (2024). Native intake.</textarea><iframe src="/frame" title="Source frame"></iframe>');
  });
  server.listen(Number(port), "127.0.0.1");
  await once(server, "listening");
  build = await buildExtension("chromium", {
    SOURCE_TASTER_EXTENSION_API_URL: `http://127.0.0.1:${process.env.SOURCE_TASTER_E2E_API_PORT ?? "3901"}`,
    SOURCE_TASTER_EXTENSION_WEBSITE_URL: origin,
  });
  const file = join(build.outDir, "background.js");
  await writeFile(file, boundaryProbe + await readFile(file, "utf8"));
});
test.afterAll(async () => {
  await build?.remove();
  await new Promise<void>((resolve) => server?.close(() => resolve()));
});

test("ordinary-page selection opens the native panel synchronously and stays local until Check", async () => {
  const profile = await mkdtemp(join(tmpdir(), "st93-selection-"));
  const browser = await launchChromium(build.outDir, profile);
  let background: Panel | undefined;
  let panel: Panel | undefined;
  try {
    const page = browser.context.pages()[0]!;
    const requests: string[] = [];
    browser.context.on("request", (request) => requests.push(request.url()));
    await page.goto(origin);
    const selectionText = await page.locator("#selection").evaluate((node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);
      return selection.toString();
    });
    const { targetInfos } = await browser.browser.send("Target.getTargets") as {
      targetInfos: { targetId: string; url: string }[];
    };
    const worker = targetInfos.find((t) => t.url === `${browser.origin}/background.js`)!;
    background = await Panel.attach(browser.browser, worker.targetId, worker.url);
    await until(() => background!.evaluate<boolean>("!!selectionEdge.clicked"), "The selection menu was not registered");
    const registrations = await background.evaluate<object[]>("selectionEdge.registrations");
    expect(registrations).toContainEqual({ id: "check-selected-text", title: "Check selected text", contexts: ["selection"] });
    const windowId = await background.evaluate<number>("chrome.windows.getCurrent().then(w => w.id)");
    await background.evaluate(`chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: false})`);
    await background.evaluate(`selectionEdge.event = [{menuItemId: "check-selected-text", selectionText: ${JSON.stringify(selectionText)}, pageUrl: "https://unrelated.invalid/not-input"}, {windowId: ${windowId}, id: 1}]`);
    await browser.triggerAction();
    expect(await background.evaluate("selectionEdge.openedInClick")).toBe(true);
    const target = await until(async () => { const error = await background!.evaluate<string | undefined>("selectionEdge.openError"); if (error) throw new Error(error); return (await browser.panelTargets())[0]; }, "Selection did not open the native side panel");
    panel = await Panel.attach(browser.browser, target.targetId, target.url);
    await until(async () => await panel!.call<string>(await panel!.find("textbox", "Reference"), "function() { return this.value; }") === selectionText, "Selection did not fill the shared input");
    expect(await panel.query("region", "Reference details")).toEqual([]);
    expect(requests.filter((url) => /\/(?:v2|v1)\//.test(url))).toEqual([]);
    expect(panel.requests.filter((r) => /\/(?:v2|v1)\//.test(r.url))).toEqual([]);
    expect(await browser.storage()).toEqual({});
  } finally {
    panel?.detach();
    background?.detach();
    await browser.close();
    await rm(profile, { recursive: true, force: true });
  }
});
