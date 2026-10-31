import { z } from "zod";
export * from "../../contract-common/src/index.ts";
/** Infrastructure readiness only. This grants no identity, permission or Quota. */
export declare const ServiceStatusResponse: z.ZodObject<{
    data: z.ZodObject<{
        program: z.ZodLiteral<"service">;
        status: z.ZodLiteral<"ready">;
        authentication: z.ZodLiteral<"unavailable">;
    }, z.core.$strip>;
    quota: z.ZodUnion<readonly [z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
        granted: z.ZodNumber;
        reserved: z.ZodNumber;
        warning: z.ZodEnum<{
            eighty: "eighty";
            exhausted: "exhausted";
            none: "none";
        }>;
        grants: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export declare const GuestTokenRequest: z.ZodObject<{
    guestId: z.ZodUUID;
    client: z.ZodEnum<{
        extension: "extension";
        web: "web";
    }>;
}, z.core.$strict>;
export type GuestTokenRequest = z.infer<typeof GuestTokenRequest>;
export declare const GuestTokenResponse: z.ZodObject<{
    data: z.ZodObject<{
        accessToken: z.ZodString;
        tokenType: z.ZodLiteral<"Bearer">;
        expiresAt: z.ZodISODateTime;
        expiresIn: z.ZodLiteral<300>;
    }, z.core.$strict>;
    quota: z.ZodUnion<readonly [z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
        granted: z.ZodNumber;
        reserved: z.ZodNumber;
        warning: z.ZodEnum<{
            eighty: "eighty";
            exhausted: "exhausted";
            none: "none";
        }>;
        grants: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export type GuestTokenResponse = z.infer<typeof GuestTokenResponse>;
/** Browser session credentials are cookies, never fields in these responses. */
export declare const SignInChallengeRequest: z.ZodObject<{
    email: z.ZodEmail;
    language: z.ZodEnum<{
        de: "de";
        en: "en";
    }>;
}, z.core.$strict>;
export declare const SignInChallengeResponse: z.ZodObject<{
    data: z.ZodObject<{
        challengeId: z.ZodUUID;
        expiresIn: z.ZodNumber;
        resendAfter: z.ZodNumber;
    }, z.core.$strict>;
    quota: z.ZodUnion<readonly [z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
        granted: z.ZodNumber;
        reserved: z.ZodNumber;
        warning: z.ZodEnum<{
            eighty: "eighty";
            exhausted: "exhausted";
            none: "none";
        }>;
        grants: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export declare const SignInConfirmRequest: z.ZodObject<{
    challengeId: z.ZodUUID;
    code: z.ZodString;
}, z.core.$strict>;
export declare const AccountSessionResponse: z.ZodObject<{
    data: z.ZodObject<{
        accountId: z.ZodUUID;
        ownerId: z.ZodUUID;
        email: z.ZodEmail;
    }, z.core.$strict>;
    quota: z.ZodUnion<readonly [z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
        granted: z.ZodNumber;
        reserved: z.ZodNumber;
        warning: z.ZodEnum<{
            eighty: "eighty";
            exhausted: "exhausted";
            none: "none";
        }>;
        grants: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export type AccountSession = z.infer<typeof AccountSessionResponse>["data"];
export declare const AccountTokenResponse: z.ZodObject<{
    data: z.ZodObject<{
        accessToken: z.ZodString;
        tokenType: z.ZodLiteral<"Bearer">;
        expiresAt: z.ZodISODateTime;
        expiresIn: z.ZodLiteral<300>;
    }, z.core.$strict>;
    quota: z.ZodUnion<readonly [z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
        granted: z.ZodNumber;
        reserved: z.ZodNumber;
        warning: z.ZodEnum<{
            eighty: "eighty";
            exhausted: "exhausted";
            none: "none";
        }>;
        grants: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export declare const SignOutRequest: z.ZodObject<{
    everywhere: z.ZodBoolean;
}, z.core.$strict>;
export declare const SignOutResponse: z.ZodObject<{
    data: z.ZodObject<{
        signedOut: z.ZodLiteral<true>;
    }, z.core.$strict>;
    quota: z.ZodUnion<readonly [z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
        granted: z.ZodNumber;
        reserved: z.ZodNumber;
        warning: z.ZodEnum<{
            eighty: "eighty";
            exhausted: "exhausted";
            none: "none";
        }>;
        grants: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
/** Separate opaque bearer secrets, never verification-API access tokens.
 * Transaction secrets live only until confirmation; session secrets may live
 * only in trusted extension-local storage (ADR-0013/0015). */
export declare const ExtensionCredential: z.ZodString;
export declare const ExtensionSignInChallengeResponse: z.ZodObject<{
    data: z.ZodObject<{
        challengeId: z.ZodUUID;
        expiresIn: z.ZodNumber;
        resendAfter: z.ZodNumber;
        transactionCredential: z.ZodString;
    }, z.core.$strict>;
    quota: z.ZodUnion<readonly [z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
        granted: z.ZodNumber;
        reserved: z.ZodNumber;
        warning: z.ZodEnum<{
            eighty: "eighty";
            exhausted: "exhausted";
            none: "none";
        }>;
        grants: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export declare const ExtensionSignInConfirmRequest: z.ZodObject<{
    challengeId: z.ZodUUID;
    code: z.ZodString;
    transactionCredential: z.ZodString;
}, z.core.$strict>;
export declare const ExtensionSignInConfirmResponse: z.ZodObject<{
    data: z.ZodObject<{
        session: z.ZodObject<{
            accountId: z.ZodUUID;
            ownerId: z.ZodUUID;
            email: z.ZodEmail;
        }, z.core.$strict>;
        sessionCredential: z.ZodString;
    }, z.core.$strict>;
    quota: z.ZodUnion<readonly [z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
        granted: z.ZodNumber;
        reserved: z.ZodNumber;
        warning: z.ZodEnum<{
            eighty: "eighty";
            exhausted: "exhausted";
            none: "none";
        }>;
        grants: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
