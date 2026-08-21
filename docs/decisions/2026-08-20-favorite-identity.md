# ADR-0007: Client-Side Favorites — Single-Chain Identity Keys

> Status: accepted
> Date: 2026-08-20

## Context

Favorites of verified sources must survive a browser refresh. The product is
anonymous (X-Client-Id is a per-browser UUID); there are no accounts. The same
user interacts with both the web SPA and the browser extension. `candidateId`
and `metadata.id` are fresh random UUIDs generated on every search by all five
providers, so they cannot identify a source across sessions. The only stable
identity available client-side is the CSL metadata identifier set (DOI, PMID,
PMCID, arxivId, URL) plus the database.

## Decision

Favorites are persisted client-side only:

- Web SPA: `localStorage` key `source-taster-favorites`.
- Browser extension: `chrome.storage.local` key `favorites` via
  `useWebExtensionStorage`, preserved across storage-version resets.

The favorite key is derived with a single identifier chain in priority order
**DOI → PMID → PMCID → arxivId → URL** (first available), type-namespaced
(`doi:…`, `pmid:…`, `pmcid:…`, `arxiv:…`, `url:…`), normalized deterministically
(DOI lowercased/trimmed, arXiv prefix and version suffix stripped, URL trimmed).
The URL fallback uses `metadata.URL ?? candidate.url`. The derivation lives in
`packages/types/src/app/favorites.ts` and is unit-tested.

Persisted shape is versioned: `{ version: 1, items: Record<key, { source, title, createdAt }> }`.

The favorites filter is session state only; the favorite set is the persisted
part.

## Alternatives

- **Server-side persistence** (new table + routes keyed by X-Client-Id): rejected —
  the requirement is only refresh survival; server storage adds migration,
  routes, and sync complexity for zero user benefit in an anonymous product.
- **Multi-key index** (favorite entry indexed under every present identifier):
  rejected as over-engineered — it only covers the rare case of the same work
  surfacing under a different identifier set across databases, at the cost of
  index/dedupe/delete semantics.
- **Full-metadata fingerprint (hash)**: rejected — database metadata differs in
  casing and fields, so the same work hashes differently across databases.
- **Helper duplicated in both apps**: rejected — the collision-critical
  normalization would be untested in one copy and drift-prone.

## Consequences

Enables a deterministic, refresh-stable favorite key with an O(1) membership
lookup, zero API/database changes, and full offline operation. Costs:

- The same work surfacing with a different identifier set produces a different
  favorite key (e.g. DOI-keyed favorite vs. a later PMID-only surface). Accepted.
- URL-keyed favorites are the least durable (URLs can change). Accepted.
- Favorites whose work does not appear in current results simply do not render;
  there is no dangling UI. A "favorites not found this run" view is deferred.