import { z } from "zod";
export declare const createCheck: {
    method: "post";
    path: "/v1/checks";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodUnion<readonly [z.ZodObject<{
                        text: z.ZodString;
                    }, z.core.$strip>, z.ZodObject<{
                        references: z.ZodArray<z.ZodObject<{
                            originalText: z.ZodString;
                            fields: z.ZodObject<{
                                type: z.ZodOptional<z.ZodString>;
                                author: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                    family: z.ZodOptional<z.ZodString>;
                                    "non-dropping-particle": z.ZodOptional<z.ZodString>;
                                    given: z.ZodOptional<z.ZodString>;
                                    literal: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>>>;
                                issued: z.ZodOptional<z.ZodObject<{
                                    literal: z.ZodString;
                                }, z.core.$strip>>;
                                title: z.ZodOptional<z.ZodString>;
                                "container-title": z.ZodOptional<z.ZodString>;
                                "container-title-short": z.ZodOptional<z.ZodString>;
                                publisher: z.ZodOptional<z.ZodString>;
                                "publisher-place": z.ZodOptional<z.ZodString>;
                                volume: z.ZodOptional<z.ZodString>;
                                issue: z.ZodOptional<z.ZodString>;
                                page: z.ZodOptional<z.ZodString>;
                                "article-number": z.ZodOptional<z.ZodString>;
                                edition: z.ZodOptional<z.ZodString>;
                                DOI: z.ZodOptional<z.ZodString>;
                                URL: z.ZodOptional<z.ZodString>;
                                ISBN: z.ZodOptional<z.ZodString>;
                                ISSN: z.ZodOptional<z.ZodString>;
                                PMID: z.ZodOptional<z.ZodString>;
                                PMCID: z.ZodOptional<z.ZodString>;
                            }, z.core.$strip>;
                            authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strip>>;
                    }, z.core.$strip>]>;
                };
            };
        };
    };
    responses: {
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        429: {
            description: string;
            headers: z.ZodObject<{
                "Retry-After": z.ZodString;
            }, z.core.$strip>;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        status: z.ZodLiteral<429>;
                        code: z.ZodLiteral<"abuse-limit">;
                        i18nKey: z.ZodLiteral<"problem_abuse_limit">;
                        retryAt: z.ZodISODateTime;
                    }, z.core.$strip>;
                };
            };
        };
        201: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            measuredConfigurationId: z.ZodOptional<z.ZodString>;
                            id: z.ZodUUID;
                            state: z.ZodEnum<{
                                ended: "ended";
                                running: "running";
                            }>;
                            lastEventSeq: z.ZodNumber;
                            lastEventCursor: z.ZodString;
                            leaseRenewAfterMs: z.ZodNumber;
                            endReason: z.ZodNullable<z.ZodEnum<{
                                cancelled: "cancelled";
                                completed: "completed";
                                "lease-expired": "lease-expired";
                            }>>;
                            references: z.ZodArray<z.ZodObject<{
                                slot: z.ZodNumber;
                                originalText: z.ZodString;
                                outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                    kind: z.ZodLiteral<"status">;
                                    status: z.ZodEnum<{
                                        cancelled: "cancelled";
                                        failed: "failed";
                                        "not-checked": "not-checked";
                                        running: "running";
                                    }>;
                                }, z.core.$strict>, z.ZodObject<{
                                    kind: z.ZodLiteral<"verdict">;
                                    measuredConfigurationId: z.ZodOptional<z.ZodString>;
                                    verdict: z.ZodEnum<{
                                        correct: "correct";
                                        "doi-conflict": "doi-conflict";
                                        "exists-with-deviations": "exists-with-deviations";
                                        "mixed-citation": "mixed-citation";
                                        "not-found": "not-found";
                                        "not-verifiable": "not-verifiable";
                                    }>;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
                                        }, z.core.$strip>;
                                        csl: z.ZodObject<{
                                            type: z.ZodOptional<z.ZodString>;
                                            author: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                                family: z.ZodOptional<z.ZodString>;
                                                "non-dropping-particle": z.ZodOptional<z.ZodString>;
                                                given: z.ZodOptional<z.ZodString>;
                                                literal: z.ZodOptional<z.ZodString>;
                                            }, z.core.$strip>>>;
                                            issued: z.ZodOptional<z.ZodObject<{
                                                literal: z.ZodString;
                                            }, z.core.$strip>>;
                                            title: z.ZodOptional<z.ZodString>;
                                            "container-title": z.ZodOptional<z.ZodString>;
                                            "container-title-short": z.ZodOptional<z.ZodString>;
                                            publisher: z.ZodOptional<z.ZodString>;
                                            "publisher-place": z.ZodOptional<z.ZodString>;
                                            volume: z.ZodOptional<z.ZodString>;
                                            issue: z.ZodOptional<z.ZodString>;
                                            page: z.ZodOptional<z.ZodString>;
                                            "article-number": z.ZodOptional<z.ZodString>;
                                            edition: z.ZodOptional<z.ZodString>;
                                            DOI: z.ZodOptional<z.ZodString>;
                                            URL: z.ZodOptional<z.ZodString>;
                                            ISBN: z.ZodOptional<z.ZodString>;
                                            ISSN: z.ZodOptional<z.ZodString>;
                                            PMID: z.ZodOptional<z.ZodString>;
                                            PMCID: z.ZodOptional<z.ZodString>;
                                        }, z.core.$strip>;
                                        fieldSources: z.ZodRecord<z.ZodString, z.ZodObject<{
                                            raw: z.ZodString;
                                            span: z.ZodOptional<z.ZodObject<{
                                                start: z.ZodNumber;
                                                end: z.ZodNumber;
                                            }, z.core.$strip>>;
                                            normalized: z.ZodOptional<z.ZodString>;
                                        }, z.core.$strip>>;
                                        authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                                        structuring: z.ZodObject<{
                                            path: z.ZodEnum<{
                                                parser: "parser";
                                                user: "user";
                                            }>;
                                            version: z.ZodString;
                                        }, z.core.$strip>;
                                    }, z.core.$strip>;
                                    scoringRules: z.ZodObject<{
                                        version: z.ZodString;
                                        calibration: z.ZodLiteral<"uncalibrated">;
                                        unicode: z.ZodString;
                                        icu: z.ZodString;
                                        profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                    }, z.core.$strip>;
                                    searchStrategyVersion: z.ZodString;
                                    searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                    identity: z.ZodObject<{
                                        kind: z.ZodEnum<{
                                            "independent-bibliography": "independent-bibliography";
                                            "supplied-doi": "supplied-doi";
                                            unresolved: "unresolved";
                                        }>;
                                        candidateId: z.ZodOptional<z.ZodString>;
                                    }, z.core.$strip>;
                                    bestMatchId: z.ZodNullable<z.ZodString>;
                                    candidates: z.ZodArray<z.ZodObject<{
                                        id: z.ZodString;
                                        source: z.ZodLiteral<"crossref">;
                                        origin: z.ZodEnum<{
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            title: "title";
                                        }>;
                                        slot: z.ZodNumber;
                                        retrievedAt: z.ZodString;
                                        csl: z.ZodObject<{
                                            type: z.ZodOptional<z.ZodString>;
                                            author: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                                family: z.ZodOptional<z.ZodString>;
                                                "non-dropping-particle": z.ZodOptional<z.ZodString>;
                                                given: z.ZodOptional<z.ZodString>;
                                                literal: z.ZodOptional<z.ZodString>;
                                            }, z.core.$strip>>>;
                                            issued: z.ZodOptional<z.ZodObject<{
                                                literal: z.ZodString;
                                            }, z.core.$strip>>;
                                            title: z.ZodOptional<z.ZodString>;
                                            "container-title": z.ZodOptional<z.ZodString>;
                                            "container-title-short": z.ZodOptional<z.ZodString>;
                                            publisher: z.ZodOptional<z.ZodString>;
                                            "publisher-place": z.ZodOptional<z.ZodString>;
                                            volume: z.ZodOptional<z.ZodString>;
                                            issue: z.ZodOptional<z.ZodString>;
                                            page: z.ZodOptional<z.ZodString>;
                                            "article-number": z.ZodOptional<z.ZodString>;
                                            edition: z.ZodOptional<z.ZodString>;
                                            DOI: z.ZodOptional<z.ZodString>;
                                            URL: z.ZodOptional<z.ZodString>;
                                            ISBN: z.ZodOptional<z.ZodString>;
                                            ISSN: z.ZodOptional<z.ZodString>;
                                            PMID: z.ZodOptional<z.ZodString>;
                                            PMCID: z.ZodOptional<z.ZodString>;
                                        }, z.core.$strip>;
                                        raw: z.ZodUnknown;
                                        fields: z.ZodArray<z.ZodObject<{
                                            field: z.ZodString;
                                            reference: z.ZodUnknown;
                                            candidate: z.ZodUnknown;
                                            score: z.ZodNullable<z.ZodObject<{
                                                value: z.ZodNumber;
                                                fullAgreement: z.ZodBoolean;
                                            }, z.core.$strip>>;
                                            reason: z.ZodEnum<{
                                                compared: "compared";
                                                "missing-candidate": "missing-candidate";
                                                "missing-reference": "missing-reference";
                                                "not-determinable": "not-determinable";
                                                "resource-limit": "resource-limit";
                                                unweighted: "unweighted";
                                            }>;
                                        }, z.core.$strip>>;
                                        score: z.ZodNullable<z.ZodObject<{
                                            value: z.ZodNumber;
                                            fullAgreement: z.ZodBoolean;
                                        }, z.core.$strip>>;
                                    }, z.core.$strip>>;
                                    evidence: z.ZodArray<z.ZodObject<{
                                        source: z.ZodEnum<{
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                        }>;
                                        operation: z.ZodEnum<{
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            title: "title";
                                        }>;
                                        outcome: z.ZodEnum<{
                                            candidate: "candidate";
                                            exists: "exists";
                                            "no-record": "no-record";
                                            nonexistent: "nonexistent";
                                            unavailable: "unavailable";
                                        }>;
                                        reason: z.ZodOptional<z.ZodString>;
                                        status: z.ZodOptional<z.ZodNumber>;
                                        durationMs: z.ZodNumber;
                                        attempts: z.ZodNumber;
                                        observedAt: z.ZodString;
                                        raw: z.ZodOptional<z.ZodUnknown>;
                                    }, z.core.$strip>>;
                                    reasons: z.ZodArray<z.ZodEnum<{
                                        "development-route-incomplete": "development-route-incomplete";
                                        "doi-nonexistent": "doi-nonexistent";
                                        "fields-differ": "fields-differ";
                                        "foreign-doi": "foreign-doi";
                                        identified: "identified";
                                        "identity-unresolved": "identity-unresolved";
                                        "mandatory-resolution-incomplete": "mandatory-resolution-incomplete";
                                        "metadata-unavailable": "metadata-unavailable";
                                        "outside-coverage": "outside-coverage";
                                        "url-verification-incomplete": "url-verification-incomplete";
                                    }>>;
                                    failedSources: z.ZodArray<z.ZodEnum<{
                                        crossref: "crossref";
                                        "doi.org": "doi.org";
                                    }>>;
                                    retraction: z.ZodLiteral<"unknown">;
                                }, z.core.$strict>], "kind">;
                                progress: z.ZodEnum<{
                                    checking: "checking";
                                    crossref: "crossref";
                                    "doi.org": "doi.org";
                                    ended: "ended";
                                    queued: "queued";
                                }>;
                            }, z.core.$strip>>;
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
                                settingsVersion: z.ZodOptional<z.ZodNumber>;
                                freeHistoryChecks: z.ZodOptional<z.ZodNumber>;
                                freeHistoryDays: z.ZodOptional<z.ZodNumber>;
                                paidHistoryDays: z.ZodOptional<z.ZodNumber>;
                            }, z.core.$strip>>;
                        }, z.core.$strip>, z.ZodObject<{
                            status: z.ZodLiteral<"not-implemented">;
                        }, z.core.$strict>, z.ZodObject<{
                            status: z.ZodLiteral<"unavailable">;
                        }, z.core.$strict>, z.ZodNull]>;
                    }, z.core.$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v1/checks";
};
export declare const getCheck: {
    method: "get";
    path: "/v1/checks/{checkId}";
    summary: string;
    request: {
        params: z.ZodObject<{
            checkId: z.ZodUUID;
        }, z.core.$strip>;
    };
    responses: {
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        429: {
            description: string;
            headers: z.ZodObject<{
                "Retry-After": z.ZodString;
            }, z.core.$strip>;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        status: z.ZodLiteral<429>;
                        code: z.ZodLiteral<"abuse-limit">;
                        i18nKey: z.ZodLiteral<"problem_abuse_limit">;
                        retryAt: z.ZodISODateTime;
                    }, z.core.$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            measuredConfigurationId: z.ZodOptional<z.ZodString>;
                            id: z.ZodUUID;
                            state: z.ZodEnum<{
                                ended: "ended";
                                running: "running";
                            }>;
                            lastEventSeq: z.ZodNumber;
                            lastEventCursor: z.ZodString;
                            leaseRenewAfterMs: z.ZodNumber;
                            endReason: z.ZodNullable<z.ZodEnum<{
                                cancelled: "cancelled";
                                completed: "completed";
                                "lease-expired": "lease-expired";
                            }>>;
                            references: z.ZodArray<z.ZodObject<{
                                slot: z.ZodNumber;
                                originalText: z.ZodString;
                                outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                    kind: z.ZodLiteral<"status">;
                                    status: z.ZodEnum<{
                                        cancelled: "cancelled";
                                        failed: "failed";
                                        "not-checked": "not-checked";
                                        running: "running";
                                    }>;
                                }, z.core.$strict>, z.ZodObject<{
                                    kind: z.ZodLiteral<"verdict">;
                                    measuredConfigurationId: z.ZodOptional<z.ZodString>;
                                    verdict: z.ZodEnum<{
                                        correct: "correct";
                                        "doi-conflict": "doi-conflict";
                                        "exists-with-deviations": "exists-with-deviations";
                                        "mixed-citation": "mixed-citation";
                                        "not-found": "not-found";
                                        "not-verifiable": "not-verifiable";
                                    }>;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
                                        }, z.core.$strip>;
                                        csl: z.ZodObject<{
                                            type: z.ZodOptional<z.ZodString>;
                                            author: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                                family: z.ZodOptional<z.ZodString>;
                                                "non-dropping-particle": z.ZodOptional<z.ZodString>;
                                                given: z.ZodOptional<z.ZodString>;
                                                literal: z.ZodOptional<z.ZodString>;
                                            }, z.core.$strip>>>;
                                            issued: z.ZodOptional<z.ZodObject<{
                                                literal: z.ZodString;
                                            }, z.core.$strip>>;
                                            title: z.ZodOptional<z.ZodString>;
                                            "container-title": z.ZodOptional<z.ZodString>;
                                            "container-title-short": z.ZodOptional<z.ZodString>;
                                            publisher: z.ZodOptional<z.ZodString>;
                                            "publisher-place": z.ZodOptional<z.ZodString>;
                                            volume: z.ZodOptional<z.ZodString>;
                                            issue: z.ZodOptional<z.ZodString>;
                                            page: z.ZodOptional<z.ZodString>;
                                            "article-number": z.ZodOptional<z.ZodString>;
                                            edition: z.ZodOptional<z.ZodString>;
                                            DOI: z.ZodOptional<z.ZodString>;
                                            URL: z.ZodOptional<z.ZodString>;
                                            ISBN: z.ZodOptional<z.ZodString>;
                                            ISSN: z.ZodOptional<z.ZodString>;
                                            PMID: z.ZodOptional<z.ZodString>;
                                            PMCID: z.ZodOptional<z.ZodString>;
                                        }, z.core.$strip>;
                                        fieldSources: z.ZodRecord<z.ZodString, z.ZodObject<{
                                            raw: z.ZodString;
                                            span: z.ZodOptional<z.ZodObject<{
                                                start: z.ZodNumber;
                                                end: z.ZodNumber;
                                            }, z.core.$strip>>;
                                            normalized: z.ZodOptional<z.ZodString>;
                                        }, z.core.$strip>>;
                                        authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                                        structuring: z.ZodObject<{
                                            path: z.ZodEnum<{
                                                parser: "parser";
                                                user: "user";
                                            }>;
                                            version: z.ZodString;
                                        }, z.core.$strip>;
                                    }, z.core.$strip>;
                                    scoringRules: z.ZodObject<{
                                        version: z.ZodString;
                                        calibration: z.ZodLiteral<"uncalibrated">;
                                        unicode: z.ZodString;
                                        icu: z.ZodString;
                                        profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                    }, z.core.$strip>;
                                    searchStrategyVersion: z.ZodString;
                                    searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                    identity: z.ZodObject<{
                                        kind: z.ZodEnum<{
                                            "independent-bibliography": "independent-bibliography";
                                            "supplied-doi": "supplied-doi";
                                            unresolved: "unresolved";
                                        }>;
                                        candidateId: z.ZodOptional<z.ZodString>;
                                    }, z.core.$strip>;
                                    bestMatchId: z.ZodNullable<z.ZodString>;
                                    candidates: z.ZodArray<z.ZodObject<{
                                        id: z.ZodString;
                                        source: z.ZodLiteral<"crossref">;
                                        origin: z.ZodEnum<{
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            title: "title";
                                        }>;
                                        slot: z.ZodNumber;
                                        retrievedAt: z.ZodString;
                                        csl: z.ZodObject<{
                                            type: z.ZodOptional<z.ZodString>;
                                            author: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                                family: z.ZodOptional<z.ZodString>;
                                                "non-dropping-particle": z.ZodOptional<z.ZodString>;
                                                given: z.ZodOptional<z.ZodString>;
                                                literal: z.ZodOptional<z.ZodString>;
                                            }, z.core.$strip>>>;
                                            issued: z.ZodOptional<z.ZodObject<{
                                                literal: z.ZodString;
                                            }, z.core.$strip>>;
                                            title: z.ZodOptional<z.ZodString>;
                                            "container-title": z.ZodOptional<z.ZodString>;
                                            "container-title-short": z.ZodOptional<z.ZodString>;
                                            publisher: z.ZodOptional<z.ZodString>;
                                            "publisher-place": z.ZodOptional<z.ZodString>;
                                            volume: z.ZodOptional<z.ZodString>;
                                            issue: z.ZodOptional<z.ZodString>;
                                            page: z.ZodOptional<z.ZodString>;
                                            "article-number": z.ZodOptional<z.ZodString>;
                                            edition: z.ZodOptional<z.ZodString>;
                                            DOI: z.ZodOptional<z.ZodString>;
                                            URL: z.ZodOptional<z.ZodString>;
                                            ISBN: z.ZodOptional<z.ZodString>;
                                            ISSN: z.ZodOptional<z.ZodString>;
                                            PMID: z.ZodOptional<z.ZodString>;
                                            PMCID: z.ZodOptional<z.ZodString>;
                                        }, z.core.$strip>;
                                        raw: z.ZodUnknown;
                                        fields: z.ZodArray<z.ZodObject<{
                                            field: z.ZodString;
                                            reference: z.ZodUnknown;
                                            candidate: z.ZodUnknown;
                                            score: z.ZodNullable<z.ZodObject<{
                                                value: z.ZodNumber;
                                                fullAgreement: z.ZodBoolean;
                                            }, z.core.$strip>>;
                                            reason: z.ZodEnum<{
                                                compared: "compared";
                                                "missing-candidate": "missing-candidate";
                                                "missing-reference": "missing-reference";
                                                "not-determinable": "not-determinable";
                                                "resource-limit": "resource-limit";
                                                unweighted: "unweighted";
                                            }>;
                                        }, z.core.$strip>>;
                                        score: z.ZodNullable<z.ZodObject<{
                                            value: z.ZodNumber;
                                            fullAgreement: z.ZodBoolean;
                                        }, z.core.$strip>>;
                                    }, z.core.$strip>>;
                                    evidence: z.ZodArray<z.ZodObject<{
                                        source: z.ZodEnum<{
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                        }>;
                                        operation: z.ZodEnum<{
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            title: "title";
                                        }>;
                                        outcome: z.ZodEnum<{
                                            candidate: "candidate";
                                            exists: "exists";
                                            "no-record": "no-record";
                                            nonexistent: "nonexistent";
                                            unavailable: "unavailable";
                                        }>;
                                        reason: z.ZodOptional<z.ZodString>;
                                        status: z.ZodOptional<z.ZodNumber>;
                                        durationMs: z.ZodNumber;
                                        attempts: z.ZodNumber;
                                        observedAt: z.ZodString;
                                        raw: z.ZodOptional<z.ZodUnknown>;
                                    }, z.core.$strip>>;
                                    reasons: z.ZodArray<z.ZodEnum<{
                                        "development-route-incomplete": "development-route-incomplete";
                                        "doi-nonexistent": "doi-nonexistent";
                                        "fields-differ": "fields-differ";
                                        "foreign-doi": "foreign-doi";
                                        identified: "identified";
                                        "identity-unresolved": "identity-unresolved";
                                        "mandatory-resolution-incomplete": "mandatory-resolution-incomplete";
                                        "metadata-unavailable": "metadata-unavailable";
                                        "outside-coverage": "outside-coverage";
                                        "url-verification-incomplete": "url-verification-incomplete";
                                    }>>;
                                    failedSources: z.ZodArray<z.ZodEnum<{
                                        crossref: "crossref";
                                        "doi.org": "doi.org";
                                    }>>;
                                    retraction: z.ZodLiteral<"unknown">;
                                }, z.core.$strict>], "kind">;
                                progress: z.ZodEnum<{
                                    checking: "checking";
                                    crossref: "crossref";
                                    "doi.org": "doi.org";
                                    ended: "ended";
                                    queued: "queued";
                                }>;
                            }, z.core.$strip>>;
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
                                settingsVersion: z.ZodOptional<z.ZodNumber>;
                                freeHistoryChecks: z.ZodOptional<z.ZodNumber>;
                                freeHistoryDays: z.ZodOptional<z.ZodNumber>;
                                paidHistoryDays: z.ZodOptional<z.ZodNumber>;
                            }, z.core.$strip>>;
                        }, z.core.$strip>, z.ZodObject<{
                            status: z.ZodLiteral<"not-implemented">;
                        }, z.core.$strict>, z.ZodObject<{
                            status: z.ZodLiteral<"unavailable">;
                        }, z.core.$strict>, z.ZodNull]>;
                    }, z.core.$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        404: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v1/checks/:checkId";
};
export declare const streamCheckEvents: {
    method: "get";
    path: "/v1/checks/{checkId}/events";
    summary: string;
    description: string;
    request: {
        params: z.ZodObject<{
            checkId: z.ZodUUID;
        }, z.core.$strip>;
        headers: z.ZodObject<{
            "last-event-id": z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
    responses: {
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        429: {
            description: string;
            headers: z.ZodObject<{
                "Retry-After": z.ZodString;
            }, z.core.$strip>;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        status: z.ZodLiteral<429>;
                        code: z.ZodLiteral<"abuse-limit">;
                        i18nKey: z.ZodLiteral<"problem_abuse_limit">;
                        retryAt: z.ZodISODateTime;
                    }, z.core.$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "text/event-stream": {
                    schema: z.ZodString;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        404: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v1/checks/:checkId/events";
};
/** Stateless Structuring preview, independent of placeholder Checks. */
export declare const structureReferences: {
    method: "post";
    path: "/v1/structurings";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        text: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
    responses: {
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        429: {
            description: string;
            headers: z.ZodObject<{
                "Retry-After": z.ZodString;
            }, z.core.$strip>;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        status: z.ZodLiteral<429>;
                        code: z.ZodLiteral<"abuse-limit">;
                        i18nKey: z.ZodLiteral<"problem_abuse_limit">;
                        retryAt: z.ZodISODateTime;
                    }, z.core.$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            references: z.ZodArray<z.ZodObject<{
                                originalText: z.ZodString;
                                span: z.ZodObject<{
                                    start: z.ZodNumber;
                                    end: z.ZodNumber;
                                }, z.core.$strip>;
                                csl: z.ZodObject<{
                                    type: z.ZodOptional<z.ZodString>;
                                    author: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                        family: z.ZodOptional<z.ZodString>;
                                        "non-dropping-particle": z.ZodOptional<z.ZodString>;
                                        given: z.ZodOptional<z.ZodString>;
                                        literal: z.ZodOptional<z.ZodString>;
                                    }, z.core.$strip>>>;
                                    issued: z.ZodOptional<z.ZodObject<{
                                        literal: z.ZodString;
                                    }, z.core.$strip>>;
                                    title: z.ZodOptional<z.ZodString>;
                                    "container-title": z.ZodOptional<z.ZodString>;
                                    "container-title-short": z.ZodOptional<z.ZodString>;
                                    publisher: z.ZodOptional<z.ZodString>;
                                    "publisher-place": z.ZodOptional<z.ZodString>;
                                    volume: z.ZodOptional<z.ZodString>;
                                    issue: z.ZodOptional<z.ZodString>;
                                    page: z.ZodOptional<z.ZodString>;
                                    "article-number": z.ZodOptional<z.ZodString>;
                                    edition: z.ZodOptional<z.ZodString>;
                                    DOI: z.ZodOptional<z.ZodString>;
                                    URL: z.ZodOptional<z.ZodString>;
                                    ISBN: z.ZodOptional<z.ZodString>;
                                    ISSN: z.ZodOptional<z.ZodString>;
                                    PMID: z.ZodOptional<z.ZodString>;
                                    PMCID: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>;
                                fieldSources: z.ZodRecord<z.ZodString, z.ZodObject<{
                                    raw: z.ZodString;
                                    span: z.ZodOptional<z.ZodObject<{
                                        start: z.ZodNumber;
                                        end: z.ZodNumber;
                                    }, z.core.$strip>>;
                                    normalized: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>>;
                                authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                                structuring: z.ZodObject<{
                                    path: z.ZodEnum<{
                                        parser: "parser";
                                        user: "user";
                                    }>;
                                    version: z.ZodString;
                                }, z.core.$strip>;
                            }, z.core.$strip>>;
                            rejected: z.ZodArray<z.ZodObject<{
                                originalText: z.ZodString;
                                span: z.ZodObject<{
                                    start: z.ZodNumber;
                                    end: z.ZodNumber;
                                }, z.core.$strip>;
                                reason: z.ZodLiteral<"no-reference-features">;
                            }, z.core.$strip>>;
                            guidance: z.ZodNullable<z.ZodLiteral<"no-references">>;
                            quotaConsumed: z.ZodLiteral<0>;
                            referenceLimit: z.ZodNumber;
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
                                settingsVersion: z.ZodOptional<z.ZodNumber>;
                                freeHistoryChecks: z.ZodOptional<z.ZodNumber>;
                                freeHistoryDays: z.ZodOptional<z.ZodNumber>;
                                paidHistoryDays: z.ZodOptional<z.ZodNumber>;
                            }, z.core.$strip>>;
                        }, z.core.$strip>, z.ZodObject<{
                            status: z.ZodLiteral<"not-implemented">;
                        }, z.core.$strict>, z.ZodObject<{
                            status: z.ZodLiteral<"unavailable">;
                        }, z.core.$strict>, z.ZodNull]>;
                    }, z.core.$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v1/structurings";
};
export declare const cancelCheck: {
    method: "post";
    path: "/v1/checks/{checkId}/cancel";
    summary: string;
    request: {
        params: z.ZodObject<{
            checkId: z.ZodUUID;
        }, z.core.$strip>;
    };
    responses: {
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        429: {
            description: string;
            headers: z.ZodObject<{
                "Retry-After": z.ZodString;
            }, z.core.$strip>;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        status: z.ZodLiteral<429>;
                        code: z.ZodLiteral<"abuse-limit">;
                        i18nKey: z.ZodLiteral<"problem_abuse_limit">;
                        retryAt: z.ZodISODateTime;
                    }, z.core.$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            measuredConfigurationId: z.ZodOptional<z.ZodString>;
                            id: z.ZodUUID;
                            state: z.ZodEnum<{
                                ended: "ended";
                                running: "running";
                            }>;
                            lastEventSeq: z.ZodNumber;
                            lastEventCursor: z.ZodString;
                            leaseRenewAfterMs: z.ZodNumber;
                            endReason: z.ZodNullable<z.ZodEnum<{
                                cancelled: "cancelled";
                                completed: "completed";
                                "lease-expired": "lease-expired";
                            }>>;
                            references: z.ZodArray<z.ZodObject<{
                                slot: z.ZodNumber;
                                originalText: z.ZodString;
                                outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                    kind: z.ZodLiteral<"status">;
                                    status: z.ZodEnum<{
                                        cancelled: "cancelled";
                                        failed: "failed";
                                        "not-checked": "not-checked";
                                        running: "running";
                                    }>;
                                }, z.core.$strict>, z.ZodObject<{
                                    kind: z.ZodLiteral<"verdict">;
                                    measuredConfigurationId: z.ZodOptional<z.ZodString>;
                                    verdict: z.ZodEnum<{
                                        correct: "correct";
                                        "doi-conflict": "doi-conflict";
                                        "exists-with-deviations": "exists-with-deviations";
                                        "mixed-citation": "mixed-citation";
                                        "not-found": "not-found";
                                        "not-verifiable": "not-verifiable";
                                    }>;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
                                        }, z.core.$strip>;
                                        csl: z.ZodObject<{
                                            type: z.ZodOptional<z.ZodString>;
                                            author: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                                family: z.ZodOptional<z.ZodString>;
                                                "non-dropping-particle": z.ZodOptional<z.ZodString>;
                                                given: z.ZodOptional<z.ZodString>;
                                                literal: z.ZodOptional<z.ZodString>;
                                            }, z.core.$strip>>>;
                                            issued: z.ZodOptional<z.ZodObject<{
                                                literal: z.ZodString;
                                            }, z.core.$strip>>;
                                            title: z.ZodOptional<z.ZodString>;
                                            "container-title": z.ZodOptional<z.ZodString>;
                                            "container-title-short": z.ZodOptional<z.ZodString>;
                                            publisher: z.ZodOptional<z.ZodString>;
                                            "publisher-place": z.ZodOptional<z.ZodString>;
                                            volume: z.ZodOptional<z.ZodString>;
                                            issue: z.ZodOptional<z.ZodString>;
                                            page: z.ZodOptional<z.ZodString>;
                                            "article-number": z.ZodOptional<z.ZodString>;
                                            edition: z.ZodOptional<z.ZodString>;
                                            DOI: z.ZodOptional<z.ZodString>;
                                            URL: z.ZodOptional<z.ZodString>;
                                            ISBN: z.ZodOptional<z.ZodString>;
                                            ISSN: z.ZodOptional<z.ZodString>;
                                            PMID: z.ZodOptional<z.ZodString>;
                                            PMCID: z.ZodOptional<z.ZodString>;
                                        }, z.core.$strip>;
                                        fieldSources: z.ZodRecord<z.ZodString, z.ZodObject<{
                                            raw: z.ZodString;
                                            span: z.ZodOptional<z.ZodObject<{
                                                start: z.ZodNumber;
                                                end: z.ZodNumber;
                                            }, z.core.$strip>>;
                                            normalized: z.ZodOptional<z.ZodString>;
                                        }, z.core.$strip>>;
                                        authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                                        structuring: z.ZodObject<{
                                            path: z.ZodEnum<{
                                                parser: "parser";
                                                user: "user";
                                            }>;
                                            version: z.ZodString;
                                        }, z.core.$strip>;
                                    }, z.core.$strip>;
                                    scoringRules: z.ZodObject<{
                                        version: z.ZodString;
                                        calibration: z.ZodLiteral<"uncalibrated">;
                                        unicode: z.ZodString;
                                        icu: z.ZodString;
                                        profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                    }, z.core.$strip>;
                                    searchStrategyVersion: z.ZodString;
                                    searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                    identity: z.ZodObject<{
                                        kind: z.ZodEnum<{
                                            "independent-bibliography": "independent-bibliography";
                                            "supplied-doi": "supplied-doi";
                                            unresolved: "unresolved";
                                        }>;
                                        candidateId: z.ZodOptional<z.ZodString>;
                                    }, z.core.$strip>;
                                    bestMatchId: z.ZodNullable<z.ZodString>;
                                    candidates: z.ZodArray<z.ZodObject<{
                                        id: z.ZodString;
                                        source: z.ZodLiteral<"crossref">;
                                        origin: z.ZodEnum<{
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            title: "title";
                                        }>;
                                        slot: z.ZodNumber;
                                        retrievedAt: z.ZodString;
                                        csl: z.ZodObject<{
                                            type: z.ZodOptional<z.ZodString>;
                                            author: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                                family: z.ZodOptional<z.ZodString>;
                                                "non-dropping-particle": z.ZodOptional<z.ZodString>;
                                                given: z.ZodOptional<z.ZodString>;
                                                literal: z.ZodOptional<z.ZodString>;
                                            }, z.core.$strip>>>;
                                            issued: z.ZodOptional<z.ZodObject<{
                                                literal: z.ZodString;
                                            }, z.core.$strip>>;
                                            title: z.ZodOptional<z.ZodString>;
                                            "container-title": z.ZodOptional<z.ZodString>;
                                            "container-title-short": z.ZodOptional<z.ZodString>;
                                            publisher: z.ZodOptional<z.ZodString>;
                                            "publisher-place": z.ZodOptional<z.ZodString>;
                                            volume: z.ZodOptional<z.ZodString>;
                                            issue: z.ZodOptional<z.ZodString>;
                                            page: z.ZodOptional<z.ZodString>;
                                            "article-number": z.ZodOptional<z.ZodString>;
                                            edition: z.ZodOptional<z.ZodString>;
                                            DOI: z.ZodOptional<z.ZodString>;
                                            URL: z.ZodOptional<z.ZodString>;
                                            ISBN: z.ZodOptional<z.ZodString>;
                                            ISSN: z.ZodOptional<z.ZodString>;
                                            PMID: z.ZodOptional<z.ZodString>;
                                            PMCID: z.ZodOptional<z.ZodString>;
                                        }, z.core.$strip>;
                                        raw: z.ZodUnknown;
                                        fields: z.ZodArray<z.ZodObject<{
                                            field: z.ZodString;
                                            reference: z.ZodUnknown;
                                            candidate: z.ZodUnknown;
                                            score: z.ZodNullable<z.ZodObject<{
                                                value: z.ZodNumber;
                                                fullAgreement: z.ZodBoolean;
                                            }, z.core.$strip>>;
                                            reason: z.ZodEnum<{
                                                compared: "compared";
                                                "missing-candidate": "missing-candidate";
                                                "missing-reference": "missing-reference";
                                                "not-determinable": "not-determinable";
                                                "resource-limit": "resource-limit";
                                                unweighted: "unweighted";
                                            }>;
                                        }, z.core.$strip>>;
                                        score: z.ZodNullable<z.ZodObject<{
                                            value: z.ZodNumber;
                                            fullAgreement: z.ZodBoolean;
                                        }, z.core.$strip>>;
                                    }, z.core.$strip>>;
                                    evidence: z.ZodArray<z.ZodObject<{
                                        source: z.ZodEnum<{
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                        }>;
                                        operation: z.ZodEnum<{
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            title: "title";
                                        }>;
                                        outcome: z.ZodEnum<{
                                            candidate: "candidate";
                                            exists: "exists";
                                            "no-record": "no-record";
                                            nonexistent: "nonexistent";
                                            unavailable: "unavailable";
                                        }>;
                                        reason: z.ZodOptional<z.ZodString>;
                                        status: z.ZodOptional<z.ZodNumber>;
                                        durationMs: z.ZodNumber;
                                        attempts: z.ZodNumber;
                                        observedAt: z.ZodString;
                                        raw: z.ZodOptional<z.ZodUnknown>;
                                    }, z.core.$strip>>;
                                    reasons: z.ZodArray<z.ZodEnum<{
                                        "development-route-incomplete": "development-route-incomplete";
                                        "doi-nonexistent": "doi-nonexistent";
                                        "fields-differ": "fields-differ";
                                        "foreign-doi": "foreign-doi";
                                        identified: "identified";
                                        "identity-unresolved": "identity-unresolved";
                                        "mandatory-resolution-incomplete": "mandatory-resolution-incomplete";
                                        "metadata-unavailable": "metadata-unavailable";
                                        "outside-coverage": "outside-coverage";
                                        "url-verification-incomplete": "url-verification-incomplete";
                                    }>>;
                                    failedSources: z.ZodArray<z.ZodEnum<{
                                        crossref: "crossref";
                                        "doi.org": "doi.org";
                                    }>>;
                                    retraction: z.ZodLiteral<"unknown">;
                                }, z.core.$strict>], "kind">;
                                progress: z.ZodEnum<{
                                    checking: "checking";
                                    crossref: "crossref";
                                    "doi.org": "doi.org";
                                    ended: "ended";
                                    queued: "queued";
                                }>;
                            }, z.core.$strip>>;
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
                                settingsVersion: z.ZodOptional<z.ZodNumber>;
                                freeHistoryChecks: z.ZodOptional<z.ZodNumber>;
                                freeHistoryDays: z.ZodOptional<z.ZodNumber>;
                                paidHistoryDays: z.ZodOptional<z.ZodNumber>;
                            }, z.core.$strip>>;
                        }, z.core.$strip>, z.ZodObject<{
                            status: z.ZodLiteral<"not-implemented">;
                        }, z.core.$strict>, z.ZodObject<{
                            status: z.ZodLiteral<"unavailable">;
                        }, z.core.$strict>, z.ZodNull]>;
                    }, z.core.$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        404: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v1/checks/:checkId/cancel";
};
export declare const renewCheckLease: {
    method: "post";
    path: "/v1/checks/{checkId}/lease";
    summary: string;
    request: {
        params: z.ZodObject<{
            checkId: z.ZodUUID;
        }, z.core.$strip>;
    };
    responses: {
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        429: {
            description: string;
            headers: z.ZodObject<{
                "Retry-After": z.ZodString;
            }, z.core.$strip>;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        status: z.ZodLiteral<429>;
                        code: z.ZodLiteral<"abuse-limit">;
                        i18nKey: z.ZodLiteral<"problem_abuse_limit">;
                        retryAt: z.ZodISODateTime;
                    }, z.core.$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            measuredConfigurationId: z.ZodOptional<z.ZodString>;
                            id: z.ZodUUID;
                            state: z.ZodEnum<{
                                ended: "ended";
                                running: "running";
                            }>;
                            lastEventSeq: z.ZodNumber;
                            lastEventCursor: z.ZodString;
                            leaseRenewAfterMs: z.ZodNumber;
                            endReason: z.ZodNullable<z.ZodEnum<{
                                cancelled: "cancelled";
                                completed: "completed";
                                "lease-expired": "lease-expired";
                            }>>;
                            references: z.ZodArray<z.ZodObject<{
                                slot: z.ZodNumber;
                                originalText: z.ZodString;
                                outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                    kind: z.ZodLiteral<"status">;
                                    status: z.ZodEnum<{
                                        cancelled: "cancelled";
                                        failed: "failed";
                                        "not-checked": "not-checked";
                                        running: "running";
                                    }>;
                                }, z.core.$strict>, z.ZodObject<{
                                    kind: z.ZodLiteral<"verdict">;
                                    measuredConfigurationId: z.ZodOptional<z.ZodString>;
                                    verdict: z.ZodEnum<{
                                        correct: "correct";
                                        "doi-conflict": "doi-conflict";
                                        "exists-with-deviations": "exists-with-deviations";
                                        "mixed-citation": "mixed-citation";
                                        "not-found": "not-found";
                                        "not-verifiable": "not-verifiable";
                                    }>;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
                                        }, z.core.$strip>;
                                        csl: z.ZodObject<{
                                            type: z.ZodOptional<z.ZodString>;
                                            author: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                                family: z.ZodOptional<z.ZodString>;
                                                "non-dropping-particle": z.ZodOptional<z.ZodString>;
                                                given: z.ZodOptional<z.ZodString>;
                                                literal: z.ZodOptional<z.ZodString>;
                                            }, z.core.$strip>>>;
                                            issued: z.ZodOptional<z.ZodObject<{
                                                literal: z.ZodString;
                                            }, z.core.$strip>>;
                                            title: z.ZodOptional<z.ZodString>;
                                            "container-title": z.ZodOptional<z.ZodString>;
                                            "container-title-short": z.ZodOptional<z.ZodString>;
                                            publisher: z.ZodOptional<z.ZodString>;
                                            "publisher-place": z.ZodOptional<z.ZodString>;
                                            volume: z.ZodOptional<z.ZodString>;
                                            issue: z.ZodOptional<z.ZodString>;
                                            page: z.ZodOptional<z.ZodString>;
                                            "article-number": z.ZodOptional<z.ZodString>;
                                            edition: z.ZodOptional<z.ZodString>;
                                            DOI: z.ZodOptional<z.ZodString>;
                                            URL: z.ZodOptional<z.ZodString>;
                                            ISBN: z.ZodOptional<z.ZodString>;
                                            ISSN: z.ZodOptional<z.ZodString>;
                                            PMID: z.ZodOptional<z.ZodString>;
                                            PMCID: z.ZodOptional<z.ZodString>;
                                        }, z.core.$strip>;
                                        fieldSources: z.ZodRecord<z.ZodString, z.ZodObject<{
                                            raw: z.ZodString;
                                            span: z.ZodOptional<z.ZodObject<{
                                                start: z.ZodNumber;
                                                end: z.ZodNumber;
                                            }, z.core.$strip>>;
                                            normalized: z.ZodOptional<z.ZodString>;
                                        }, z.core.$strip>>;
                                        authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                                        structuring: z.ZodObject<{
                                            path: z.ZodEnum<{
                                                parser: "parser";
                                                user: "user";
                                            }>;
                                            version: z.ZodString;
                                        }, z.core.$strip>;
                                    }, z.core.$strip>;
                                    scoringRules: z.ZodObject<{
                                        version: z.ZodString;
                                        calibration: z.ZodLiteral<"uncalibrated">;
                                        unicode: z.ZodString;
                                        icu: z.ZodString;
                                        profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                    }, z.core.$strip>;
                                    searchStrategyVersion: z.ZodString;
                                    searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                    identity: z.ZodObject<{
                                        kind: z.ZodEnum<{
                                            "independent-bibliography": "independent-bibliography";
                                            "supplied-doi": "supplied-doi";
                                            unresolved: "unresolved";
                                        }>;
                                        candidateId: z.ZodOptional<z.ZodString>;
                                    }, z.core.$strip>;
                                    bestMatchId: z.ZodNullable<z.ZodString>;
                                    candidates: z.ZodArray<z.ZodObject<{
                                        id: z.ZodString;
                                        source: z.ZodLiteral<"crossref">;
                                        origin: z.ZodEnum<{
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            title: "title";
                                        }>;
                                        slot: z.ZodNumber;
                                        retrievedAt: z.ZodString;
                                        csl: z.ZodObject<{
                                            type: z.ZodOptional<z.ZodString>;
                                            author: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                                family: z.ZodOptional<z.ZodString>;
                                                "non-dropping-particle": z.ZodOptional<z.ZodString>;
                                                given: z.ZodOptional<z.ZodString>;
                                                literal: z.ZodOptional<z.ZodString>;
                                            }, z.core.$strip>>>;
                                            issued: z.ZodOptional<z.ZodObject<{
                                                literal: z.ZodString;
                                            }, z.core.$strip>>;
                                            title: z.ZodOptional<z.ZodString>;
                                            "container-title": z.ZodOptional<z.ZodString>;
                                            "container-title-short": z.ZodOptional<z.ZodString>;
                                            publisher: z.ZodOptional<z.ZodString>;
                                            "publisher-place": z.ZodOptional<z.ZodString>;
                                            volume: z.ZodOptional<z.ZodString>;
                                            issue: z.ZodOptional<z.ZodString>;
                                            page: z.ZodOptional<z.ZodString>;
                                            "article-number": z.ZodOptional<z.ZodString>;
                                            edition: z.ZodOptional<z.ZodString>;
                                            DOI: z.ZodOptional<z.ZodString>;
                                            URL: z.ZodOptional<z.ZodString>;
                                            ISBN: z.ZodOptional<z.ZodString>;
                                            ISSN: z.ZodOptional<z.ZodString>;
                                            PMID: z.ZodOptional<z.ZodString>;
                                            PMCID: z.ZodOptional<z.ZodString>;
                                        }, z.core.$strip>;
                                        raw: z.ZodUnknown;
                                        fields: z.ZodArray<z.ZodObject<{
                                            field: z.ZodString;
                                            reference: z.ZodUnknown;
                                            candidate: z.ZodUnknown;
                                            score: z.ZodNullable<z.ZodObject<{
                                                value: z.ZodNumber;
                                                fullAgreement: z.ZodBoolean;
                                            }, z.core.$strip>>;
                                            reason: z.ZodEnum<{
                                                compared: "compared";
                                                "missing-candidate": "missing-candidate";
                                                "missing-reference": "missing-reference";
                                                "not-determinable": "not-determinable";
                                                "resource-limit": "resource-limit";
                                                unweighted: "unweighted";
                                            }>;
                                        }, z.core.$strip>>;
                                        score: z.ZodNullable<z.ZodObject<{
                                            value: z.ZodNumber;
                                            fullAgreement: z.ZodBoolean;
                                        }, z.core.$strip>>;
                                    }, z.core.$strip>>;
                                    evidence: z.ZodArray<z.ZodObject<{
                                        source: z.ZodEnum<{
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                        }>;
                                        operation: z.ZodEnum<{
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            title: "title";
                                        }>;
                                        outcome: z.ZodEnum<{
                                            candidate: "candidate";
                                            exists: "exists";
                                            "no-record": "no-record";
                                            nonexistent: "nonexistent";
                                            unavailable: "unavailable";
                                        }>;
                                        reason: z.ZodOptional<z.ZodString>;
                                        status: z.ZodOptional<z.ZodNumber>;
                                        durationMs: z.ZodNumber;
                                        attempts: z.ZodNumber;
                                        observedAt: z.ZodString;
                                        raw: z.ZodOptional<z.ZodUnknown>;
                                    }, z.core.$strip>>;
                                    reasons: z.ZodArray<z.ZodEnum<{
                                        "development-route-incomplete": "development-route-incomplete";
                                        "doi-nonexistent": "doi-nonexistent";
                                        "fields-differ": "fields-differ";
                                        "foreign-doi": "foreign-doi";
                                        identified: "identified";
                                        "identity-unresolved": "identity-unresolved";
                                        "mandatory-resolution-incomplete": "mandatory-resolution-incomplete";
                                        "metadata-unavailable": "metadata-unavailable";
                                        "outside-coverage": "outside-coverage";
                                        "url-verification-incomplete": "url-verification-incomplete";
                                    }>>;
                                    failedSources: z.ZodArray<z.ZodEnum<{
                                        crossref: "crossref";
                                        "doi.org": "doi.org";
                                    }>>;
                                    retraction: z.ZodLiteral<"unknown">;
                                }, z.core.$strict>], "kind">;
                                progress: z.ZodEnum<{
                                    checking: "checking";
                                    crossref: "crossref";
                                    "doi.org": "doi.org";
                                    ended: "ended";
                                    queued: "queued";
                                }>;
                            }, z.core.$strip>>;
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
                                settingsVersion: z.ZodOptional<z.ZodNumber>;
                                freeHistoryChecks: z.ZodOptional<z.ZodNumber>;
                                freeHistoryDays: z.ZodOptional<z.ZodNumber>;
                                paidHistoryDays: z.ZodOptional<z.ZodNumber>;
                            }, z.core.$strip>>;
                        }, z.core.$strip>, z.ZodObject<{
                            status: z.ZodLiteral<"not-implemented">;
                        }, z.core.$strict>, z.ZodObject<{
                            status: z.ZodLiteral<"unavailable">;
                        }, z.core.$strict>, z.ZodNull]>;
                    }, z.core.$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        404: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v1/checks/:checkId/lease";
};
