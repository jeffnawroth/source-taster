# Accepted medium mapping

Accepted on 10 November 2026 with email A and PDF C. See `docs/design/email-and-pdf.md` for the durable decision.

This exploration continues #193/#195 and the product continuity decision from #196. It changes no requirements, generator choice, delivery boundary or repository licence exception.

| Concern | PDF report | Transactional mail |
| --- | --- | --- |
| Surface | Opaque white paper | Opaque white message on the named light `bg` canvas |
| Brand | Source Taster wordmark in real text | Source Taster wordmark in real text, readable with images unavailable |
| Fonts | Local static Atkinson Regular/Bold/Italic; Plex Mono for metadata; Noto for missing supported glyphs | Native Arial/Helvetica sans-serif fallback; code in Consolas/Courier; no remote font dependency |
| Colour | Existing light sRGB text/accent roles; Verdict colour only on its vector mark | Existing light text/accent roles; one primary action when an action exists |
| Translucency | None at runtime; border roles flattened on white | Six-digit opaque colours; roles flattened on white message or named mail canvas |
| Verdicts | Six existing vector silhouettes with adjacent neutral labels and counts | No Verdicts or Check content enter account/contract mail |
| Statuses | Explicit separate textual group; no previous result presented as a running Re-check's result | Each message states the actual account/contract event; payment is confirmed only after the server event |
| Navigation | Overview, numbered Reference headings, logical tag order, associated links, page-number Artifacts | One column, semantic headings, presentation tables for layout, clear action, plain-text alternative |
| Motion/glass | Omitted | Omitted |

The fixed sRGB primitives come from the token specification; `mapping.json` lists each alpha source and the exact opaque result on both named backdrops. Glass is not composited into a decorative paper effect. Verdict background tints are not reintroduced.

Mail limitations are explicit: arbitrary forced dark-mode transformations and Outlook/Gmail/Apple Mail engine behavior are not proven by Chromium preview. The production template must be checked in those clients after layout selection. PDF language, reading order, links and fonts require the existing ADR-0017 evidence, including human screen-reader review, before production acceptance.

The email source, prose, specimens and screenshots remain private. This public mapping describes only the shared identity contract. No new reusable cross-repository component is introduced.
