import { z } from "zod";
export declare const ExportFormat: z.ZodEnum<{
    bibtex: "bibtex";
    "csl-json": "csl-json";
    "imported-format": "imported-format";
}>;
export type ExportFormat = z.infer<typeof ExportFormat>;
export declare const ExportRequest: z.ZodObject<{
    format: z.ZodEnum<{
        bibtex: "bibtex";
        "csl-json": "csl-json";
        "imported-format": "imported-format";
    }>;
    mode: z.ZodEnum<{
        original: "original";
        "selected-corrections": "selected-corrections";
    }>;
    corrections: z.ZodDefault<z.ZodArray<z.ZodObject<{
        slot: z.ZodNumber;
        resultToken: z.ZodString;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export type ExportRequest = z.input<typeof ExportRequest>;
