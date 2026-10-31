import type { z } from "zod";
import { ExtensionSignInConfirmRequest, SignInChallengeRequest, SignInConfirmRequest, GuestTokenRequest, ProblemDetails, AccountDeletionRequest, EmailChangeChallengeRequest, EmailChangeConfirmRequest, FreshProofChallengeRequest, FreshProofConfirmRequest } from "./index.ts";
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
