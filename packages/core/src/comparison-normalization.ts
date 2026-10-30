// SPDX-License-Identifier: AGPL-3.0-or-later
import { decodeHTML } from "entities";
export function clean(raw: string, journal = false) {
  let value = decodeHTML(raw.replace(/<[^>]*>/gu, ""));
  // Inspect the case-preserved token after provider cleanup, before folding.
  if (journal)
    value = value.replace(/\s*(?:\([A-Z0-9]{2,}\)|\[[A-Z0-9]{2,}\])\s*$/u, "");
  // Recognized mojibake only; fatal decoding refuses incomplete/invalid repair.
  if (/[\u00c2-\u00f4]/u.test(value)) {
    const windows: Record<string, number> = {
      "€": 128,
      "‚": 130,
      ƒ: 131,
      "„": 132,
      "…": 133,
      "†": 134,
      "‡": 135,
      ˆ: 136,
      "‰": 137,
      Š: 138,
      "‹": 139,
      Œ: 140,
      Ž: 142,
      "‘": 145,
      "’": 146,
      "“": 147,
      "”": 148,
      "•": 149,
      "–": 150,
      "—": 151,
      "˜": 152,
      "™": 153,
      š: 154,
      "›": 155,
      œ: 156,
      ž: 158,
      Ÿ: 159,
    };
    const chars = [...value];
    let repaired = "";
    for (let i = 0; i < chars.length; i++) {
      const first = chars[i]!;
      const byte = first.codePointAt(0)!;
      const count =
        byte >= 0xc2 && byte <= 0xdf
          ? 2
          : byte >= 0xe0 && byte <= 0xef
            ? 3
            : byte >= 0xf0 && byte <= 0xf4
              ? 4
              : 0;
      if (count && i + count <= chars.length) {
        const bytes = chars
          .slice(i, i + count)
          .map((c) => windows[c] ?? c.codePointAt(0)!);
        if (bytes.every((byte) => byte <= 255)) {
          try {
            repaired += decodeURIComponent(
              bytes
                .map((byte) => "%" + byte.toString(16).padStart(2, "0"))
                .join(""),
            );
            i += count - 1;
            continue;
          } catch {
            /* Invalid sequences stay raw. */
          }
        }
      }
      repaired += first;
    }
    value = repaired;
  }
  value = value
    .normalize("NFKC")
    .replace(/[‐‑‒–—−]/gu, "-")
    .replace(/[‘’‚‛]/gu, "'")
    .replace(/[“”„‟]/gu, '"');
  return [...value]
    .map((c) => (c === "ı" ? c : c.toUpperCase().toLowerCase()))
    .join("")
    .replaceAll("ß", "ss")
    .replaceAll("ς", "σ");
}
/** Steps 5–6 on text that already passed exactly once through steps 1–4. */
export function foldClean(value: string, extended: boolean) {
  return value
    .replace(
      /[äöü]/gu,
      (c) =>
        ({
          ä: extended ? "ae" : "a",
          ö: extended ? "oe" : "o",
          ü: extended ? "ue" : "u",
        })[c]!,
    )
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}
