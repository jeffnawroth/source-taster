// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  createServer,
  type Server,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { once } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import {
  startDoiFixtures,
  physicsReference,
} from "../../server/test/support/doi-fixtures.ts";
import { pdf } from "../../server/test/support/documents.ts";
import { startTestService } from "../../server/test/support/service.ts";
import { buildExtension } from "../e2e/support/build.ts";
import { launchFirefox } from "../e2e/support/firefox.ts";
import { launchChromium, Panel, until } from "../e2e/support/chromium.ts";

const port = process.env.SOURCE_TASTER_E2E_WEB_PORT ?? "5293";
const origin = `http://127.0.0.1:${port}`;
let server: Server;
let frameServer: Server;
let build: Awaited<ReturnType<typeof buildExtension>>;

// Chrome's headless debugging protocol cannot choose OS context-menu entries.
// In a test-owned package only, capture the browser's public event boundary,
// forwarding every API to Chrome. The test delivers a selectionText event with
// a debugger user gesture; real native sidePanel.open and runtime ports run.
const boundaryProbe = `
globalThis.selectionEdge = { registrations: [], clicked: null, inClick: false, opens: [], ports: [] };
const connect = chrome.runtime.onConnect.addListener.bind(chrome.runtime.onConnect);
chrome.runtime.onConnect.addListener = (listener) => connect((port) => {
  selectionEdge.ports.push(port);
  listener(port);
});
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
  if (!selectionEdge.event) return;
  selectionEdge.inClick = true;
  selectionEdge.clicked(...selectionEdge.event);
  selectionEdge.inClick = false;
});
const open = chrome.sidePanel.open.bind(chrome.sidePanel);
chrome.sidePanel.open = (...args) => {
  selectionEdge.opens.push(selectionEdge.inClick);
  return open(...args).catch((error) => { selectionEdge.openError = String(error); throw error; });
};
`;

test.beforeAll(async () => {
  const respond = (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    if (req.url === "/reference.pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.end(pdf([["PDF Reference (2024). Native intake."]]));
      return;
    }
    if (req.url === "/long") {
      res.end(
        `<textarea aria-label="Long selection">${"A".repeat(16_385)}</textarea>`,
      );
      return;
    }
    res.end(
      req.url === "/frame"
        ? '<p id="selection">Frame Reference (2024). Native intake.</p>'
        : `<p id="selection">Page Reference (2024). Native intake.</p><p contenteditable id="editable">Editable Reference (2024). Native intake.</p><textarea aria-label="Source field">Field Reference (2024). Native intake.</textarea><iframe src="/frame" title="Source frame"></iframe><iframe src="http://127.0.0.1:${process.env.SOURCE_TASTER_E2E_AUX_PORT ?? "3902"}/frame" title="Cross-origin frame"></iframe>`,
    );
  };
  frameServer = createServer(respond);
  frameServer.listen(
    Number(process.env.SOURCE_TASTER_E2E_AUX_PORT ?? "3902"),
    "127.0.0.1",
  );
  await once(frameServer, "listening");
  server = createServer(respond);
  server.listen(Number(port), "127.0.0.1");
  await once(server, "listening");
  build = await buildExtension("chromium", {
    SOURCE_TASTER_EXTENSION_API_URL: `http://127.0.0.1:${process.env.SOURCE_TASTER_E2E_API_PORT ?? "3901"}`,
    SOURCE_TASTER_EXTENSION_WEBSITE_URL: origin,
  });
  const file = join(build.outDir, "background.js");
  await writeFile(file, boundaryProbe + (await readFile(file, "utf8")));
});
test.afterAll(async () => {
  await build?.remove();
  if (frameServer?.listening)
    await new Promise<void>((resolve) => frameServer.close(() => resolve()));
  if (server?.listening)
    await new Promise<void>((resolve) => server.close(() => resolve()));
});

async function withIntake(
  run: (tools: {
    panel: Panel;
    disconnect: () => Promise<void>;
    select: (text: string) => Promise<void>;
    browser: Awaited<ReturnType<typeof launchChromium>>;
  }) => Promise<void>,
  {
    allowRequests = false,
    surface = "page",
    language = "en",
  }: {
    allowRequests?: boolean;
    surface?: "page" | "frame" | "cross-frame" | "field" | "editable";
    language?: "en" | "de";
  } = {},
) {
  const profile = await mkdtemp(join(tmpdir(), "st93-selection-"));
  const browser = await launchChromium(
    build.outDir,
    profile,
    language === "de" ? "de-DE" : "en-GB",
  );

  let background: Panel | undefined;
  let panel: Panel | undefined;
  try {
    const page = browser.context.pages()[0]!;
    const requests: string[] = [];
    browser.context.on("request", (request) => requests.push(request.url()));
    await page.goto(origin);
    const targetPage =
      surface === "frame"
        ? page.frameLocator('iframe[title="Source frame"]')
        : surface === "cross-frame"
          ? page.frameLocator('iframe[title="Cross-origin frame"]')
          : page;
    const selectionText = await targetPage
      .locator(
        surface === "field"
          ? "textarea"
          : surface === "editable"
            ? "#editable"
            : "#selection",
      )
      .evaluate((node) => {
        if (node instanceof HTMLTextAreaElement) {
          node.focus();
          node.select();
          return node.value.slice(node.selectionStart, node.selectionEnd);
        }
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection()!;
        selection.removeAllRanges();
        selection.addRange(range);
        return selection.toString();
      });
    const { targetInfos } = (await browser.browser.send(
      "Target.getTargets",
    )) as {
      targetInfos: { targetId: string; url: string }[];
    };
    const worker = targetInfos.find(
      (t) => t.url === `${browser.origin}/background.js`,
    )!;
    background = await Panel.attach(
      browser.browser,
      worker.targetId,
      worker.url,
    );
    await until(
      () => background!.evaluate<boolean>("!!selectionEdge.clicked"),
      "The selection menu was not registered",
    );
    const registrations = await background.evaluate<object[]>(
      "selectionEdge.registrations",
    );
    const menuLanguage = await background.evaluate<string>(
      "chrome.i18n.getUILanguage()",
    );
    expect(registrations).toContainEqual({
      id: "check-selected-text",
      title: menuLanguage.startsWith("de")
        ? "Ausgewählten Text prüfen"
        : "Check selected text",
      contexts: ["selection"],
    });
    const windowId = await background.evaluate<number>(
      "chrome.windows.getCurrent().then(w => w.id)",
    );
    await background.evaluate(
      `chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: false})`,
    );
    await background.evaluate(
      `selectionEdge.event = [{menuItemId: "check-selected-text", selectionText: ${JSON.stringify(selectionText)}, pageUrl: "https://unrelated.invalid/not-input"}, {windowId: ${windowId}, id: 1}]`,
    );
    await browser.triggerAction();
    // Extensions.triggerAction returns once the browser has queued the action
    // event, not once the worker's listener has run (a busy or cold worker
    // runs it later). Wait for the open call itself, then assert that it was
    // made synchronously inside the click, i.e. with the user gesture intact.
    // A regression that opens after an await records `false` and fails here
    // instead of timing out.
    expect(
      await until(async () => {
        const opens = await background!.evaluate<boolean[]>(
          "selectionEdge.opens",
        );
        return opens.length > 0 && opens;
      }, "The toolbar action never reached the selection handler to open the side panel"),
    ).toEqual([true]);
    const target = await until(async () => {
      const error = await background!.evaluate<string | undefined>(
        "selectionEdge.openError",
      );
      if (error) throw new Error(error);
      return (await browser.panelTargets())[0];
    }, "Selection did not open the native side panel");
    panel = await Panel.attach(browser.browser, target.targetId, target.url);
    await until(
      async () =>
        (await panel!.call<string>(
          await panel!.find("textbox", /^(Reference|Referenz)$/),
          "function() { return this.value; }",
        )) === selectionText,
      "Selection did not fill the shared input",
    );
    // Once the intake has settled, the click still made exactly one open, and
    // no later open slipped in outside the gesture.
    expect(await background.evaluate<boolean[]>("selectionEdge.opens")).toEqual(
      [true],
    );
    if (language === "de")
      await panel.preferences({ language: "de" });
    await run({
      panel,
      browser,
      disconnect: async () => {
        await background!.evaluate(
          "selectionEdge.ports.forEach(port => port.disconnect()); selectionEdge.ports = []",
        );
      },
      select: async (text) => {
        await background!.evaluate(
          `selectionEdge.event = [{menuItemId: "check-selected-text", selectionText: ${JSON.stringify(text)}}, {windowId: ${windowId}}]`,
        );
        await browser.triggerAction();
      },
    });
    if (!allowRequests)
      expect(requests.filter((url) => /\/(?:v2|v1)\//.test(url))).toEqual([]);
    if (!allowRequests)
      expect(panel.requests.filter((r) => /\/(?:v2|v1)\//.test(r.url))).toEqual(
        [],
      );
    expect(await browser.storage()).toEqual(
      language === "de"
        ? {
            "source-taster-guest-preferences-v1": {
              language: "de",
              citationStyle: "apa",
              theme: "system",
            },
          }
        : {},
    );
  } finally {
    panel?.detach();
    background?.detach();
    await browser.close();
    await rm(profile, { recursive: true, force: true });
  }
}

test("ordinary-page selection opens the native panel synchronously and stays local until Check", async () => {
  await withIntake(async ({ panel }) => {
    expect(await panel.query("region", "Reference detail")).toEqual([]);
    expect(await panel.text("main")).toContain("Page selection");
  });
});

test("replacing an unsent draft offers one-step Undo", async () => {
  await withIntake(async ({ panel, select }) => {
    await panel.fill("textbox", "Reference", "My unsent draft\nSecond line");
    await select("Replacement Reference\nWith native line breaks");
    await until(
      async () =>
        (await panel.call(
          await panel.find("textbox", "Reference"),
          "function() { return this.value; }",
        )) === "Replacement Reference\nWith native line breaks",
      "Replacement did not arrive",
    );
    await panel.click("button", "Undo selection replacement");
    expect(
      await panel.call(
        await panel.find("textbox", "Reference"),
        "function() { return this.value; }",
      ),
    ).toBe("My unsent draft\nSecond line");
    expect(await panel.query("button", "Undo selection replacement")).toEqual(
      [],
    );
  });
});

test("empty native selection keeps the draft and explains copy and paste", async () => {
  await withIntake(async ({ panel, select }) => {
    await panel.fill("textbox", "Reference", "Keep this draft");
    await select("");
    await panel.waitForText(
      "status",
      undefined,
      "Copy and paste the text. No selection was taken over.",
    );
    expect(
      await panel.call(
        await panel.find("textbox", "Reference"),
        "function() { return this.value; }",
      ),
    ).toBe("Keep this draft");
    expect(await panel.query("button", "Undo selection replacement")).toEqual(
      [],
    );
    expect(await panel.text("main")).toContain(
      "Copy and paste the text if the page uses its own menus or canvas editors, the field is a password field, or a private window lacks extension permission.",
    );
  });
});

test("selection replaces an imported draft and Undo restores its preview", async () => {
  const service = await startTestService(
    Number(process.env.SOURCE_TASTER_E2E_API_PORT ?? "3901"),
  );
  const directory = await mkdtemp(join(tmpdir(), "st93-library-"));
  const file = join(directory, "references.bib");
  await writeFile(
    file,
    "@article{old, title={Old library title}, author={Smith, Ada}, year={2024}}",
  );
  try {
    await withIntake(
      async ({ panel, select }) => {
        const node = await panel.locate(
          `document.querySelector('input[accept=".bib,.bibtex,.ris"]')`,
        );
        await panel.send("DOM.setFileInputFiles", {
          backendNodeId: node,
          files: [file],
        });
        await panel.waitForText(
          "region",
          "Recognized references",
          "Old library title",
        );
        await select("New plain text draft");
        await until(
          async () =>
            (await panel.call(
              await panel.find("textbox", "Reference"),
              "function() { return this.value; }",
            )) === "New plain text draft",
          "New selection did not arrive",
        );
        expect(await panel.query("region", "Recognized references")).toEqual(
          [],
        );
        expect(await panel.text("main")).not.toContain("references.bib");
        await panel.click("button", "Undo selection replacement");
        await panel.waitForText(
          "region",
          "Recognized references",
          "Old library title",
        );
        expect(await panel.text("main")).toContain("references.bib");
      },
      { allowRequests: true },
    );
  } finally {
    await service.stop();
    await rm(directory, { recursive: true, force: true });
  }
});

for (const surface of ["frame", "cross-frame", "field", "editable"] as const) {
  test(`${surface} selection fills the native panel without a Check`, async () => {
    await withIntake(
      async ({ panel }) => {
        expect(await panel.query("region", "Reference detail")).toEqual([]);
      },
      { surface },
    );
  });
}

test("German panel notices and Undo are localized", async () => {
  await withIntake(
    async ({ panel, select }) => {
      await select("");
      await panel.waitForText(
        "status",
        undefined,
        "Kopieren und fügen Sie den Text ein. Es wurde keine Auswahl übernommen.",
      );
      await select("Neue Auswahl");
      await panel.click("button", "Auswahlübernahme rückgängig machen");
    },
    { language: "de" },
  );
});

test("selection keeps the running Check reachable and its finished evidence intact", async () => {
  const fixtures = await startDoiFixtures();
  const held = fixtures.hold("/api/handles/10.1038/nphys1170");
  const service = await startTestService(
    Number(process.env.SOURCE_TASTER_E2E_API_PORT ?? "3901"),
    50,
    { ...fixtures.env, SOURCE_TASTER_CLIENT_LEASE_MS: "1500" },
  );
  try {
    await withIntake(
      async ({ panel, select }) => {
        await panel.fill("textbox", "Reference", physicsReference);
        await panel.click("button", "Check reference");
        await held.arrived;
        await panel.waitForText("grid", "References", "Running");
        const create = () =>
          panel.requests.filter(
            (r) => r.method === "POST" && r.url.endsWith("/v2/checks"),
          );
        expect(create()).toHaveLength(1);
        await select("Draft received while running");
        await until(
          async () =>
            (await panel.call(
              await panel.find("textbox", "Reference"),
              "function() { return this.value; }",
            )) === "Draft received while running",
          "Selection while running was lost",
        );
        await panel.waitForText("grid", "References", "Running");
        expect(await panel.query("button", "Cancel check")).toHaveLength(1);
        held.release();
        await panel.waitForText("grid", "References", "Correct");
        await panel.click("button", /^Open reference 1:/);
        const before = await panel.text("region", "Reference detail");
        await select("Draft received after completion");
        await until(
          async () =>
            (await panel.call(
              await panel.find("textbox", "Reference"),
              "function() { return this.value; }",
            )) === "Draft received after completion",
          "Selection after completion was lost",
        );
        expect(await panel.text("region", "Reference detail")).toBe(before);
        expect(create()).toHaveLength(1);
        expect(
          panel.requests.filter(
            (r) => r.method === "POST" && r.url.endsWith("/cancel"),
          ),
        ).toEqual([]);
      },
      { allowRequests: true },
    );
  } finally {
    held.release();
    await service.stop();
    await fixtures.stop();
  }
});

test("Firefox native selection opens the sidebar, warns at its cap and reads the built-in PDF viewer", async () => {
  const firefoxBuild = await buildExtension("firefox", {
    SOURCE_TASTER_EXTENSION_API_URL: `http://127.0.0.1:${process.env.SOURCE_TASTER_E2E_API_PORT ?? "3901"}`,
    SOURCE_TASTER_EXTENSION_WEBSITE_URL: origin,
  });
  const firefox = await launchFirefox(firefoxBuild.outDir);
  try {
    test.info().annotations.push({
      type: "browser",
      description: `Firefox ${firefox.version}`,
    });
    await firefox.selectFromPage(origin, "#selection", "Check selected text");
    await until(
      async () =>
        (await firefox.find("entry", "Reference")).value ===
        "Page Reference (2024). Native intake.",
      "Firefox selection did not arrive",
    );
    expect(await firefox.text("region", "Reference detail")).toBe("");
    await firefox.selectFromPage(
      `${origin}/long`,
      "textarea",
      "Check selected text",
    );
    await until(
      async () =>
        (await firefox.find("entry", "Reference")).value.length === 16_384,
      "Firefox native cap was not preserved",
    );
    await until(
      async () =>
        (await firefox.tree()).some(
          (node) =>
            node.name ===
            "Paste the text or upload a file for longer lists. The selection may have been shortened.",
        ),
      "Firefox truncation notice was not shown",
    );
    await firefox.selectFromPage(
      `${origin}/reference.pdf`,
      ".textLayer span[role=presentation]",
      "Check selected text",
    );
    await until(
      async () =>
        (await firefox.find("entry", "Reference")).value ===
        "PDF Reference (2024). Native intake.",
      "Built-in PDF viewer selection did not arrive",
    );
    expect(await firefox.text("region", "Reference detail")).toBe("");
  } finally {
    await firefox.close();
    await firefoxBuild.remove();
  }
});

test("an open panel reconnects after the browser disconnects its runtime port", async () => {
  await withIntake(async ({ panel, select, disconnect }) => {
    await disconnect();
    await select("Selection after port disconnection");
    await until(
      async () =>
        (await panel.call(
          await panel.find("textbox", "Reference"),
          "function() { return this.value; }",
        )) === "Selection after port disconnection",
      "Open panel lost its selection connection after port disconnection",
    );
  });
});

test("Undo restores an unsent document draft visibly in its file input", async () => {
  const directory = await mkdtemp(join(tmpdir(), "st93-document-draft-"));
  const file = join(directory, "unsent.pdf");
  await writeFile(file, pdf([["Unsent document draft"]]));
  try {
    await withIntake(async ({ panel, select }) => {
      const node = await panel.locate(
        'document.getElementById("document-file")',
      );
      await panel.send("DOM.setFileInputFiles", {
        backendNodeId: node,
        files: [file],
      });
      await select("Replacement text draft");
      await until(
        async () =>
          (await panel.call(
            await panel.find("textbox", "Reference"),
            "function() { return this.value; }",
          )) === "Replacement text draft",
        "Selection did not replace the document draft",
      );
      expect(
        await panel.call(node, "function() { return this.files.length; }"),
      ).toBe(0);
      await panel.click("button", "Undo selection replacement");
      expect(
        await panel.call(node, "function() { return this.files[0]?.name; }"),
      ).toBe("unsent.pdf");
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("selection replaces a prepared bibliography draft and Undo restores its moved regions", async () => {
  const service = await startTestService(
    Number(process.env.SOURCE_TASTER_E2E_API_PORT ?? "3901"),
  );
  try {
    await withIntake(
      async ({ panel, select }) => {
        const first = "Doe, J. (2020). Signal maps. Example Press.";
        const second = "Roe, A. (2021). Careful systems. Example Press.";
        const original = `References\n${first}\n${second}`;
        await panel.fill("textbox", "Reference", original);
        await panel.structure();
        await panel.waitForText(
          "region",
          "Recognized references",
          "Signal maps",
        );
        await panel.fill(
          "spinbutton",
          "Region 1 start",
          String(original.indexOf(second)),
        );
        await select("New plain text selection");
        await until(async () => {
          const fields = await panel.query("textbox", "Reference");
          return (
            fields.length === 1 &&
            (await panel.call(
              fields[0]!,
              "function() { return this.value; }",
            )) === "New plain text selection"
          );
        }, "Selection did not replace the prepared bibliography draft");
        expect(await panel.query("spinbutton", "Region 1 start")).toEqual([]);
        expect(await panel.query("region", "Recognized references")).toEqual(
          [],
        );
        await panel.click("button", "Undo selection replacement");
        expect(
          await panel.call(
            await panel.find(
              "textbox",
              "Original document text — mark a region here",
            ),
            "function() { return this.value; }",
          ),
        ).toBe(original);
        expect(
          await panel.call(
            await panel.find("spinbutton", "Region 1 start"),
            "function() { return this.value; }",
          ),
        ).toBe(String(original.indexOf(second)));
        expect(
          panel.requests.filter(
            (r) => r.method === "POST" && r.url.endsWith("/v2/checks"),
          ),
        ).toEqual([]);
        expect(await panel.axe()).toEqual([]);
      },
      { allowRequests: true },
    );
  } finally {
    await service.stop();
  }
});
