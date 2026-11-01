import { type VerificationClientOptions } from "./client.ts";
import { type ReportRequest } from "./report.ts";
export declare function reportClient(options?: VerificationClientOptions): {
    create: (checkId: string, request: ReportRequest, signal?: AbortSignal) => Promise<{
        id: string;
        checkId: string;
        language: "de" | "en";
        state: "cancelled" | "failed" | "generating" | "queued" | "ready";
        failure?: "limit-exceeded" | "unavailable" | "unsupported-character" | undefined;
        intermediate?: boolean | undefined;
        expiresAt: string;
    }>;
    status: (checkId: string, reportId: string, signal?: AbortSignal) => Promise<{
        id: string;
        checkId: string;
        language: "de" | "en";
        state: "cancelled" | "failed" | "generating" | "queued" | "ready";
        failure?: "limit-exceeded" | "unavailable" | "unsupported-character" | undefined;
        intermediate?: boolean | undefined;
        expiresAt: string;
    }>;
    cancel: (checkId: string, reportId: string, signal?: AbortSignal) => Promise<{
        id: string;
        checkId: string;
        language: "de" | "en";
        state: "cancelled" | "failed" | "generating" | "queued" | "ready";
        failure?: "limit-exceeded" | "unavailable" | "unsupported-character" | undefined;
        intermediate?: boolean | undefined;
        expiresAt: string;
    }>;
    download: (checkId: string, reportId: string, signal?: AbortSignal) => Promise<{
        blob: Blob;
        filename: string;
    }>;
};
