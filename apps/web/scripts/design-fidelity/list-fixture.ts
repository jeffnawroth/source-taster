// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

/** Semantic content/state only: never product markup, classes, styles or boxes. */
export type ListFixtureNode =
  | {
      kind: "fieldset" | "form" | "stack" | "row" | "actions";
      label: string;
      disabled: boolean;
      children: ListFixtureNode[];
    }
  | {
      kind: "field";
      label: string;
      control: "input" | "textarea" | "select";
      type: string;
      value: string;
      placeholder: string | null;
      disabled: boolean;
      required: boolean;
      readOnly: boolean;
      invalid: boolean;
      descriptions: string[];
      options: {
        label: string;
        value: string;
        selected: boolean;
        disabled: boolean;
      }[];
    }
  | {
      kind: "choice";
      label: string;
      type: "checkbox" | "radio";
      value: string;
      checked: boolean;
      disabled: boolean;
      descriptions: string[];
    }
  | {
      kind: "button";
      label: string;
      type: "button" | "submit" | "reset";
      variant: "primary" | "secondary" | "ghost" | "danger";
      disabled: boolean;
      pending: boolean;
      descriptions: string[];
    }
  | { kind: "text"; text: string; role: string | null }
  | { kind: "heading"; text: string; level: number }
  | { kind: "list"; ordered: boolean; items: ListFixtureNode[][] };

export interface ListFixture {
  source: "actual-business-edit-list-form";
  heading: string;
  body: ListFixtureNode[];
  footer: ListFixtureNode[];
}

/** Read after the built Edit-list interaction, before navigating to the source.
 * Hidden RAC inputs are still real controls: do not filter by screen position. */
export async function readListFixture(page: Page): Promise<ListFixture | null> {
  return page.evaluate(() => {
    const section = document.querySelector(".reference-list-actions"),
      dialog = section?.closest('[role="dialog"]');
    if (!section || !dialog) return null;
    const heading = section.querySelector(":scope > h3"),
      form = section.querySelector("form");
    if (!heading || !form)
      throw new Error("The real Edit-list business form is not open.");
    const text = (node: Element | null | undefined) =>
      node?.textContent?.trim() ?? "";
    const references = (node: Element, attribute: string) =>
      (node.getAttribute(attribute) ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .map((id) => document.getElementById(id))
        .filter((item): item is HTMLElement => item !== null);
    // Descriptions are attached to their owning control exactly once.
    const described = new Set<Element>();
    for (const node of dialog.querySelectorAll(
      "[aria-describedby],[aria-errormessage]",
    ))
      for (const attribute of ["aria-describedby", "aria-errormessage"])
        for (const item of references(node, attribute)) described.add(item);
    const descriptions = (node: Element) => {
      const owners = [node];
      if (
        node instanceof HTMLInputElement ||
        node instanceof HTMLTextAreaElement ||
        node instanceof HTMLSelectElement
      )
        owners.push(...(node.labels ?? []));
      return [
        ...new Set(
          owners.flatMap((owner) => [
            ...references(owner, "aria-describedby"),
            ...references(owner, "aria-errormessage"),
          ]),
        ),
      ]
        .map(text)
        .filter(Boolean);
    };
    const labelText = (node: Element) => {
      const clone = node.cloneNode(true) as Element;
      clone
        .querySelectorAll('[aria-hidden="true"],input,select,textarea,svg')
        .forEach((item) => item.remove());
      for (const item of clone.querySelectorAll("[id]"))
        if (described.has(document.getElementById(item.id)!)) item.remove();
      return text(clone);
    };
    const name = (node: Element) => {
      const labelled = references(node, "aria-labelledby")
        .map(labelText)
        .join(" ");
      if (labelled) return labelled;
      if (node.hasAttribute("aria-label"))
        return node.getAttribute("aria-label")!;
      if (
        node instanceof HTMLInputElement ||
        node instanceof HTMLTextAreaElement ||
        node instanceof HTMLSelectElement
      )
        return [...(node.labels ?? [])].map(labelText).join(" ");
      return labelText(node);
    };
    const disabled = (node: Element) =>
      node.matches(":disabled") || !!node.closest('[aria-disabled="true"]');
    const children = (node: Element): ListFixtureNode[] =>
      [...node.children].flatMap(read);
    function read(node: Element): ListFixtureNode[] {
      if (
        node === heading ||
        described.has(node) ||
        node.matches('legend,label,svg,[hidden],[aria-hidden="true"]')
      ) {
        // Wrapped native controls are still read. Their names are obtained
        // via input.labels, without duplicating the label's text.
        if (
          node.matches("label") &&
          node.querySelector("input,textarea,select")
        )
          return children(node);
        return [];
      }
      if (node instanceof HTMLButtonElement) {
        const variant = node.getAttribute("data-variant");
        return [
          {
            kind: "button",
            label: name(node),
            type: node.type,
            variant:
              variant === "primary" ||
              variant === "ghost" ||
              variant === "danger"
                ? variant
                : "secondary",
            disabled: disabled(node),
            pending: node.getAttribute("aria-busy") === "true",
            descriptions: descriptions(node),
          },
        ];
      }
      if (
        node instanceof HTMLInputElement &&
        (node.type === "checkbox" || node.type === "radio")
      )
        return [
          {
            kind: "choice",
            label: name(node),
            type: node.type,
            value: node.value,
            checked: node.checked,
            disabled: disabled(node),
            descriptions: descriptions(node),
          },
        ];
      if (
        node instanceof HTMLInputElement ||
        node instanceof HTMLTextAreaElement ||
        node instanceof HTMLSelectElement
      ) {
        if (node instanceof HTMLInputElement && node.type === "hidden")
          return [];
        return [
          {
            kind: "field",
            label: name(node),
            control:
              node instanceof HTMLSelectElement
                ? "select"
                : node instanceof HTMLTextAreaElement
                  ? "textarea"
                  : "input",
            type: node instanceof HTMLInputElement ? node.type : "",
            value: node.value,
            placeholder: node.getAttribute("placeholder"),
            disabled: disabled(node),
            required: node.required,
            readOnly: !(node instanceof HTMLSelectElement) && node.readOnly,
            invalid: node.getAttribute("aria-invalid") === "true",
            descriptions: descriptions(node),
            options:
              node instanceof HTMLSelectElement
                ? [...node.options].map((option) => ({
                    label: option.label,
                    value: option.value,
                    selected: option.selected,
                    disabled: option.disabled,
                  }))
                : [],
          },
        ];
      }
      if (node.matches("fieldset,[role=group],[role=radiogroup]")) {
        const legend = node.querySelector(":scope > legend");
        const label = legend ? text(legend) : name(node);
        const items = [...node.children]
          .filter(
            (item) =>
              item !== legend &&
              !references(node, "aria-labelledby").includes(
                item as HTMLElement,
              ),
          )
          .flatMap(read);
        return [
          {
            kind: "fieldset",
            label,
            disabled: disabled(node),
            children: items,
          },
        ];
      }
      if (node.matches("p,[role=alert],[role=status],pre"))
        return [
          { kind: "text", text: text(node), role: node.getAttribute("role") },
        ];
      if (node.matches("h1,h2,h3,h4,h5,h6"))
        return [
          {
            kind: "heading",
            text: text(node),
            level: Number(node.tagName.slice(1)),
          },
        ];
      if (node.matches("ul,ol"))
        return [
          {
            kind: "list",
            ordered: node.matches("ol"),
            items: [...node.children].map((item) => {
              const items = children(item);
              return items.length
                ? items
                : [{ kind: "text", text: text(item), role: null }];
            }),
          },
        ];
      const items = children(node);
      if (node instanceof HTMLFormElement)
        return [{ kind: "form", label: "", disabled: false, children: items }];
      if (node.matches("section"))
        return [
          {
            kind: "stack",
            label: node.getAttribute("aria-label") ?? "",
            disabled: false,
            children: items,
          },
        ];
      if (items.length > 1 && items.every((item) => item.kind === "button"))
        return [{ kind: "row", label: "", disabled: false, children: items }];
      return items;
    }
    const footer = [...dialog.children]
      .filter((node) => node !== section)
      .flatMap(read);
    return {
      source: "actual-business-edit-list-form",
      heading: text(heading),
      body: children(section),
      footer: footer.length
        ? [{ kind: "actions", label: "", disabled: false, children: footer }]
        : [],
    };
  });
}

/** Replace only the source stub's data, using literal ORIGINAL #194 D classes.
 * No product HTML/CSS, new style rules, masks or relaxed tolerances are used. */
export async function normalizeListFixture(
  page: Page,
  fixture: ListFixture | null,
  id: string,
) {
  if (!/^app-edit-list(?:-|$)/.test(id)) return [];
  if (!fixture)
    throw new Error("Missing actual Edit-list business-form fixture.");
  return page.evaluate((fixture) => {
    const dialog = document.querySelector(".v-D .dlg"),
      heading = dialog?.querySelector("h2");
    if (!dialog || !heading)
      throw new Error("Accepted #194 D Edit-list .dlg is unavailable.");
    const before = dialog.textContent;
    let sequence = 0;
    const make = (tag: string, className = "", content?: string) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (content !== undefined) node.textContent = content;
      return node;
    };
    const describe = (control: Element, parent: Element, lines: string[]) => {
      if (!lines.length) return;
      const description = make("span", "note", lines.join(" · "));
      description.id = `list-description-${++sequence}`;
      control.setAttribute("aria-describedby", description.id);
      parent.append(description);
    };
    function render(data: ListFixtureNode): HTMLElement {
      switch (data.kind) {
        case "fieldset":
        case "form":
        case "stack":
        case "row":
        case "actions": {
          const node = make(
            data.kind === "fieldset"
              ? "fieldset"
              : data.kind === "form"
                ? "form"
                : "div",
            data.kind === "row"
              ? "row"
              : data.kind === "actions"
                ? "acts"
                : "fs",
          );
          if (data.kind === "fieldset") {
            (node as HTMLFieldSetElement).disabled = data.disabled;
            node.append(make("legend", "", data.label));
          } else if (data.label) node.setAttribute("aria-label", data.label);
          if (data.kind === "form")
            node.addEventListener("submit", (event) => event.preventDefault());
          node.append(...data.children.map(render));
          return node;
        }
        case "field": {
          const node = make("label", "fld");
          node.append(make("span", "", data.label));
          const control = document.createElement(data.control);
          if (control instanceof HTMLInputElement) control.type = data.type;
          // .sel is the source's existing full-width generic control recipe;
          // its properties apply unchanged to the actual multiline input too.
          if (data.control !== "input") control.className = "sel";
          // D's own editable draft fields are rows="1" .fld textareas (the
          // native default of two rows is not a D recipe).
          if (control instanceof HTMLTextAreaElement) control.rows = 1;
          control.disabled = data.disabled;
          control.required = data.required;
          if (!(control instanceof HTMLSelectElement))
            control.readOnly = data.readOnly;
          if (data.placeholder !== null)
            control.setAttribute("placeholder", data.placeholder);
          if (data.invalid) control.setAttribute("aria-invalid", "true");
          if (control instanceof HTMLSelectElement)
            for (const option of data.options) {
              const item = new Option(
                option.label,
                option.value,
                false,
                option.selected,
              );
              item.disabled = option.disabled;
              control.append(item);
            }
          control.value = data.value;
          node.append(control);
          describe(control, node, data.descriptions);
          return node;
        }
        case "choice": {
          const node = make("label", "opt"),
            control = document.createElement("input");
          control.type = data.type;
          control.value = data.value;
          control.checked = data.checked;
          control.disabled = data.disabled;
          node.append(control, document.createTextNode(data.label));
          describe(control, node, data.descriptions);
          return node;
        }
        case "button": {
          const control = document.createElement("button");
          control.className =
            data.variant === "secondary" ? "btn" : `btn ${data.variant}`;
          control.textContent = data.label;
          control.type = data.type;
          control.disabled = data.disabled;
          if (data.pending) control.setAttribute("aria-busy", "true");
          if (!data.descriptions.length) return control;
          const node = make("div", "fs");
          node.append(control);
          describe(control, node, data.descriptions);
          return node;
        }
        case "text": {
          const node = make("p", "", data.text);
          if (data.role) node.setAttribute("role", data.role);
          return node;
        }
        case "heading":
          return make(`h${data.level}`, "", data.text);
        case "list": {
          const node = make(data.ordered ? "ol" : "ul");
          for (const items of data.items) {
            const item = make("li");
            item.append(...items.map(render));
            node.append(item);
          }
          return node;
        }
      }
    }
    heading.textContent = fixture.heading;
    for (const node of [...dialog.children])
      if (node !== heading) node.remove();
    dialog.append(...fixture.body.map(render), ...fixture.footer.map(render));
    return [
      {
        field: "dialog.actual-edit-list-business-form",
        reason:
          "Actual business form replaces the accepted #194 D Edit-list stub. All observed removal choices, addition fields, values, author controls, preview/actions, disabled reasons and errors use ORIGINAL .dlg/.fld/.sel/.fs/.opt/.row/.acts/.btn recipes. No product classes/styles/geometry or fabricated input content enter the oracle; original source CSS and fidelity gates/masks remain unchanged.",
        before,
        after: fixture,
        limitations: [
          "The source stub has no business workflow; projection records the reached real state and does not simulate requests, preview computation, revisions or saves.",
          "The real textarea retains auto-growth; source projection uses the existing .sel recipe without copying its measured height or adding CSS.",
        ],
      },
    ];
  }, fixture);
}
