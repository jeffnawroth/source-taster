import { GuestTokenRequest, ProblemDetails } from "./index.ts";
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
