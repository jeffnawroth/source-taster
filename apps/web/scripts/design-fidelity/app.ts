// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";
import type { Check } from "@source-taster/contract-verification/v2";
import {
  apiComparisonRows,
  assertComparisonRows,
  assertComparisonRecord,
} from "./comparison-fixture.ts";

import {
  readEditorFixture,
  assertEditorFixture,
  normalizeEditorFixture,
} from "./editor-fixture.ts";

/** Semantic fixture data only. No product classes, styles or geometry enter the source. */
export async function readAppFixture(
  page: Page,
  check?: Check,
  language: "en" | "de" = "en",
  selectedSlot?: number,
) {
  const fixture = await page.evaluate(() => {
    const text = (node: Element | null | undefined) =>
      node?.textContent?.trim() ?? "";
    return {
      menu: [...document.querySelectorAll('.strip-menu [role="menuitem"]')].map(
        (node) => ({
          id: node.getAttribute("data-key") ?? "",
          label: text(node.querySelector("span")),
          hint: text(node.querySelector("small")),
          disabled: node.getAttribute("aria-disabled") === "true",
        }),
      ),
      running: [...document.querySelectorAll(".feed-card .card-step")].map(
        text,
      ),
      detail: document.querySelector(".check-detail")
        ? {
            provenance: [...document.querySelectorAll(".detail-best > *")].map(
              (node) => ({
                text: text(node),
                href: node.getAttribute("href"),
                record: node.classList.contains("detail-record"),
              }),
            ),
            editing: !!document.querySelector(".detail-compare input"),
            rows: [...document.querySelectorAll(".detail-compare tbody")].map(
              (node) => {
                const cells = node.querySelectorAll("td");
                return {
                  field: node.getAttribute("data-field") ?? "",
                  label: text(node.querySelector("th")),
                  yours: text(
                    cells[0]?.querySelector(
                      ":scope > span:not(.compare-label)",
                    ),
                  ),
                  best: text(
                    cells[1]?.querySelector(
                      ":scope > span:not(.compare-label)",
                    ),
                  ),
                  note: text(node.querySelector(".compare-note")),
                  differs: text(node.querySelector(".compare-differs")),
                  agrees: !!node.querySelector(".compare-agrees"),
                  unknownYours: !!cells[0]?.querySelector(".compare-unknown"),
                  unknownBest: !!cells[1]?.querySelector(".compare-unknown"),
                };
              },
            ),
          }
        : null,
      dialog: (() => {
        const dialog = document.querySelector(
          ".workspace-dialog,.st-alert-dialog",
        );
        if (!dialog) return null;
        const section = dialog.querySelector(":scope > section");
        return {
          heading: text(dialog.querySelector("h2,h3")),
          // Report entitlement and export content are real data/action differences.
          paragraphs: [
            ...(section ?? dialog).querySelectorAll(":scope > p:not(.sr-only)"),
          ]
            .map(text)
            .filter(Boolean),
          buttons: [...dialog.querySelectorAll(".st-actions button")].map(
            (node) => ({
              text: text(node),
              primary: node.getAttribute("data-variant") === "primary",
              danger: node.getAttribute("data-variant") === "danger",
            }),
          ),
          report: dialog.querySelector(".report-download")
            ? {
                fields: [
                  ...dialog.querySelectorAll(".report-options label"),
                ].map((label) => {
                  const control = label.querySelector<
                    HTMLInputElement | HTMLSelectElement
                  >("input,select")!;
                  const copy = label.cloneNode(true) as Element;
                  copy.querySelector("input,select")?.remove();
                  return {
                    label: text(copy),
                    kind: control.tagName.toLowerCase(),
                    value: control.value,
                    disabled: control.disabled,
                    options:
                      control instanceof HTMLSelectElement
                        ? [...control.options].map((option) => ({
                            text: text(option),
                            selected: option.selected,
                          }))
                        : [],
                  };
                }),
              }
            : null,
          export: dialog.querySelector(".reference-exports")
            ? {
                formatLabel: text(
                  dialog.querySelector('[role="radiogroup"]')
                    ?.firstElementChild,
                ),
                formats: [
                  ...dialog.querySelectorAll('[role="radiogroup"] label'),
                ].map((node) => ({
                  text: text(node),
                  checked: !!node.querySelector("input:checked"),
                })),
                contentLabel: (() => {
                  const label = dialog
                    .querySelector(".workspace-select")
                    ?.cloneNode(true) as Element | undefined;
                  label?.querySelector("select")?.remove();
                  return text(label);
                })(),
                options: [...dialog.querySelectorAll("select option")].map(
                  (node) => ({
                    text: text(node),
                    selected: (node as HTMLOptionElement).selected,
                  }),
                ),
              }
            : null,
        };
      })(),
    };
  });
  if (fixture.detail) {
    const reference = check?.references.find(
      (r) => r.slot === (selectedSlot ?? check.references[0]?.slot),
    );
    if (!reference)
      throw new Error(
        "An actual API Reference is required to validate the displayed comparison",
      );
    const expected = apiComparisonRows(reference, language);
    // While a draft is open, D's table holds an input per editable field in the
    // Your Reference cell (validated by the editor fixture below); the compared
    // rows and their Best-match side must still match the API.
    if (fixture.detail.editing) {
      const fields = new Set(expected.map((row) => row.field));
      fixture.detail.rows = fixture.detail.rows
        .filter((row) => fields.has(row.field))
        .map((row) => {
          const api = expected.find((item) => item.field === row.field)!;
          return { ...row, yours: api.yours, unknownYours: api.unknownYours };
        });
    }
    assertComparisonRows(expected, fixture.detail.rows);
    // The source receives API expectations, never unchecked display observations.
    fixture.detail.rows = expected;
    assertComparisonRecord(reference, language, fixture.detail.provenance);
  }
  const editor = await readEditorFixture(page);
  if (editor) {
    const reference = check?.references.find(
      (r) => r.slot === (selectedSlot ?? check.references[0]?.slot),
    );
    if (!reference)
      throw new Error(
        "An actual API Reference is required to validate the field editor",
      );
    assertEditorFixture(reference, language, editor);
  }
  return { ...fixture, editor };
}
export type AppFixture = Awaited<ReturnType<typeof readAppFixture>>;

/** Populate #194's original .mi/.cmp/.dlg recipes with the actual available data.
 * Deliberately keeps original classes, source CSS, full pixels and fixed gates. */
export async function normalizeAppFixture(
  page: Page,
  fixture: AppFixture,
  id: string,
) {
  const changes = await page.evaluate(
    ({ fixture, id }) => {
      const ST = (window as unknown as { ST: { ico(id: string): string } }).ST;
      const esc = (value: string) =>
        value.replace(
          /[&<>"']/g,
          (char) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            })[char]!,
        );
      const changes: {
        field: string;
        reason: string;
        before: unknown;
        after: unknown;
      }[] = [];
      const record = (
        field: string,
        before: unknown,
        after: unknown,
        reason: string,
      ) => changes.push({ field, before, after, reason });
      const menu = document.querySelector(".v-D .menu");
      if (menu && fixture.menu.length) {
        const before = menu.textContent;
        const icons: Record<string, string> = {
          stop: "i-stop",
          reset: "i-reset",
          export: "i-download",
          report: "i-pdf",
          bibliography: "i-list",
          help: "i-help",
          "edit-list": "i-edit-list",
          labels: "i-filter",
        };
        menu.innerHTML = fixture.menu
          .map(
            (item) =>
              `<button type="button" role="menuitem" class="mi" data-act="${esc(item.id === "export" ? "dlg:export" : item.id)}" ${item.disabled ? "disabled" : ""}>${ST.ico(icons[item.id] ?? "i-filter")}<span>${esc(item.label)}</span>${item.disabled && item.hint ? `<small>${esc(item.hint)}</small>` : ""}</button>`,
          )
          .join("");
        record(
          "menu.available-actions",
          before,
          fixture.menu,
          "Real action inventory, labels and eligibility projected through original D .mi recipe; Formatted bibliography remains available",
        );
      }
      if (id.includes("running")) {
        const nodes = [...document.querySelectorAll(".v-D .card .steptxt")];
        nodes.forEach((node, index) => {
          if (fixture.running[index])
            node.textContent = fixture.running[index]!;
        });
        record(
          "running.current-query",
          "Prototype predicted step count/search wording",
          fixture.running,
          "Actual current-query text; a future source or search count is never invented",
        );
      }
      const cmp = document.querySelector(".v-D .detail .cmp");
      if (cmp && fixture.detail && !fixture.editor) {
        if (cmp.querySelector("input,textarea,select"))
          throw new Error(
            "Source has editable comparison controls without a validated product editor; refusing to replace them",
          );
        const before = cmp.textContent;
        cmp.querySelectorAll(".cmp-r").forEach((node) => node.remove());
        for (const row of fixture.detail.rows) {
          const node = document.createElement("div");
          node.className = `cmp-r${row.differs ? " is-dev" : ""}`;
          node.setAttribute("role", "row");
          // These are D's original row components, populated with raw values and recorded agreement.
          node.innerHTML = `<span class="cf" role="rowheader">${esc(row.label)}</span><span class="cy" role="cell"><span class="lab" aria-hidden="true">${esc(document.querySelector(".cmp-h span:nth-child(2)")?.textContent ?? "")}</span><span class="${row.unknownYours ? "unk" : row.differs ? "st-dev" : ""}">${esc(row.yours)}</span>${row.differs ? `<br><span class="devtag">${ST.ico("e-diff")}${esc(row.differs)}</span>` : row.agrees ? `<span class="okmark">${ST.ico("e-ok")}</span>` : ""}</span><span class="cb" role="cell"><span class="lab" aria-hidden="true">${esc(document.querySelector(".cmp-h span:nth-child(3)")?.textContent ?? "")}</span><span class="${row.unknownBest ? "unk" : ""}">${esc(row.best)}</span><small>${esc(row.note)}</small></span>`;
          cmp.append(node);
        }
        record(
          "detail.recorded-comparison",
          before,
          fixture.detail,
          "Original .cmp row/column/mark recipes receive all actual fields, raw values, recorded scores/agreements and Best-match provenance; no string-inequality rescoring",
        );
      }
      if (cmp && fixture.detail) {
        document.querySelector('[data-app-fixture="provenance"]')?.remove();
        const provenance = document.createElement("p");
        provenance.dataset.appFixture = "provenance";
        provenance.className = "row note";
        for (const item of fixture.detail.provenance) {
          const node = document.createElement(item.href ? "a" : "span");
          node.textContent = item.text;
          if (item.href) {
            node.setAttribute("href", item.href);
            node.className = "lnk";
          }
          if (item.record) {
            node.className = "cb";
            const small = document.createElement("small");
            small.textContent = item.text;
            node.replaceChildren(small);
          }
          provenance.append(node);
        }
        cmp.before(provenance);
      }
      const dlg = document.querySelector(".v-D .dlg");
      if (dlg && fixture.dialog && /app-(report|export|reset)-/.test(id)) {
        const before = dlg.textContent,
          data = fixture.dialog;
        const heading = dlg.querySelector("h2")!;
        heading.textContent = data.heading;
        for (const node of [...dlg.children])
          if (node !== heading) node.remove();
        const append = (html: string) =>
          dlg.insertAdjacentHTML("beforeend", html);
        if (data.export) {
          append(
            `<fieldset class="fs"><legend>${esc(data.export.formatLabel)}</legend>${data.export.formats.map((format) => `<label class="opt"><input type="radio" name="actual-format" ${format.checked ? "checked" : ""}>${esc(format.text)}</label>`).join("")}</fieldset>`,
          );
          append(
            `<label class="fld"><span>${esc(data.export.contentLabel)}</span><select class="sel">${data.export.options.map((option) => `<option ${option.selected ? "selected" : ""}>${esc(option.text)}</option>`).join("")}</select></label>`,
          );
        }
        for (const text of data.paragraphs)
          append(`<p class="${data.export ? "note" : ""}">${esc(text)}</p>`);
        if (data.report?.fields.length) {
          append(
            `<div class="row">${data.report.fields.map((field) => `<label class="fld"><span>${esc(field.label)}</span>${field.kind === "select" ? `<select class="sel" ${field.disabled ? "disabled" : ""}>${field.options.map((option) => `<option ${option.selected ? "selected" : ""}>${esc(option.text)}</option>`).join("")}</select>` : `<input value="${esc(field.value)}" ${field.disabled ? "disabled" : ""}>`}</label>`).join("")}</div>`,
          );
        }
        append(
          `<div class="acts">${data.buttons.map((button) => `<button class="btn ${button.primary ? "primary" : button.danger ? "danger" : "ghost"}">${button.danger ? ST.ico("i-reset") : button.primary && data.export ? ST.ico("i-download") : button.primary && data.report ? ST.ico("i-pdf") : ""}${esc(button.text)}</button>`).join("")}</div>`,
        );
        record(
          "dialog.actual-data-actions",
          before,
          data,
          "Standalone report entitlement and real export content choices replace source stub data using original .dlg/.fs/.opt/.fld/.sel/.acts recipes; source styles remain unchanged",
        );
      }
      const pager = document.querySelectorAll(
        ".v-D .dhead .pos,.v-D .dhead .pg",
      );
      if (pager.length) {
        record(
          "detail.pager",
          [...pager].map((node) => node.textContent),
          "Back/Close only",
          "Owner #212 amendment removes previous/next and position counter; reapplied after fixture rendering",
        );
        pager.forEach((node) => node.remove());
      }
      return changes;
    },
    { fixture, id },
  );
  const editorChanges = await normalizeEditorFixture(
    page,
    fixture.editor,
    fixture.detail?.rows ?? [],
  );
  const fieldLabelChanges = await page.evaluate(() => {
    const value = document.querySelector<HTMLElement>(".v-D .cmp .cy");
    const labels = [
      ...document.querySelectorAll<HTMLElement>(
        '.v-D .cmp .cf[role="rowheader"]',
      ),
    ];
    if (!value || !labels.length) return [];
    // Full API field names exceed the original short fixture labels. Extend
    // them with the original comparison cells' own wrapping recipe, never
    // with product styles or measured product dimensions.
    const recipe = getComputedStyle(value);
    const wrapping = {
      overflowWrap: recipe.overflowWrap,
      minWidth: recipe.minWidth,
    };
    const before = labels.map((label) => label.textContent);
    for (const label of labels) {
      label.style.overflowWrap = wrapping.overflowWrap;
      label.style.minWidth = wrapping.minWidth;
    }
    return [
      {
        field: "detail.full-api-label-wrapping",
        before,
        after: wrapping,
        reason:
          "Additional full API field labels, absent from the short source fixtures, use D's original comparison value-cell wrapping/minimum-size recipe. Source fonts, columns and renderer remain unchanged; no product styles or dimensions enter the oracle.",
      },
    ];
  });
  return [...changes, ...editorChanges, ...fieldLabelChanges];
}
