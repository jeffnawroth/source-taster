// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

/** Semantic content only: never copy product styles, classes or geometry. */
interface Content {
  tag: string;
  text?: string;
  role?: string;
  label?: string;
  href?: string;
  value?: string;
  checked?: boolean;
  disabled?: boolean;
  open?: boolean;
  variant?: string;
  /** Geometry key of the button's leading icon, resolved against D's sprite. */
  icon?: string;
  recipe?: "tracked" | "provenance";
  children?: Content[];
}

export interface ManualFixture {
  heading: string;
  note: string;
  messages: { text: string; role: string | null }[];
  group: null | {
    label: string;
    disabled: boolean;
    choices: {
      value: string;
      label: string;
      selected: boolean;
      disabled: boolean;
    }[];
  };
  actions: Content[];
  /** Actual content before Manual judgment, in its original content order. */
  preceding: { kind: "correction" | "additional"; content: Content }[];
  /** Field/result history disclosures, including their closed contents. */
  following: Content[];
  /** D's lower detail, read from the built evidence block. */
  evidence: null | {
    notice: string;
    trail: { state: string; source: boolean; name: string; rest: string }[];
    disclosures: Content[];
  };
}

/** Read after the product driver opens Manual judgment. DOM selectors locate
 * semantic data; no computed CSS, dimensions, positions or scroll are read. */
export async function readManualFixture(
  page: Page,
): Promise<ManualFixture | null> {
  return page.evaluate(() => {
    const text = (node: Node | null | undefined) =>
      node?.textContent?.trim() ?? "";
    const section = document
      .querySelector(".check-detail .manual-verdict-note")
      ?.closest("section");
    if (!section) return null;
    const cleanText = (element: Element) => {
      const copy = element.cloneNode(true) as Element;
      copy
        .querySelectorAll('svg,input,[aria-hidden="true"],.sr-only')
        .forEach((n) => n.remove());
      return text(copy);
    };
    const glyphKey = (svg: Element) =>
      [...svg.children]
        .map(
          (child) =>
            `${child.tagName.toLowerCase()}(${[...child.attributes]
              .map((a) => `${a.name}=${a.value}`)
              .sort()
              .join(",")})`,
        )
        .join("");
    function content(node: Node): Content[] {
      if (node.nodeType === Node.TEXT_NODE)
        return node.textContent
          ? [{ tag: "text", text: node.textContent }]
          : [];
      if (
        !(node instanceof Element) ||
        node.matches('svg,[aria-hidden="true"]')
      )
        return [];
      // RAC's hidden input is represented by the real label's control state.
      if (node.matches('.sr-only, input[type="checkbox"], input[type="radio"]'))
        return [];
      const children = [...node.childNodes].flatMap(content);
      if (
        node.tagName === "SPAN" ||
        node.tagName === "FORM" ||
        node.matches(".detail-section-head")
      )
        return children;
      const tag = node.tagName.toLowerCase();
      const base: Content = { tag, children };
      const role = node.getAttribute("role");
      if (role) base.role = role;
      if (node.hasAttribute("aria-label"))
        base.label = node.getAttribute("aria-label")!;
      if (node instanceof HTMLAnchorElement)
        base.href = node.getAttribute("href") ?? undefined;
      if (node instanceof HTMLDetailsElement) base.open = node.open;
      if (node instanceof HTMLButtonElement) {
        base.text = cleanText(node);
        base.children = [];
        base.disabled = node.disabled;
        base.variant = node.getAttribute("data-variant") ?? undefined;
        // D's btn() draws its sprite icon before the label. Carry the built
        // glyph's geometry; the prototype side looks it up in D's own sprite.
        const glyph = node.querySelector("svg");
        if (glyph) base.icon = glyphKey(glyph);
      }
      if (
        node instanceof HTMLInputElement ||
        node instanceof HTMLTextAreaElement
      ) {
        base.value = node.value;
        base.disabled = node.disabled;
      }
      const checkbox = node.matches("label")
        ? node.querySelector<HTMLInputElement>('input[type="checkbox"]')
        : null;
      if (checkbox) {
        base.tag = "checkbox";
        base.text = cleanText(node);
        base.children = [];
        base.checked = checkbox.checked;
        base.disabled = checkbox.disabled;
      }
      if (node.matches(".detail-tc")) base.recipe = "tracked";
      if (node.matches(".detail-tc-meta")) base.recipe = "provenance";
      return [base];
    }
    const group = section.querySelector('[role="radiogroup"]');
    const actionRow = section.querySelector(
      ".manual-verdict-actions,.detail-row",
    );
    const actions = actionRow ? [...actionRow.childNodes].flatMap(content) : [];
    const parent = section.parentElement!;
    const preceding: ManualFixture["preceding"] = [];
    for (const node of [...parent.children]) {
      if (node === section) break;
      // Comparison and all evidence retain their own original source renderer.
      if (node.querySelector(".detail-compare,.detail-original")) continue;
      if (node.matches(".detail-section")) {
        const projected = content(node)[0];
        if (projected)
          preceding.push({
            kind: node.querySelector(".detail-tc")
              ? "correction"
              : "additional",
            content: projected,
          });
      } else if (node.matches('p,[role="alert"],[role="status"]')) {
        const projected = content(node)[0];
        if (projected)
          preceding.push({ kind: "additional", content: projected });
      }
    }
    return {
      heading: text(section.querySelector("h3")),
      note: text(section.querySelector(".manual-verdict-note")),
      messages: [
        ...section.querySelectorAll(
          ':scope > p[role="alert"],:scope > p[role="status"]',
        ),
      ].map((node) => ({ text: text(node), role: node.getAttribute("role") })),
      group: group
        ? {
            label:
              text(group.firstElementChild) ||
              group.getAttribute("aria-label") ||
              "",
            disabled: group.getAttribute("aria-disabled") === "true",
            choices: [
              ...group.querySelectorAll<HTMLInputElement>(
                'input[type="radio"]',
              ),
            ].map((input) => ({
              value: input.value,
              label: input.closest("label")
                ? cleanText(input.closest("label")!)
                : (input.getAttribute("aria-label") ?? ""),
              selected: input.checked,
              disabled: input.disabled,
            })),
          }
        : null,
      actions,
      preceding,
      following: [...parent.children]
        .filter((node) => node.matches("details"))
        .flatMap(content),
      evidence: (() => {
        const block = parent.querySelector(".detail-evidence");
        if (!block) return null;
        return {
          notice: text(block.querySelector(":scope > .detail-nrow")),
          trail: [...block.querySelectorAll(".detail-trail")].map((row) => {
            const line = row.querySelector("p");
            const muted = text(line?.querySelector(".detail-muted"));
            const name = row.querySelector(".detail-src-name");
            return {
              state: row.getAttribute("data-state") ?? "none",
              source: !!name,
              name: name
                ? text(name)
                : text(line).slice(0, -muted.length).trim(),
              rest: muted.replace(/^·\s*/, ""),
            };
          }),
          disclosures: [...block.children]
            .filter((node) => node.matches("details"))
            .flatMap(content),
        };
      })(),
    };
  });
}

/** Apply after normalizePrototype and the source's judge-open interaction.
 * The accepted D CSS remains the oracle. Additional actual sections use D's
 * .dsec/.row recipes and are explicitly recorded, never silently removed.
 * Call after source rendering settles; a later source render replaces this DOM. */
export async function normalizeManualFixture(
  page: Page,
  fixture: ManualFixture | null,
) {
  if (!fixture) return [];
  return page.evaluate((fixture) => {
    const ST = (
      window as unknown as {
        ST: { gly(value: string): string; ico(name: string): string };
      }
    ).ST;
    // Built button glyphs are D recipes; find the D sprite with the same
    // geometry so the oracle draws D's own icon, never the product's.
    const sprite = (key: string) => {
      const match = [...document.querySelectorAll("svg symbol[id^='i-']")].find(
        (symbol) =>
          [...symbol.children]
            .map(
              (child) =>
                `${child.tagName.toLowerCase()}(${[...child.attributes]
                  .map((a) => `${a.name}=${a.value}`)
                  .sort()
                  .join(",")})`,
            )
            .join("") === key,
      );
      if (!match)
        throw new Error(`Built button glyph has no #194 D sprite: ${key}`);
      return match.id;
    };
    const section =
      document
        .querySelector('.v-D .detail [data-act^="judge:"]')
        ?.closest(".dsec") ??
      document.querySelector(".v-D .detail .jg")?.closest(".dsec");
    if (!section || !ST)
      throw new Error(
        "Accepted #194 D Manual judgment section is unavailable.",
      );
    const changes: {
      field: string;
      before: unknown;
      after: unknown;
      reason: string;
    }[] = [];
    const record = (
      field: string,
      before: unknown,
      after: unknown,
      reason: string,
    ) => changes.push({ field, before, after, reason });
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
    function render(data: Content): string {
      if (data.tag === "text") return esc(data.text ?? "");
      const inner =
        data.text !== undefined
          ? esc(data.text)
          : (data.children ?? []).map(render).join("");
      const attrs = `${data.role ? ` role="${esc(data.role)}"` : ""}${data.label ? ` aria-label="${esc(data.label)}"` : ""}`;
      if (data.tag === "button")
        return `<button type="button" class="btn sm ${data.variant === "primary" ? "primary" : data.variant === "ghost" ? "ghost" : ""}"${data.disabled ? " disabled" : ""}${attrs}>${data.icon ? `${ST.ico(sprite(data.icon))}<span>${inner}</span>` : inner}</button>`;
      if (data.tag === "checkbox")
        return `<label class="row note"><input type="checkbox"${data.checked ? " checked" : ""}${data.disabled ? " disabled" : ""}>${inner}</label>`;
      if (data.tag === "input" || data.tag === "textarea")
        return `<input value="${esc(data.value ?? "")}"${data.disabled ? " disabled" : ""}${attrs}>`;
      if (data.tag === "a")
        return `<a class="lnk"${data.href ? ` href="${esc(data.href)}"` : ""}${attrs}>${inner}</a>`;
      if (data.tag === "section")
        return `<section class="dsec"${attrs}>${inner}</section>`;
      if (data.tag === "details")
        return `<details class="dsec"${data.open ? " open" : ""}${attrs}>${inner}</details>`;
      if (data.tag === "summary")
        return `<summary class="row note"${attrs}>${inner}</summary>`;
      if (data.tag === "h3" || data.tag === "h2")
        return `<h3 class="eyebrow"${attrs}>${inner}</h3>`;
      if (data.tag === "p")
        return `<p class="${data.recipe === "tracked" ? "tc" : data.recipe === "provenance" ? "mono muted" : "note"}"${data.recipe === "provenance" ? ' style="font-size:var(--st-text-xs)"' : ""}${attrs}>${inner}</p>`;
      if (data.tag === "del" || data.tag === "ins")
        return `<${data.tag} class="st-${data.tag}">${inner}</${data.tag}>`;
      if (
        [
          "dl",
          "dt",
          "dd",
          "ol",
          "ul",
          "li",
          "i",
          "b",
          "strong",
          "em",
          "small",
        ].includes(data.tag)
      )
        return `<${data.tag}${attrs}>${inner}</${data.tag}>`;
      return `<div class="row"${attrs}>${inner}</div>`;
    }
    const before = section.textContent;
    section.replaceChildren();
    section.insertAdjacentHTML(
      "beforeend",
      `<h3 class="eyebrow">${esc(fixture.heading)}</h3><p class="note">${esc(fixture.note)}</p>${fixture.messages.map((message) => `<p class="note"${message.role ? ` role="${esc(message.role)}"` : ""}>${esc(message.text)}</p>`).join("")}`,
    );
    if (fixture.group) {
      const verdicts: Record<string, string> = {
        correct: "correct",
        "exists-with-deviations": "deviations",
        "mixed-citation": "mixed",
        "doi-conflict": "doi-conflict",
        "not-found": "not-found",
        "not-verifiable": "not-verifiable",
      };
      section.insertAdjacentHTML(
        "beforeend",
        `<div class="jg" role="group" aria-label="${esc(fixture.group.label)}">${fixture.group.choices
          .map((choice) => {
            const verdict = verdicts[choice.value];
            if (!verdict)
              throw new Error(`Unknown actual manual Verdict: ${choice.value}`);
            return `<button type="button" class="jb" data-v="${verdict}" aria-pressed="${choice.selected}"${choice.disabled || fixture.group?.disabled ? " disabled" : ""}>${ST.gly(verdict)}<span>${esc(choice.label)}</span></button>`;
          })
          .join("")}</div>`,
      );
    }
    section.insertAdjacentHTML(
      "beforeend",
      `<div class="row">${fixture.actions.map(render).join("")}</div>`,
    );
    record(
      "detail.manual-judgment",
      before,
      fixture,
      "Real labels, current radio selection, errors/statuses, pending eligibility and explicit Save/Discard projected through original #194 D .jg/.jb/.row. Source click-to-save behavior is intentionally not used by the measured fixture.",
    );
    const body = section.parentElement!;
    body
      .querySelectorAll('[data-manual-fixture="additional"]')
      .forEach((node) => node.remove());
    const oldCorrection = body.querySelector(".tc")?.closest(".dsec");
    const correctionBefore = oldCorrection?.textContent ?? null;
    oldCorrection?.remove();
    if (
      oldCorrection &&
      !fixture.preceding.some((item) => item.kind === "correction")
    )
      record(
        "detail.prototype-correction",
        correctionBefore,
        null,
        "The actual product has no current Correction suggestion; retain its actual availability explanation below instead of showing the prototype's sample suggestion.",
      );
    for (const [index, item] of fixture.preceding.entries()) {
      const node = document.createElement("div");
      node.innerHTML = render(item.content);
      const projected = node.firstElementChild!;
      projected.setAttribute("data-manual-fixture", "additional");
      section.before(projected);
      record(
        `detail.${item.kind}.${index}`,
        item.kind === "correction" ? correctionBefore : null,
        item.content,
        item.kind === "correction"
          ? "Preserve the actual tracked Correction suggestion, provenance, actions and export checkbox using original .tc/.st-del/.st-ins/.row recipes."
          : "Actual additional section data absent from the accepted source (including Field revision); retain every recorded value and action using original .dsec/.row recipes. No product geometry or styles enter the oracle.",
      );
    }
    if (fixture.evidence) {
      const ev = fixture.evidence;
      const sources = body.querySelector(".srcs")?.closest(".dsec");
      if (ev.notice && sources) {
        sources.insertAdjacentHTML(
          "beforebegin",
          `<p class="nrow" data-manual-fixture="additional">${ST.ico("i-info")}<span>${esc(ev.notice)}</span></p>`,
        );
        record(
          "detail.uncalibrated-notice",
          null,
          ev.notice,
          "Release gate notice (releaseQualified false) projected through D's own .nrow recipe before the Data sources.",
        );
      }
      const trail = body.querySelector("ol.trail");
      if (trail && ev.trail.length) {
        const before = trail.textContent;
        const icons: Record<string, string> = {
          ok: "e-ok",
          none: "e-none",
          diff: "e-diff",
          bad: "e-bad",
          warn: "e-warn",
        };
        trail.innerHTML = ev.trail
          .map(
            (row) =>
              `<li class="te is-${row.state}">${ST.ico(row.source ? (icons[row.state] ?? "e-none") : "e-end")}<span><span class="${row.source ? "mono" : ""}">${esc(row.name)}</span> <span class="muted">· ${esc(row.rest)}</span></span></li>`,
          )
          .join("");
        record(
          "detail.evidence-trail",
          before,
          ev.trail,
          "One row per actual evidence step (operation and outcome), then the Verdict row, through D's own .te recipe. The fixture trail drives D's feed track, so it keeps one node per queried Data source there.",
        );
      }
      for (const [index, data] of ev.disclosures.entries()) {
        const node = document.createElement("div");
        node.innerHTML = render(data);
        const projected = node.firstElementChild!;
        projected.setAttribute("data-manual-fixture", "additional");
        body.append(projected);
        record(
          `detail.evidence-disclosure.${index}`,
          null,
          data,
          "Actual rules and identity provenance Disclosure, closed as built, through D's .dsec/.row recipes.",
        );
      }
    }
    for (const [index, data] of fixture.following.entries()) {
      const node = document.createElement("div");
      node.innerHTML = render(data);
      const projected = node.firstElementChild!;
      projected.setAttribute("data-manual-fixture", "additional");
      body.append(projected);
      record(
        `detail.revision-disclosure.${index}`,
        null,
        data,
        "Additional actual historical/field revision disclosure, open state and complete contents retained using source .dsec/.row recipes; existing Sources, Candidates and Evidence trail are left intact.",
      );
    }
    return changes;
  }, fixture);
}
