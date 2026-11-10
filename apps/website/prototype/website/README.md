# Website and documentation design review — #198

Throwaway, public-only snapshot on `prototype/198-website`. **Do not publish or merge the prototype.** The question is which page hierarchy and reading/navigation structure fits the accepted Source Taster identity. The owner accepted A as the main structure with C’s question-led documentation index on 10 November 2026. The default `variant=S` captures this combination: homepage and article layouts from A, documentation index from C. The original alternatives remain available.

Open `prototype-198.html` directly. It needs no server, dependencies or network access. To rebuild from the existing public website content, run from the repository root:

```sh
pnpm --filter @source-taster/website prototype:website
```

Equivalent dependency-free command: `node apps/website/prototype/website/build.mjs` (Node 24).

## Compare

- **S · Selected A + C:** accepted combination; default on opening the file.

- **A · Product first:** split homepage with the familiar Check example; documentation has persistent chapters, a wide article and a secondary contents list on desktop. Chapters collapse on a phone.
- **B · Reading edition:** single-column homepage with the example below the introduction and numbered narrative sections. Documentation centers the article, with a chapter disclosure and inline search.
- **C · Questions first:** homepage leads through visitor questions; documentation starts as a task portal. Articles retain breadcrumbs, an inline contents list and related guides, with no permanent sidebar.

Shared URL parameters: `variant=S|A|B|C`, `page=home|index|how-the-check-works|structuring|preferences|errors-and-retry|availability|faq|contact|accessibility|legal-notice|terms|privacy|withdrawal|source-access|cancellation|app-demo`, `lang=de|en`, `theme=light|dark`, `frame=web|360`.

The bottom arrows (or Left/Right outside text fields and disclosures) preserve the current page while changing structure. The review controls switch pages, simulate 360 px and expose search loading/failure fixtures. Product navigation, language switching, theme, FAQ disclosures, chapters, article anchors and search results also work. Search opens with the header button or Ctrl/Cmd+K. Escape closes the search dialog and returns focus. B uses inline search within documentation.

## Existing context, not a new website implementation

The real host is the existing static Astro site. This offline snapshot keeps its page identities, public content, language counterparts, navigation and four exact legal drafts together so the designs can be judged in context without changing static production routes or running a server. The snapshot's `page` parameter is a review mechanism; production keeps the existing `/de/`, `/en/` and `/docs/...` routes. It is not a new routing decision.

`build.mjs` embeds `src/content.ts`, the versioned legal drafts and local fonts. It generates the single review HTML; edit `style.css` and `site.js`, then rebuild. No new runtime dependencies are installed. The task-runner entry exists only on this throwaway branch.

The app handoff embeds the public, accepted #194 D snapshot in a sandboxed iframe with calm styling and compact strip a. It is explicitly a design example with fixture data, separate from the actual development feature claims. The homepage is a compact illustration of that feed/strip structure, not a second proposed checking interface. `assets/SOURCES.md` records the source commit and adaptations.

## Content and boundaries

Existing development availability limits remain visible. There is no sign-up, purchase, extension download, live support address, operational cancellation endpoint, published measurement, invented price or certification. Legal draft wording and version labels are unchanged. The footer cancellation destination explains the unconfigured service handoff; it accepts no cancellation. Source/license information distinguishes this in-memory search stand-in from the existing site's Pagefind distribution.

Only public documentation is searched, in the selected language. Queries never enter URLs, cookies, local/session storage or requests. Search state is in memory. Loading and failure controls simulate engine availability; retry runs the local stand-in. This does not qualify Pagefind or reproduce its ranking/tokenization.

The prototype updates the German display term `Urteil` to the selected `Befund` voice with the necessary article changes. This is a proposed ordinary-copy amendment, not an edit of legal documents. The current FAQ's broader statement about Checks ending with “Not checked” is retained from the existing content; reconcile it with the explicitly opt-in DOI path during the release-content review.

All surfaces share the accepted Atkinson Hyperlegible Next / IBM Plex Mono fonts, Source Taster logo, cobalt accent, neutral opaque surfaces and labelled Verdict marks. No decorative UI gradients, colour fields or glows are introduced. The existing logo artwork retains its own gradient. The final production implementation must use the shared static UI recipes and preserve ADR-0020; this snapshot does not exercise Astro islands or replace those recipes.

## Verification

See `verification.json`. Inspected desktop/phone and light/dark renderings; verified all public pages in DE/EN. Checks cover overflow, target size, content presence, script errors, network requests, search results/empty/loading/failure/retry, language continuity, modal focus/Escape, navigation, FAQ, exact legal text, URL stability, simulated width and the real D handoff. This is prototype evidence, not a production accessibility or release qualification.

The selection is complete. Record the accepted A + C combination in #198 and #181; carry it into the later design-system synthesis and implementation work. The throwaway prototype remains off main.
