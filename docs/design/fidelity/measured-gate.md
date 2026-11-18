# Measured prototype fidelity

The accepted artifacts pinned in [sources.md](../sources.md) are the visual oracle. Their actual CSS, typefaces, renderer and geometry govern the owned components. A successful unit test or a reduced screenshot pair does not establish fidelity.

The public driver is `apps/web/scripts/design-fidelity.ts`. It covers #194 D (calm, strip a), #198 S and the real PDF pages of #197 C. The independent private driver covers #196 KA with KC Plan/Quota, OC, and #197 Email A in the service checkout. No private source, template or screenshot is imported into this repository.

## Run

Start the standalone preview, then run the public matrix:

```sh
pnpm dev:local
pnpm --filter @source-taster/web fidelity
```

Stop the standalone preview before starting hosted mode on the same ports:

```sh
SOURCE_TASTER_SERVICE_WORKTREE=/absolute/path/to/service-worktree pnpm dev:local:hosted
SOURCE_TASTER_SERVICE_WORKTREE=/absolute/path/to/service-worktree pnpm --filter @source-taster/web fidelity --hosted
```

Browser runs are serialized. The full hosted command finishes its public browser run before invoking the private driver. Mail and payment use only the launcher's local captures/fakes. A fresh Free Account supplies a real session and Quota; the driver sets its language and appearance through the actual Preferences API.

`--list` enumerates states without launching a browser or deleting evidence. `--only <substring>` is a diagnostic subset, recorded as incomplete. EN/DE, light/dark and desktop/360 are independent dimensions. PDFs retain the accepted light, opaque paper appearance; both languages and every page are compared.

## Failure policy

Each state keeps native-size source, product and difference PNGs, computed styles, geometry, explicit normalizations and failures in `results.json`. The HTML sheet scrolls horizontally; it never scales the images into thumbnails.

- Pixel channel differences greater than 16 count as changed. More than 1% changed pixels fails.
- Different image dimensions fail, including a missing PDF page. Images are never resized to make a comparison pass.
- Geometry differences greater than 1 px and computed length differences greater than 0.5 px fail. Missing elements and failed drivers fail.
- Overflowing border radii are compared using CSS's physical corner scaling: `999px` and `9999px` draw the same pill; a square corner still fails.
- A selected subset, crashed run or missing private family cannot establish completion. Results are written after every state so a failed run cannot leave an earlier clean result in place.

The original website and report fonts are loaded locally. The website driver fails when its stylesheet or fonts have not loaded, instead of interpreting fallback fonts as a design difference. After rebuilding the website, refresh the Vite configuration only after `dist-preview/website-artifact.json` exists; the website host otherwise retains an outdated asset manifest.

## Fixture alignment and owner amendments

The product runs through its actual API and worker. Its current Check is projected into the prototype's fixture model, with every replaced field logged. The genuine pre-search state uses the real Structuring result; no synthetic Check, Verdict, Status or evidence query is injected into the product. The driver can hold the create request to measure that transient state without introducing an artificial product delay.

References, immutable input, counts, Quota and available commands may differ from the prototype's fictional data. Data alignment preserves the source renderer, CSS and component classes. Required truthful development copy, glossary/sentence-case corrections and actual legal destinations are separately identified and logged; the website also retains an unaligned source screenshot. A normalization must never erase a missing interaction, restyle the oracle from the implementation, or conceal a layout failure.

The app and native-panel reference use the later accepted #199 final brand
artwork, pinned at `9e846bdd966f98010efeac1dbcdc985d9393ee82`, in #194's original
28 px brand slot. The original files are
`apps/extension/prototype/brand/masters/favicon.svg` (web) and
`apps/extension/prototype/brand/exports/extension-64.png` (extension). This is
logged as `brand.final-artwork`; the reference bytes come from that immutable
source tree rather than the current product exports. The extension export's
SHA-256 is `d28d0fd169f8191edc3fa04c53a4b60809e5547b228cf03757ed5c0630080dc6`.

The owner's 17 November amendments are explicit: the launcher shares the content column's centre, persistent appearance controls are required, and AccountPopover uses the source's calm floating glass treatment. ADR-0023 and ADR-0027 record these corrections. Standalone mode retains ADR-0003's absence of Account/Plan/Quota service UI.

## Local review links

The Vite development server exposes the original public artifacts and public comparison files without copying prototype pages into production:

- [#194 D](http://127.0.0.1:5493/__design/prototypes/structure?variant=D&calm=1&strip=a&still=1&lang=en&theme=light)
- [#198 S](http://127.0.0.1:5493/__design/prototypes/website?variant=S&page=home&lang=en&theme=light&frame=web)
- [#197 PDF C](http://127.0.0.1:5493/__design/prototypes/report)
- [Standalone comparison sheet](http://127.0.0.1:5493/__design/comparisons/standalone/index.html)
- [Hosted public comparison sheet](http://127.0.0.1:5493/__design/comparisons/hosted/index.html)
- [Native extension comparison sheet](http://127.0.0.1:5493/__design/comparisons/extension/index.html)

Private sheets stay in the service checkout. These development routes are absent from production builds. Measured visual fidelity does not qualify deployment, legal copy, brand rights, screen-reader use, email clients or PDF/UA; their existing release gates remain in force and `releaseQualified` stays false.
