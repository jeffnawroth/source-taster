import { type ExportRequest } from "./export.ts";
import { type VerificationClientOptions } from "./client.ts";
export declare function exportClient(options?: VerificationClientOptions): (checkId: string, request: ExportRequest, signal?: AbortSignal) => Promise<{
    blob: Blob;
    filename: string;
}>;
