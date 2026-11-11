// SPDX-License-Identifier: AGPL-3.0-or-later
// PDF-native geometry for the accepted six project-owned silhouettes (#191,
// #197). No UI component, font glyph, brand asset or token-package artwork.
import type PDFDocument from "pdfkit";
import { opaque } from "@source-taster/design-tokens";
import type { ReportVerdict } from "./model.ts";
const paper = opaque.white;
const roles = {
  correct: "verdict-correct-mark",
  "exists-with-deviations": "verdict-deviations-mark",
  "mixed-citation": "verdict-mixed-mark",
  "doi-conflict": "verdict-doi-conflict-mark",
  "not-found": "verdict-not-found-mark",
  "not-verifiable": "verdict-not-verifiable-mark",
} as const;
export function verdictMark(
  doc: PDFDocument,
  verdict: ReportVerdict,
  x: number,
  y: number,
) {
  doc.save();
  doc.markContent("Artifact", { type: "Layout" });
  doc.translate(x, y).scale(0.6).lineCap("round").lineJoin("round");
  const color = paper[roles[verdict]];
  const inner = paper["on-verdict-mark"];
  switch (verdict) {
    case "correct":
      doc.circle(12, 12, 10.3).fill(color);
      doc.path("M7.3 12.4l3.2 3.2 6.2-6.8").lineWidth(2.3).stroke(inner);
      break;
    case "exists-with-deviations":
      doc.path("M12 1.6L22.4 12 12 22.4 1.6 12Z").fill(color);
      doc
        .path("M8 10.2h8M8 13.8h8M13.4 6.8l-2.8 10.4")
        .lineWidth(1.8)
        .stroke(inner);
      break;
    case "mixed-citation":
      doc.path("M12 1.7l8.9 5.1v10.4L12 22.3 3.1 17.2V6.8Z").fill(color);
      doc.circle(9.6, 12, 3.3).lineWidth(1.7).stroke(inner);
      doc.circle(14.4, 12, 3.3).stroke(inner);
      break;
    case "doi-conflict":
      doc.roundedRect(2.4, 2.4, 19.2, 19.2, 5.2).fill(color);
      doc
        .path("M6.4 12h3.4M14.2 12h3.4M11 15.6l2-7.2")
        .lineWidth(2)
        .stroke(inner);
      break;
    case "not-found":
      doc.circle(10.2, 10.2, 7.6).lineWidth(2.5).stroke(color);
      doc.path("M15.8 15.8l5.6 5.6").lineWidth(3.2).stroke(color);
      doc.path("M7.4 7.4l5.6 5.6M13 7.4l-5.6 5.6").lineWidth(1.9).stroke(color);
      break;
    case "not-verifiable":
      doc
        .circle(12, 12, 9.6)
        .lineWidth(2.1)
        .dash(3.4, { space: 2.7 })
        .stroke(color)
        .undash();
      doc
        .path("M9.5 9.6a2.6 2.6 0 1 1 3.7 2.3c-.9.5-1.2 1-1.2 1.9M12 17h.01")
        .lineWidth(2)
        .stroke(color);
      break;
  }
  doc.endMarkedContent();
  doc.restore();
}
