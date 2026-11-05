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
| `--hosted`     | Also start the private service and run the web app in hosted mode; see "Hosted preview". Alias: `pnpm dev:local:hosted`. Not combinable with `--web` or `--no-reports`. |

The container is left running when you press Ctrl-C (starting again is faster); `pnpm dev:local:down` removes it. The script only ever touches a container named `stpreview-pg` that carries its own label `stpreview=1`, and refuses to use any database that is not on `127.0.0.1:5491` (your 5433 instance is never used). Variables such as `DATABASE_*`, `SOURCE_TASTER_*` or `VITE_*` from your shell are deliberately dropped.

## What is fake, and the "offline" guarantee

- **Data sources**: the DOI resolver, Crossref, OpenAlex and Europe PMC are loopback fixtures started by the script, so no real DOI or article search is queried. Semantic Scholar, arXiv, Open Library and Google Books are never switched on, so ISBN and book lookups answer "not checked" rather than reaching a real catalog.
- **AI**: off. Standalone has no AI extraction; the page says "Your current feature scope does not include AI extraction. The parser was used."
- **Mail, payments, accounts**: not present in this mode; `pnpm dev:local:hosted` adds them, all faked (see "Hosted preview").
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

Accounts and sign-in, History, Check pack, Pro, the DPA and the Operator screens come from the private service. They are in `pnpm dev:local:hosted`; see "Hosted preview" below for the preparation and for what was verified.

## Load the unpacked extension in Chrome

The extension is built per target with its server addresses compiled in. The default build points at ports 3100/5173; rebuild it for the preview ports:

```sh
SOURCE_TASTER_EXTENSION_API_URL=http://127.0.0.1:5492 \
SOURCE_TASTER_EXTENSION_WEBSITE_URL=http://127.0.0.1:5493 \
  pnpm --filter @source-taster/extension build
```

Then in Chrome (116 or newer): `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select `apps/extension/dist/chromium`. Click the toolbar icon to open the side panel (the same Check workspace). Reload the extension after every rebuild. Its host permission covers only the API origin you built it for, so no CORS setup is needed; the API origin must be loopback. `apps/extension/dist/firefox` is built too (not covered here). `dist` is git-ignored.

## Hosted preview (`pnpm dev:local:hosted`)

Starts the whole hosted product on loopback: the public API and worker, the private service (web and worker), the web app in hosted mode, a fake commerce provider and a mail capture. Everything runs against the preview's own PostgreSQL (`stpreview-pg`, fresh databases and roles that are dropped on exit). The launcher composes the same building blocks as the server's `bothPrograms` test harness (`apps/server/test/support/both-programs.ts`) and does not weaken any hosted-mode guard: the stack runs under `NODE_ENV=test`, exactly like the browser suites, because that is the only sanctioned way to start the hosted composition from this repository.

### One-time preparation of the private service

The private service is only ever used from a **linked worktree** of its launch branch, never from your main checkout (the launcher refuses a directory whose `.git` is not a file). In that worktree: install the dependencies, generate the database client, build the message catalogue and build the service's own web, following the service's README. If you also want orders to be payable, prepare the optional payment tooling described there (it needs Java). The launcher checks everything it needs and names each missing piece, so you can run it and follow the messages.

### Run it

```sh
export SOURCE_TASTER_SERVICE_WORKTREE=/absolute/path/to/service-worktree
pnpm dev:local:hosted            # or: pnpm dev:local --hosted    (Ctrl-C stops it)
pnpm dev:local:down              # remove the stpreview-pg container afterwards
```

| Part                       | Address                                  |
| -------------------------- | ---------------------------------------- |
| Web app (hosted mode)      | <http://127.0.0.1:5493/>                 |
| Public API + worker        | <http://127.0.0.1:5492/>                 |
| Private service            | <http://127.0.0.1:5494/> (direct)        |
| Service pages as the web app uses them | <http://127.0.0.1:5495/> (`/plan`, `/order`, `/cancel`, `/operator`); the web app links here |
| Captured mail              | <http://127.0.0.1:5496/> (also `/mail.json`, newest first) |

Open the web app in **Chromium or Chrome**. The session cookie is `Secure`; Chromium accepts it on loopback, other browsers were not tried. `--no-smoke` skips the start-up Check. `--basic` is accepted; it was not exercised in the hosted run.

### Accounts and mail

- Sign in with any e-mail address; an address nobody has used becomes a new Free Account (100 checks in the run). Read the six-digit code in the terminal (`✉ … CODE 123456`) or on the mail page. The same applies to the DPA confirmation code and to the Operator sign-in.
- `demo@example.invalid` is seeded with a large Quota and the features of a paid plan (History, report).
- `operator@example.invalid` is the Operator; sign in at <http://127.0.0.1:5495/operator>. The launcher establishes this Operator through the service's own set-up flow during start-up.
- The service allows one code per address every 60 seconds. Requesting another one sooner shows an error; wait a minute.
- Mail goes to the capture only. No SMTP server of any provider is contacted. Every data-source address of the API and worker was checked to be a loopback fixture.

### Payments

Orders (Check pack, Pro) are created by the real service and paid automatically by a fake provider: a small proxy on port 5495 notices each accepted order and confirms its payment (`💳 fake payment confirmed …`). After **Refresh Orders** the order is *Active*, an invoice (PDF and XML) exists and the Quota has grown. The fake provider needs the optional payment tooling mentioned above. Without it the banner says "NOT available" and orders cannot be placed; everything else still works.

### Clock

The launcher advances the harness clock with real time (once a second), so the service's background work runs on real time. Only orders with immediate start were exercised; time-driven commerce behaviour (renewals, the end of the withdrawal period, expiry) was not observed.

### Verified

Run on 2026-11-05 with Chromium (headless), driven by Playwright against the stack above.

| Feature | Result |
| --- | --- |
| Sign-in with a captured code | Works for `demo@`, `operator@` and a never-seen address. The Account shows its e-mail address and Quota. |
| Quota | Works and counts down: `demo@` showed 1100 of 1100 before the first Check and 1099 afterwards; a new Free Account showed 100 of 100. |
| History | Works: *Enable History*, run a Check, the entry appears with its deletion date, *Refresh History* keeps it. |
| Check | Works. Importing `docs/local-preview/demo.bib` gives the documented three Verdicts (Correct, DOI conflict, Not verifiable), also for a signed-in Account. |
| Reference export | *Download References* delivered a CSL-JSON file. |
| PDF report | *Create report* → *Download report* delivered a valid PDF 1.7 (23 KB). |
| Check pack | Works: order, automatic fake payment, order *Active*, Quota +300, invoice (PDF and XML) listed under *Load invoices*. |
| Pro | Works: subscription ordered and paid, Quota +1000, the Operator's Account view shows "Pro is active". |
| DPA | Works: the review packet is shown (placeholder text), a fresh code is mailed, *Conclude agreement* succeeds, the accepted packet is listed with *Download accepted packet*, and a receipt mail arrives. |
| Operator | The screens tried work: sign-in with a mailed code, the catalog, configuration and audit views, and Account search. |

### What does not work, or was not tried

- **AI extraction** is unavailable even for Accounts that have the feature: the page says "AI extraction is currently unavailable. The parser was used." There is no provider.
- **Order and purchase confirmation mails** are not captured. The order page says "Confirmation email queued" (and shows a durable copy of the confirmation), but the test composition does not run the service's mail delivery for these mails; only sign-in codes, DPA codes and the DPA receipt reach the capture.
- **The DPA receipt link** points at a non-existent host. Sign in at the web app and open *Data processing agreement* instead.
- **Pasting several References as plain text** counted only one Reference in the hosted run; import a `.bib` or `.ris` file for several (not compared with standalone).
- **Operator write actions** were not tried. The catalog view reports no measured configurations.
- **Cancellation, renewals and refunds** were not tried.
- **PDF/DOCX upload** stays fail-closed as in standalone mode.
- **Browsers other than Chromium** were not tried.

## What does not work locally, and why

| Missing                                           | Why                                                                                                                         |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Guest, Account, History, Check pack, Pro, DPA, Operator | Not in `pnpm dev:local`: the hosted authority lives in the private service. Use `pnpm dev:local:hosted`.                 |
| Real payments, real mail                          | Never: only fakes exist (hosted preview only).                                                                              |
| AI extraction                                     | Always off in standalone; no provider key is read.                                                                          |
| PDF/DOCX upload                                   | Fails closed without the isolated extractor image `SOURCE_TASTER_DOCUMENT_IMAGE` (not configured on purpose).              |
| Real catalogs (Crossref, OpenAlex, DOI resolver) and ISBN/book catalogs | Replaced by loopback fixtures, or not enabled at all (books). Results describe the fixtures, not the real world. Verdicts are uncalibrated. |
| Saved Checks across restarts, seeded demo data    | The browser keeps Check content in memory only; a Check lives only while a client renews its lease; each run starts with an empty database. There is therefore nothing to seed in standalone. |
| Quota that counts down                            | Standalone: the fake Quota is static. `pnpm dev:local:hosted` has the real Quota.                                           |
| Firefox                                           | Built, but not covered by this guide.                                                                                       |

## Troubleshooting

- **"Port … is busy"**: another process holds 5491, 5492 or 5493. The preview never picks other ports; free them.
- **"A container named stpreview-pg exists but is not ours"**: you created that name yourself; rename or remove it.
- **Docker errors**: start Docker Desktop.
- **Vite crashes on a missing website**: run the one-time build above (`pagefind:fetch` → `pagefind:build` → `pagefind:verify` → `build`).
- **Closing the terminal window** stops the stack like Ctrl-C does. If the stack does not stop within 15 s, or you press Ctrl-C a second time, it is killed.
- **Leftovers after a crash**: `pnpm dev:local:down` removes the database container; stray `node` processes can be found with `lsof -iTCP:5492 -iTCP:5493 -sTCP:LISTEN`.
- **Hosted: "SOURCE_TASTER_SERVICE_WORKTREE …"**: the launcher names what is wrong with the directory (unset, relative, not a linked worktree, missing install, generated output or built web). Fix it as listed under "One-time preparation".
- **Hosted: "Port … is busy"**: the hosted run also needs 5494, 5495 and 5496.
- **Run the script's own tests**: `pnpm test:scripts`.
