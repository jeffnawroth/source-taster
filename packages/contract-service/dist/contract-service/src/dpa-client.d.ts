import { DpaChallengeRequest, DpaConcludeRequest } from "./dpa.ts";
/** Transport only. Opaque extension credentials never become download URLs. */
export declare function dpaClient(options: {
    baseUrl: string;
    fetch?: typeof fetch;
    credential?: string;
}): {
    state: (language: "de" | "en") => Promise<{
        packet: {
            version: string;
            language: "de" | "en";
            documents: {
                kind: "agreement" | "annex" | "processing" | "subprocessors" | "toms";
                version: string;
                title: string;
                text: string;
            }[];
        } | null;
        party: {
            name: string;
            address: string;
            representative: string;
        } | null;
        partyRevision: number;
        agreements: {
            id: string;
            operationId: string;
            accountId: string;
            concludedAt: string;
            party: {
                name: string;
                address: string;
                representative: string;
            };
            partyRevision: number;
            packet: {
                version: string;
                language: "de" | "en";
                documents: {
                    kind: "agreement" | "annex" | "processing" | "subprocessors" | "toms";
                    version: string;
                    title: string;
                    text: string;
                }[];
            };
            authorityAccepted: true;
            businessUse: true;
        }[];
        notices: {
            id: string;
            agreementId: string;
            version: string;
            change: string;
            intendedEffectiveAt: string;
            objectionDeadline: string;
            objectionRoute: string;
            delivery: "queued" | "sent";
            objection: string | null;
            resolved: boolean;
        }[];
    }>;
    challenge: (input: DpaChallengeRequest) => Promise<{
        operationId: string;
        status: "concluded" | "expired" | "pending";
        expiresAt: string;
        agreement: {
            id: string;
            operationId: string;
            accountId: string;
            concludedAt: string;
            party: {
                name: string;
                address: string;
                representative: string;
            };
            partyRevision: number;
            packet: {
                version: string;
                language: "de" | "en";
                documents: {
                    kind: "agreement" | "annex" | "processing" | "subprocessors" | "toms";
                    version: string;
                    title: string;
                    text: string;
                }[];
            };
            authorityAccepted: true;
            businessUse: true;
        } | null;
    }>;
    conclude: (input: DpaConcludeRequest) => Promise<{
        operationId: string;
        status: "concluded" | "expired" | "pending";
        expiresAt: string;
        agreement: {
            id: string;
            operationId: string;
            accountId: string;
            concludedAt: string;
            party: {
                name: string;
                address: string;
                representative: string;
            };
            partyRevision: number;
            packet: {
                version: string;
                language: "de" | "en";
                documents: {
                    kind: "agreement" | "annex" | "processing" | "subprocessors" | "toms";
                    version: string;
                    title: string;
                    text: string;
                }[];
            };
            authorityAccepted: true;
            businessUse: true;
        } | null;
    }>;
    operation: (id: string) => Promise<{
        operationId: string;
        status: "concluded" | "expired" | "pending";
        expiresAt: string;
        agreement: {
            id: string;
            operationId: string;
            accountId: string;
            concludedAt: string;
            party: {
                name: string;
                address: string;
                representative: string;
            };
            partyRevision: number;
            packet: {
                version: string;
                language: "de" | "en";
                documents: {
                    kind: "agreement" | "annex" | "processing" | "subprocessors" | "toms";
                    version: string;
                    title: string;
                    text: string;
                }[];
            };
            authorityAccepted: true;
            businessUse: true;
        } | null;
    }>;
    download: (id: string) => Promise<Blob>;
    object: (input: {
        noticeId: string;
        reason: string;
    }) => Promise<void>;
};
export type DpaClient = ReturnType<typeof dpaClient>;
