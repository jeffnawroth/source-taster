// SPDX-License-Identifier: AGPL-3.0-or-later
// #197 C is a paper design: compare actual PDF pages, never an HTML imitation.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser, Page } from "@playwright/test";
import {
  pages as websitePages,
  copy as websiteCopy,
} from "../../../website/src/content.ts";
import { guideNavigation } from "../../../website/src/guide-navigation.ts";
import type {
  ReportModel,
  ReportVerdict,
  Block,
} from "../../../server/src/reports/model.ts";
import { renderPdf } from "../../../server/src/reports/pdf.ts";
import type { Probe } from "./measurements.ts";

const reportPin = "267624a0de0b7e4b7e877aaf87990d53b0fb4f53";
const reportPath = "apps/server/prototype/report";

interface FixtureReference {
  key?: string;
  status?: string;
  title: string;
  original: string;
  reason?: [string, string];
  suggestion?: string | null;
  source?: string;
  version?: string;
  manual?: { system: string; at: [string, string] };
}
interface Fixture {
  references: FixtureReference[];
  keys: string[];
  labels: Record<"de" | "en", string[]>;
  statuses: Record<"de" | "en", Record<string, string>>;
}
export interface PdfComparison {
  id: string;
  prototype: string;
  built: string;
  note: string;
  failures: string[];
}

/** Explicit source-to-domain mapping; no Verdict or unfinished Status is dropped. */
function projectFixture(fixture: Fixture, language: "de" | "en"): ReportModel {
  assert.equal(
    fixture.references.length,
    10,
    "The pinned #197 fixture has ten References",
  );
  assert.deepEqual(fixture.keys, [
    "correct",
    "deviations",
    "mixed",
    "doi-conflict",
    "not-found",
    "not-verifiable",
  ]);
  const map: Record<string, ReportVerdict> = {
    correct: "correct",
    deviations: "exists-with-deviations",
    mixed: "mixed-citation",
    "doi-conflict": "doi-conflict",
    "not-found": "not-found",
    "not-verifiable": "not-verifiable",
  };
  const text = (de: string, en: string) => (language === "de" ? de : en);
  const at = language === "de" ? 0 : 1;
  const statusReasons: Record<string, string> = {
    running: text(
      "Die Prüfung läuft. In diesem Zwischenstand liegt noch kein Befund vor.",
      "The Check is running. This snapshot has no Verdict yet.",
    ),
    "not-checked": text(
      "Für diese Referenz wurde noch keine Prüfung gestartet.",
      "No Check has started for this Reference.",
    ),
    cancelled: text(
      "Die Prüfung wurde abgebrochen. Es liegt kein Befund vor.",
      "The Check was cancelled. There is no Verdict.",
    ),
    failed: text(
      "Die Prüfung ist technisch fehlgeschlagen. Es liegt kein Befund vor.",
      "The Check failed technically. There is no Verdict.",
    ),
  };
  const title = text("Prüfbericht", "Verification report");
  const model: ReportModel = {
    language,
    title,
    metaTitle: title,
    footer: text(
      "Source Taster · Zwischenstand",
      "Source Taster · Intermediate snapshot",
    ),
    pageLabel: (page, total) =>
      text(`Seite ${page} / ${total}`, `Page ${page} / ${total}`),
    front: [
      {
        kind: "paragraph",
        appearance: "document",
        text: text(
          "Literaturliste - Seminar Digitale Lehre",
          "Reference list - Digital teaching seminar",
        ),
      },
      {
        kind: "paragraph",
        appearance: "capture",
        text: text(
          "Aufnahme: 10. November 2026, 14:00 UTC",
          "Captured: 10 November 2026, 14:00 UTC",
        ),
      },
      {
        kind: "paragraph",
        appearance: "snapshot",
        text: text(
          "Zwischenstand: Die Prüfung ist noch nicht abgeschlossen. Diese Datei zeigt den Zustand zum Aufnahmezeitpunkt.",
          "Intermediate snapshot: the Check is not complete. This file shows its state at the capture time.",
        ),
      },
      {
        kind: "paragraph",
        appearance: "notice",
        text: text(
          "Gestaltungsprototyp mit Beispieldaten. Keine echte Quellenprüfung.",
          "Design prototype with fictional data. No real Source verification.",
        ),
      },
    ],
    overview: {
      heading: text("Auf einen Blick", "At a glance"),
      blocks: [
        {
          kind: "paragraph",
          appearance: "summary",
          text: text(
            "1 von 10 Referenzen ist als korrekt eingeordnet. Vier Referenzen haben noch keinen Befund.",
            "1 of 10 References is classified as correct. Four References have no Verdict yet.",
          ),
        },
        {
          kind: "counts",
          label: "",
          items: fixture.keys.map((key, index) => ({
            verdict: map[key]!,
            text: `${fixture.labels[language][index]}: 1`,
          })),
        },
        {
          kind: "counts",
          label: text(
            "Status - getrennt von Befunden",
            "Statuses - separate from Verdicts",
          ),
          items: ["running", "not-checked", "cancelled", "failed"].map(
            (status) => ({ text: `${fixture.statuses[language][status]}: 1` }),
          ),
        },
        {
          kind: "paragraph",
          appearance: "overview-note",
          text: text(
            "Manuell geändert: Referenz 1. Systembefund und Änderung bleiben nebeneinander erhalten.",
            "Manually changed: Reference 1. The system Verdict and the change are both retained.",
          ),
        },
        {
          kind: "paragraph",
          appearance: "overview-note",
          text: text(
            "Scoring-Regeln: Versionen 2026.10 und 2026.11. Die jeweilige Version steht an der Referenz.",
            "Scoring rules: versions 2026.10 and 2026.11. Each Reference states its own version.",
          ),
        },
      ],
    },
    references: fixture.references.map((reference, index) => {
      const blocks: Block[] = [];
      if (reference.key) {
        const verdict = map[reference.key];
        assert.ok(verdict, `Unmapped source Verdict ${reference.key}`);
        blocks.push({
          kind: "outcome",
          text: fixture.labels[language][fixture.keys.indexOf(reference.key)]!,
          verdict,
        });
      } else {
        assert.ok(
          reference.status && statusReasons[reference.status],
          `Unmapped source Status ${reference.status}`,
        );
        blocks.push({
          kind: "outcome",
          text: `Status: ${fixture.statuses[language][reference.status]!}`,
        });
      }
      if (reference.manual) {
        assert.equal(reference.manual.system, "not-verifiable");
        blocks.push(
          {
            kind: "paragraph",
            appearance: "manual",
            text: text(
              "Manuell: Korrekt. Systembefund: Nicht verifizierbar.",
              "Manual: Correct. System Verdict: Not verifiable.",
            ),
          },
          {
            kind: "paragraph",
            text: reference.manual.at[at],
            appearance: "timestamp",
          },
        );
      }
      blocks.push({
        kind: "labelled",
        label: text("Geprüfte Referenz", "Checked Reference"),
        text: reference.original,
      });
      if (reference.status)
        blocks.push({
          kind: "paragraph",
          text: statusReasons[reference.status]!,
        });
      else {
        assert.ok(reference.reason && reference.source && reference.version);
        blocks.push(
          {
            kind: "labelled",
            label: text("Begründung", "Explanation"),
            text: reference.reason[at],
          },
          {
            kind: "labelled",
            label: text(
              "Korrekturvorlage - Vorschau, APA 7",
              "Correction suggestion - preview, APA 7",
            ),
            text:
              reference.suggestion ??
              text(
                "Keine geeignete Korrekturvorlage vorhanden.",
                "No eligible Correction suggestion.",
              ),
          },
          {
            kind: "metadata",
            text: `${text("Scoring-Regeln", "Scoring rules")}: ${reference.version}`,
          },
          {
            kind: "link",
            label: text(
              "Datenquelle, Beispieldaten",
              "Data source, example data",
            ),
            url: reference.source,
          },
        );
      }
      return { heading: `${index + 1}. ${reference.title}`, blocks };
    }),
  };
  assert.equal(model.references.length, fixture.references.length);
  for (const [index, reference] of fixture.references.entries()) {
    const content = JSON.stringify(model.references[index]);
    assert.ok(
      content.includes(reference.original),
      `Source Reference ${index + 1} was omitted`,
    );
    if (reference.suggestion) assert.ok(content.includes(reference.suggestion));
    if (reference.reason) assert.ok(content.includes(reference.reason[at]));
  }
  return model;
}

/** Render both PDFs through the same independent PDF.js rasterizer at 1.35×.
 * All resources are fulfilled from local installed files; no real server runs. */
async function pdfPages(browser: Browser, root: string, bytes: Uint8Array) {
  const require = createRequire(join(root, "apps/server/package.json"));
  const build = dirname(require.resolve("pdfjs-dist/legacy/build/pdf.mjs"));
  const page = await browser.newPage();
  const origin = "http://pdf-fidelity.invalid";
  try {
    await page.route(`${origin}/**`, async (route) => {
      const name = new URL(route.request().url()).pathname;
      if (name === "/")
        return route.fulfill({
          contentType: "text/html",
          body: "<!doctype html><meta charset=utf-8>",
        });
      if (name === "/pdf.mjs" || name === "/pdf.worker.mjs")
        return route.fulfill({
          contentType: "text/javascript",
          body: readFileSync(join(build, name.slice(1))),
        });
      return route.abort();
    });
    await page.goto(origin);
    return await page.evaluate(
      async ({ encoded, origin }) => {
        interface PdfModule {
          GlobalWorkerOptions: { workerSrc: string };
          getDocument(options: {
            data: Uint8Array;
            useSystemFonts: boolean;
            verbosity: number;
          }): {
            promise: Promise<{
              numPages: number;
              getPage(index: number): Promise<{
                getViewport(options: { scale: number }): {
                  width: number;
                  height: number;
                };
                render(options: {
                  canvasContext: CanvasRenderingContext2D;
                  viewport: { width: number; height: number };
                }): { promise: Promise<void> };
              }>;
            }>;
            destroy(): Promise<void>;
          };
        }
        const pdfjs = (await import(`${origin}/pdf.mjs`)) as PdfModule;
        pdfjs.GlobalWorkerOptions.workerSrc = `${origin}/pdf.worker.mjs`;
        const task = pdfjs.getDocument({
          data: Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)),
          useSystemFonts: false,
          verbosity: 0,
        });
        const pdf = await task.promise;
        try {
          const pages: string[] = [];
          for (let index = 1; index <= pdf.numPages; index++) {
            const source = await pdf.getPage(index);
            const viewport = source.getViewport({ scale: 1.35 });
            const canvas = document.createElement("canvas");
            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);
            await source.render({
              canvasContext: canvas.getContext("2d")!,
              viewport,
            }).promise;
            pages.push(canvas.toDataURL("image/png").split(",")[1]!);
          }
          return pages;
        } finally {
          await task.destroy();
        }
      },
      { encoded: Buffer.from(bytes).toString("base64"), origin },
    );
  } finally {
    await page.close();
  }
}

export async function preparePdfComparisons(
  browser: Browser,
  root: string,
  out: string,
): Promise<PdfComparison[]> {
  mkdirSync(out, { recursive: true });
  const temporary = mkdtempSync(join(tmpdir(), "st-fidelity-report-"));
  const git = (path: string) =>
    execFileSync("git", ["show", `${reportPin}:${reportPath}/${path}`], {
      cwd: root,
      maxBuffer: 64 * 1024 * 1024,
    });
  try {
    const fixturePath = join(temporary, "fixture.mjs");
    writeFileSync(fixturePath, git("fixture.mjs"));
    const fixture = (await import(pathToFileURL(fixturePath).href)) as Fixture;
    const comparisons: PdfComparison[] = [];
    for (const language of ["de", "en"] as const) {
      const model = projectFixture(fixture, language);
      const builtPdf = await renderPdf(model);
      const prototypePdf = git(`output/pdf/report-C-${language}.pdf`);
      writeFileSync(join(out, `report-C-${language}.built.pdf`), builtPdf);
      writeFileSync(
        join(out, `report-C-${language}.prototype.pdf`),
        prototypePdf,
      );
      const prototype = await pdfPages(browser, root, prototypePdf);
      const built = await pdfPages(browser, root, builtPdf);
      const failures =
        built.length === prototype.length
          ? []
          : [
              `#197 C ${language}: production and accepted PDF page counts differ (${built.length}/${prototype.length})`,
            ];
      // A missing page remains a dimension failure, never a duplicated page.
      const absent =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==";
      for (
        let index = 0;
        index < Math.max(prototype.length, built.length);
        index++
      ) {
        const id = `pdf-C-${language}-page-${index + 1}`;
        const sourcePath = join(out, `${id}.prototype.png`),
          builtPath = join(out, `${id}.built.png`);
        writeFileSync(
          sourcePath,
          Buffer.from(prototype[index] ?? absent, "base64"),
        );
        writeFileSync(builtPath, Buffer.from(built[index] ?? absent, "base64"));
        comparisons.push({
          id,
          prototype: sourcePath,
          built: builtPath,
          failures,
          note: `#197 PDF C at ${reportPin}. Identical fictional snapshot, all six Verdicts and four Statuses, unchanged original text, manual and system Verdict, multilingual text and per-Reference Scoring rules. Both PDFs rasterized locally at 1.35×; no text mask or rescaling.`,
        });
      }
    }
    return comparisons;
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

/** Original #198 S selectors against their owned static-site counterparts. */
export function websiteProbes(id: string): Probe[] {
  const shape = [
    "border-top-left-radius",
    "border-top-right-radius",
    "border-top-width",
  ];
  const probes: Probe[] = [
    {
      name: "site-header",
      prototype: ".site-header",
      built: ".site-header",
      geometry: ["x", "y", "width", "height"],
    },
    {
      name: "header-row",
      prototype: ".header-row",
      built: ".header-row",
      geometry: ["x", "y", "width", "height"],
      styles: ["column-gap"],
    },
    {
      name: "site-brand",
      prototype: ".brand",
      built: ".brand",
      geometry: ["height"],
      styles: ["font-size", "font-weight", "column-gap"],
    },
    {
      name: "theme-toggle",
      prototype: '[data-action="theme"]',
      built: "[data-theme-toggle]",
      geometry: ["x", "y", "width", "height"],
      styles: shape,
    },
    {
      name: "page-heading",
      prototype: "main h1",
      built: "main h1",
      geometry: ["x", "y", "width", "height"],
      styles: ["font-size", "font-weight", "line-height", "letter-spacing"],
    },
  ];
  if (id.includes("home"))
    probes.push(
      {
        name: "hero",
        prototype: ".hero-A",
        built: ".hero-A",
        geometry: ["x", "y", "width", "height"],
        styles: ["column-gap", "padding-top", "padding-bottom"],
      },
      {
        name: "example",
        prototype: ".example",
        built: ".example",
        styles: [...shape, "font-size"],
      },
    );
  if (id.includes("index"))
    probes.push({
      name: "docs-index",
      prototype: ".docs-C",
      built: ".docs-C",
      geometry: ["x", "y", "width"],
      styles: ["padding-top"],
    });
  if (
    [
      "how-the-check-works",
      "structuring",
      "preferences",
      "errors-and-retry",
      "availability",
    ].some((page) => id.includes(page))
  )
    probes.push({
      name: "article",
      prototype: ".article",
      built: ".article",
      geometry: ["x", "y", "width"],
      styles: ["padding-top", "padding-bottom"],
    });
  if (id.startsWith("site-search-"))
    probes.push({
      name: "site-search",
      prototype: "#search-dialog",
      built: "dialog[data-search]",
      geometry: ["x", "y", "width", "height"],
      styles: [...shape, "padding-top", "padding-left"],
    });
  return probes;
}

export interface WebsiteFixture {
  legalLinks: { text: string; href: string }[];
}

export async function assertWebsiteAssets(page: Page) {
  await page.evaluate(async () => {
    const sheets = [
      ...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
    ];
    if (!sheets.length || sheets.some((link) => !link.sheet))
      throw new Error(
        "Website stylesheet missing; refresh Vite only after the website build and manifest are complete",
      );
    for (const font of [
      '400 15px "Atkinson Hyperlegible Next"',
      '700 15px "Atkinson Hyperlegible Next"',
      '400 15px "IBM Plex Mono"',
    ]) {
      const faces = await document.fonts.load(font);
      if (!faces.length || faces.some((face) => face.status !== "loaded"))
        throw new Error(`Website font unavailable: ${font}`);
    }
  });
}

/** The transparent review host is outside the website. Composite its canvas
 * with the source site's own background, without editing source DOM or CSS. */
export async function prepareWebsiteCanvas(page: Page) {
  const background = await page
    .locator(".site")
    .evaluate((site) => getComputedStyle(site).backgroundColor);
  const channels = background.match(/[\d.]+/g)?.map(Number);
  const [r, g, b] = channels ?? [];
  if (
    channels?.length !== 3 ||
    r === undefined ||
    g === undefined ||
    b === undefined ||
    ![r, g, b].every(
      (channel) => Number.isFinite(channel) && channel >= 0 && channel <= 255,
    )
  )
    throw new Error(
      `Expected an opaque source website background: ${background}`,
    );
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setDefaultBackgroundColorOverride", {
    color: { r, g, b, a: 1 },
  });
  return {
    path: "capture.review-canvas",
    reason:
      "Composite the transparent review host with the source website background; source DOM and CSS unchanged",
    before: "Browser default white canvas behind the transparent review host",
    after: background,
  };
}

export async function readWebsiteFixture(page: Page): Promise<WebsiteFixture> {
  return page.evaluate(() => ({
    legalLinks: [
      ...document.querySelectorAll<HTMLAnchorElement>(
        ".site-footer nav.footer-links a",
      ),
    ].map((link) => ({
      text: link.textContent?.trim() ?? "",
      href: link.href,
    })),
  }));
}

/** The reviewed factual/voice amendments are content inputs, never visual rules.
 * Rendering identical truthful copy keeps changes in line wrapping measurable.
 * Every changed source field is recorded, including the old text. */
export async function normalizeWebsiteFixture(
  page: Page,
  language: "en" | "de",
  fixture: WebsiteFixture,
) {
  const id = new URL(page.url()).searchParams.get("page") ?? "home";
  const data = websitePages[language].find((candidate) => candidate.id === id);
  const navigation = guideNavigation[language];
  const copy = websiteCopy[language];
  const guides = websitePages[language].filter(
    (candidate) => candidate.section === "docs",
  );
  return page.evaluate(
    ({ id, data, navigation, copy, fixture, language, guides }) => {
      const changes: {
        path: string;
        reason: string;
        before: string;
        after: string;
      }[] = [];
      function text(
        node: Element | null,
        after: string | undefined,
        path: string,
        reason: string,
      ) {
        if (!node || after === undefined || node.textContent === after) return;
        changes.push({ path, reason, before: node.textContent ?? "", after });
        node.textContent = after;
      }
      const voice =
        "Accepted English sentence case and current glossary wording; original source element/style retained";
      const factual =
        "Truthful development availability and qualification copy; no change to original source element/style";
      const preferencesAmendment =
        "Owner amendment (17 November 2026): three Preferences, Account/Guest lifecycle, styled suggestions/PDF/RTF and page-local website settings; original source element/style retained";
      if (data) {
        text(
          document.querySelector("main h1"),
          data.title,
          "page.title",
          voice,
        );
        text(
          document.querySelector(
            "main > .lead, .article > .lead, .intro > .lead, .hero-A > div .lead",
          ),
          data.summary,
          "page.summary",
          id === "preferences" ? preferencesAmendment : voice,
        );
        if (data.section === "docs" && id !== "index") {
          const sections = [...document.querySelectorAll(".article-section")];
          if (sections.length !== data.paragraphs.length)
            throw new Error("Source and current article section counts differ");
          const selected = navigation[id as keyof typeof navigation];
          sections.forEach((section, index) => {
            text(
              section.querySelector("h2"),
              selected.sections[index],
              `sections.${index}.heading`,
              voice,
            );
            text(
              section.querySelector("p"),
              data.paragraphs[index],
              `sections.${index}.paragraph`,
              id === "preferences" ? preferencesAmendment : factual,
            );
          });
          document
            .querySelectorAll(".toc a")
            .forEach((node, index) =>
              text(node, selected.sections[index], `contents.${index}`, voice),
            );
        } else if (id === "faq") {
          document.querySelectorAll(".faq details").forEach((node, index) => {
            const paragraph = data.paragraphs[index];
            if (!paragraph) return;
            const boundary = paragraph.indexOf("?");
            text(
              node.querySelector("summary"),
              paragraph.slice(0, boundary + 1),
              `faq.${index}.question`,
              factual,
            );
            text(
              node.querySelector("p"),
              paragraph.slice(boundary + 1).trim(),
              `faq.${index}.answer`,
              factual,
            );
          });
        } else if (id === "contact") {
          document
            .querySelectorAll("main > .stack > p")
            .forEach((node, index) =>
              text(node, data.paragraphs[index], `contact.${index}`, voice),
            );
        }
      }
      const chapters = [
        copy.overview,
        copy.how,
        language === "en"
          ? "Structuring references"
          : "Referenzen strukturieren",
        copy.preferences,
        copy.retry,
        copy.limitations,
      ];
      document
        .querySelectorAll(".chapter-nav")
        .forEach((nav) =>
          nav
            .querySelectorAll("a")
            .forEach((node, index) =>
              text(node, chapters[index], `chapters.${index}`, voice),
            ),
        );
      document.querySelectorAll(".topic-grid .guide").forEach((node) => {
        const key = (node as HTMLAnchorElement).dataset.page as
          keyof typeof navigation | undefined;
        if (key && navigation[key]) {
          text(
            node.querySelector("h3, h2"),
            navigation[key].question,
            `topics.${key}`,
            voice,
          );
          if (key === "preferences")
            text(
              node.querySelector("small"),
              guides.find((guide) => guide.id === key)?.summary,
              "topics.preferences.summary",
              preferencesAmendment,
            );
        }
      });
      document.querySelectorAll(".three > .stack").forEach((node) => {
        const key = node.querySelector<HTMLAnchorElement>("a")?.dataset.page;
        const guide = guides.find((candidate) => candidate.id === key);
        if (!guide) return;
        text(
          node.querySelector("h3"),
          guide.title,
          `home-guides.${key}.title`,
          voice,
        );
        text(
          node.querySelector("p"),
          guide.summary,
          `home-guides.${key}.summary`,
          voice,
        );
      });
      text(
        document.querySelector(".example-label"),
        copy.example.toUpperCase(),
        "example.label",
        "Required illustrative-example disclaimer; source typography and frame retained",
      );
      text(
        document.querySelector(".strip-head strong"),
        copy.sampleCheck,
        "example.heading",
        voice,
      );
      text(
        document.querySelector(".strip-head > .subtle"),
        copy.sampleCount.replace("{count}", "3"),
        "example.count",
        voice,
      );
      text(
        document.querySelector(".command > span"),
        copy.paste,
        "example.placeholder",
        voice,
      );
      const legal = document.querySelector(".site-footer nav.footer-links");
      if (legal && fixture.legalLinks.length) {
        const before = [...legal.querySelectorAll("a")]
          .map((node) => node.textContent)
          .join(" | ");
        const after = fixture.legalLinks.map((node) => node.text).join(" | ");
        if (before !== after) {
          legal.replaceChildren(
            ...fixture.legalLinks.map((item) => {
              const link = document.createElement("a");
              link.textContent = item.text;
              link.href = item.href;
              return link;
            }),
          );
          changes.push({
            path: "footer.legal-links",
            reason:
              "Required interface notices and the actually configured cancellation endpoint; unchanged source link layout",
            before,
            after,
          });
        }
      }
      const appDesign = document.querySelector(
        '.mobile-nav [data-page="app-demo"]',
      );
      if (appDesign) {
        changes.push({
          path: "navigation.review-only",
          reason: "Prototype review destination is not a public product route",
          before: appDesign.textContent ?? "",
          after: "",
        });
        appDesign.remove();
      }
      return changes;
    },
    { id, data, navigation, copy, fixture, language, guides },
  );
}
