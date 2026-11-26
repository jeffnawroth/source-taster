// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Browser, Page } from "@playwright/test";

/** Tolerances are fixed review policy, never learned from the current product. */
export const tolerances = {
  geometry: 1,
  style: 0.5,
  channel: 16,
  pixels: 0.01,
};
export interface Probe {
  name: string;
  prototype: string;
  built: string;
  geometry?: ("x" | "y" | "width" | "height")[];
  styles?: string[];
}
export interface Measurement {
  box: { x: number; y: number; width: number; height: number };
  styles: Record<string, string>;
}
/** A rounded track must also encode the real balance, independently of source fixture pixels. */
export function compareQuotaProportion(
  quota: { remaining: number; granted: number },
  trackWidth: number,
  fillWidth: number,
) {
  const expected =
    trackWidth *
    Math.max(0, Math.min(1, quota.remaining / Math.max(1, quota.granted)));
  return trackWidth <= 0 || Math.abs(fillWidth - expected) > tolerances.geometry
    ? [
        `Quota fill: ${quota.remaining}/${quota.granted} requires ${expected}px of ${trackWidth}px, received ${fillWidth}px`,
      ]
    : [];
}
export type Measurements = Record<string, Measurement | null>;
const corners = [
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
];
/** CSS scales overflowing corner radii together; both full-round token spellings draw the same pill. */
function effectiveRadius(measurement: Measurement, property: string) {
  const fallback = parseFloat(measurement.styles[property] ?? "0");
  const [tl, tr, br, bl] = corners.map((key) =>
    parseFloat(measurement.styles[key] ?? String(fallback)),
  ) as [number, number, number, number];
  const { width, height } = measurement.box;
  return (
    fallback *
    Math.min(
      1,
      width / (tl + tr),
      width / (bl + br),
      height / (tl + bl),
      height / (tr + br),
    )
  );
}
export async function measure(page: Page, probes: Probe[], prototype: boolean) {
  const result: Measurements = {};
  for (const probe of probes) {
    const locator = page
      .locator(prototype ? probe.prototype : probe.built)
      .first();
    result[probe.name] =
      (await locator.count()) && (await locator.isVisible())
        ? await locator.evaluate(
            (node, properties) => {
              const box = node.getBoundingClientRect();
              const computed = getComputedStyle(node);
              return {
                box: {
                  x: box.x,
                  y: box.y,
                  width: box.width,
                  height: box.height,
                },
                styles: Object.fromEntries(
                  properties.map((name) => [
                    name,
                    computed.getPropertyValue(name),
                  ]),
                ),
              };
            },
            [
              ...new Set([
                ...(probe.styles ?? []),
                ...((probe.styles ?? []).some((key) => corners.includes(key))
                  ? corners
                  : []),
              ]),
            ],
          )
        : null;
  }
  return result;
}
export function compareMeasurements(
  probes: Probe[],
  source: Measurements,
  built: Measurements,
) {
  const failures: string[] = [];
  for (const probe of probes) {
    const a = source[probe.name],
      b = built[probe.name];
    if (!a || !b) {
      failures.push(
        `${probe.name}: missing ${!a ? "prototype" : "built"} element`,
      );
      continue;
    }
    for (const key of probe.geometry ?? [])
      if (Math.abs(a.box[key] - b.box[key]) > tolerances.geometry)
        failures.push(
          `${probe.name}.${key}: expected ${a.box[key]}, received ${b.box[key]}`,
        );
    for (const key of probe.styles ?? []) {
      const av = a.styles[key]!,
        bv = b.styles[key]!;
      if (
        corners.includes(key) &&
        /^-?[\d.]+px$/.test(av) &&
        /^-?[\d.]+px$/.test(bv)
      ) {
        if (
          Math.abs(effectiveRadius(a, key) - effectiveRadius(b, key)) >
          tolerances.style
        )
          failures.push(
            `${probe.name}.${key}: expected physical radius ${effectiveRadius(a, key)}, received ${effectiveRadius(b, key)}`,
          );
        continue;
      }
      const numeric = /^-?[\d.]+px$/.test(av) && /^-?[\d.]+px$/.test(bv);
      if (
        numeric
          ? Math.abs(parseFloat(av) - parseFloat(bv)) > tolerances.style
          : av !== bv
      )
        failures.push(`${probe.name}.${key}: expected ${av}, received ${bv}`);
    }
  }
  return failures;
}

/** Browser Canvas decodes PNGs losslessly; no image rescaling or thumbnail comparison. */
export async function pixelDiff(
  browser: Browser,
  a: Buffer,
  b: Buffer,
  regions?: { source: Measurement["box"]; built: Measurement["box"] },
) {
  const page = await browser.newPage();
  try {
    return await page.evaluate(
      async ({ source, actual, policy, regions }) => {
        async function decode(
          data: string,
          box?: { x: number; y: number; width: number; height: number },
        ) {
          const image = new Image();
          image.src = `data:image/png;base64,${data}`;
          await image.decode();
          const canvas = document.createElement("canvas");
          const x = Math.floor(box?.x ?? 0),
            y = Math.floor(box?.y ?? 0);
          canvas.width = box ? Math.ceil(box.x + box.width) - x : image.width;
          canvas.height = box
            ? Math.ceil(box.y + box.height) - y
            : image.height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
          ctx.drawImage(image, -x, -y);
          return {
            width: canvas.width,
            height: canvas.height,
            data: ctx.getImageData(0, 0, canvas.width, canvas.height).data,
          };
        }
        const [left, right] = await Promise.all([
          decode(source, regions?.source),
          decode(actual, regions?.built),
        ]);
        const width = Math.max(left.width, right.width),
          height = Math.max(left.height, right.height);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!,
          diff = ctx.createImageData(width, height);
        let changed = 0;
        for (let y = 0; y < height; y++)
          for (let x = 0; x < width; x++) {
            const li = (y * left.width + x) * 4,
              ri = (y * right.width + x) * 4,
              di = (y * width + x) * 4;
            const missing =
              x >= left.width ||
              x >= right.width ||
              y >= left.height ||
              y >= right.height;
            const different =
              missing ||
              [0, 1, 2, 3].some(
                (c) =>
                  Math.abs(left.data[li + c]! - right.data[ri + c]!) >
                  policy.channel,
              );
            if (different) changed++;
            diff.data[di] = different ? 230 : (right.data[ri] ?? 255);
            diff.data[di + 1] = different ? 0 : (right.data[ri + 1] ?? 255);
            diff.data[di + 2] = different ? 90 : (right.data[ri + 2] ?? 255);
            diff.data[di + 3] = 255;
          }
        ctx.putImageData(diff, 0, 0);
        const ratio = changed / (width * height);
        return {
          changed,
          total: width * height,
          ratio,
          dimensionsMatch:
            left.width === right.width && left.height === right.height,
          source: { width: left.width, height: left.height },
          built: { width: right.width, height: right.height },
          passed:
            ratio <= policy.pixels &&
            left.width === right.width &&
            left.height === right.height,
          image: canvas.toDataURL("image/png").split(",")[1]!,
        };
      },
      {
        source: a.toString("base64"),
        actual: b.toString("base64"),
        policy: tolerances,
        regions,
      },
    );
  } finally {
    await page.close();
  }
}

const shape = [
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-top-width",
];
export function probesFor(id: string): Probe[] {
  if (id.startsWith("site-")) return [];
  const probes: Probe[] = [
    {
      name: "theme-control",
      prototype: ".v-D .owner-theme",
      built: ".theme-toggle",
      geometry: ["x", "y", "width", "height"],
      styles: [
        ...shape,
        "border-top-color",
        "background-color",
        "color",
        ...(id.includes("theme-focus")
          ? [
              "outline-width",
              "outline-style",
              "outline-color",
              "outline-offset",
            ]
          : []),
      ],
    },
    {
      name: "theme-glyph",
      prototype: ".owner-theme > svg",
      built: ".theme-toggle svg",
      geometry: ["width", "height"],
      styles: ["stroke-width", "stroke-linecap", "stroke-linejoin"],
    },
    {
      name: "body-typography",
      prototype: "body",
      built: "body",
      styles: ["font-family", "font-size", "line-height"],
    },
    {
      name: "topbar",
      prototype: ".v-D .top",
      built: ".checking-topbar-inner",
      geometry: ["x", "y", "width", "height"],
      styles: shape,
    },
    {
      name: "command-trigger",
      prototype: ".v-D .cmdf",
      built: ".command-trigger",
      geometry: ["y", "width", "height"],
      styles: [...shape, "font-size", "padding-left", "padding-right"],
    },
  ];
  if (
    /(?:intake|filled|input-focus|command-hover|command-focus|palette(?!-done))/.test(
      id,
    )
  )
    probes.push(
      {
        name: "intake",
        prototype: ".v-D .intake",
        built: ".check-workspace .intake",
        geometry: ["x", "y", "width"],
        styles: ["padding-top", "row-gap"],
      },
      {
        name: "input",
        prototype: ".v-D .cmdbar",
        built: ".intake-command",
        geometry: ["x", "y", "width"],
        styles: shape,
      },
    );
  if (
    /(?:counted|running|done|detail|menu|export|report|reset|edit-list|short|filter|labels)/.test(
      id,
    )
  )
    probes.push(
      {
        name: "summary-strip",
        prototype: ".v-D .strip",
        built: ".summary-strip",
        geometry: ["x", "y", "width", "height"],
        styles: [...shape, "padding-top", "padding-left", "row-gap"],
      },
      {
        name: "reference-card",
        prototype: ".v-D .card",
        built: ".feed-card",
        geometry: ["x", "y", "width", "height"],
        styles: [...shape, "padding-top", "padding-left"],
      },
      {
        name: "reference-title",
        prototype: ".v-D .ctitle",
        built: ".card-title",
        styles: ["font-size", "font-weight", "line-height"],
      },
    );
  // The narrow push view replaces the feed. Its active detail is measured below;
  // a covered, inert source feed is not a visible counterpart.
  if (id.includes("detail") && id.includes("-360-"))
    for (let index = probes.length - 1; index >= 0; index--)
      if (
        ["summary-strip", "reference-card", "reference-title"].includes(
          probes[index]!.name,
        )
      )
        probes.splice(index, 1);
  if (id.includes("detail"))
    probes.push(
      {
        name: "detail",
        prototype: ".v-D .detail",
        built: ".check-detail",
        geometry: ["x", "y", "width"],
        styles: ["border-left-width"],
      },
      {
        name: "detail-header",
        prototype: ".v-D .dhead",
        built: ".detail-head",
        geometry: ["x", "y", "width", "height"],
        styles: ["padding-top", "padding-left", "column-gap"],
      },
      {
        name: "detail-title",
        prototype: ".v-D .dtitle",
        built: ".detail-title",
        styles: ["font-size", "font-weight", "line-height", "letter-spacing"],
      },
      // Documented extra sections (web-gaps §13) shift these down the scroller,
      // so section probes compare inline geometry and type, not document y.
      // Built-only Best-match provenance, projected through D .row.note/.cb.
      {
        name: "detail-provenance",
        prototype: '[data-app-fixture="provenance"]',
        built: ".detail-best",
        geometry: ["x", "width", "height"],
        styles: ["font-size", "line-height", "row-gap"],
      },
      {
        name: "detail-record",
        prototype: '[data-app-fixture="provenance"] .cb small',
        built: ".detail-record",
        geometry: ["x", "width", "height"],
        styles: ["font-size", "line-height", "margin-top"],
      },
      {
        name: "detail-tc-del",
        prototype: ".v-D .detail .tc del",
        built: ".detail-tc del",
        geometry: ["x", "width", "height"],
        styles: ["padding-left", "padding-right", "margin-right"],
      },
      {
        name: "detail-tc-ins",
        prototype: ".v-D .detail .tc ins",
        built: ".detail-tc ins",
        geometry: ["x", "width", "height"],
        styles: ["padding-left", "margin-left"],
      },
      {
        name: "detail-tc-meta",
        prototype: ".v-D .detail .tc + p",
        built: ".detail-tc-meta",
        geometry: ["x", "width", "height"],
        styles: ["font-size", "line-height", "margin-top"],
      },
      {
        name: "detail-compare",
        prototype: ".v-D .cmp",
        built: ".detail-compare",
        geometry: ["x", "width"],
      },
      {
        name: "detail-candidates-section",
        prototype: '.v-D .dsec:has([data-act^="exp:cand"])',
        built: ".detail-section:has(.detail-candidates)",
        geometry: ["x", "width", "height"],
      },
      {
        name: "detail-candidates-toggle",
        prototype: '.v-D .detail [data-act^="exp:cand"]',
        built: ".detail-toggle",
        geometry: ["x", "width", "height"],
        styles: ["font-size", "font-weight", "line-height"],
      },
      {
        name: "detail-evidence-row",
        prototype: ".v-D .detail .trail li:first-child",
        built: ".detail-trail:first-child",
        geometry: ["x", "width", "height"],
        styles: ["font-size", "line-height", "padding-top", "row-gap"],
      },
      {
        name: "detail-evidence-source-name",
        prototype: ".v-D .detail .trail li:first-child .mono",
        built: ".detail-trail:first-child .detail-src-name",
        geometry: ["x", "width", "height"],
        styles: ["font-size", "font-weight", "line-height"],
      },
      {
        name: "detail-disclosure-chevron",
        prototype: ".v-D .detail details[data-manual-fixture] > summary > .ico",
        built:
          ".detail-actions > .detail-evidence > .detail-disclosure > summary > svg",
        geometry: ["x", "width", "height"],
      },
      {
        name: "detail-disclosure-summary",
        prototype: ".v-D .detail details[data-manual-fixture] > summary",
        built:
          ".detail-actions > .detail-evidence > .detail-disclosure > summary",
        geometry: ["x", "width", "height"],
        styles: ["font-size", "font-weight", "line-height"],
      },
    );
  if (id.includes("detail-edit"))
    probes.push(
      {
        name: "editor-author-add",
        prototype: '[data-editor-snapshot-action="author-add"]',
        built: ".detail-authors > .detail-row button",
        geometry: ["x", "y", "width", "height"],
        styles: ["font-size", "line-height", "padding-top", "padding-bottom"],
      },
      {
        name: "editor-author-truncation",
        prototype: '[data-editor-path="authorsTruncated"]',
        built: '.detail-authors input[type="checkbox"]',
        geometry: ["x", "y", "width", "height"],
        styles: ["margin-top", "margin-bottom", "border-top-width"],
      },
      {
        name: "editor-author-truncation-label",
        prototype: '.v-D .cmp label:has([data-editor-path="authorsTruncated"])',
        built: ".detail-authors > .detail-check",
        geometry: ["x", "y", "width", "height"],
        styles: ["font-size", "line-height", "row-gap"],
      },
    );
  // D's active filter: a chip in the compact strip, a row beside the wide one.
  if (id.includes("-filter-"))
    probes.push({
      name: "active-filter",
      prototype: id.includes("-360-") ? ".v-D .fchip" : ".v-D .frow",
      built: ".active-filter",
      geometry: ["x", "y", "width", "height"],
      styles: [...shape, "padding-left", "column-gap", "font-size"],
    });
  if (id.includes("menu"))
    probes.push({
      name: "menu",
      prototype: ".v-D .menu",
      built: ".strip-menu",
      geometry: ["width"],
      styles: [...shape, "padding-top", "padding-left"],
    });
  if (/(?:export|report|reset|edit-list)/.test(id))
    probes.push({
      name: "dialog",
      prototype: ".v-D .dlg",
      built: ".st-modal:not([data-st-layer])",
      geometry: ["x", "y", "width"],
      styles: [
        ...shape,
        "background-color",
        "backdrop-filter",
        "border-top-color",
        "box-shadow",
      ],
    });
  if (/(?:export|report|reset|edit-list)/.test(id))
    probes.push({
      name: "dialog-heading",
      prototype: ".v-D .dlg h2",
      // Menu-reached content keeps its own section h3 (it also renders
      // inline), styled as the Dialog title; either is the measured title.
      built:
        ".st-modal:not([data-st-layer]) :is(h2, .workspace-dialog > section > h3:first-child)",
      styles: ["font-size", "font-weight", "line-height", "letter-spacing"],
    });
  if (id.includes("edit-list"))
    probes.push(
      {
        name: "edit-list-legend",
        prototype: ".v-D .dlg fieldset > legend",
        built: ".reference-list-removals > :first-child",
        geometry: ["x", "y", "height"],
        styles: ["font-size", "line-height"],
      },
      {
        name: "edit-list-option",
        prototype: ".v-D .dlg label.opt",
        built: ".reference-list-actions .st-checkbox",
        geometry: ["x", "y", "width", "height"],
        styles: ["font-size", "line-height", "column-gap"],
      },
      {
        name: "edit-list-option-box",
        prototype: ".v-D .dlg label.opt > input",
        built: ".reference-list-actions .st-checkbox input",
        geometry: ["x", "y", "width", "height"],
      },
    );
  if (id.includes("export"))
    probes.push(
      {
        name: "export-format-group",
        prototype: ".v-D .dlg .fs",
        built: '.reference-exports [role="radiogroup"]',
        geometry: ["x", "y", "width", "height"],
      },
      {
        name: "export-format-label",
        prototype: ".v-D .dlg legend",
        built: '.reference-exports [role="radiogroup"] > :first-child',
        geometry: ["x", "y", "height"],
        styles: ["font-size", "font-weight", "line-height"],
      },
      {
        name: "export-format-option",
        prototype: ".v-D .dlg .opt",
        built: ".reference-exports .st-radio",
        geometry: ["x", "y", "width", "height"],
        styles: [
          "font-size",
          "line-height",
          "padding-top",
          "align-items",
          "column-gap",
        ],
      },
      {
        name: "export-content-select",
        prototype: ".v-D .dlg .sel",
        built: ".reference-exports select",
        geometry: ["x", "y", "width", "height"],
        styles: [
          "font-size",
          "padding-top",
          "padding-left",
          "border-top-left-radius",
        ],
      },
    );
  if (id.includes("palette"))
    probes.push(
      {
        name: "palette",
        prototype: ".v-D .palette",
        built: '[data-st-layer="command-palette"]',
        geometry: ["x", "y", "width"],
        styles: shape,
      },
      {
        name: "palette-search",
        prototype: ".v-D .pq",
        built: ".command-palette-search",
        geometry: ["x", "y", "width", "height"],
        styles: ["padding-top", "padding-left"],
      },
    );
  if (id.includes("account")) {
    probes.push({
      name: "account-popover",
      prototype: ".v-D .pop",
      built: ".account-entry",
      geometry: ["x", "y", "width"],
      styles: shape,
    });
    probes.push(
      {
        name: "account-heading",
        prototype: ".v-D .pop h2",
        built: ".account-entry h2",
        geometry: ["x", "y", "width", "height"],
        styles: [
          "font-size",
          "font-weight",
          "line-height",
          "letter-spacing",
          "font-family",
        ],
      },
      {
        name: "quota-eyebrow",
        prototype: ".v-D .pop div:has(> .meter) > .eyebrow",
        built: '.account-entry [role="meter"] .react-aria-Label',
        // D's eyebrow is an inline span in a body-leading line box; the label
        // is that line box itself, so only the start edge is comparable.
        geometry: ["x"],
        styles: ["font-size", "font-weight", "letter-spacing", "color"],
      },
      {
        name: "quota-value",
        prototype: ".v-D .pop .meter + p",
        built: ".account-entry .st-meter-value",
        geometry: ["x", "y", "width", "height"],
        styles: [
          "font-size",
          "font-weight",
          "line-height",
          "letter-spacing",
          "font-family",
          "color",
        ],
      },
      {
        name: "quota-track",
        prototype: ".v-D .pop .meter",
        built: '.account-entry [role="meter"] .st-track',
        geometry: ["width", "height"],
        styles: [...shape, "overflow-x", "overflow-y"],
      },
      {
        name: "quota-fill",
        prototype: ".v-D .pop .meter > i",
        built: '.account-entry [role="meter"] .st-fill',
        geometry: ["width", "height"],
        styles: [...shape, "overflow-x", "overflow-y"],
      },
    );
  }
  return probes;
}
