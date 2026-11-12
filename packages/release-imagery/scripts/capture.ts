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

/** Scrolls a region to the top of its scroller, below the sticky glass header. */
async function scrollRegionIntoView(panel: Panel, name: string) {
  const node = await panel.find("region", name);
  await panel.call(
    node,
    `function () {
      this.scrollIntoView({ block: "start" });
      let scroller = this.parentElement;
      while (scroller && scroller.scrollHeight <= scroller.clientHeight + 1)
        scroller = scroller.parentElement;
      (scroller ?? document.scrollingElement).scrollBy(0, 54);
    }`,
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
      const file = `captures/${language}-${story}.png`;
      await mkdir(join(outDir, "captures"), { recursive: true });
      await panel.screenshot(join(outDir, file));
      const bytes = await readFile(join(outDir, file));
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
    await scrollRegionIntoView(panel, text.workspace_detail!);
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
