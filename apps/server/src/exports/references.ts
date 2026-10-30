// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Csl } from "@source-taster/core";
import type { ExportFormat } from "@source-taster/contract-verification/export";
import { bibtex } from "./bibtex.ts";
export interface ExportReference {
  authorsTruncated?: boolean;
  id: string;
  originalText: string;
  fields: Csl;
}
export interface ReferenceExporter {
  readonly format: string;
  readonly contentType: string;
  readonly filename: string;
  serialize(references: readonly ExportReference[]): string;
}
function cslItem(reference: ExportReference) {
  const { issued, ...fields } = reference.fields;
  const iso = issued?.literal.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/u);
  return {
    ...fields,
    id: reference.id,
    ...(issued
      ? {
          issued: iso
            ? { "date-parts": [iso.slice(1).filter(Boolean).map(Number)] }
            : issued,
        }
      : {}),
    custom: { originalText: reference.originalText },
  };
}
const cslJson: ReferenceExporter = {
  format: "csl-json",
  contentType: "application/vnd.citationstyles.csl+json; charset=utf-8",
  filename: "source-taster-references.json",
  serialize: (references) =>
    JSON.stringify(references.map(cslItem), null, 2) + "\n",
};
// New adapters (including the future RIS exporter) join this owned port.
const exporters: readonly ReferenceExporter[] = [cslJson, bibtex];
export function referenceExporter(format: ExportFormat): ReferenceExporter {
  const exporter = exporters.find((entry) => entry.format === format);
  if (!exporter) throw new Error("export-format-unavailable");
  return exporter;
}
