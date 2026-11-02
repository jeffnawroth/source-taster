import { CommerceInvoicesResponse } from "./commerce.js";
import { dpaClient } from "./dpa-client.js";
export { dpaClient } from "./dpa-client.js";
import { AccountPreferencesPatch, AccountPreferencesResponse, ExtensionCredential, ExtensionSignInChallengeResponse, ExtensionSignInConfirmRequest, ExtensionSignInConfirmResponse, SignInChallengeRequest, SignInChallengeResponse, SignInConfirmRequest, AccountSessionResponse, AccountTokenResponse, SignOutResponse, SignOutRequest, GuestTokenRequest, GuestTokenResponse, ProblemDetails, AccountDeletionRequest, AccountDeletionResponse, EmailChangeChallengeRequest, EmailChangeChallengeResponse, EmailChangeConfirmRequest, FreshProofChallengeRequest, FreshProofChallengeResponse, FreshProofConfirmRequest, FreshProofResponse, } from "./index.js";
export class GuestTokenError extends Error {
    status;
    problem;
    constructor(status, problem) {
        super(problem?.title ?? "Guest token unavailable");
        this.status = status;
        this.problem = problem;
    }
}
export function sensitiveFailure(error) {
    if (!(error instanceof GuestTokenError))
        return "unknown";
    const code = error.problem?.code;
    if (error.status === 401)
        return "session-ended";
    if (error.status === 404 || error.status === 501)
        return "unavailable";
    if (error.status === 503)
        return "temporarily-unavailable";
    if (error.status === 403)
        return code === "fresh-proof-required" ? "proof-required" : "session-ended";
    if (error.status === 429)
        return code === "fresh-proof-exhausted"
            ? "proof-exhausted"
            : "rate-limited";
    if (error.status === 400 && code === "fresh-proof-invalid")
        return "proof-invalid";
    if (error.status === 400 && code === "email-change-invalid")
        return "email-code-invalid";
    return "unknown";
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
        invoices: invoiceClient(options),
        dpa: dpaClient(options),
        preferences: async () => AccountPreferencesResponse.parse(await call("/v1/preferences")).data,
        updatePreferences: async (patch) => AccountPreferencesResponse.parse(await call("/v1/preferences", "PATCH", AccountPreferencesPatch.parse(patch))).data,
        session: async () => AccountSessionResponse.parse(await call("/v1/session")).data,
        challenge: async (input) => SignInChallengeResponse.parse(await call("/v1/sign-in/challenges", "POST", SignInChallengeRequest.parse(input))).data,
        confirm: async (input) => AccountSessionResponse.parse(await call("/v1/sign-in/confirm", "POST", SignInConfirmRequest.parse(input))).data,
        token: async () => AccountTokenResponse.parse(await call("/v1/account-tokens", "POST")).data,
        activity: async () => AccountSessionResponse.parse(await call("/v1/session/activity", "POST"))
            .data,
        signOut: async (everywhere) => SignOutResponse.parse(await call("/v1/sign-out", "POST", SignOutRequest.parse({ everywhere }))).data,
        sensitive: {
            freshProofChallenge: async (input) => FreshProofChallengeResponse.parse(await call("/v1/account/fresh-proof/challenges", "POST", FreshProofChallengeRequest.parse(input))).data,
            freshProofConfirm: async (input) => FreshProofResponse.parse(await call("/v1/account/fresh-proof/confirm", "POST", FreshProofConfirmRequest.parse(input))).data,
            emailChangeChallenge: async (input) => EmailChangeChallengeResponse.parse(await call("/v1/account/email-change/challenges", "POST", EmailChangeChallengeRequest.parse(input))).data,
            emailChangeConfirm: async (input) => AccountSessionResponse.parse(await call("/v1/account/email-change/confirm", "POST", EmailChangeConfirmRequest.parse(input))).data,
            deleteAccount: async (input) => AccountDeletionResponse.parse(await call("/v1/account/deletion", "POST", AccountDeletionRequest.parse(input))).data,
        },
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
        invoices: (credential) => invoiceClient({ ...options, credential }),
        dpa: (credential) => dpaClient({ ...options, credential }),
        challenge: async (input) => ExtensionSignInChallengeResponse.parse(await call("/sign-in/challenges", "POST", undefined, SignInChallengeRequest.parse(input))).data,
        confirm: async (input) => ExtensionSignInConfirmResponse.parse(await call("/sign-in/confirm", "POST", undefined, ExtensionSignInConfirmRequest.parse(input))).data,
        preferences: async (credential) => AccountPreferencesResponse.parse(await call("/preferences", "GET", credential)).data,
        updatePreferences: async (credential, patch) => AccountPreferencesResponse.parse(await call("/preferences", "PATCH", credential, AccountPreferencesPatch.parse(patch))).data,
        session: async (credential) => AccountSessionResponse.parse(await call("/session", "GET", credential))
            .data,
        token: async (credential) => AccountTokenResponse.parse(await call("/account-tokens", "POST", credential)).data,
        activity: async (credential) => AccountSessionResponse.parse(await call("/session/activity", "POST", credential)).data,
        signOut: async (credential, everywhere) => SignOutResponse.parse(await call("/sign-out", "POST", credential, SignOutRequest.parse({ everywhere }))).data,
        sensitive: {
            freshProofChallenge: async (credential, input) => FreshProofChallengeResponse.parse(await call("/account/fresh-proof/challenges", "POST", credential, FreshProofChallengeRequest.parse(input))).data,
            freshProofConfirm: async (credential, input) => FreshProofResponse.parse(await call("/account/fresh-proof/confirm", "POST", credential, FreshProofConfirmRequest.parse(input))).data,
            emailChangeChallenge: async (credential, input) => EmailChangeChallengeResponse.parse(await call("/account/email-change/challenges", "POST", credential, EmailChangeChallengeRequest.parse(input))).data,
            emailChangeConfirm: async (credential, input) => AccountSessionResponse.parse(await call("/account/email-change/confirm", "POST", credential, EmailChangeConfirmRequest.parse(input))).data,
            deleteAccount: async (credential, input) => AccountDeletionResponse.parse(await call("/account/deletion", "POST", credential, AccountDeletionRequest.parse(input))).data,
        },
    };
}
export function invoiceClient(options) {
    async function get(path) {
        const response = await (options.fetch ?? fetch)(`${options.baseUrl}/v1/${options.credential ? "extension/" : ""}commerce/invoices${path}`, {
            credentials: options.credential ? "omit" : "include",
            redirect: "error",
            cache: "no-store",
            headers: options.credential
                ? {
                    authorization: `Bearer ${ExtensionCredential.parse(options.credential)}`,
                }
                : {},
        });
        if (!response.ok)
            throw new GuestTokenError(response.status);
        return response;
    }
    return {
        list: async () => CommerceInvoicesResponse.parse(await (await get("")).json()).data,
        download: async (id, format) => (await get(`/${encodeURIComponent(id)}${format === "ubl" ? "/ubl" : ""}`)).blob(),
    };
}
