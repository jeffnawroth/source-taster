// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";
import type { ReferenceSlot } from "@source-taster/contract-verification/v2";
import en from "../../../../packages/i18n/messages/en.json" with { type: "json" };
import de from "../../../../packages/i18n/messages/de.json" with { type: "json" };
import { apiFieldLabels, type ComparisonRow } from "./comparison-fixture.ts";

const authorLabels = {
  family: "revision_family",
  given: "revision_given",
  literal: "revision_literal",
  "non-dropping-particle": "revision_particle",
} as const;
interface Control {
  path: string;
  group: string;
  label: string;
  kind: string;
  value: string;
  checked: boolean;
}
export interface EditorFixture {
  legend: string;
  authorLegend: string;
  controls: (Control & { disabled: boolean })[];
  actions: {
    group: string;
    label: string;
    disabled: boolean;
    primary: boolean;
  }[];
  messages: { text: string; role: string | null }[];
}

/** Initial Edit-fields draft comes from the committed editable revision, NOT
 * an old result or Candidate. Keep this inventory independent of Fields/fieldLabels. */
export function apiEditorControls(
  reference: ReferenceSlot,
  language: "en" | "de",
): Control[] {
  const messages = language === "de" ? de : en;
  const controls: Control[] = [];
  for (const field of Object.keys(reference.fields))
    if (!Object.hasOwn(apiFieldLabels, field))
      throw new Error(`Editor API field has no independent label: ${field}`);
  for (const field of Object.keys(
    apiFieldLabels,
  ) as (keyof typeof apiFieldLabels)[]) {
    if (field === "author") continue;
    controls.push({
      path: field,
      group: "",
      label: messages[apiFieldLabels[field]],
      kind: "text",
      value:
        field === "issued"
          ? (reference.fields.issued?.literal ?? "")
          : (reference.fields[field] ?? ""),
      checked: false,
    });
  }
  for (const [index, author] of (reference.fields.author ?? []).entries()) {
    for (const key of Object.keys(author))
      if (!Object.hasOwn(authorLabels, key))
        throw new Error(
          `Editor API author component has no independent label: ${key}`,
        );
    for (const key of Object.keys(
      authorLabels,
    ) as (keyof typeof authorLabels)[])
      controls.push({
        path: `author.${index}.${key}`,
        group: messages.revision_author_number.replace(
          "{number}",
          String(index + 1),
        ),
        label: messages[authorLabels[key]],
        kind: "text",
        value: author[key] ?? "",
        checked: false,
      });
  }
  controls.push({
    path: "authorsTruncated",
    group: "",
    label: messages.revision_truncated,
    kind: "checkbox",
    value: "",
    checked: reference.authorsTruncated ?? false,
  });
  return controls;
}

/** Only the freshly opened editor is measured here. An edited/stale draft needs
 * a separately supplied semantic draft oracle; silently accepting it would mask bugs. */
export function assertEditorFixture(
  reference: ReferenceSlot,
  language: "en" | "de",
  fixture: EditorFixture,
) {
  const expected = apiEditorControls(reference, language);
  const messages = language === "de" ? de : en;
  if (
    fixture.legend !== messages.revision_fields ||
    fixture.authorLegend !== messages.field_author
  )
    throw new Error(
      "Editor omits or changes the Reference/Author field groups",
    );
  if (fixture.controls.length !== expected.length)
    throw new Error(
      `Editor inventory: API requires ${expected.length} controls; product displays ${fixture.controls.length}`,
    );
  const used = new Set<number>();
  for (const control of expected) {
    const index = fixture.controls.findIndex(
      (item, i) =>
        !used.has(i) &&
        item.group === control.group &&
        item.label === control.label,
    );
    const observed = fixture.controls[index];
    if (!observed)
      throw new Error(
        `Editor inventory omits ${control.path} (${control.label})`,
      );
    for (const key of ["kind", "value", "checked"] as const)
      if (observed[key] !== control[key])
        throw new Error(
          `Editor ${control.path}.${key}: API requires ${JSON.stringify(control[key])}; product displays ${JSON.stringify(observed[key])}`,
        );
    observed.path = control.path;
    used.add(index);
  }
  const expectedActions = [
    ...(reference.fields.author ?? []).map((_, i) => ({
      group: messages.revision_author_number.replace("{number}", String(i + 1)),
      label: messages.revision_remove_author,
    })),
    { group: "", label: messages.revision_add_author },
    ...[
      messages.revision_save_recheck,
      messages.revision_save,
      messages.revision_discard,
    ].map((label) => ({ group: "", label })),
  ];
  // Disabled editors omit author add/remove, but must retain all editable values.
  const authorEditing = !fixture.controls.every((item) => item.disabled);
  const actions = authorEditing ? expectedActions : expectedActions.slice(-3);
  if (
    fixture.actions.length !== actions.length ||
    actions.some(
      (action, i) =>
        action.group !== fixture.actions[i]?.group ||
        action.label !== fixture.actions[i]?.label,
    )
  )
    throw new Error(
      "Editor action inventory omits or changes author/Save/Save-and-recheck/Discard actions",
    );
}

/** Semantic data only; input labels and fieldset legends locate structured names.
 * Extra/missing controls are errors, rather than being filtered out of the fixture. */
export async function readEditorFixture(
  page: Page,
): Promise<EditorFixture | null> {
  return page.evaluate(() => {
    const form = document.querySelector<HTMLFormElement>(
      ".check-detail form.detail-draft",
    );
    if (!form) return null;
    const text = (node: Node | null | undefined) =>
      node?.textContent?.trim() ?? "";
    const root = form.querySelector(":scope > fieldset");
    if (!root) throw new Error("Product field editor has no field inventory");
    const authors = root.querySelector(":scope > fieldset");
    const group = (node: Element) => {
      const fieldset = node.closest("fieldset");
      return fieldset && fieldset !== root && fieldset !== authors
        ? text(fieldset.querySelector(":scope > legend"))
        : "";
    };
    const label = (
      input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    ) => {
      const node = input.labels?.[0];
      const copy = node?.cloneNode(true) as Element | undefined;
      copy
        ?.querySelectorAll('input,svg,[aria-hidden="true"]')
        .forEach((item) => item.remove());
      return text(copy) || input.getAttribute("aria-label") || "";
    };
    return {
      legend: text(root.querySelector(":scope > legend")),
      authorLegend: text(authors?.querySelector(":scope > legend")),
      controls: [
        ...form.querySelectorAll<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >("input,textarea,select"),
      ].map((input) => ({
        path: "",
        group: group(input),
        label: label(input),
        kind:
          input instanceof HTMLInputElement
            ? input.type
            : input.tagName.toLowerCase(),
        value:
          input instanceof HTMLInputElement && input.type === "checkbox"
            ? ""
            : input.value,
        checked: input instanceof HTMLInputElement && input.checked,
        disabled: input.matches(":disabled"),
      })),
      actions: [...form.querySelectorAll<HTMLButtonElement>("button")].map(
        (button) => ({
          group: group(button),
          label: text(button),
          disabled: button.matches(":disabled"),
          primary: button.getAttribute("data-variant") === "primary",
        }),
      ),
      messages: [...form.querySelectorAll(':scope > p,[role="alert"]')].map(
        (node) => ({ text: text(node), role: node.getAttribute("role") }),
      ),
    };
  });
}

export const editorWorkflowLimitations = [
  "Initial editor inventory/values are checked against the actual API editable revision, independently of the rendered product and recorded result.",
  "The pinned #194 editor owns flat data-fld inputs and simulated Save-and-recheck/Discard. It has no structured-author, author truncation or Save-fields-only workflow. Additional actual controls/actions below are semantic snapshot projections, not workflow acceptance evidence.",
  "Original input nodes and native scalar editing/Save-and-recheck/Discard hooks are retained. A subsequent source render replaces the projection; capture after source interactions settle. Real persistence, author add/remove and Save-fields-only must be exercised in product workflow coverage.",
] as const;

/** Extend D's original inline .cmp/.cmp-r/.fld recipes with the independently
 * validated inventory. Never import product styles/geometry or drop extra inputs. */
export async function normalizeEditorFixture(
  page: Page,
  fixture: EditorFixture | null,
  rows: ComparisonRow[],
) {
  if (!fixture) return [];
  return page.evaluate(
    ({ fixture, rows, limitations }) => {
      const cmp = document.querySelector(".v-D .detail .cmp");
      if (!cmp)
        throw new Error(
          "Accepted #194 inline comparison editor is unavailable",
        );
      const section = cmp.closest(".dsec")!;
      const ST = (
        window as unknown as {
          ST: {
            ico(id: string): string;
            state: { selected: number | null };
            act: { setDraft(id: number, key: string, value: string): void };
          };
        }
      ).ST;
      const aliases: Record<string, string> = {
        year: "issued",
        journal: "container-title",
        doi: "DOI",
        isbn: "ISBN",
        pages: "page",
      };
      const sourceKeys = Object.fromEntries(
        Object.entries(aliases).map(([key, field]) => [field, key]),
      );
      const originals = [...cmp.querySelectorAll<HTMLInputElement>("input")];
      const before = {
        text: section.textContent,
        controls: originals.map((input) => ({
          field: input.dataset.fld,
          value: input.value,
        })),
      };
      const unused = new Set(originals);
      const projected = new Map<string, HTMLInputElement>();
      // Reserve matches before repurposing spare nodes, so no scalar loses its input.
      for (const control of fixture.controls) {
        const input = originals.find(
          (item) =>
            (aliases[item.dataset.fld ?? ""] ?? item.dataset.fld) ===
            control.path,
        );
        if (input) {
          projected.set(control.path, input);
          unused.delete(input);
        }
      }
      for (const control of fixture.controls) {
        const input =
          projected.get(control.path) ??
          unused.values().next().value ??
          document.createElement("input");
        unused.delete(input);
        projected.set(control.path, input);
        input.type = control.kind;
        input.value = control.value;
        input.checked = control.checked;
        input.disabled = control.disabled;
        input.setAttribute(
          "aria-label",
          [control.group, control.label].filter(Boolean).join(" · "),
        );
        input.dataset.editorPath = control.path;
        input.dataset.k = `fld-${control.path}`;
        // Preserve native flat scalar editing; structured controls have no equivalent
        // in the pinned simulator and must not be sent as bogus flat CSL fields.
        if (
          !control.path.startsWith("author.") &&
          control.path !== "authorsTruncated"
        )
          input.dataset.fld = sourceKeys[control.path] ?? control.path;
        else input.removeAttribute("data-fld");
      }
      if (unused.size)
        throw new Error(
          "Source editor has extra editable controls; refusing to discard them",
        );
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
      const makeInput = (control: EditorFixture["controls"][number]) => {
        const label = document.createElement("label");
        label.className = "fld";
        const span = document.createElement("span");
        span.textContent = control.label;
        label.append(span, projected.get(control.path)!);
        return label;
      };
      // Move every original input out before replacing row children.
      for (const input of projected.values()) input.remove();
      cmp.querySelectorAll(".cmp-r").forEach((node) => node.remove());
      for (const control of fixture.controls.filter(
        (item) => item.kind !== "checkbox" && !item.path.startsWith("author."),
      )) {
        const row = rows.find((item) => item.field === control.path);
        const node = document.createElement("div");
        node.className = `cmp-r${row?.differs ? " is-dev" : ""}`;
        node.setAttribute("role", "row");
        node.dataset.field = control.path;
        node.innerHTML = `<span class="cf" role="rowheader">${esc(control.label)}</span><span class="cy" role="cell"></span><span class="cb" role="cell">${row ? `<span class="${row.unknownBest ? "unk" : ""}">${esc(row.best)}</span><small>${esc(row.note)}</small>` : ""}</span>`;
        const yours = node.querySelector(".cy")!;
        yours.append(makeInput(control));
        if (row?.differs)
          yours.insertAdjacentHTML(
            "beforeend",
            `<br><span class="devtag">${ST.ico("e-diff")}${esc(row.differs)}</span>`,
          );
        else if (row?.agrees)
          yours.insertAdjacentHTML(
            "beforeend",
            `<span class="okmark">${ST.ico("e-ok")}</span>`,
          );
        cmp.append(node);
      }
      const authorRow = rows.find((row) => row.field === "author");
      const author = document.createElement("div");
      author.className = `cmp-r${authorRow?.differs ? " is-dev" : ""}`;
      author.dataset.field = "author";
      author.setAttribute("role", "row");
      author.innerHTML = `<span class="cf" role="rowheader">${esc(fixture.authorLegend)}</span><span class="cy" role="cell"></span><span class="cb" role="cell">${authorRow ? `<span class="${authorRow.unknownBest ? "unk" : ""}">${esc(authorRow.best)}</span><small>${esc(authorRow.note)}</small>` : ""}</span>`;
      const authorCell = author.querySelector(".cy")!;
      for (const group of new Set(
        fixture.controls
          .filter((control) => control.path.startsWith("author."))
          .map((control) => control.group),
      )) {
        const fieldset = document.createElement("fieldset");
        fieldset.className = "fs";
        const legend = document.createElement("legend");
        legend.textContent = group;
        fieldset.append(legend);
        for (const control of fixture.controls.filter(
          (item) => item.group === group,
        ))
          fieldset.append(makeInput(control));
        for (const action of fixture.actions.filter(
          (item) => item.group === group,
        )) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "btn sm";
          button.textContent = action.label;
          button.disabled = action.disabled;
          button.dataset.editorSnapshotAction = "author-remove";
          fieldset.append(button);
        }
        authorCell.append(fieldset);
      }
      const add = fixture.actions.find(
        (action) =>
          !action.group &&
          action.label !== fixture.actions.at(-1)?.label &&
          fixture.actions.indexOf(action) < fixture.actions.length - 3,
      );
      if (add) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn sm";
        button.textContent = add.label;
        button.disabled = add.disabled;
        button.dataset.editorSnapshotAction = "author-add";
        authorCell.append(button);
      }
      const truncation = fixture.controls.find(
        (control) => control.path === "authorsTruncated",
      )!;
      authorCell.append(makeInput(truncation));
      if (authorRow?.differs)
        authorCell.insertAdjacentHTML(
          "beforeend",
          `<br><span class="devtag">${ST.ico("e-diff")}${esc(authorRow.differs)}</span>`,
        );
      else if (authorRow?.agrees)
        authorCell.insertAdjacentHTML(
          "beforeend",
          `<span class="okmark">${ST.ico("e-ok")}</span>`,
        );
      cmp.append(author);
      const oldSave = section.querySelector<HTMLButtonElement>(
        '[data-act^="save:"]',
      );
      const oldDiscard = section.querySelector<HTMLButtonElement>(
        '[data-act^="discard:"]',
      );
      if (!oldSave || !oldDiscard)
        throw new Error(
          "Source editor lost native Save-and-recheck/Discard hooks",
        );
      section
        .querySelectorAll('[data-editor-fixture="messages"]')
        .forEach((node) => node.remove());
      for (const node of [...section.querySelectorAll(":scope > p.note")])
        node.remove();
      for (const message of fixture.messages) {
        const node = document.createElement("p");
        node.className = "note";
        node.textContent = message.text;
        node.dataset.editorFixture = "messages";
        if (message.role) node.setAttribute("role", message.role);
        cmp.after(node);
      }
      const actions = fixture.actions.slice(-3);
      const saveOnly = document.createElement("button");
      saveOnly.type = "button";
      saveOnly.dataset.editorSnapshotAction = "save-fields-only";
      section
        .querySelectorAll('[data-editor-snapshot-action="save-fields-only"]')
        .forEach((node) => node.remove());
      for (const [index, button] of [oldSave, saveOnly, oldDiscard].entries()) {
        const action = actions[index]!;
        button.textContent = action.label;
        button.disabled = action.disabled;
        button.className = `btn sm${action.primary ? " primary" : index === 2 ? " ghost" : ""}`;
      }
      oldSave.after(saveOnly);
      if (originals.some((input) => !cmp.contains(input)))
        throw new Error(
          "Source editor projection discarded an original input node",
        );
      if (cmp.querySelectorAll("input").length !== fixture.controls.length)
        throw new Error(
          "Source editor projection lost a validated API control",
        );
      return [
        {
          field: "detail.inline-field-editor",
          before,
          after: fixture,
          reason:
            "Complete independently validated API field/structured-author inventory and actual action/status data through original #194 D .cmp/.cmp-r/.fld/.fs/.btn recipes. All original input nodes retained; no product CSS/geometry copied.",
          limitations,
        },
      ];
    },
    { fixture, rows, limitations: [...editorWorkflowLimitations] },
  );
}
