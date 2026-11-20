# #258: owner provisioning wizard

Part of #70. This is the agent part of the owner's provisioning work: one interactive script, [`scripts/owner-setup.sh`](../../scripts/owner-setup.sh), that walks the owner through the steps only they can do (their legal person, payment, accounts, signature) and puts every resulting value where the code expects it. The script and this note provision nothing themselves. No account was opened, no provider was contacted and no real value was captured while writing them.

## Run it

```text
scripts/owner-setup.sh --dry-run   # rehearse: no GitHub writes, no real keys, temporary output folder
scripts/owner-setup.sh             # real run
REPO=owner/name scripts/owner-setup.sh   # another repository
```

It needs `node`, `curl`, `shasum` or `sha256sum`, and optionally `gh` signed in as a repository admin. Without `gh` it still runs and lists each GitHub write it skipped, with the exact command to run by hand. It remembers values: stop with Ctrl-C and re-run, and Enter keeps the saved value.

Everything it captures goes to `$HOME/source-taster-owner-setup` (mode 0700, outside the repository): `owner-values.env` (mode 0600), `offline-keys/` and `sign-approval.mjs`. Nothing is committed, and `.env*` is git-ignored in any case.

## Stages

| #   | Stage                    | The owner does                                                                                                   | Lands in                                                                 |
| --- | ------------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | Preflight                | Checks tools and `gh` sign-in.                                                                                   | Nothing.                                                                 |
| 2   | Domain                   | Registers the domain in their own name, locks it.                                                                | `DOMAIN` in the values file.                                             |
| 3   | Support mailbox          | Creates a real mailbox for the legal notice.                                                                     | `SUPPORT_ADDRESS`.                                                       |
| 4   | Seller identity          | Types name, address, country, register and VAT details.                                                          | `SELLER_*`. They fill `apps/website/publication.json` later, by a human. |
| 5   | Scalingo                 | Creates the account, a Paris (`osc-fr1`) app and a deploy token.                                                 | `SCALINGO_APP_ID`, `SCALINGO_API_TOKEN`.                                 |
| 6   | Scalingo CLI pin         | Picks a release asset; the script downloads it, shows the SHA-256, and the owner compares it with the published checksum. | `SCALINGO_CLI_URL`, `SCALINGO_CLI_SHA256`.                               |
| 7   | Scaleway storage         | Creates a Paris bucket with versioning and Object Lock, and a narrowly scoped access key.                        | `BACKUP_BUCKET`, `BACKUP_ACCESS_KEY`, `BACKUP_SECRET_KEY`.               |
| 8   | Scaleway mail            | Adds the sending domain, SPF, DKIM and DMARC, creates SMTP credentials.                                          | `SMTP_USER`, `SMTP_PASSWORD`.                                            |
| 9   | Offline keys             | Moves the generated private keys to offline storage.                                                             | `offline-keys/`, `sign-approval.mjs`.                                    |
| 10  | GitHub environment       | Confirms; the script creates the environment and sets its secrets and variables.                                 | See the next table.                                                      |
| 11  | Stripe                   | Registers and verifies the account for the seller, copies the test key.                                          | `STRIPE_TEST_SECRET_KEY` (values file only).                             |
| 12  | Better Stack             | Creates the heartbeat monitor and status page.                                                                   | `HEARTBEAT_URL` (values file only).                                      |
| 13  | Browser developer stores | Registers the Chrome, Edge and Firefox developer accounts.                                                       | Nothing; unconfirmed ones are listed at the end.                         |

## GitHub names it sets

Every name was taken from [`deploy-scalingo.yml`](../../.github/workflows/deploy-scalingo.yml) and is set on the environment `scalingo-paris-verification`, never at repository level, so only the protected deploy job can read it.

| Name                         | Kind     | Source in the workflow                       |
| ---------------------------- | -------- | -------------------------------------------- |
| `SCALINGO_API_TOKEN`         | secret   | the deploy step                              |
| `SCALINGO_CLI_URL`           | variable | the deploy step (prefix is enforced)         |
| `SCALINGO_CLI_SHA256`        | variable | the deploy step (64 lowercase hex)           |
| `DEPLOY_APPROVAL_PUBLIC_KEY` | variable | the evidence step (Ed25519 public PEM)       |
| `QUALIFICATION_REPOSITORY`   | variable | the pin check and the qualification checkout |
| `QUALIFICATION_COMMIT`       | variable | the pin check (40 lowercase hex)             |
| `QUALIFICATION_READ_TOKEN`   | secret   | the qualification checkout                   |

The environment is created through the GitHub API with the owner as required reviewer, so a deploy pauses for a human. Self-review stays allowed because there is one owner; add a second reviewer when there is one.

Not set by the wizard because each release produces them: the secrets `DEPLOY_CONFIGURATION_JSON`, `DEPLOY_APPROVAL_JSON`, `DEPLOY_APPROVAL_SIGNATURE` and `MEASURED_CONFIGURATIONS_JSON`, and the variables `QUALITY_EXTRACTION`, `QUALITY_CONFIGURATION_FILE`, `QUALITY_ROOT` and `LOAD_REPORT`. [#116](116-deployment-backup-status.md) describes them.

## Keys

| Key                | Algorithm | Why this shape                                                                                                                                            |
| ------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deployment approval | Ed25519   | `apps/server/ops/deployment.mjs` verifies the signature with `verify(null, …)` and a base64 signature file, which is what `sign-approval.mjs` writes.      |
| Backup             | RSA-3072  | `apps/server/ops/backup.mjs` refuses a public key below 3072 bits and wraps with OAEP SHA-256.                                                            |

The wizard sends only the approval public key to GitHub. Neither private key is sent anywhere. Losing `backup-private.pem` makes every export unreadable, so the wizard asks for a second offline copy and records an open item if the owner declines.

## What was verified, and what was not

- `bash -n` passes. ShellCheck 0.11 reports one finding, SC1087, in the unchanged wizard library (a false positive on a colour escape); none in the stage code. The library part is byte-identical to the template.
- A full `--dry-run` with scripted input ran all 13 stages to the summary and exit 0. Dry-run writes nothing to GitHub and generates no keys.
- The key generation code was run separately: Ed25519 sign and verify round-trips with the same `verify` call as `deployment.mjs`, and the RSA public key reports 3072 bits.
- Not verified: the third-party dashboards. Steps for Scalingo, Scaleway, Stripe, Better Stack and the three browser stores describe intent and mark "labels may differ"; nobody checked them against a live account. The GitHub environment API call was not run against the real repository.

## What only the owner can do

These cannot be done by an agent and the wizard only prepares them:

- Register the domain, the provider accounts and the three developer accounts, with identity papers, payment method and two-factor devices.
- Pass Stripe business verification and connect the bank account.
- Sign each release's approval packet with the offline key.
- Decide the open provider choices in [#159](https://github.com/jeffnawroth/source-taster/issues/159) (AI extraction) and [#160](https://github.com/jeffnawroth/source-taster/issues/160) (e-invoicing), then sign those contracts and the data processing agreements.
- Review and approve the legal drafts ([#257](257-lawyer-review-packet.md)); until then `reviews.*` in `publication.json` stay null and the publication gate stays closed.
