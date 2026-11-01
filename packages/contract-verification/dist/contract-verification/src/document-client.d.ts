import { type VerificationClientOptions } from "./client.ts";
import { type TextStructuringRequest } from "./document.ts";
export declare function documentClient(options?: VerificationClientOptions): (file: Blob, name: string, signal?: AbortSignal) => Promise<{
    document: {
        format: "docx" | "pdf";
        text: string;
        notice: "partial-no-text" | null;
    };
    structuring: {
        rejected: {
            originalText: string;
            span: {
                start: number;
                end: number;
            };
            reason: "no-reference-features";
        }[];
        guidance: "no-references" | null;
        quotaConsumed: 0;
        referenceLimit: number;
        receipt?: {
            expiresAt: number;
            signature: string;
        } | undefined;
        references: {
            originalText: string;
            span: {
                start: number;
                end: number;
            };
            authorsTruncated?: boolean | undefined;
            csl: {
                type?: string | undefined;
                author?: {
                    family?: string | undefined;
                    "non-dropping-particle"?: string | undefined;
                    given?: string | undefined;
                    literal?: string | undefined;
                }[] | undefined;
                issued?: {
                    literal: string;
                } | undefined;
                title?: string | undefined;
                "container-title"?: string | undefined;
                "container-title-short"?: string | undefined;
                publisher?: string | undefined;
                "publisher-place"?: string | undefined;
                volume?: string | undefined;
                issue?: string | undefined;
                page?: string | undefined;
                "article-number"?: string | undefined;
                edition?: string | undefined;
                DOI?: string | undefined;
                URL?: string | undefined;
                ISBN?: string | undefined;
                ISSN?: string | undefined;
                PMID?: string | undefined;
                PMCID?: string | undefined;
                arXiv?: string | undefined;
            };
            fieldSources: Record<string, {
                raw: string;
                span?: {
                    start: number;
                    end: number;
                } | undefined;
                normalized?: string | undefined;
                provenance?: "ai" | "parser" | "user" | undefined;
            }>;
            structuring: {
                path: "ai" | "parser" | "user";
                version: string;
            };
            ai?: {
                configuration: string;
                notice: "ai-can-be-wrong";
                proposals: {
                    field: string;
                    value: unknown;
                    reason: "ungrounded";
                }[];
                changedFields: string[];
            } | undefined;
        }[];
        ai?: {
            reason: "configuration-unavailable" | "feature-unavailable" | "guest" | null;
            upgrade: boolean;
            fallbacks: {
                span: {
                    start: number;
                    end: number;
                };
                reason: "invalid-output" | "provider-unavailable" | "timeout";
            }[];
        } | undefined;
    };
    selection: {
        version: string;
        regions: {
            start: number;
            end: number;
        }[];
    };
    referenceLimitExceeded: boolean;
}>;
export declare function documentSettingsClient(options?: VerificationClientOptions): (signal?: AbortSignal) => Promise<{
    inputBytes: number;
}>;
export declare function textStructuringClient(options?: VerificationClientOptions): (input: TextStructuringRequest, signal?: AbortSignal) => Promise<{
    document: {
        text: string;
        selection: {
            version: string;
            regions: {
                start: number;
                end: number;
            }[];
        };
    } | null;
    structuring: {
        rejected: {
            originalText: string;
            span: {
                start: number;
                end: number;
            };
            reason: "no-reference-features";
        }[];
        guidance: "no-references" | null;
        quotaConsumed: 0;
        referenceLimit: number;
        receipt?: {
            expiresAt: number;
            signature: string;
        } | undefined;
        references: {
            originalText: string;
            span: {
                start: number;
                end: number;
            };
            authorsTruncated?: boolean | undefined;
            csl: {
                type?: string | undefined;
                author?: {
                    family?: string | undefined;
                    "non-dropping-particle"?: string | undefined;
                    given?: string | undefined;
                    literal?: string | undefined;
                }[] | undefined;
                issued?: {
                    literal: string;
                } | undefined;
                title?: string | undefined;
                "container-title"?: string | undefined;
                "container-title-short"?: string | undefined;
                publisher?: string | undefined;
                "publisher-place"?: string | undefined;
                volume?: string | undefined;
                issue?: string | undefined;
                page?: string | undefined;
                "article-number"?: string | undefined;
                edition?: string | undefined;
                DOI?: string | undefined;
                URL?: string | undefined;
                ISBN?: string | undefined;
                ISSN?: string | undefined;
                PMID?: string | undefined;
                PMCID?: string | undefined;
                arXiv?: string | undefined;
            };
            fieldSources: Record<string, {
                raw: string;
                span?: {
                    start: number;
                    end: number;
                } | undefined;
                normalized?: string | undefined;
                provenance?: "ai" | "parser" | "user" | undefined;
            }>;
            structuring: {
                path: "ai" | "parser" | "user";
                version: string;
            };
            ai?: {
                configuration: string;
                notice: "ai-can-be-wrong";
                proposals: {
                    field: string;
                    value: unknown;
                    reason: "ungrounded";
                }[];
                changedFields: string[];
            } | undefined;
        }[];
        ai?: {
            reason: "configuration-unavailable" | "feature-unavailable" | "guest" | null;
            upgrade: boolean;
            fallbacks: {
                span: {
                    start: number;
                    end: number;
                };
                reason: "invalid-output" | "provider-unavailable" | "timeout";
            }[];
        } | undefined;
    };
    referenceLimitExceeded: boolean;
}>;
