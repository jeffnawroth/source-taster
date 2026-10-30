import { type BibliographyRequest } from "./bibliography.ts";
import { type VerificationClientOptions } from "./client.ts";
export declare function bibliographyClient(options?: VerificationClientOptions): (checkId: string, request: BibliographyRequest) => Promise<{
    style: "acs" | "ama" | "apa" | "chicago" | "din-iso-690" | "harvard" | "ieee" | "mla" | "oxford" | "springer" | "vancouver";
    rendererVersion: string;
    entries: {
        slot: number;
        suggestion: {
            text: string;
            rtf: string;
            html: string;
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
            };
        } | null;
        applied: boolean;
        resultToken?: string | undefined;
    }[];
    bibliography: {
        text: string;
        rtf: string;
        html: string;
    } | null;
}>;
