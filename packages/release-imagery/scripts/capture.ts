// SPDX-License-Identifier: AGPL-3.0-or-later
// Manual capture: drives the real native Chromium side panel (built from this
// tree) against the invented capture fixtures and screenshots three stories per
// language. It fails closed: a capture is kept only if every rendered Verdict
// equals the fixture's expected label and the product's own development-preview
// notice is on the page. Nothing is hidden, cropped or restyled.
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PNG } from "pngjs";
import { buildExtension } from "../../../apps/extension/e2e/support/build.ts";
import {
  launchChromium,
  until,
  type Panel,
} from "../../../apps/extension/e2e/support/chromium.ts";
import { labels } from "../../../apps/extension/e2e/support/workspace.ts";
import { captureInput, captureReferences } from "../src/fixtures.ts";
import type { CaptureRecord } from "../src/manifest.ts";
import type { Locale, Story } from "../src/specs.ts";
import { isTiledCapture } from "../src/tiling.ts";
import { startCaptureService } from "./capture-serve.ts";

/** CSS size of the captured panel; exported so composition lays it out at 1:1. */
export const panelViewport = { width: 480, height: 900 } as const;
const browserLocale = { en: "en-GB", de: "de-DE" } as const;

const messages = async (language: Locale) =>
  JSON.parse(
    await readFile(
      new URL(`../../i18n/messages/${language}.json`, import.meta.url),
      "utf8",
    ),
  ) as Record<string, string>;

/** Scrolls a region to the top of the working viewport. The stylesheet's scroll
 *  padding keeps it below the sticky glass layers; nothing is nudged by hand. */
async function scrollRegionIntoView(panel: Panel, name: string) {
  const node = await panel.find("region", name);
  await panel.call(
    node,
    `function () { this.scrollIntoView({ block: "start" }); }`,
  );
}

/**
 * Pixels by which the target is covered by a sticky layer of the panel (the
 * top bar, the summary strip), 0 when it is clear. A capture that shows
 * content under those layers is refused rather than kept.
 */
async function stickyOverlap(panel: Panel, target: string) {
  return panel.evaluate<number>(
    `(() => {
      const element = ${target};
      if (!element) return Infinity;
      const top = element.getBoundingClientRect().top;
      const layers = [...document.querySelectorAll(".checking-topbar, .summary-container")]
        .filter((layer) => layer !== element && !layer.contains(element));
      return Math.max(0, ...layers.map((layer) => layer.getBoundingClientRect().bottom - top));
    })()`,
  );
}

const wholeWord = (text: string, label: string) =>
  new RegExp(`(?<!\\p{L})${label}(?!\\p{L})`, "u").test(text);

async function readVerdicts(panel: Panel, language: Locale) {
  const names: string[] = [];
  for (let n = 1; n <= captureReferences.length; n++) {
    const [row] = await panel.query(
      "button",
      new RegExp(
        `^${language === "en" ? "Open reference" : "Referenz"} ${n}${language === "en" ? "" : " öffnen"}:`,
        "u",
      ),
    );
    if (row === undefined) return undefined;
    names.push(
      await panel.call<string>(
        row,
        `function () { const row = this.closest('[role=row], [role=option], li, article'); return (row ?? this).innerText + ' | ' + (row ? row.tagName + '/' + row.getAttribute('role') : 'none'); }`,
      ),
    );
  }
  return names;
}

export async function captureLanguage(
  language: Locale,
  apiUrl: string,
  outDir: string,
): Promise<CaptureRecord[]> {
  const build = await buildExtension("chromium", {
    SOURCE_TASTER_EXTENSION_API_URL: apiUrl,
    SOURCE_TASTER_EXTENSION_WEBSITE_URL: apiUrl,
  });
  const profile = await mkdtemp(join(tmpdir(), "st215-profile-"));
  const browser = await launchChromium(
    build.outDir,
    profile,
    browserLocale[language],
  );
  const l = labels[language];
  const text = await messages(language);
  const notice = text.skeleton_notice!;
  const records: CaptureRecord[] = [];
  try {
    const panel = await browser.openPanel();
    await panel.send("Emulation.setDeviceMetricsOverride", {
      ...panelViewport,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await panel.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-color-scheme", value: "light" }],
    });
    let verdictsRead: string[] = [];
    const shoot = async (story: Story) => {
      const noticeInViewport = await panel.evaluate<boolean>(
        `(() => {
          const text = ${JSON.stringify(notice)};
          const node = [...document.querySelectorAll("*")].find(
            (n) => n.children.length === 0 && n.textContent?.trim() === text,
          );
          if (!node) return false;
          const r = node.getBoundingClientRect();
          return r.top >= 0 && r.bottom <= innerHeight;
        })()`,
      );
      // Right after the viewport override and a scroll the compositor may not
      // have produced a frame at the new size yet; a screenshot then comes back
      // as a tiled copy of the panel. Two frames settle it.
      const settle = () =>
        panel.evaluate(
          `new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(true))))`,
        );
      const file = `captures/${language}-${story}.png`;
      await mkdir(join(outDir, "captures"), { recursive: true });
      // It can still happen; a tiled picture is never kept. The shot is taken
      // again after a further settle, and the capture fails if it stays tiled.
      let bytes: Buffer | undefined;
      for (let attempt = 1; attempt <= 5 && bytes === undefined; attempt++) {
        await settle();
        await new Promise((done) => setTimeout(done, 250 * attempt));
        await panel.screenshot(join(outDir, file));
        const shot = await readFile(join(outDir, file));
        if (!isTiledCapture(PNG.sync.read(shot))) bytes = shot;
      }
      if (bytes === undefined)
        throw new Error(
          `${file} came back as a tiled copy of the panel five times in a row`,
        );
      records.push({
        file,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        language,
        story,
        devPreviewNoticeInViewport: noticeInViewport,
        verdictsRead,
      });
    };

    // The headless browser UI language does not reach the panel; a person
    // chooses German in the panel's own Language control.
    if (language === "de") await panel.select("combobox", "Language", "de");

    // The product's own notice must be on the page; it is never hidden.
    await until(
      () =>
        panel.evaluate<boolean>(
          `document.body.innerText.includes(${JSON.stringify(notice)})`,
        ),
      "The development-preview notice is not on the page",
      15_000,
    );

    await panel.fill("textbox", l.input, captureInput);
    // The product's own notice stays in the picture: the story ends at it.
    await panel.evaluate(
      `(() => {
        const text = ${JSON.stringify(notice)};
        [...document.querySelectorAll("p")]
          .find((n) => n.textContent?.trim() === text)
          ?.scrollIntoView({ block: "end" });
      })()`,
    );
    await shoot("workspace");

    await panel.click("button", l.check);
    let lastRead: string[] | undefined;
    await until(async () => {
      const read = await readVerdicts(panel, language);
      lastRead = read;
      return (
        read?.every((name, i) =>
          wholeWord(name, captureReferences[i]!.verdict[language]),
        ) && read
      );
    }, "The rendered Verdicts never matched the fixtures' expected labels").catch(
      (error: Error) => {
        throw new Error(
          `${error.message}; last read: ${JSON.stringify(lastRead)}`,
        );
      },
    );
    verdictsRead = captureReferences.map((r) => r.verdict[language]);
    await scrollRegionIntoView(panel, text.workspace_summary!);
    const stripCovered = await stickyOverlap(
      panel,
      `document.querySelector(".feed-card")`,
    );
    if (stripCovered > 0)
      throw new Error(
        `The first reference sits ${stripCovered}px under a sticky layer in ${language}`,
      );
    await shoot("overview");

    const [open] = await panel.query(
      "button",
      new RegExp(
        `^${language === "en" ? "Open reference" : "Referenz"} 2${language === "en" ? "" : " öffnen"}:`,
        "u",
      ),
    );
    await panel.clickNode(open!);
    await panel.find("region", l.detail);
    // The story shows the disclosure the caption names: the explanation and
    // source evidence, opened as a person opens it.
    const disclosure = `[...document.querySelectorAll("#reference-detail details > summary")].find((n) => n.textContent?.trim() === ${JSON.stringify(text.evidence_details)})`;
    await panel.evaluate(`${disclosure}?.click()`);
    await until(
      () => panel.evaluate<boolean>(`!!(${disclosure})?.parentElement?.open`),
      "The evidence disclosure did not open",
      5_000,
    );
    // The disclosure sits below the comparison, so the story is scrolled to the
    // end of the comparison with the opened disclosure beneath it, clear of the
    // sticky layers.
    await panel.evaluate(
      `(() => {
        const summary = ${disclosure};
        let scroller = summary.parentElement;
        while (scroller && scroller.scrollHeight <= scroller.clientHeight + 1)
          scroller = scroller.parentElement;
        scroller ??= document.scrollingElement;
        const layers = [...document.querySelectorAll(".checking-topbar, .summary-container")];
        const clear = Math.max(...layers.map((layer) => layer.getBoundingClientRect().bottom));
        scroller.scrollBy(0, summary.getBoundingClientRect().top - clear - 240);
      })()`,
    );
    const covered = await stickyOverlap(panel, disclosure);
    if (covered > 0)
      throw new Error(
        `The evidence disclosure sits ${covered}px under a sticky layer in ${language}`,
      );
    // The candidates the disclosure lists must be on the picture.
    const candidate = `[...document.querySelectorAll("#reference-detail details[open] li, #reference-detail details[open] p")].find((n) => n.textContent?.includes(${JSON.stringify(text.evidence_candidate)}))`;
    const place = await panel.evaluate<{
      top: number;
      bottom: number;
      viewport: number;
    } | null>(
      `(() => {
        const node = ${candidate};
        if (!node) return null;
        const r = node.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, viewport: innerHeight };
      })()`,
    );
    if (!place || place.top < 0 || place.bottom > place.viewport)
      throw new Error(
        `The candidate line of the evidence disclosure is not inside the viewport in ${language}: ${JSON.stringify(place)}`,
      );
    await shoot("evidence");
  } finally {
    await browser.close();
    await rm(profile, { recursive: true, force: true });
    await build.remove();
  }
  return records;
}

export async function captureAll(outDir: string, apiPort: number) {
  const service = await startCaptureService(apiPort);
  try {
    const records: CaptureRecord[] = [];
    for (const language of ["en", "de"] as const)
      records.push(
        ...(await captureLanguage(language, service.apiUrl, outDir)),
      );
    return records;
  } finally {
    await service.stop();
  }
}
