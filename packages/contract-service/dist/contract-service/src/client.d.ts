export { dpaClient, type DpaClient } from "./dpa-client.ts";
import type { z } from "zod";
import { AccountPreferencesPatch, ExtensionSignInConfirmRequest, SignInChallengeRequest, SignInConfirmRequest, GuestTokenRequest, ProblemDetails, AccountDeletionRequest, EmailChangeChallengeRequest, EmailChangeConfirmRequest, FreshProofChallengeRequest, FreshProofConfirmRequest } from "./index.ts";
export declare class GuestTokenError extends Error {
    readonly status: number;
    readonly problem: ProblemDetails | undefined;
    constructor(status: number, problem?: ProblemDetails);
}
/** What a UI can do with a failed sensitive-action call. Anything the private
 * service has not implemented (404/501) is `unavailable`, never a success. */
export type SensitiveFailure = "proof-required" | "proof-invalid" | "proof-exhausted" | "email-code-invalid" | "rate-limited" | "session-ended" | "unavailable" | "temporarily-unavailable" | "unknown";
export declare function sensitiveFailure(error: unknown): SensitiveFailure;
export declare function guestTokenClient(options: {
    baseUrl: string;
    fetch?: typeof fetch;
}): (input: GuestTokenRequest) => Promise<{
    accessToken: string;
    tokenType: "Bearer";
    expiresAt: string;
    expiresIn: 300;
}>;
/** Web transport only. The browser owns Secure HttpOnly cookies; no credential is returned or stored here. */
export declare function accountSessionClient(options: {
    baseUrl: string;
    fetch?: typeof fetch;
}): {
    dpa: {
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
        challenge: (input: import("./dpa.ts").DpaChallengeRequest) => Promise<{
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
        conclude: (input: import("./dpa.ts").DpaConcludeRequest) => Promise<{
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
    preferences: () => Promise<{
        language: "de" | "en";
        citationStyle: string;
    }>;
    updatePreferences: (patch: AccountPreferencesPatch) => Promise<{
        language: "de" | "en";
        citationStyle: string;
    }>;
    session: () => Promise<{
        accountId: string;
        ownerId: string;
        email: string;
    }>;
    challenge: (input: z.infer<typeof SignInChallengeRequest>) => Promise<{
        challengeId: string;
        expiresIn: number;
        resendAfter: number;
    }>;
    confirm: (input: z.infer<typeof SignInConfirmRequest>) => Promise<{
        accountId: string;
        ownerId: string;
        email: string;
    }>;
    token: () => Promise<{
        accessToken: string;
        tokenType: "Bearer";
        expiresAt: string;
        expiresIn: 300;
    }>;
    activity: () => Promise<{
        accountId: string;
        ownerId: string;
        email: string;
    }>;
    signOut: (everywhere: boolean) => Promise<{
        signedOut: true;
    }>;
    sensitive: {
        freshProofChallenge: (input: z.infer<typeof FreshProofChallengeRequest>) => Promise<{
            challengeId: string;
            action: "account-deletion" | "email-change";
            expiresIn: number;
            resendAfter: number;
        }>;
        freshProofConfirm: (input: z.infer<typeof FreshProofConfirmRequest>) => Promise<{
            action: "account-deletion" | "email-change";
            expiresAt: string;
            expiresIn: number;
        }>;
        emailChangeChallenge: (input: z.infer<typeof EmailChangeChallengeRequest>) => Promise<{
            challengeId: string;
            expiresIn: number;
            resendAfter: number;
        }>;
        emailChangeConfirm: (input: z.infer<typeof EmailChangeConfirmRequest>) => Promise<{
            accountId: string;
            ownerId: string;
            email: string;
        }>;
        deleteAccount: (input: z.infer<typeof AccountDeletionRequest>) => Promise<{
            status: "deleted" | "in-progress";
        }>;
    };
};
/** Extension transport only. These endpoints never consume web cookies.
 * The host owns trusted extension-local persistence and in-memory API tokens. */
export declare function extensionSessionClient(options: {
    baseUrl: string;
    fetch?: typeof fetch;
}): {
    dpa: (credential: string) => {
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
        challenge: (input: import("./dpa.ts").DpaChallengeRequest) => Promise<{
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
        conclude: (input: import("./dpa.ts").DpaConcludeRequest) => Promise<{
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
    challenge: (input: z.infer<typeof SignInChallengeRequest>) => Promise<{
        challengeId: string;
        expiresIn: number;
        resendAfter: number;
        transactionCredential: string;
    }>;
    confirm: (input: z.infer<typeof ExtensionSignInConfirmRequest>) => Promise<{
        session: {
            accountId: string;
            ownerId: string;
            email: string;
        };
        sessionCredential: string;
    }>;
    preferences: (credential: string) => Promise<{
        language: "de" | "en";
        citationStyle: string;
    }>;
    updatePreferences: (credential: string, patch: AccountPreferencesPatch) => Promise<{
        language: "de" | "en";
        citationStyle: string;
    }>;
    session: (credential: string) => Promise<{
        accountId: string;
        ownerId: string;
        email: string;
    }>;
    token: (credential: string) => Promise<{
        accessToken: string;
        tokenType: "Bearer";
        expiresAt: string;
        expiresIn: 300;
    }>;
    activity: (credential: string) => Promise<{
        accountId: string;
        ownerId: string;
        email: string;
    }>;
    signOut: (credential: string, everywhere: boolean) => Promise<{
        signedOut: true;
    }>;
    sensitive: {
        freshProofChallenge: (credential: string, input: z.infer<typeof FreshProofChallengeRequest>) => Promise<{
            challengeId: string;
            action: "account-deletion" | "email-change";
            expiresIn: number;
            resendAfter: number;
        }>;
        freshProofConfirm: (credential: string, input: z.infer<typeof FreshProofConfirmRequest>) => Promise<{
            action: "account-deletion" | "email-change";
            expiresAt: string;
            expiresIn: number;
        }>;
        emailChangeChallenge: (credential: string, input: z.infer<typeof EmailChangeChallengeRequest>) => Promise<{
            challengeId: string;
            expiresIn: number;
            resendAfter: number;
        }>;
        emailChangeConfirm: (credential: string, input: z.infer<typeof EmailChangeConfirmRequest>) => Promise<{
            accountId: string;
            ownerId: string;
            email: string;
        }>;
        deleteAccount: (credential: string, input: z.infer<typeof AccountDeletionRequest>) => Promise<{
            status: "deleted" | "in-progress";
        }>;
    };
};
