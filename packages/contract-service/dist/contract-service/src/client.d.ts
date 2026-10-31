import type { z } from "zod";
import { AccountPreferencesPatch, ExtensionSignInConfirmRequest, SignInChallengeRequest, SignInConfirmRequest, GuestTokenRequest, ProblemDetails } from "./index.ts";
export declare class GuestTokenError extends Error {
    readonly status: number;
    readonly problem: ProblemDetails | undefined;
    constructor(status: number, problem?: ProblemDetails);
}
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
};
