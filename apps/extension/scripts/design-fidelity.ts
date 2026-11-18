// SPDX-License-Identifier: AGPL-3.0-or-later
// Companion to the public web gate: build and open the genuine SIDE_PANEL.
// API/worker and the web information origin are managed by the caller.
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Page } from "@playwright/test";
import { CheckResponse } from "@source-taster/contract-verification/v2";
import { buildExtension } from "../e2e/support/build.ts";
import { launchChromium, until, type Panel } from "../e2e/support/chromium.ts";
import { pins } from "../../web/design-sources.ts";
import {
  measure,
  compareMeasurements,
  pixelDiff,
  probesFor,
  tolerances,
  type Measurements,
  type Probe,
} from "../../web/scripts/design-fidelity/measurements.ts";
import {
  normalizePrototype,
  normalizeStructuringPrototype,
} from "../../web/scripts/design-fidelity/fixtures.ts";
import { readShellFixture } from "../../web/scripts/design-fidelity/normalization.ts";
import { interactions } from "../../web/scripts/design-fidelity/interactions.ts";
import {
  alignNativeShell,
  references,
  held,
} from "./design-fidelity/fixtures.ts";
import {
  measurementPage,
  nativeViewport,
} from "./design-fidelity/native-page.ts";
import { captureResponses } from "./design-fidelity/responses.ts";
import {
  appFontFaces,
  appFontSource,
} from "../../web/scripts/design-fidelity/fonts.ts";
import {
  readManualFixture,
  normalizeManualFixture,
} from "../../web/scripts/design-fidelity/manual-fixture.ts";
import {
  readListFixture,
  normalizeListFixture,
} from "../../web/scripts/design-fidelity/list-fixture.ts";
import { scrollAppEnd } from "../../web/scripts/design-fidelity/scroll.ts";
import {
  captureScrollCoverage,
  compareScrollCoverage,
  scrollCoverageDom,
  type ScrollCoverage,
} from "../../web/scripts/design-fidelity/scroll-coverage.ts";
import { normalizeBrand } from "../../web/scripts/design-fidelity/brand.ts";
import { normalizeAppUtilities } from "../../web/scripts/design-fidelity/theme.ts";
import {
  readAppFixture,
  normalizeAppFixture,
} from "../../web/scripts/design-fidelity/app.ts";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const args = process.argv.slice(2);
const option = (name: string) => {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--"))
    throw new Error(`Missing ${name} value`);
  return value;
};
const api = option("--api") ?? "http://127.0.0.1:5492";
const web = option("--web") ?? "http://127.0.0.1:5493";
const out = resolve(
  root,
  option("--out") ?? "apps/extension/test-results/design-fidelity",
);
const only = option("--only");
const stages = [
  "intake",
  "filled",
  "palette",
  "palette-query",
  "input-focus",
  "command-hover",
  "command-focus",
  "theme-hover",
  "theme-focus",
  "counted",
  "running",
  "done",
  "done-end",
  "detail",
  "detail-end",
  "menu",
  "export",
  ...interactions.map((item) => item.id),
];
const matrix = ["en", "de"].flatMap((lang) =>
  ["light", "dark"].flatMap((theme) =>
    stages.map((stage) => ({
      id: `native-${stage}-${theme}-${lang}`,
      stage,
      lang: lang as "en" | "de",
      theme: theme as "light" | "dark",
    })),
  ),
);
const selected = matrix.filter((state) => !only || state.id.includes(only));
if (!selected.length)
  throw new Error(`No native fidelity states match ${only}`);

const launcher = /^(Search or command|Suchen oder Befehl) …$/u;
const more = /^(More actions|Weitere Aktionen)$/u;
const exportItem = /^(Export|Exportieren)$/u;
const inputName = /^(Reference|Referenz)$/u;
const checkName = /^(Check reference|Referenz prüfen)$/u;
async function focus(panel: Panel, selector: string) {
  await panel.call(
    await panel.locate(`document.querySelector(${JSON.stringify(selector)})`),
    "function () { this.focus(); }",
  );
}
async function hover(panel: Panel, selector: string) {
  const point = await panel.call<{ x: number; y: number }>(
    await panel.locate(`document.querySelector(${JSON.stringify(selector)})`),
    "function () { const r = this.getBoundingClientRect(); return { x: r.x+r.width/2, y: r.y+r.height/2 }; }",
  );
  await panel.send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    ...point,
  });
}
async function settle(panel: Panel) {
  await panel.evaluate(`(async () => {
    await document.fonts.ready;
    await Promise.all(document.getAnimations().filter((a) =>
      a.effect?.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => null)));
    await new Promise((done) => setTimeout(done, 400));
  })()`);
}
async function builtAfter(panel: Panel, stage: string) {
  if (stage.startsWith("palette")) {
    await panel.click("button", launcher);
    if (stage === "palette-query") {
      // SearchField exposes searchbox, while the intake exposes textbox.
      // Resolve the actual overlay input so the background intake cannot win.
      const query = await panel.locate(
        "document.querySelector('.command-palette-search input')",
      );
      await panel.call(query, "function () { this.focus(); this.select(); }");
      await panel.send("Input.insertText", { text: "zzzz-no-command" });
      await panel.locate("document.querySelector('.command-palette-empty')");
    }
  }
  if (stage === "input-focus") await focus(panel, ".intake-textarea");
  if (stage === "command-focus") await focus(panel, ".command-trigger");
  if (stage === "command-hover") await hover(panel, ".command-trigger");
  if (stage === "theme-focus") {
    await panel.send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "Tab",
      code: "Tab",
      windowsVirtualKeyCode: 9,
    });
    await panel.send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "Tab",
      code: "Tab",
      windowsVirtualKeyCode: 9,
    });
    await focus(panel, ".theme-toggle");
  }
  if (stage === "theme-hover") await hover(panel, ".theme-toggle");
  if (
    ["menu", "export", "report", "reset", "edit-list", "menu-hover"].includes(
      stage,
    )
  ) {
    await panel.click("button", more);
    const item = {
      export: exportItem,
      report: /^(PDF report|PDF-Bericht)$/u,
      reset: /^(Reset|Zurücksetzen)$/u,
      "edit-list": /^(Edit reference list|Referenzliste bearbeiten)$/u,
    }[stage];
    if (item) await panel.click("menuitem", item);
    if (stage === "menu-hover") {
      const point = await panel.centreOf("menuitem", exportItem);
      await panel.send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        ...point,
      });
    }
  }
  if (stage === "detail-edit")
    await panel.click("button", /^(Edit fields|Felder bearbeiten)$/u);
  if (stage === "detail-manual")
    await panel.click("button", /^(Judge manually|Manuell beurteilen)$/u);
}
async function sourceAfter(page: Page, stage: string) {
  const interaction = interactions.find((item) => item.id === stage);
  if (interaction) return interaction.prototype(page);
  if (stage.startsWith("palette")) {
    await page.locator(".v-D .cmdf").click();
    if (stage === "palette-query")
      await page.locator(".v-D .pq input").fill("zzzz-no-command");
  }
  if (stage === "input-focus")
    await page.locator(".v-D .cmdbar textarea").focus();
  if (stage === "command-focus") await page.locator(".v-D .cmdf").focus();
  if (stage === "command-hover") await page.locator(".v-D .cmdf").hover();
  if (stage === "menu" || stage === "export") {
    await page.locator('[data-k="menubtn"]').click();
    if (stage === "export")
      await page.locator('[data-act="dlg:export"]').click();
  }
}
function stageFor(stage: string) {
  if (stage === "done-end") return "done";
  if (stage === "detail-end") return "detail";
  const interaction = interactions.find((item) => item.id === stage);
  if (interaction) return interaction.sourceStage;
  if (stage === "menu" || stage === "export") return "done";
  if (["counted", "running", "done", "detail"].includes(stage)) return stage;
  return "intake";
}
function nativeProbes(stage: string): Probe[] {
  const probes = probesFor(`app-${stage}`);
  if (stage === "intake")
    probes.push(
      {
        name: "intake-note",
        prototype: ".v-D .intake > .nrow span",
        built: ".workspace-notes .note-row span",
        geometry: ["x", "y", "width"],
        styles: [
          "font-family",
          "font-size",
          "font-weight",
          "letter-spacing",
          "line-height",
        ],
      },
      {
        name: "intake-hint",
        prototype: ".v-D #d-hint",
        built: ".intake-hint",
        geometry: ["x", "y", "width"],
        styles: [
          "font-family",
          "font-size",
          "font-weight",
          "letter-spacing",
          "line-height",
        ],
      },
    );
  if (stageFor(stage) === "intake")
    probes.push(
      {
        name: "native-source-segment",
        prototype: ".v-D .srcrow .seg",
        built: ".intake-segment",
        geometry: ["x", "y", "width", "height"],
        styles: [
          "padding-top",
          "padding-left",
          "column-gap",
          "border-top-width",
          "border-top-left-radius",
        ],
      },
      {
        name: "native-selection-control",
        prototype: '.v-D [data-act="src:selection"]',
        built: ".intake-segment button:last-child",
        geometry: ["x", "y", "width", "height"],
        styles: ["font-size", "font-weight"],
      },
    );
  // In a narrow detail the feed is intentionally replaced. Require the actual
  // visible detail probes instead of comparing absent strip/cards on both sides.
  if (stage.includes("detail"))
    return probes.filter(
      (probe) =>
        !["summary-strip", "reference-card", "reference-title"].includes(
          probe.name,
        ),
    );
  return probes;
}
const escape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
type Result = {
  id: string;
  passed: boolean;
  failures: string[];
  [key: string]: unknown;
};
const results: Result[] = [];
const rows: string[] = [];
let finished = false;
async function report() {
  const failed = results.filter((result) => !result.passed).length;
  await writeFile(
    join(out, "results.json"),
    JSON.stringify(
      {
        surface: "native-chromium-side-panel",
        pin: pins.structure,
        sourceParameters: "variant=D&calm=1&strip=a&still=1&w=360",
        api,
        web,
        tolerances,
        selected: selected.length,
        expected: matrix.length,
        completed: results.length,
        failed,
        runFinished: finished,
        complete: finished && !only && results.length === matrix.length,
        passed:
          finished && !only && results.length === matrix.length && !failed,
        partial: !!only,
        results,
      },
      null,
      2,
    ),
  );
  await writeFile(
    join(out, "index.html"),
    `<!doctype html><meta charset="utf-8"><title>Native extension measured fidelity</title>
    <style>body{font:14px system-ui;margin:16px}section{margin-bottom:48px}.pair{display:flex;gap:16px;align-items:start;overflow:auto}img{max-width:none;border:1px solid #ccc}figure{margin:0}figcaption{font-weight:600;margin:4px 0}.fail{color:#b00020}</style>
    <h1>Native Chromium side panel fidelity</h1><p>${results.length}/${selected.length} selected states; ${failed} failures. ${finished ? "Run finished." : "Run incomplete; no acceptance claim."} ${only ? "Partial diagnostic selection." : `Full ${matrix.length}-state matrix.`}</p>
    <p>Actual unpacked extension, real API/worker. Full-size PNG gate ≤1%, channel difference ≤16; geometry ≤1px; computed lengths ≤0.5px. Exact observed native viewport and explicit source fixture changes are recorded in results.json. Source CSS and fonts remain the oracle; images are never resized.</p>${rows.join("")}`,
  );
}

if (args.includes("--list")) {
  console.log(selected.map((state) => state.id).join("\n"));
} else {
  await mkdir(out, { recursive: true });
  await report();
  const work = await mkdtemp(join(tmpdir(), "st-native-fidelity-"));
  let build: Awaited<ReturnType<typeof buildExtension>> | undefined;
  try {
    // git-show is the authority, never an unverified file from /tmp.
    const source = join(work, "prototype-194.html");
    await writeFile(
      source,
      execFileSync(
        "git",
        ["show", `${pins.structure.commit}:${pins.structure.path}`],
        { cwd: root, maxBuffer: 64 * 1024 * 1024 },
      ),
    );
    build = await buildExtension("chromium", {
      SOURCE_TASTER_EXTENSION_API_URL: api,
      SOURCE_TASTER_EXTENSION_WEBSITE_URL: web,
    });
    for (const state of selected) {
      // A failed new capture must never present PNGs from an earlier run.
      for (const suffix of ["prototype", "built", "diff"])
        await rm(join(out, `${state.id}.${suffix}.png`), { force: true });
      const profile = await mkdtemp(join(work, "profile-"));
      const failures: string[] = [];
      const normalizations: unknown[] = [];
      const scrollCoverage: {
        prototype?: ScrollCoverage;
        built?: ScrollCoverage;
      } = {};
      let scrollComparisons:
        Awaited<ReturnType<typeof compareScrollCoverage>> | undefined;
      const measurements: { prototype: Measurements; built: Measurements } = {
        prototype: {},
        built: {},
      };
      const probes = nativeProbes(state.stage);
      let native: Awaited<ReturnType<typeof launchChromium>> | undefined;
      let panel: Panel | undefined;
      let capture: ReturnType<typeof captureResponses> | undefined;
      let viewport: Awaited<ReturnType<typeof nativeViewport>> | undefined;
      let pixels:
        Omit<Awaited<ReturnType<typeof pixelDiff>>, "image"> | undefined;
      let themeGlyphPixels:
        Omit<Awaited<ReturnType<typeof pixelDiff>>, "image"> | undefined;
      let target: unknown;
      let preferences: unknown;
      let cleanupCheck: string | undefined;
      try {
        native = await launchChromium(
          build.outDir,
          profile,
          state.lang === "de" ? "de-DE" : "en-US",
        );
        await native.setStorage({
          "source-taster-guest-preferences-v1": {
            language: state.lang,
            theme: state.theme,
            citationStyle: "apa",
          },
        });
        panel = await native.openPanel();
        const contexts = await native.contexts();
        if (
          !contexts.some(
            (context) =>
              context.contextType === "SIDE_PANEL" &&
              context.documentUrl === panel!.url,
          )
        )
          throw new Error("Native SIDE_PANEL context was not observed");
        target = {
          targetId: panel.targetId,
          url: panel.url,
          contexts,
          version: native.version,
        };
        viewport = await nativeViewport(panel);
        await panel.send("Emulation.setEmulatedMedia", {
          features: [
            { name: "prefers-reduced-motion", value: "reduce" },
            { name: "prefers-color-scheme", value: state.theme },
          ],
        });
        await panel.find("textbox", inputName);
        await until(
          () =>
            panel!.evaluate<boolean>(
              `document.documentElement.lang === ${JSON.stringify(state.lang)} && document.documentElement.dataset.theme === ${JSON.stringify(state.theme)}`,
            ),
          "Native stored language/theme not applied",
        );
        preferences = (await native.storage())[
          "source-taster-guest-preferences-v1"
        ];
        capture = captureResponses(native, panel);
        const base = stageFor(state.stage);
        const inputText =
          state.stage === "running" ? `${references}\n${held}` : references;
        const hold =
          base === "counted"
            ? await panel.holdRequests(/\/v2\/checks$/)
            : undefined;
        if (state.stage === "filled" || base !== "intake") {
          await panel.fill("textbox", inputName, inputText);
          if (base !== "intake") {
            await panel.click("button", checkName);
            if (base === "counted") {
              await panel.locate(
                "document.querySelector('[data-testid=counted-preview]')",
              );
              await until(
                () => hold!.held() > 0,
                "No actual Check POST held for counted capture",
              );
              await until(
                () => capture!.structuring(),
                "No actual structuring response captured",
              );
            } else {
              await panel.locate(
                "document.querySelector('.check-status')",
                120_000,
              );
              await until(
                () => capture!.check(),
                "No actual Check response captured",
              );
              cleanupCheck = capture.check()!.id;
              await until(
                () =>
                  panel!.evaluate<boolean>(
                    `/^(Finished|Abgeschlossen)$/.test(document.querySelector('.check-status > p.sr-only')?.textContent?.trim() ?? '') === ${base !== "running"}`,
                  ),
                "Check did not reach expected lifecycle",
                120_000,
              );
              if (base === "running")
                await until(
                  () =>
                    panel!.evaluate<boolean>(
                      // Wait for the ordinary witnesses to settle while the
                      // real held DOI remains pending. No sleep-based stage.
                      "Array.from(document.querySelectorAll('[role=progressbar]')).some((node) => Number(node.getAttribute('aria-valuenow')) === 8 && Number(node.getAttribute('aria-valuemax')) === 9)",
                    ),
                  "Running fixture never settled at eight completed / nine total",
                  120_000,
                );
            }
          }
        }
        if (base === "detail")
          await panel.click(
            "button",
            /^(Open reference 1:|Referenz 1 öffnen:)/u,
          );
        await builtAfter(panel, state.stage);
        await settle(panel);
        await capture.flush();
        let check = capture.check();
        if (check) {
          const body: unknown = await panel.evaluate(
            `fetch(${JSON.stringify(`${api}/v2/checks/${check.id}`)}).then(async (r) => { if (!r.ok) throw new Error('Fixture read HTTP '+r.status); return r.json(); })`,
          );
          check = CheckResponse.parse(body).data;
        }
        const fixture = await readShellFixture(measurementPage(panel));
        const appFixture = await readAppFixture(
          measurementPage(panel),
          check,
          state.lang,
        );
        const manualFixture = await readManualFixture(measurementPage(panel));
        const listFixture = await readListFixture(measurementPage(panel));
        if (state.stage.endsWith("-end"))
          normalizations.push(
            await scrollAppEnd(
              measurementPage(panel),
              false,
              base === "detail" ? "detail" : "feed",
            ),
          );
        measurements.built = await measure(
          measurementPage(panel),
          probes,
          false,
        );
        await panel.screenshot(join(out, `${state.id}.built.png`));
        scrollCoverage.built = await captureScrollCoverage(
          (request) =>
            measurementPage(panel!).evaluate(scrollCoverageDom, request),
          (path) => panel!.screenshot(path),
          out,
          state.id,
          false,
        );
        const page = await native.context.newPage();
        try {
          const observed = viewport.observed;
          await page.setViewportSize({
            width: observed.width,
            height: observed.height,
          });
          await page.emulateMedia({
            reducedMotion: "reduce",
            colorScheme: state.theme,
          });
          await page.route("https://fonts.googleapis.com/**", (route) =>
            route.abort(),
          );
          await page.goto(
            `${pathToFileURL(source).href}?variant=D&calm=1&strip=a&still=1&w=360&theme=${state.theme}&lang=${state.lang}&stage=${base}`,
          );
          // Only remove the review host/fake browser page and fit its panel
          // canvas to the observed native viewport. No .v-D product CSS edits.
          await page.addStyleTag({
            content: `#switcher,#devbar,#review,.panel-chrome{display:none!important}
            #stage[data-w="360"]{display:block!important}.fake-page{display:none!important}
            #stage[data-w="360"] .panel-wrap{border:0!important;height:100dvh}
            ${appFontFaces(root)}`,
          });
          normalizations.push({ field: "source-fonts", ...appFontSource });
          normalizations.push({
            field: "review-host",
            reason:
              "Review controls, fake webpage and simulated panel border are outside the native panel target; same observed viewport and local original font files",
            viewport: observed,
          });
          if (check)
            normalizations.push(
              await normalizePrototype(page, check, state.lang, {
                inputText,
                ...(base === "detail"
                  ? { selectedSlot: check.references[0]?.slot }
                  : {}),
              }),
            );
          else if (base === "counted")
            normalizations.push(
              await normalizeStructuringPrototype(
                page,
                capture.structuring()!,
                inputText,
              ),
            );
          else if (fixture.inputText !== undefined) {
            normalizations.push(
              await page.evaluate((text) => {
                const source = (
                  window as unknown as {
                    ST: {
                      state: { input: string };
                      act: { setInput(text: string): void };
                    };
                  }
                ).ST;
                const before = source.state.input;
                source.act.setInput(text);
                return { field: "inputText", before, after: text };
              }, fixture.inputText),
            );
          }
          await sourceAfter(page, state.stage);
          normalizations.push(...(await alignNativeShell(page, fixture)));
          normalizations.push(await normalizeBrand(page, root, "extension"));
          normalizations.push(
            ...(await normalizeAppFixture(
              page,
              appFixture,
              `app-${state.stage}-360-${state.theme}-${state.lang}`,
            )),
          );
          normalizations.push(
            ...(await normalizeManualFixture(page, manualFixture)),
          );
          normalizations.push(
            ...(await normalizeListFixture(
              page,
              listFixture,
              `app-${state.stage}-360-${state.theme}-${state.lang}`,
            )),
          );
          normalizations.push(
            await normalizeAppUtilities(
              page,
              root,
              state.id,
              state.theme,
              state.lang,
            ),
          );
          await page.addStyleTag({ content: ".v-D .cmdf{margin:0}" });
          await page.evaluate(async () => {
            await document.fonts.ready;
          });
          await page.waitForTimeout(400);
          if (state.stage.endsWith("-end"))
            normalizations.push(
              await scrollAppEnd(
                page,
                true,
                base === "detail" ? "detail" : "feed",
              ),
            );
          measurements.prototype = await measure(page, probes, true);
          await page.screenshot({
            path: join(out, `${state.id}.prototype.png`),
            animations: "disabled",
            caret: "hide",
          });
          scrollCoverage.prototype = await captureScrollCoverage(
            (request) => page.evaluate(scrollCoverageDom, request),
            (path) =>
              page.screenshot({ path, animations: "disabled", caret: "hide" }),
            out,
            state.id,
            true,
          );
        } finally {
          await page.close();
        }
        failures.push(
          ...compareMeasurements(
            probes,
            measurements.prototype,
            measurements.built,
          ),
        );
        scrollComparisons = await compareScrollCoverage(
          native.context.browser()!,
          scrollCoverage.prototype,
          scrollCoverage.built,
          out,
          state.id,
        );
        failures.push(...scrollComparisons.failures);
        const sourceGlyph = measurements.prototype["theme-glyph"];
        const builtGlyph = measurements.built["theme-glyph"];
        if (sourceGlyph && builtGlyph) {
          const glyph = await pixelDiff(
            native.context.browser()!,
            await readFile(join(out, `${state.id}.prototype.png`)),
            await readFile(join(out, `${state.id}.built.png`)),
            { source: sourceGlyph.box, built: builtGlyph.box },
          );
          await writeFile(
            join(out, `${state.id}.theme-glyph.diff.png`),
            Buffer.from(glyph.image, "base64"),
          );
          const { image: _glyphImage, ...glyphMetric } = glyph;
          themeGlyphPixels = glyphMetric;
          if (!glyph.passed)
            failures.push(
              `Theme glyph pixel diff ${(glyph.ratio * 100).toFixed(3)}% exceeds fixed 1% or dimensions differ`,
            );
        }
        const diff = await pixelDiff(
          native.context.browser()!,
          await readFile(join(out, `${state.id}.prototype.png`)),
          await readFile(join(out, `${state.id}.built.png`)),
        );
        const { image, ...summary } = diff;
        pixels = summary;
        await writeFile(
          join(out, `${state.id}.diff.png`),
          Buffer.from(image, "base64"),
        );
        if (!diff.passed)
          failures.push(
            `Pixel diff ${(diff.ratio * 100).toFixed(3)}% exceeds 1% or dimensions differ`,
          );
        // Counted POST is intentionally never released: closing this test's
        // native context cancels it without starting unobserved background work.
      } catch (error) {
        failures.push(`Native fidelity driver: ${String(error)}`);
      } finally {
        if (cleanupCheck && panel) {
          try {
            await panel.evaluate(
              `fetch(${JSON.stringify(`${api}/v2/checks/${cleanupCheck}/cancel`)}, {method:'POST'}).then((r) => { if (!r.ok) throw new Error('Cleanup HTTP '+r.status); return 0; })`,
            );
          } catch (error) {
            failures.push(`Owned Check cleanup: ${String(error)}`);
          }
        }
        await capture?.flush();
        failures.push(...(capture?.failures ?? []));
        capture?.close();
        panel?.detach();
        await native?.close();
        await rm(profile, { recursive: true, force: true });
      }
      const result = {
        id: state.id,
        passed: !failures.length,
        failures,
        viewport,
        target,
        preferences,
        pixels,
        themeGlyphPixels,
        probes,
        measurements,
        scrollCoverage: {
          ...scrollCoverage,
          comparisons: scrollComparisons?.comparisons,
        },
        normalizations,
        apiResponses: capture?.observed ?? [],
        masks: [],
      };
      results.push(result);
      rows.push(
        `<section id="${state.id}"><h2>${state.id}</h2><p>Observed native viewport: ${viewport?.observed.width ?? "unknown"} × ${viewport?.observed.height ?? "unknown"}; CDP 360px override ${viewport?.emulated ? "applied" : "unavailable"}.</p>${failures.length ? `<p class="fail">${failures.map(escape).join("<br>")}</p>` : "<p>PASS</p>"}<div class="pair">${[
          ["prototype", "Accepted source with logged fixture alignment"],
          ["built", "Built native SIDE_PANEL"],
          ["diff", "Full-size pixel diff"],
        ]
          .map(
            ([suffix, caption]) =>
              `<figure><figcaption>${caption}</figcaption><img src="${state.id}.${suffix}.png"></figure>`,
          )
          .join("")}</div></section>`,
      );
      for (const slice of scrollComparisons?.comparisons ?? [])
        rows.push(
          `<section><h2>${state.id}: scroll ${slice.key}</h2><p>${slice.passed ? "PASS" : "FAIL"} (${(slice.ratio * 100).toFixed(3)}%). Overlapping native-size coverage.</p><div class="pair">${["prototype", "built", "diff"].map((suffix) => `<figure><figcaption>${suffix}</figcaption><img src="${state.id}.scroll-${slice.key}.${suffix}.png"></figure>`).join("")}</div></section>`,
        );
      await report();
      console.log(
        `${result.passed ? "PASS" : "FAIL"} ${state.id}${pixels ? ` (${(pixels.ratio * 100).toFixed(3)}%)` : " (driver blocked)"}`,
      );
    }
    finished = true;
    await report();
    if (results.some((result) => !result.passed)) process.exitCode = 1;
    console.log(`Sheets: ${join(out, "index.html")}`);
  } finally {
    await build?.remove();
    await rm(work, { recursive: true, force: true });
  }
}
