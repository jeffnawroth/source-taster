# Local preview

Run and explore the public product on your Mac with **one command**. Everything an external service would provide is replaced by a local fake: no AI provider, no mail, no payment provider, and Data sources that answer from fixtures on loopback. Nothing reaches the internet unless you opt in to web-page checks with `--web`.

```sh
pnpm dev:local
```

What it starts (all on `127.0.0.1`, ports from 5491 so it never collides with the usual 5433/3100/5173 setup):

| Part                             | URL / address                       | Notes                                                                                                                    |
| -------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Web app (Check workspace)        | <http://127.0.0.1:5493/>            | Vite, proxies `/v1` and `/v2` to the API                                                                                 |
| Website (marketing, docs, legal) | <http://127.0.0.1:5493/en/>         | also `/de/`, `/docs/en/`, `/en/terms/`, `/en/privacy/`, … (`/docs/` alone is a 404)                                      |
| Verification API + worker        | <http://127.0.0.1:5492/>            | `/health`, `/v1/openapi.json`                                                                                            |
| PostgreSQL 18                    | `stpreview-pg` on `127.0.0.1:5491`  | Docker container created on demand; every run gets a fresh, empty database that is dropped on exit                       |
| Fixture servers                  | loopback ports                      | DOI resolver, Crossref, comparison catalogs, bibliographic catalogs, and web pages with `--web`                          |

It is a thin wrapper (`scripts/dev-local.ts`) around the server's existing browser-test composition (`apps/server/scripts/e2e-serve.ts`). After the stack is up it runs one real **smoke Check** through API, worker and fixtures and prints the Verdicts, so a broken stack fails in the terminal instead of in the browser.

## Prerequisites

- macOS arm64 (or Linux amd64 GNU) with Xcode Command Line Tools (needed once for the website's search-index build).
- Node 24.14 (`.nvmrc`) and pnpm 12.15.0 (`packageManager`).
- Docker Desktop, running.
- Chrome or Chromium 116 or newer, only for the extension.

One-time build (see the README for the background; the website build downloads checksum-pinned sources and a project-local Rust toolchain, so it needs internet once and takes a while):

```sh
pnpm install --frozen-lockfile
pnpm pagefind:fetch
pnpm pagefind:build
pnpm pagefind:verify
pnpm build
```

`pnpm dev:local` checks these outputs and tells you which command is missing. The website draft is required: the web app's dev server refuses to start without `apps/website/dist-preview`.

> The root `package.json` is an input of the website build recipe. If you change it (or any other recipe input), re-run `pnpm pagefind:fetch` before `pagefind:build`, otherwise you get "Source recipe changed or missing".

## Run it

```sh
pnpm dev:local              # start (Ctrl-C stops the stack)
pnpm dev:local:down         # remove the stpreview-pg container and its volume
```

Options, e.g. `pnpm dev:local --basic --no-reports`:

| Option         | Effect                                                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--basic`      | DOI route only: no OpenAlex/Europe PMC fixtures.                                                                                                                      |
| `--web`        | Turns on web-page checks. `example.com` and the Internet Archive hosts answer from a fixture; **any other URL is fetched from the real internet**. Not combinable with `--basic`. |
| `--no-reports` | Standalone as it really is: no Quota panel and no PDF report (the fake Quota below is not installed).                                                                 |
| `--no-smoke`   | Skip the startup smoke Check.                                                                                                                                         |

The container is left running when you press Ctrl-C (starting again is faster); `pnpm dev:local:down` removes it. The script only ever touches a container named `stpreview-pg` that carries its own label `stpreview=1`, and refuses to use any database that is not on `127.0.0.1:5491` (your 5433 instance is never used). Variables such as `DATABASE_*`, `SOURCE_TASTER_*` or `VITE_*` from your shell are deliberately dropped.

## What is fake, and the "offline" guarantee

- **Data sources**: the DOI resolver, Crossref, OpenAlex and Europe PMC are loopback fixtures started by the script, so no real DOI or article search is queried. Semantic Scholar, arXiv, Open Library and Google Books are never switched on, so ISBN and book lookups answer "not checked" rather than reaching a real catalog.
- **AI**: off. Standalone has no AI extraction; the page says "Your current feature scope does not include AI extraction. The parser was used."
- **Mail, payments, accounts**: not present in this mode (see "Hosted-only").
- **Quota and PDF report**: the server's test composition installs a **fake Quota** (1000 granted checks, report feature granted). The panel always shows the full 1000 and never counts down; it exists so the Quota panel and the report are visible.
- **Web-page checks**: off unless you start with `--web`. Then `example.com`, `archive.org` and `web.archive.org` are redirected to a local fixture, and **a Reference containing a URL on any other host is fetched from the real internet** (plain GET, with the server's private-address protection). Paste only `example.com` URLs if you want to stay offline.

## Fixture data to paste

Any DOI that has no special fixture resolves to the same record (Aspelmeyer, *Measured measurement*, Nature Physics 2009). Useful References:

| What you paste                                                                                                                             | Verdict you get                                |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170`                                 | Correct                                        |
| `Doe, J. (2020). A reference whose DOI does not exist. Journal of Examples, 1, 1–2. https://doi.org/10.5555/workspace-nonexistent`         | DOI conflict (the resolver says "no such DOI") |
| a Reference with DOI `10.5555/browser-unavailable`                                                                                         | Not verifiable (resolver answers 503)          |

Ready-made import files are in `docs/local-preview/`: `demo.bib` (three entries, one per row above) and `demo.ris` (the first two). Text with several References works too (one per line).

## Feature tour

### Visible in `pnpm dev:local`

1. **Check workspace** – open <http://127.0.0.1:5493/>. Paste the first Reference above, press **Check Reference**. The Check runs, the summary shows the Verdict counts, and *Open Reference 1* shows fields, evidence and Correction suggestions. Switch language (Deutsch/English) and citation style at the top. Edit fields, *Re-check this Reference* (free of Quota), or *Judge manually*.
2. **Structure References** – previews the deterministic Structuring without starting a Check and without Quota.
3. **Import BibTeX / RIS** – "Import BibTeX or RIS" → choose `docs/local-preview/demo.bib` (or `.ris`) → the entries are recognised → **Check Reference** → three different Verdicts.
4. **Exports** – after a Check: *Export References* (CSL-JSON or BibTeX, with or without selected Correction suggestions) and *Formatted bibliography* (copy, or RTF download).
5. **PDF report** – *Accessible PDF report* → language → **Create report** → **Download report**: a tagged PDF (`application/pdf`). Temporary, 15 minutes at most.
6. **Quota panel** – shows "1000 of 1000 checks left" (fake, static; see above).
7. **Website** – <http://127.0.0.1:5493/en/> and `/de/`, documentation at `/docs/en/`, plus the legal pages linked in the app footer.
8. **Document upload (PDF/DOCX)** – shows "Document reading is temporarily unavailable". That is the intended fail-closed behaviour: it needs the isolated extractor image `SOURCE_TASTER_DOCUMENT_IMAGE`, which the preview deliberately does not configure. Paste References instead.

### Hosted-only (not in `pnpm dev:local`)

These need the hosted authority from the private service (accounts, sessions, billing, operations) and cannot run from this repository alone:

- Guest and Account, sign-in with mailed codes, sensitive Account actions
- **History** (needs an Account session)
- **Check pack** and **Pro** with a fake payment
- **DPA** and its acceptance
- **Operator** screens
- real Quota accounting

In this repository, hosted startup is intentionally closed (`loadConfig` refuses hosted mode until #94); the only hosted composition is the test harness `apps/server/test/support/both-programs.ts`, which starts the public API/worker together with the private service from a prepared private worktree. See "Optional: private service" below.

## Load the unpacked extension in Chrome

The extension is built per target with its server addresses compiled in. The default build points at ports 3100/5173; rebuild it for the preview ports:

```sh
SOURCE_TASTER_EXTENSION_API_URL=http://127.0.0.1:5492 \
SOURCE_TASTER_EXTENSION_WEBSITE_URL=http://127.0.0.1:5493 \
  pnpm --filter @source-taster/extension build
```

Then in Chrome (116 or newer): `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select `apps/extension/dist/chromium`. Click the toolbar icon to open the side panel (the same Check workspace). Reload the extension after every rebuild. Its host permission covers only the API origin you built it for, so no CORS setup is needed; the API origin must be loopback. `apps/extension/dist/firefox` is built too (not covered here). `dist` is git-ignored.

## Optional: private service (hosted features) — UNVERIFIED

This section is a map, not a tested recipe. It was assembled from the public harness and the private repository's README and `package.json` files (read only); it has **not** been run. The private service lives at `~/Developer/Repositories/source-taster-service`; do not change its checked-out branch for this. Use a separate worktree of the launch branch (`origin/spec/70-launch-product` at the time of writing) and install its dependencies there.

What exists:

- The private service has the scripts `db:setup` (needs `DATABASE_ADMIN_URL` and a new dedicated `DATABASE_URL`), `start:web` (loopback port 3210, `SERVICE_PORT` overrides) and `start:worker`. `SERVICE_MAIL_REHEARSAL=enabled` is its mail fake (a loopback SMTP capture, no real mail).
- The public repository composes both programs only in tests: `bothPrograms({ accounts: true })` plus a Vite server with `VITE_SOURCE_TASTER_MODE=hosted` and `VITE_SOURCE_TASTER_SERVICE_URL=<service url>`. It needs `SOURCE_TASTER_SERVICE_WORKTREE=<path to the prepared private worktree>`. The tested entry point is the browser suite `apps/web/e2e-account/` (config `apps/web/account.playwright.config.ts`); it can use the preview PostgreSQL by setting `DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:5491/postgres` (start `pnpm dev:local`, or create the container, first).

Known obstacles for an interactive hosted run:

- Sign-in codes reach the harness's in-memory mailbox over IPC; they are not delivered to the SMTP capture.
- The harness uses a frozen clock.
- The service's `allowedOrigins` must include the Vite URL.
- A permanent interactive hosted launcher does not exist yet; it would be a new script built on `both-programs.ts`.

## What does not work locally, and why

| Missing                                           | Why                                                                                                                         |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Guest, Account, History, Check pack, Pro, DPA, Operator | Hosted authority lives in the private service; hosted startup in this repository is closed until #94.                 |
| Real payments, real mail                          | Only fakes exist, and only inside the hosted test composition.                                                              |
| AI extraction                                     | Always off in standalone; no provider key is read.                                                                          |
| PDF/DOCX upload                                   | Fails closed without the isolated extractor image `SOURCE_TASTER_DOCUMENT_IMAGE` (not configured on purpose).              |
| Real catalogs (Crossref, OpenAlex, DOI resolver) and ISBN/book catalogs | Replaced by loopback fixtures, or not enabled at all (books). Results describe the fixtures, not the real world. Verdicts are uncalibrated. |
| Saved Checks across restarts, seeded demo data    | The browser keeps Check content in memory only; a Check lives only while a client renews its lease; each run starts with an empty database. There is therefore nothing to seed in standalone. |
| Quota that counts down                            | The fake Quota is static.                                                                                                   |
| Firefox                                           | Built, but not covered by this guide.                                                                                       |

## Troubleshooting

- **"Port … is busy"**: another process holds 5491, 5492 or 5493. The preview never picks other ports; free them.
- **"A container named stpreview-pg exists but is not ours"**: you created that name yourself; rename or remove it.
- **Docker errors**: start Docker Desktop.
- **Vite crashes on a missing website**: run the one-time build above (`pagefind:fetch` → `pagefind:build` → `pagefind:verify` → `build`).
- **Closing the terminal window** stops the stack like Ctrl-C does. If the stack does not stop within 15 s, or you press Ctrl-C a second time, it is killed.
- **Leftovers after a crash**: `pnpm dev:local:down` removes the database container; stray `node` processes can be found with `lsof -iTCP:5492 -iTCP:5493 -sTCP:LISTEN`.
- **Run the script's own tests**: `pnpm test:scripts`.
