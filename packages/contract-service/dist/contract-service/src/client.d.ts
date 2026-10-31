import type { z } from "zod";
import { SignInChallengeRequest, SignInConfirmRequest, GuestTokenRequest, ProblemDetails } from "./index.ts";
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
