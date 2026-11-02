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
                "check-pack": "check-pack";
                credit: "credit";
                free: "free";
                guest: "guest";
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
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
                "check-pack": "check-pack";
                credit: "credit";
                free: "free";
                guest: "guest";
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export type GuestTokenResponse = z.infer<typeof GuestTokenResponse>;
/** Account data only: never Check content, Guest identity or theme/onboarding hooks. */
export declare const AccountPreferences: z.ZodObject<{
    language: z.ZodEnum<{
        de: "de";
        en: "en";
    }>;
    citationStyle: z.ZodEnum<{
        acs: "acs";
        ama: "ama";
        apa: "apa";
        chicago: "chicago";
        "din-iso-690": "din-iso-690";
        harvard: "harvard";
        ieee: "ieee";
        mla: "mla";
        oxford: "oxford";
        springer: "springer";
        vancouver: "vancouver";
    }>;
}, z.core.$strict>;
export type AccountPreferences = z.infer<typeof AccountPreferences>;
export declare const AccountPreferencesPatch: z.ZodObject<{
    language: z.ZodOptional<z.ZodEnum<{
        de: "de";
        en: "en";
    }>>;
    citationStyle: z.ZodOptional<z.ZodEnum<{
        acs: "acs";
        ama: "ama";
        apa: "apa";
        chicago: "chicago";
        "din-iso-690": "din-iso-690";
        harvard: "harvard";
        ieee: "ieee";
        mla: "mla";
        oxford: "oxford";
        springer: "springer";
        vancouver: "vancouver";
    }>>;
}, z.core.$strict>;
export type AccountPreferencesPatch = z.infer<typeof AccountPreferencesPatch>;
export declare const AccountPreferencesResponse: z.ZodObject<{
    data: z.ZodObject<{
        language: z.ZodEnum<{
            de: "de";
            en: "en";
        }>;
        citationStyle: z.ZodString;
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
                "check-pack": "check-pack";
                credit: "credit";
                free: "free";
                guest: "guest";
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
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
                "check-pack": "check-pack";
                credit: "credit";
                free: "free";
                guest: "guest";
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export declare const SignInConfirmRequest: z.ZodObject<{
    challengeId: z.ZodUUID;
    code: z.ZodString;
    preferences: z.ZodOptional<z.ZodObject<{
        language: z.ZodEnum<{
            de: "de";
            en: "en";
        }>;
        citationStyle: z.ZodEnum<{
            acs: "acs";
            ama: "ama";
            apa: "apa";
            chicago: "chicago";
            "din-iso-690": "din-iso-690";
            harvard: "harvard";
            ieee: "ieee";
            mla: "mla";
            oxford: "oxford";
            springer: "springer";
            vancouver: "vancouver";
        }>;
    }, z.core.$strict>>;
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
                "check-pack": "check-pack";
                credit: "credit";
                free: "free";
                guest: "guest";
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
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
                "check-pack": "check-pack";
                credit: "credit";
                free: "free";
                guest: "guest";
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
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
                "check-pack": "check-pack";
                credit: "credit";
                free: "free";
                guest: "guest";
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
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
                "check-pack": "check-pack";
                credit: "credit";
                free: "free";
                guest: "guest";
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export declare const ExtensionSignInConfirmRequest: z.ZodObject<{
    challengeId: z.ZodUUID;
    code: z.ZodString;
    preferences: z.ZodOptional<z.ZodObject<{
        language: z.ZodEnum<{
            de: "de";
            en: "en";
        }>;
        citationStyle: z.ZodEnum<{
            acs: "acs";
            ama: "ama";
            apa: "apa";
            chicago: "chicago";
            "din-iso-690": "din-iso-690";
            harvard: "harvard";
            ieee: "ieee";
            mla: "mla";
            oxford: "oxford";
            springer: "springer";
            vancouver: "vancouver";
        }>;
    }, z.core.$strict>>;
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
                "check-pack": "check-pack";
                credit: "credit";
                free: "free";
                guest: "guest";
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
/** #102 sensitive Account actions (ADR-0013). Proof is a server-side fact bound
 * to the requesting session and one action; it is never a bearer value, never in
 * a URL and never returned to the browser. `expiresAt` is display information. */
export declare const SensitiveAction: z.ZodEnum<{
    "account-deletion": "account-deletion";
    "email-change": "email-change";
}>;
export type SensitiveAction = z.infer<typeof SensitiveAction>;
export declare const FreshProofChallengeRequest: z.ZodObject<{
    action: z.ZodEnum<{
        "account-deletion": "account-deletion";
        "email-change": "email-change";
    }>;
    language: z.ZodEnum<{
        de: "de";
        en: "en";
    }>;
}, z.core.$strict>;
export declare const FreshProofChallengeResponse: z.ZodObject<{
    data: z.ZodObject<{
        challengeId: z.ZodUUID;
        action: z.ZodEnum<{
            "account-deletion": "account-deletion";
            "email-change": "email-change";
        }>;
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
                "check-pack": "check-pack";
                credit: "credit";
                free: "free";
                guest: "guest";
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export declare const FreshProofConfirmRequest: z.ZodObject<{
    challengeId: z.ZodUUID;
    code: z.ZodString;
    preferences: z.ZodOptional<z.ZodObject<{
        language: z.ZodEnum<{
            de: "de";
            en: "en";
        }>;
        citationStyle: z.ZodEnum<{
            acs: "acs";
            ama: "ama";
            apa: "apa";
            chicago: "chicago";
            "din-iso-690": "din-iso-690";
            harvard: "harvard";
            ieee: "ieee";
            mla: "mla";
            oxford: "oxford";
            springer: "springer";
            vancouver: "vancouver";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const FreshProofResponse: z.ZodObject<{
    data: z.ZodObject<{
        action: z.ZodEnum<{
            "account-deletion": "account-deletion";
            "email-change": "email-change";
        }>;
        expiresAt: z.ZodISODateTime;
        expiresIn: z.ZodNumber;
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
                "check-pack": "check-pack";
                credit: "credit";
                free: "free";
                guest: "guest";
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export type FreshProof = z.infer<typeof FreshProofResponse>["data"];
export declare const EmailChangeChallengeRequest: z.ZodObject<{
    newEmail: z.ZodEmail;
    language: z.ZodEnum<{
        de: "de";
        en: "en";
    }>;
}, z.core.$strict>;
/** Identical for every new address: existing and unknown ones are not told apart. */
export declare const EmailChangeChallengeResponse: z.ZodObject<{
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
                "check-pack": "check-pack";
                credit: "credit";
                free: "free";
                guest: "guest";
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export declare const EmailChangeConfirmRequest: z.ZodObject<{
    challengeId: z.ZodUUID;
    code: z.ZodString;
    preferences: z.ZodOptional<z.ZodObject<{
        language: z.ZodEnum<{
            de: "de";
            en: "en";
        }>;
        citationStyle: z.ZodEnum<{
            acs: "acs";
            ama: "ama";
            apa: "apa";
            chicago: "chicago";
            "din-iso-690": "din-iso-690";
            harvard: "harvard";
            ieee: "ieee";
            mla: "mla";
            oxford: "oxford";
            springer: "springer";
            vancouver: "vancouver";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>;
/** The eight-year blocked billing-retention notice must be acknowledged by value. */
export declare const AccountDeletionRequest: z.ZodObject<{
    billingRetentionAcknowledged: z.ZodLiteral<true>;
    billingRetentionYears: z.ZodLiteral<8>;
}, z.core.$strict>;
export declare const AccountDeletionResponse: z.ZodObject<{
    data: z.ZodObject<{
        status: z.ZodEnum<{
            deleted: "deleted";
            "in-progress": "in-progress";
        }>;
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
                "check-pack": "check-pack";
                credit: "credit";
                free: "free";
                guest: "guest";
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export type AccountDeletion = z.infer<typeof AccountDeletionResponse>["data"];
/** Problem `code` values the sensitive-action endpoints may use. */
export declare const sensitiveProblemCodes: readonly ["fresh-proof-required", "fresh-proof-invalid", "fresh-proof-exhausted", "email-change-invalid", "rate-limited"];
export * from "./commerce.ts";
export * from "./dpa.ts";
