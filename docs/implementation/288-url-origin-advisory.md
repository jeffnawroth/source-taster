# #288 — Fixed URL origin recursion in controlled website builds

RUSTSEC-2026-0592 (GHSA-hrj5-67jp-wqp9) affects Rust `url` through 2.5.8.
Calling `Url::origin()` on a deeply nested `blob:` URL recursively consumed the
thread stack and aborted the process. The upstream fix in 2.5.9 returns an
opaque origin for an inner scheme other than HTTP, HTTPS or file, without
recursing.

The controlled Pagefind-native and Rolldown lockfiles select `url` 2.5.9 and its
required `form_urlencoded` 1.2.3. Registry checksums are retained in both locks;
all other package selections stay unchanged. The upstream source locks remain
unaltered: they are provenance-pinned snapshots, not the controlled build's
selected graph. The audit still scans those raw inventories and records their
findings; only the verified actual build graph determines whether such a
finding is selected. No advisory is suppressed and no gate policy changes.

## Behavioral reproduction

A small Cargo executable depended on exactly `url` 2.5.8, then 2.5.9. On a
thread with a 128 KiB stack it parsed 10,000 `blob:` prefixes followed by
`https://example.com/`, called `origin().ascii_serialization()`, and asserted
`"null"`. Both runs used the pinned controlled Rust toolchain.

- Before: `thread has overflowed its stack`, process aborted with exit 134.
- After: the identical executable completed with exit 0.

The controlled source fetch/build, website artifact generation, license/advisory
scan and refusal controls remain the integration checks. Their current outputs
are CI artifacts rather than amendments to historical qualification evidence.
