# Audit gaps P-5 and FA-ERW-02/03/05 — 5 November 2026

Narrows the two PARTIAL gaps from the 4 November requirements audit as far as the public repository can; neither is fully closed (see each "Limit" and "Remaining"). It is test evidence about source behavior only. It does not qualify or activate anything, does not assert provider permission, release eligibility or a passed Quality gate, and does not change the #138/#140 gates that hold #114 activation. No real provider, payment, mail or identity service was contacted.

## 1. P-5 — #114 AC3 "New Checks use the active configuration; results record it"

**Finding.** The product already did this. `Check.measuredConfiguration` is snapshotted in the Check transaction, `ReferenceResult.measuredConfigurationId` is written with each stored result, and `toCheck` exposes both (`apps/server/src/checks/store.ts`). The audit gap was in tests: the only assertions were in `apps/server/test/configurations.contract.ts` (second test), which is not matched by the default `test/**/*.test.ts` include, is not listed in any package script or workflow, and shares a file with a test that needs the private service. So no default-suite or CI test asserted that a stored result exposes the ID. No product change was needed.

**Added.** `apps/server/test/check-measured-configuration.test.ts` (real PostgreSQL, real web and worker processes, published HTTP contract; the active pointer is the existing controlled `TEST_CONFIGURATION_POINTER` adapter):

- A new Check returns the active ID; after the worker ends it, the Check and its stored result expose the same ID, and the database row `reference_results.measured_configuration_id` holds it (not a response-side value).
- The ID survives a web restart and a switch of the pointer; the old Check and result keep ID A while only a new Check takes ID B.
- With no active configuration, no ID is invented at Check or result level or in the database.

**Evidence.** Passed on the first run, as expected for existing behavior. To show it can fail, the result-level mapping in `toCheck` was temporarily disabled: the first test failed (`expected {…} to match object {…}`); the change was reverted and is not committed.

**Limit.** The controlled run ends in a failed Status because the pointer names a configuration with no local executable. A Verdict carrying the ID needs a qualified, locally executable measured configuration and real source recordings; that path cannot be exercised source-only and stays covered by the existing store check (`configuration-result-mismatch`) and qualification work under #114/#138/#140. AI-preview binding (`ai-extraction.test.ts`) is unchanged.

## 2. FA-ERW-02, FA-ERW-03, FA-ERW-05 — simulations

### Where each part lives

| Part                                                                         | Public repo                                            | Private service only                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------ |
| Opaque Owner key on every Check (`owner_id`, `actor_id`); Owner-scoped reads | yes (`Principal.ownerId`, store)                       | Owner creation, personal Owner per Account |
| Named permissions and the `Entitlements.resolve` / `can()` port              | yes (`apps/server/src/entitlements.ts`, `http/app.ts`) | role → permission map (ADR-0013, ADR-0014) |
| Membership (Account, organization Owner, role)                               | no                                                     | yes (ADR-0004 "Joining")                   |
| Issuer/subject → Account mapping and linking after proof of both accesses    | no                                                     | yes (ADR-0013 "future identity linking")   |

The public program never sees roles, memberships, issuers or subjects. The tests below therefore use **test-defined stand-ins** for the private tables (`ROLES`, `memberships`, `IDENTITIES`) behind a test `resolve` function. They show what the public seams accept and require; they do not show that the private service's join, role mapping or linking works.

### Tests

`apps/server/test/extension-seams.test.ts` (in-process `createApp` on real PostgreSQL, no ports):

- **FA-ERW-03.** The test fails if any business route of `/v1` or `/v2` (read from `app.routes`) is missing from its reviewed route → permission table, so a new route cannot go unclassified. For each route, denying one named permission yields 403 exactly for the route's permission (a route that 403s for another reason, or a mis-classified table entry, would not be caught); an anonymous request yields 401. A **simulated new role** (`read-only-reviewer`, added as one row in the test role table with no change to any route) passes only `check:read` routes; an unknown role authenticates nothing.
- **FA-ERW-02, scenario "Account joins an organization".** Account A with session S creates a Check under its personal Owner. A membership (A, organization Owner O, role) is added to the test stand-in. The public program needs no data migration for this: the personal Check's database row is identical before and after, including after a Check is created under O, and the same Account and session headers keep working (the test supplies them; it does not exercise the private session store); a Check created under O has `owner_id = O`, `actor_id = A`; the personal Owner cannot read O's Check and O cannot read the personal one (404); a read-only membership cannot create under O while the personal Owner keeps full use; an unrelated organization is refused.
- **FA-ERW-05, scenario "a further sign-in method is added".** An email-code identity creates a Check. A simulated university issuer/subject is mapped to the same Account; the Check row is unchanged, the new identity sees it and creates further Checks under the same Owner/Account, and a different Account's identity gets 404. `verification.checks` has `owner_id` and `actor_id` but no issuer, subject, provider, session, identity or email column, so ownership cannot depend on the method (a name-based check: a differently named column would not be caught).

**Evidence.** Passed on the first run. Mutations, each reverted and not committed: skipping `principal.can` in `authorize` failed the permission, role and join tests (3 failures); removing the Owner comparison in `ownerSnapshot` failed the join and identity tests (2 failures).

### Remaining — private service or human

Public-repository tests cannot cover these; they need tests in the private service (not touched here):

1. **Join (ADR-0004).** Creating a membership leaves the personal Owner's Plan, grants, Quota and History unchanged; a personal Pro subscription continues independently; blocking one Account does not block the organization Owner; no personal History becomes visible to organization members.
2. **Role (FA-ERW-03).** Adding a role to the private permission map changes decisions for existing named permissions with no change to the protected actions; every private protected action is covered by the same route/permission completeness check as above.
3. **Identity (ADR-0013 continuity list).** Attaching a simulated new method preserves one Account and one personal Owner; rejects same-email and unverified-claim linking; rejects an issuer/subject already bound elsewhere; requires fresh proof of both accesses; refuses invoice-only takeover.
4. **Human.** The FA-ERW acceptance reviews in `docs/requirements-traceability.md` remain architecture reviews by the client. A live federation login, metadata trust and no-email/collision cases stay deferred to the FA-ORG-07 trigger (ADR-0013); nothing here is that proof.

## Running

The new tests run in the default server suite (`pnpm --filter @source-taster/server exec vitest run test/check-measured-configuration.test.ts test/extension-seams.test.ts`) against `DATABASE_TEST_URL` / `DATABASE_ADMIN_URL`. `check-measured-configuration` uses port `SOURCE_TASTER_TEST_MEASURED_RECORD_PORT` (default 5812); `extension-seams` binds no port.
