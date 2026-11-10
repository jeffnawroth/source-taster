# Website and documentation design

**Accepted by the owner on 10 November 2026** for #198, part of design-system map #181: **A (Product first) as the main structure, with C’s question-led documentation index.** Source: branch `prototype/198-website`, `apps/website/prototype/website/prototype-198.html` and its README. The default selected snapshot is `variant=S`; the original A/B/C explorations remain available as primary evidence.

The accepted combination keeps the accepted #193/#195 calm identity and #194 D checking structure constant: local Atkinson Hyperlegible Next and IBM Plex Mono, existing logo, cobalt actions, neutral opaque work surfaces, established control shapes and colour confined to labelled Verdict glyphs. Website, documentation and app handoff belong to one product.

## Accepted structure

Use A’s split homepage: a short product introduction beside the familiar Check example, followed by explanatory sections and direct documentation links. This makes the product concrete at first glance.

Use C’s question-led topic portal for the documentation index. Each question leads to its existing guide, making the entry point useful without requiring visitors to know a chapter title.

Use A’s reading layout for the articles: persistent chapter navigation, a wide article and secondary contents on desktop; a chapter disclosure and full-width reading area on phones. The topic portal changes only the documentation index, not the article layout. Search remains available from the common header in a focused dialog.

These choices provide quick orientation and enough reading space, consistent with the owner’s preference for clear pages across the product.

## Captured alternatives

| Variant | Homepage | Documentation |
| --- | --- | --- |
| A — Product first | Split introduction and familiar checking example; explanatory sections follow | Persistent chapter navigation, wide article, secondary page contents; chapter disclosure on phones |
| B — Reading edition | Centered introduction, example, then numbered narrative rows | Centered reading column, chapter disclosure, inline search |
| C — Questions first | Visitor questions lead to relevant guides; workspace example follows | Task portal, full-page articles, breadcrumbs, inline contents and related guides |

The existing static Astro site supplies all public page identities and content. Production continues to use its existing DE/EN routes and local Pagefind search under ADR-0020. The offline prototype's in-memory search is a presentation stand-in; it is not a search-engine decision or qualification. Existing direct help, FAQ, contact, accessibility, cancellation and four versioned legal destinations remain in the navigation.

Retain the honest development availability wording. A design example is not evidence of an available service. Do not infer launched checking paths, hosted Accounts, purchases, extension downloads, prices, measurements, certification or a live support/cancellation service from the designs. Legal text/versioning and publication prerequisites are unchanged. German ordinary copy proposes `Befund` in place of the older `Urteil`; legal draft text stays exact. Resolve the existing FAQ/opt-in DOI wording inconsistency against release evidence before publication.

The app destination embeds the actual public #194 D snapshot, adapted only for offline fonts, parent-owned history, selected language/theme, hidden review chrome and the accepted calm/compact configuration. It carries an explicit design-example label. Private Account and Operator content is neither copied nor indexed.

Prototype verification covers 1280 px and 360 px, DE/EN, light/dark, responsive navigation and article layouts, public-page reachability, search states, keyboard interactions and no external resource/query/storage activity. See the captured verification record for counts and limits. Production still needs the shared UI recipes, Astro integration, actual Pagefind behavior, semantic routing and the existing accessibility/content/publication gates.

Keep prototype implementation out of main. Carry this accepted combination into the later styleguide/ADR synthesis and implementation issues; do not promote the throwaway code directly into production. The accepted snapshot was additionally checked in DE/EN, light/dark and desktop/360 px after composition.
