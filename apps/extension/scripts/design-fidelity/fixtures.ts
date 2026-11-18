// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";
import type { ShellFixture } from "../../../web/scripts/design-fidelity/normalization.ts";

/** Native-only standalone fixture alignment. Unlike web360 normalization this
 * retains Selection. It never adds product CSS or changes source typography. */
export async function alignNativeShell(page: Page, fixture: ShellFixture) {
  return page.evaluate((fixture) => {
    const changes: { field: string; before: unknown; after: unknown }[] = [];
    const record = (field: string, before: unknown, after: unknown) => {
      if (JSON.stringify(before) !== JSON.stringify(after))
        changes.push({ field, before: before ?? null, after: after ?? null });
    };
    const source = (
      window as unknown as {
        ST: {
          ico(name: string): string;
          strings(value: unknown): void;
          state: { view: string };
          act: { nav(view: string): void };
        };
      }
    ).ST;
    if (fixture.countedConsumption) {
      record(
        "counted.consumption",
        document.querySelector(".v-D .sh .t > span")?.textContent,
        fixture.countedConsumption,
      );
      source.strings({
        de: { quotaPreview: () => fixture.countedConsumption, autoStart: "" },
        en: { quotaPreview: () => fixture.countedConsumption, autoStart: "" },
      });
      source.act.nav(source.state.view);
    }
    const serviceNodes = [
      ...document.querySelectorAll(".v-D .hbtn,.v-D .acct,.v-D .feed > .nrow"),
    ];
    record(
      "standalone.unavailable-services",
      serviceNodes.map((node) => node.textContent),
      [],
    );
    serviceNodes.forEach((node) => node.remove());
    const notes = [...document.querySelectorAll(".v-D .intake > .nrow")];
    record(
      "standalone.notice",
      notes.map((node) => node.textContent),
      fixture.notice ?? "",
    );
    if (notes[0] && fixture.notice) {
      const label = notes[0].querySelector("span");
      if (label) label.textContent = fixture.notice;
    }
    notes.slice(fixture.notice ? 1 : 0).forEach((node) => node.remove());
    const lead = document.querySelector(".v-D .ilead");
    if (lead && fixture.lead) {
      record("intake.lead", lead.textContent, fixture.lead);
      lead.textContent = fixture.lead;
    }
    for (const [selector, value] of [
      [".v-D #d-hint", fixture.inputHint],
      [".v-D #d-dis", fixture.inputDisabledReason],
    ] as const) {
      const node = document.querySelector(selector);
      if (node && value) {
        record("intake.copy." + selector, node.textContent, value);
        node.textContent = value;
      }
    }
    const selection = document.querySelector<HTMLButtonElement>(
      '.v-D [data-act="src:selection"]',
    );
    if (selection && fixture.selectionAvailable !== undefined) {
      record(
        "selection.available",
        !selection.disabled,
        fixture.selectionAvailable,
      );
      selection.disabled = !fixture.selectionAvailable;
    }
    const input = document.querySelector<HTMLTextAreaElement>(
      ".v-D .cmdbar textarea",
    );
    if (input && fixture.inputText !== undefined) {
      // Input data is projected before opening overlays, so this must already
      // match without a re-render that would close the measured overlay.
      if (input.value !== fixture.inputText)
        throw new Error(
          "Source input data was not projected before source actions",
        );
      if (fixture.inputScrollTop !== undefined) {
        record("intake.scrollTop", input.scrollTop, fixture.inputScrollTop);
        input.scrollTop = fixture.inputScrollTop;
      }
    }
    const query = document.querySelector<HTMLInputElement>(".v-D .pq input");
    if (query && fixture.commandPlaceholder) {
      record(
        "palette.placeholder",
        query.placeholder,
        fixture.commandPlaceholder,
      );
      query.placeholder = fixture.commandPlaceholder;
    }
    const empty = document.querySelector(".v-D .palette .pl .note");
    if (empty && fixture.commandEmpty) {
      record("palette.empty", empty.textContent, fixture.commandEmpty);
      empty.textContent = fixture.commandEmpty;
    }
    if (fixture.commands.length) {
      const list = document.querySelector(".v-D .palette .pl");
      const template = list?.querySelector(".po");
      if (!list || !template) throw new Error("Source command row missing");
      record("palette.commands", list.textContent, fixture.commands);
      const icons: Record<string, string> = {
        input: "i-search",
        history: "i-history",
        account: "i-user",
        reset: "i-plus",
        preferences: "i-gear",
        stop: "i-stop",
      };
      list.replaceChildren();
      let group: string | undefined;
      fixture.commands.forEach((item, index) => {
        if (item.group !== group) {
          const heading = document.createElement("li");
          heading.className = "pg-h eyebrow";
          heading.setAttribute("role", "presentation");
          heading.textContent = item.group;
          list.append(heading);
          group = item.group;
        }
        const row = template.cloneNode(true) as HTMLElement;
        row.id = `native-fixture-command-${index}`;
        row.dataset.i = String(index);
        row.setAttribute("aria-selected", String(index === 0));
        row.setAttribute("aria-disabled", String(item.disabled));
        const icon = icons[item.id];
        if (!icon)
          throw new Error(`No accepted-source glyph for command ${item.id}`);
        row.querySelector("svg")?.remove();
        row.insertAdjacentHTML("afterbegin", source.ico(icon));
        const label = row.querySelector("span");
        if (label) label.textContent = item.label;
        row.querySelector("small")?.remove();
        list.append(row);
      });
    }
    return changes;
  }, fixture);
}

// Same deterministic API/worker witnesses as the public harness. Importing its
// executable would launch another browser, so keep the input fixture explicit.
export const references = [
  "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
  "Aspelmeyer, M. (2011). Measured measurements. Nature Physics, 7, 13–15. https://doi.org/10.1038/nphys1170",
  "Smith, A. (2021). Synthetic journal evidence. The Journal of biological chemistry, 1, 1–2. https://doi.org/10.5555/browser-journal",
  "Jones, B. (2015). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.5555/browser-journal",
  "Doe, J. (2020). A reference whose DOI does not exist. Journal of Examples, 1, 1–2. https://doi.org/10.5555/workspace-nonexistent",
  "Nobody, N. (2018). A title nobody has written anywhere. Journal of Nothing, 3, 5–6.",
  "Poe, P. (2022). Invalid metadata. Journal of Examples, 3, 1–2. https://doi.org/10.5555/browser-invalid",
  "Roe, R. (2021). Unavailable resolver. Journal of Examples, 2, 3–4. https://doi.org/10.5555/browser-unavailable",
].join("\n\n");
export const held =
  "Held, H. (2023). A resolver that never answers. Journal of Examples, 4, 1–2. https://doi.org/10.5555/browser-held";
