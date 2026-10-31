import { ExtensionCredential, ExtensionSignInChallengeResponse, ExtensionSignInConfirmRequest, ExtensionSignInConfirmResponse, SignInChallengeRequest, SignInChallengeResponse, SignInConfirmRequest, AccountSessionResponse, AccountTokenResponse, SignOutResponse, SignOutRequest, GuestTokenRequest, GuestTokenResponse, ProblemDetails, } from "./index.js";
export class GuestTokenError extends Error {
    status;
    problem;
    constructor(status, problem) {
        super(problem?.title ?? "Guest token unavailable");
        this.status = status;
        this.problem = problem;
    }
}
export function guestTokenClient(options) {
    return async (input) => {
        const response = await (options.fetch ?? fetch)(`${options.baseUrl}/v1/guest-tokens`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(GuestTokenRequest.parse(input)),
            credentials: "omit",
            redirect: "error",
            cache: "no-store",
        });
        const body = await response.json().catch(() => undefined);
        if (!response.ok)
            throw new GuestTokenError(response.status, ProblemDetails.safeParse(body).data);
        return GuestTokenResponse.parse(body).data;
    };
}
/** Web transport only. The browser owns Secure HttpOnly cookies; no credential is returned or stored here. */
export function accountSessionClient(options) {
    async function call(path, method = "GET", body) {
        const response = await (options.fetch ?? fetch)(`${options.baseUrl}${path}`, {
            method,
            credentials: "include",
            redirect: "error",
            cache: "no-store",
            headers: body === undefined ? {} : { "content-type": "application/json" },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
        const value = await response.json().catch(() => undefined);
        if (!response.ok)
            throw new GuestTokenError(response.status, ProblemDetails.safeParse(value).data);
        return value;
    }
    return {
        session: async () => AccountSessionResponse.parse(await call("/v1/session")).data,
        challenge: async (input) => SignInChallengeResponse.parse(await call("/v1/sign-in/challenges", "POST", SignInChallengeRequest.parse(input))).data,
        confirm: async (input) => AccountSessionResponse.parse(await call("/v1/sign-in/confirm", "POST", SignInConfirmRequest.parse(input))).data,
        token: async () => AccountTokenResponse.parse(await call("/v1/account-tokens", "POST")).data,
        activity: async () => AccountSessionResponse.parse(await call("/v1/session/activity", "POST"))
            .data,
        signOut: async (everywhere) => SignOutResponse.parse(await call("/v1/sign-out", "POST", SignOutRequest.parse({ everywhere }))).data,
    };
}
/** Extension transport only. These endpoints never consume web cookies.
 * The host owns trusted extension-local persistence and in-memory API tokens. */
export function extensionSessionClient(options) {
    async function call(path, method, credential, body) {
        const response = await (options.fetch ?? fetch)(`${options.baseUrl}/v1/extension${path}`, {
            method,
            credentials: "omit",
            redirect: "error",
            cache: "no-store",
            headers: {
                ...(credential === undefined
                    ? {}
                    : {
                        authorization: `Bearer ${ExtensionCredential.parse(credential)}`,
                    }),
                ...(body === undefined ? {} : { "content-type": "application/json" }),
            },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
        const value = await response.json().catch(() => undefined);
        if (!response.ok)
            throw new GuestTokenError(response.status, ProblemDetails.safeParse(value).data);
        return value;
    }
    return {
        challenge: async (input) => ExtensionSignInChallengeResponse.parse(await call("/sign-in/challenges", "POST", undefined, SignInChallengeRequest.parse(input))).data,
        confirm: async (input) => ExtensionSignInConfirmResponse.parse(await call("/sign-in/confirm", "POST", undefined, ExtensionSignInConfirmRequest.parse(input))).data,
        session: async (credential) => AccountSessionResponse.parse(await call("/session", "GET", credential))
            .data,
        token: async (credential) => AccountTokenResponse.parse(await call("/account-tokens", "POST", credential)).data,
        activity: async (credential) => AccountSessionResponse.parse(await call("/session/activity", "POST", credential)).data,
        signOut: async (credential, everywhere) => SignOutResponse.parse(await call("/sign-out", "POST", credential, SignOutRequest.parse({ everywhere }))).data,
    };
}
