import {
  VatValidationRequest,
  VatValidationResponse,
  CommerceInvoicesResponse,
  SubscriptionRequest,
  SubscriptionOperation,
  SubscriptionConsent,
  SubscriptionResponse,
  SubscriptionsResponse,
} from "./commerce.ts";
import { z } from "zod";
import {
  CommerceCatalogResponse,
  CheckPackOrderRequest,
  CheckPackOrderResponse,
  CheckPackOrdersResponse,
} from "./commerce.ts";
import { webDpaRoutes, extensionDpaRoutes } from "./dpa-routes.ts";
export { webDpaRoutes, extensionDpaRoutes };
// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { createRoute } from "@hono/zod-openapi";
import {
  AccountPreferencesPatch,
  AccountPreferencesResponse,
  ExtensionSignInChallengeResponse,
  ExtensionSignInConfirmRequest,
  ExtensionSignInConfirmResponse,
  SignInChallengeRequest,
  SignInChallengeResponse,
  SignInConfirmRequest,
  AccountSessionResponse,
  AccountTokenResponse,
  SignOutRequest,
  SignOutResponse,
  GuestTokenRequest,
  GuestTokenResponse,
  PublicJwks,
  ProblemDetails,
  ServiceStatusResponse,
  AccountDeletionRequest,
  AccountDeletionResponse,
  EmailChangeChallengeRequest,
  EmailChangeChallengeResponse,
  EmailChangeConfirmRequest,
  FreshProofChallengeRequest,
  FreshProofChallengeResponse,
  FreshProofConfirmRequest,
  FreshProofResponse,
} from "./index.ts";
export const getServiceStatus = createRoute({
  method: "get",
  path: "/v1/status",
  summary: "Read infrastructure readiness; authentication is not implemented",
  responses: {
    200: {
      description: "Ready; no authorization or Quota is granted",
      content: { "application/json": { schema: ServiceStatusResponse } },
    },
  },
});
const problem = {
  description: "Denied or unavailable",
  content: { "application/problem+json": { schema: ProblemDetails } },
};
export const issueGuestToken = createRoute({
  method: "post",
  path: "/v1/guest-tokens",
  summary: "Issue or renew a five-minute Guest access token; no Quota grant",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: GuestTokenRequest } },
    },
  },
  responses: {
    200: {
      description: "Guest verification access token",
      content: { "application/json": { schema: GuestTokenResponse } },
    },
    400: problem,
    403: problem,
    503: problem,
  },
});
export const getGuestJwks = createRoute({
  method: "get",
  path: "/.well-known/jwks.json",
  summary: "Current public access-token keys",
  responses: {
    200: {
      description: "Ed25519 JWKS",
      content: { "application/json": { schema: PublicJwks } },
    },
    503: problem,
  },
});
function post(
  path: string,
  summary: string,
  input:
    | typeof SignInChallengeRequest
    | typeof SignInConfirmRequest
    | typeof SignOutRequest,
  output:
    | typeof SignInChallengeResponse
    | typeof AccountSessionResponse
    | typeof SignOutResponse,
) {
  return createRoute({
    method: "post",
    path,
    summary,
    request: {
      body: {
        required: true,
        content: { "application/json": { schema: input } },
      },
    },
    responses: {
      200: {
        description: "Success",
        content: { "application/json": { schema: output } },
      },
      400: problem,
      401: problem,
      403: problem,
      429: problem,
      503: problem,
    },
  });
}
export const requestSignIn = post(
  "/v1/sign-in/challenges",
  "Request a transaction-bound email code",
  SignInChallengeRequest,
  SignInChallengeResponse,
);
export const confirmSignIn = post(
  "/v1/sign-in/confirm",
  "Confirm email and create a host-scoped web session",
  SignInConfirmRequest,
  AccountSessionResponse,
);
export const signOut = post(
  "/v1/sign-out",
  "Revoke this session or every Account session",
  SignOutRequest,
  SignOutResponse,
);
export const getAccountSession = createRoute({
  method: "get",
  path: "/v1/session",
  summary: "Read the current web session (does not extend idle expiry)",
  responses: {
    200: {
      description: "Current Account",
      content: { "application/json": { schema: AccountSessionResponse } },
    },
    401: problem,
    503: problem,
  },
});
export const recordSessionActivity = createRoute({
  method: "post",
  path: "/v1/session/activity",
  summary:
    "Record foreground user activity; background token renewal does not extend idle expiry",
  responses: {
    200: {
      description: "Current Account",
      content: { "application/json": { schema: AccountSessionResponse } },
    },
    401: problem,
    403: problem,
    503: problem,
  },
});
export const issueAccountToken = createRoute({
  method: "post",
  path: "/v1/account-tokens",
  summary:
    "Issue a five-minute Account access token from a current web session",
  responses: {
    200: {
      description: "Verification token",
      content: { "application/json": { schema: AccountTokenResponse } },
    },
    401: problem,
    403: problem,
    503: problem,
  },
});

/** Extension endpoints deliberately separate from host-cookie web endpoints.
 * Origins must be deployment-qualified; a claimed extension ID grants nothing. */
const extensionBearer = {
  type: "http",
  scheme: "bearer",
  description:
    "Opaque extension session credential; never a web cookie or verification JWT",
} as const;
function extensionRoute(
  method: "get" | "post",
  path: string,
  summary: string,
  output:
    | typeof AccountSessionResponse
    | typeof AccountTokenResponse
    | typeof SignOutResponse
    | typeof ExtensionSignInChallengeResponse
    | typeof ExtensionSignInConfirmResponse,
  input?:
    | typeof SignInChallengeRequest
    | typeof ExtensionSignInConfirmRequest
    | typeof SignOutRequest,
  authenticated = true,
) {
  return createRoute({
    method,
    path: `/v1/extension${path}`,
    summary,
    ...(authenticated ? { security: [{ ExtensionSession: [] }] } : {}),
    ...(input
      ? {
          request: {
            body: {
              required: true,
              content: { "application/json": { schema: input } },
            },
          },
        }
      : {}),
    responses: {
      200: {
        description: "Success; no web cookie is read or set",
        content: { "application/json": { schema: output } },
      },
      400: problem,
      401: problem,
      403: problem,
      429: problem,
      503: problem,
    },
  });
}
export { extensionBearer };
export const requestExtensionSignIn = extensionRoute(
  "post",
  "/sign-in/challenges",
  "Request an extension-bound email code and in-memory transaction secret",
  ExtensionSignInChallengeResponse,
  SignInChallengeRequest,
  false,
);
export const confirmExtensionSignIn = extensionRoute(
  "post",
  "/sign-in/confirm",
  "Consume an extension-bound code and transaction secret; create an independent extension session",
  ExtensionSignInConfirmResponse,
  ExtensionSignInConfirmRequest,
  false,
);
export const getExtensionSession = extensionRoute(
  "get",
  "/session",
  "Read extension session; does not extend idle expiry",
  AccountSessionResponse,
);
export const issueExtensionAccountToken = extensionRoute(
  "post",
  "/account-tokens",
  "Issue a five-minute Account token; does not extend idle expiry",
  AccountTokenResponse,
);
export const recordExtensionSessionActivity = extensionRoute(
  "post",
  "/session/activity",
  "Record foreground user activity within absolute session expiry",
  AccountSessionResponse,
);
export const signOutExtension = extensionRoute(
  "post",
  "/sign-out",
  "Revoke this extension session or all Account sessions across clients",
  SignOutResponse,
  SignOutRequest,
);
/** PATCH is partial: the service must update only supplied columns atomically. */
function preferenceRoute(method: "get" | "patch", extension: boolean) {
  return createRoute({
    method,
    path: extension ? "/v1/extension/preferences" : "/v1/preferences",
    summary:
      method === "get"
        ? "Read current Account Preferences without extending idle expiry"
        : "Write supplied Account Preference fields; per-field last-write-wins",
    ...(extension ? { security: [{ ExtensionSession: [] }] } : {}),
    ...(method === "patch"
      ? {
          request: {
            body: {
              required: true,
              content: {
                "application/json": { schema: AccountPreferencesPatch },
              },
            },
          },
        }
      : {}),
    responses: {
      200: {
        description: "Authoritative Account Preferences; no-store",
        content: { "application/json": { schema: AccountPreferencesResponse } },
      },
      400: problem,
      401: problem,
      403: problem,
      429: problem,
      503: problem,
    },
  });
}
export const getAccountPreferences = preferenceRoute("get", false);
export const patchAccountPreferences = preferenceRoute("patch", false);
export const getExtensionPreferences = preferenceRoute("get", true);
export const patchExtensionPreferences = preferenceRoute("patch", true);

/** #102. The same five actions exist for the cookie web session and the
 * extension session; only the transport differs. */
function sensitive(
  prefix: "/v1" | "/v1/extension",
  path: string,
  summary: string,
  input:
    | typeof FreshProofChallengeRequest
    | typeof FreshProofConfirmRequest
    | typeof EmailChangeChallengeRequest
    | typeof AccountDeletionRequest,
  output:
    | typeof FreshProofChallengeResponse
    | typeof FreshProofResponse
    | typeof EmailChangeChallengeResponse
    | typeof AccountSessionResponse
    | typeof AccountDeletionResponse,
) {
  return createRoute({
    method: "post",
    path: `${prefix}/account${path}`,
    summary,
    ...(prefix === "/v1/extension"
      ? { security: [{ ExtensionSession: [] }] }
      : {}),
    request: {
      body: {
        required: true,
        content: { "application/json": { schema: input } },
      },
    },
    responses: {
      200: {
        description: "Success",
        content: { "application/json": { schema: output } },
      },
      400: problem,
      401: problem,
      403: problem,
      429: problem,
      501: problem,
      503: problem,
    },
  });
}
const sensitiveRoutes = (prefix: "/v1" | "/v1/extension") =>
  [
    sensitive(
      prefix,
      "/fresh-proof/challenges",
      "Send an email code to the current address to prove fresh control for one action",
      FreshProofChallengeRequest,
      FreshProofChallengeResponse,
    ),
    sensitive(
      prefix,
      "/fresh-proof/confirm",
      "Consume the code; fresh proof (at most five minutes, one action, this session) is recorded server-side",
      FreshProofConfirmRequest,
      FreshProofResponse,
    ),
    sensitive(
      prefix,
      "/email-change/challenges",
      "With fresh proof, send a code to the replacement address; the answer is the same for every address",
      EmailChangeChallengeRequest,
      EmailChangeChallengeResponse,
    ),
    sensitive(
      prefix,
      "/email-change/confirm",
      "With fresh proof, confirm the replacement address; Account and Owner IDs are preserved",
      EmailChangeConfirmRequest,
      AccountSessionResponse,
    ),
    sensitive(
      prefix,
      "/deletion",
      "With fresh proof and acknowledged eight-year blocked billing retention, delete the Account",
      AccountDeletionRequest,
      AccountDeletionResponse,
    ),
  ] as const;
export const webSensitiveRoutes = sensitiveRoutes("/v1");
export const extensionSensitiveRoutes = sensitiveRoutes("/v1/extension");
export const getCommerceCatalog = createRoute({
  method: "get",
  path: "/v1/commerce/catalog",
  summary: "Versioned Check packs and Order terms",
  responses: {
    200: {
      description: "Catalog",
      content: { "application/json": { schema: CommerceCatalogResponse } },
    },
    400: problem,
    503: problem,
  },
});
export const createCheckPackOrder = createRoute({
  method: "post",
  path: "/v1/commerce/orders",
  summary: "Conclude a binding Order before hosted payment collection",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: CheckPackOrderRequest } },
    },
  },
  responses: {
    200: {
      description: "Order",
      content: { "application/json": { schema: CheckPackOrderResponse } },
    },
    400: problem,
    401: problem,
    403: problem,
    409: problem,
    503: problem,
  },
});
export const getCheckPackOrders = createRoute({
  method: "get",
  path: "/v1/commerce/orders",
  summary: "Own Orders and durable confirmations",
  responses: {
    200: {
      description: "Orders",
      content: { "application/json": { schema: CheckPackOrdersResponse } },
    },
    401: problem,
    403: problem,
    503: problem,
  },
});
export const getCommerceInvoice = createRoute({
  method: "get",
  path: "/v1/commerce/invoices/{id}",
  summary: "Download an own archived invoice with a current web session",
  request: { params: z.object({ id: z.string().min(1).max(255) }) },
  responses: {
    200: {
      description: "Archived invoice PDF; no-store",
      content: { "application/pdf": { schema: z.string() } },
    },
    401: problem,
    403: problem,
    404: problem,
    503: problem,
  },
});
export const createSubscription = createRoute({
  method: "post",
  path: "/v1/commerce/subscriptions",
  summary: "Subscribe to monthly Pro through an own binding Order",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: SubscriptionRequest } },
    },
  },
  responses: {
    200: {
      description: "Subscription",
      content: { "application/json": { schema: SubscriptionResponse } },
    },
    400: problem,
    401: problem,
    403: problem,
    409: problem,
    503: problem,
  },
});
export const getSubscriptions = createRoute({
  method: "get",
  path: "/v1/commerce/subscriptions",
  summary: "Own subscription management, including failed payments",
  responses: {
    200: {
      description: "Subscriptions",
      content: { "application/json": { schema: SubscriptionsResponse } },
    },
    401: problem,
    403: problem,
    503: problem,
  },
});
export const cancelSubscription = createRoute({
  method: "post",
  path: "/v1/commerce/subscriptions/{id}/cancel",
  summary: "Record cancellation at the end of the paid period",
  request: {
    params: z.object({ id: z.uuid() }),
    body: {
      required: true,
      content: { "application/json": { schema: SubscriptionOperation } },
    },
  },
  responses: {
    200: {
      description: "Durable cancellation receipt",
      content: { "application/json": { schema: SubscriptionResponse } },
    },
    400: problem,
    401: problem,
    403: problem,
    404: problem,
    409: problem,
    503: problem,
  },
});
export const consentSubscription = createRoute({
  method: "post",
  path: "/v1/commerce/subscriptions/{id}/consent",
  summary: "Separately consent to earlier Pro activation",
  request: {
    params: z.object({ id: z.uuid() }),
    body: {
      required: true,
      content: { "application/json": { schema: SubscriptionConsent } },
    },
  },
  responses: {
    200: {
      description: "Activation consent",
      content: { "application/json": { schema: SubscriptionResponse } },
    },
    400: problem,
    401: problem,
    403: problem,
    404: problem,
    409: problem,
    503: problem,
  },
});
export const validateCommerceVat = createRoute({
  method: "post",
  path: "/v1/commerce/vat-validations",
  summary: "Validate a business VAT ID before ordering",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: VatValidationRequest } },
    },
  },
  responses: {
    200: {
      description: "Validation outcome",
      content: { "application/json": { schema: VatValidationResponse } },
    },
    400: problem,
    401: problem,
    403: problem,
    503: problem,
  },
});
export const getCommerceInvoices = createRoute({
  method: "get",
  path: "/v1/commerce/invoices",
  summary: "List own archived invoices",
  request: {
    query: z.object({ after: z.string().min(1).max(255).optional() }),
  },
  responses: {
    200: {
      description: "Invoices",
      content: { "application/json": { schema: CommerceInvoicesResponse } },
    },
    401: problem,
    403: problem,
    503: problem,
  },
});
export const getCommerceStructuredInvoice = createRoute({
  method: "get",
  path: "/v1/commerce/invoices/{id}/ubl",
  summary: "Download exact archived structured invoice bytes",
  request: { params: z.object({ id: z.string().min(1).max(255) }) },
  responses: {
    200: {
      description: "Archived UBL",
      content: { "application/xml": { schema: z.string() } },
    },
    401: problem,
    403: problem,
    404: problem,
    503: problem,
  },
});
export const extensionCommerceInvoices = createRoute({
  ...getCommerceInvoices,
  path: "/v1/extension/commerce/invoices",
});
export const extensionCommerceInvoice = createRoute({
  ...getCommerceInvoice,
  path: "/v1/extension/commerce/invoices/{id}",
});
export const extensionCommerceStructuredInvoice = createRoute({
  ...getCommerceStructuredInvoice,
  path: "/v1/extension/commerce/invoices/{id}/ubl",
});
export const routes = [
  extensionCommerceInvoices,
  extensionCommerceInvoice,
  extensionCommerceStructuredInvoice,
  validateCommerceVat,
  getCommerceInvoices,
  getCommerceStructuredInvoice,
  createSubscription,
  getSubscriptions,
  cancelSubscription,
  consentSubscription,
  getCommerceInvoice,
  getCommerceCatalog,
  createCheckPackOrder,
  getCheckPackOrders,
  ...Object.values(webDpaRoutes),
  ...Object.values(extensionDpaRoutes),
  getAccountPreferences,
  patchAccountPreferences,
  getExtensionPreferences,
  patchExtensionPreferences,
  getServiceStatus,
  issueGuestToken,
  getGuestJwks,
  requestSignIn,
  confirmSignIn,
  getAccountSession,
  issueAccountToken,
  recordSessionActivity,
  signOut,
  requestExtensionSignIn,
  confirmExtensionSignIn,
  getExtensionSession,
  issueExtensionAccountToken,
  recordExtensionSessionActivity,
  signOutExtension,
  ...webSensitiveRoutes,
  ...extensionSensitiveRoutes,
];
