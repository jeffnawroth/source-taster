// SPDX-License-Identifier: AGPL-3.0-or-later
/** citeproc bibliography layout, retained in the downloaded/pasted document. */
export interface BibliographyLayout {
  entryspacing: number;
  linespacing: number;
  hangingindent?: boolean;
  "second-field-align": false | "flush" | "margin";
  maxoffset: number;
}
function indent(layout: BibliographyLayout) {
  return layout.hangingindent
    ? 720
    : layout["second-field-align"]
      ? Math.max(360, (layout.maxoffset + 1) * 120)
      : 0;
}
export function rtfParagraph(body: string, layout: BibliographyLayout) {
  const left = indent(layout);
  return `\\pard\\li${left}\\fi${-left}\\tx${left}\\sl${240 * layout.linespacing}\\slmult1\\sa${240 * layout.entryspacing} ${body}\\par`;
}
/** Keep safe typography only; layout is generated from numeric CSL parameters. */
export function clipboardHtml(html: string, layout: BibliographyLayout) {
  const stack: { original: string; output: string | null }[] = [];
  const allowed = new Set([
    "i",
    "b",
    "em",
    "strong",
    "sup",
    "sub",
    "p",
    "br",
    "div",
    "span",
  ]);
  return html.replace(/<!--[\s\S]*?-->|<[^>]*>/gu, (tag) => {
    const original = tag.match(/^<\/?([a-z0-9]+)/iu)?.[1]?.toLowerCase();
    if (!original) return "";
    if (tag.startsWith("</")) {
      const index = stack.findLastIndex((entry) => entry.original === original);
      if (index < 0) return "";
      return stack
        .splice(index)
        .reverse()
        .map((entry) => (entry.output ? `</${entry.output}>` : ""))
        .join("");
    }
    let output = allowed.has(original) ? original : null;
    let style = "";
    const role = tag.match(/\bclass="([^"]*)"/u)?.[1];
    if (
      original === "div" &&
      ["csl-left-margin", "csl-right-inline"].includes(role ?? "")
    ) {
      output = "span";
      if (role === "csl-left-margin")
        style = `display:inline-block;width:${indent(layout) / 1440}in;text-indent:0`;
    } else if (role === "csl-entry") {
      const left = indent(layout) / 1440;
      style = `margin:0 0 ${layout.entryspacing}em ${left}in;text-indent:-${left}in;line-height:${layout.linespacing}`;
    } else {
      const supplied = tag.match(/\bstyle="([^"]*)"/u)?.[1] ?? "";
      style = supplied
        .split(";")
        .map((value) => value.trim())
        .filter((value) =>
          /^(?:font-variant:\s*small-caps|font-style:\s*(?:italic|normal)|font-weight:\s*(?:bold|normal)|text-decoration:\s*underline)$/u.test(
            value,
          ),
        )
        .join(";");
    }
    if (
      !/\/\s*>$/u.test(tag) &&
      !["br", "img", "hr", "meta", "link", "input"].includes(original)
    )
      stack.push({ original, output });
    return output ? `<${output}${style ? ` style="${style}"` : ""}>` : "";
  });
}
