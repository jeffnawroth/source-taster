import { seedRightsInvoices } from "../../server/test/support/rights-fixture.ts";
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test, expect, type Download } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createHash, randomUUID } from "node:crypto";
import { writeFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { CheckResponse } from "@source-taster/contract-verification";
import { physicsReference } from "../../server/test/support/doi-fixtures.ts";
import { bothPrograms } from "../../server/test/support/both-programs.ts";
interface FileManifest {
  complete: boolean;
  parts: number;
  files: number;
  sha256: string;
}
interface DownloadedExport {
  format: string;
  checks: { references: { originalText: string }[] }[];
  invoices: unknown[];
  totals: unknown[];
  completeness: string;
}
const fileManifest = (bytes: Buffer) =>
  JSON.parse(bytes.toString()) as FileManifest;
const exportedData = (bytes: Buffer) =>
  JSON.parse(bytes.toString()) as DownloadedExport;
for (const language of ["en", "de"] as const)
  test(`Operator-arranged recipient-only downloads in ${language}`, async ({
    page,
  }) => {
    const setup = join(
      process.env.SOURCE_TASTER_113_EVIDENCE!,
      `browser-${randomUUID()}.json`,
    );
    const both = await bothPrograms({
      accounts: true,
      verificationEnv: { SOURCE_TASTER_EXPORT_PART_BYTES: "1024" },
      verificationPublicOrigin: "https://verification.test.invalid",
      serviceAllowedOrigins: [
        "https://web.test.invalid",
        "https://service.test.invalid",
      ],
      serviceEnv: {
        SERVICE_EXPORT_PART_BYTES: "1024",
        SERVICE_OPERATOR_SETUP: setup,
        SERVICE_OPERATOR_SESSION_EPOCH:
          "113-browser-external-operator-epoch-32-characters",
        SERVICE_OPERATOR_ORIGINS: JSON.stringify([
          "https://service.test.invalid",
          "https://web.test.invalid",
        ]),
      },
    });
    try {
      const o = await both.signIn("operator-browser@example.invalid");
      await writeFile(
        setup,
        JSON.stringify({
          accountId: o.data.accountId,
          codeHash: createHash("sha256").update("setup").digest("hex"),
          completionFile: setup + ".done",
        }),
      );
      expect(
        (await o.call("/v1/operator/bootstrap", { setupCode: "setup" })).status,
      ).toBe(200);
      const recipient = await both.signIn("recipient-browser@example.invalid");
      const created = await fetch(both.apiUrl + "/v1/checks", {
        method: "POST",
        headers: {
          authorization: `Bearer ${recipient.token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ text: physicsReference }),
      });
      expect(created.status).toBe(201);
      const check = CheckResponse.parse(await created.json()).data;
      await expect
        .poll(
          async () =>
            CheckResponse.parse(
              await (
                await fetch(both.apiUrl + `/v1/checks/${check.id}`, {
                  headers: { authorization: `Bearer ${recipient.token}` },
                })
              ).json(),
            ).data.state,
          { timeout: 15000 },
        )
        .toBe("ended");
      await seedRightsInvoices(
        both.urls[1]!,
        recipient.data.ownerId,
        "browser-invoice-",
      );
      await both.advance(61000);
      await page.route("https://service.test.invalid/**", async (route) => {
        const u = new URL(route.request().url());
        const response = await route.fetch({
          url: both.serviceUrl + u.pathname + u.search,
        });
        await route.fulfill({ response });
      });
      const latestCode = async () =>
        (await both.mail())
          .filter((m) => /\b\d{6}\b/.test(m.text))
          .at(-1)!
          .text.match(/\b\d{6}\b/)![0];
      await page.goto("https://service.test.invalid/operator");
      await page
        .getByLabel("Email address", { exact: true })
        .fill("operator-browser@example.invalid");
      await page
        .getByRole("button", { name: "Send sign-in code", exact: true })
        .click();
      await expect(
        page.getByLabel("Sign-in code", { exact: true }),
      ).toBeVisible();
      await page
        .getByLabel("Sign-in code", { exact: true })
        .fill(await latestCode());
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await page
        .getByLabel("Target Account ID (including deleted Accounts)")
        .fill(recipient.data.accountId);
      await page
        .getByRole("button", { name: "Review export", exact: true })
        .click();
      const section = page.getByRole("region", {
        name: "Accounting and data-subject exports",
      });
      await section
        .getByLabel("Email address", { exact: true })
        .fill("operator-browser@example.invalid");
      await both.advance(61000);
      await section
        .getByRole("button", { name: "Send fresh proof code" })
        .click();
      await expect(section.getByLabel("Sign-in code")).toBeVisible();
      await section.getByLabel("Sign-in code").fill(await latestCode());
      await section
        .getByRole("button", { name: "Confirm fresh proof" })
        .click();
      await section
        .getByLabel("I confirm the export scope and support-case reason")
        .check();
      await section.getByRole("button", { name: "Arrange export" }).click();
      await expect(
        section
          .getByText("Awaiting recipient verification or delivery", {
            exact: false,
          })
          .first(),
      ).toBeVisible();
      const id = await section
        .getByLabel("Data-subject request ID", { exact: true })
        .inputValue();
      await page
        .getByRole("combobox", { name: "Language", exact: true })
        .selectOption(language);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      // A new browser context has no Operator credential or recipient session.
      const context = await page.context().browser()!.newContext();
      const userPage = await context.newPage();
      await userPage.route("https://service.test.invalid/**", async (route) => {
        const u = new URL(route.request().url());
        await route.fulfill({
          response: await route.fetch({
            url: both.serviceUrl + u.pathname + u.search,
          }),
        });
      });
      let cutVerification = false;
      await userPage.route(
        "https://verification.test.invalid/**",
        async (route) => {
          const u = new URL(route.request().url());
          const response = await route.fetch({
            url: both.apiUrl + u.pathname + u.search,
          });
          if (
            process.env.SOURCE_TASTER_TEST_INTERRUPT_ARTIFACT === "1" &&
            !cutVerification &&
            u.pathname.endsWith("/download")
          ) {
            cutVerification = true;
            const lines = (await response.text()).trim().split("\n");
            // Transport cut: genuine authorized part frames, without the final
            // manifest. The next button press must recover every unsaved byte.
            const parts = lines
              .filter(
                (line) =>
                  (JSON.parse(line) as { type: string }).type === "part",
              )
              .slice(0, 2);
            await route.fulfill({ response, body: parts.join("\n") + "\n" });
          } else await route.fulfill({ response });
        },
      );
      await userPage.goto(
        `https://service.test.invalid/privacy?language=${language}`,
      );
      const en = language === "en";
      await userPage
        .getByLabel(en ? "Data-subject request ID" : "ID der Datenauskunft", {
          exact: true,
        })
        .fill(id);
      await userPage
        .getByLabel(en ? "Email address" : "E-Mail-Adresse", { exact: true })
        .fill("recipient-browser@example.invalid");
      await both.advance(61000);
      await userPage
        .getByRole("button", {
          name: en ? "Send sign-in code" : "Anmeldecode senden",
          exact: true,
        })
        .click();
      await expect(
        userPage.getByRole("button", {
          name: en ? "Sign in" : "Anmelden",
          exact: true,
        }),
      ).toBeVisible();
      await userPage
        .getByLabel(en ? "Sign-in code" : "Anmeldecode", { exact: true })
        .fill(await latestCode());
      await userPage
        .getByRole("button", { name: en ? "Sign in" : "Anmelden", exact: true })
        .click();
      await userPage
        .getByRole("button", {
          name: en
            ? "Send data-subject access code"
            : "Zugriffscode für Datenauskunft senden",
          exact: true,
        })
        .click();
      await expect(userPage.getByRole("status")).toContainText(
        en ? "An access code was sent" : "Ein Zugriffscode wurde",
      );
      await userPage
        .getByLabel(en ? "Sign-in code" : "Anmeldecode", { exact: true })
        .fill(await latestCode());
      await userPage
        .getByRole("button", {
          name: en ? "Verify recipient access" : "Empfängerzugriff bestätigen",
          exact: true,
        })
        .click();
      const privateDownload = userPage.getByRole("button", {
        name: en
          ? "Download Account and billing data"
          : "Account- und Abrechnungsdaten herunterladen",
        exact: true,
      });
      await expect(privateDownload).toBeVisible();
      expect(
        (
          await new AxeBuilder({ page: userPage })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      for (const [buttonName, format] of [
        [
          en
            ? "Download Account and billing data"
            : "Account- und Abrechnungsdaten herunterladen",
          "source-taster-service-data-subject-v1",
        ],
        [
          en
            ? "Download verification and History data"
            : "Prüf- und Verlaufsdaten herunterladen",
          "source-taster-verification-data-subject-v1",
        ],
      ] as const) {
        const button = userPage.getByRole("button", {
          name: buttonName,
          exact: true,
        });
        await expect(button).toBeEnabled();
        const files: Promise<{ name: string; bytes: Buffer }>[] = [];
        const collect = (download: Download) => {
          files.push(
            (async () => ({
              name: download.suggestedFilename(),
              bytes: await readFile(await download.path()),
            }))(),
          );
        };
        userPage.on("download", collect);
        for (let file = 0; file < 100; file++) {
          await button.press("Enter");
          await expect(button).toBeEnabled();
          if (
            (await userPage.getByRole("status").textContent()) ===
            (en ? "Download received" : "Download empfangen")
          )
            break;
        }
        await expect(userPage.getByRole("status")).toHaveText(
          en ? "Download received" : "Download empfangen",
        );
        const manifestDownload = userPage.waitForEvent("download", {
          predicate: (download) =>
            download.suggestedFilename().endsWith("-manifest.json"),
        });
        await userPage
          .getByRole("button", {
            name: en ? "Download manifest" : "Manifest herunterladen",
            exact: true,
          })
          .last()
          .press("Enter");
        await manifestDownload;
        userPage.off("download", collect);
        const downloaded = await Promise.all(files);
        const manifestFile = downloaded.find((file) =>
          file.name.endsWith("-manifest.json"),
        );
        expect(manifestFile).toBeDefined();
        const manifest = fileManifest(manifestFile!.bytes);
        expect(manifest.complete).toBe(true);
        const parts = downloaded
          .filter((file) => file.name.endsWith(".part"))
          .sort((a, b) => a.name.localeCompare(b.name));
        expect(parts).toHaveLength(manifest.files);
        for (const part of parts)
          expect(part.bytes.length).toBeLessThanOrEqual(
            Number(process.env.SOURCE_TASTER_TEST_EXPORT_FILE_BYTES ?? 8388608),
          );
        const payload = Buffer.concat(parts.map((part) => part.bytes));
        expect(createHash("sha256").update(payload).digest("hex")).toBe(
          manifest.sha256,
        );
        const data = exportedData(payload);
        expect(data.format).toBe(format);
        if (format.includes("verification")) {
          expect(manifest.parts).toBeGreaterThan(1);
          expect(data.checks[0]!.references[0]!.originalText).toBe(
            physicsReference,
          );
        }
      }
      await context.close();
      const accountingSection = page.getByRole("region", {
        name: en
          ? "Accounting and data-subject exports"
          : "Buchhaltungs- und Datenauskünfte",
        exact: true,
      });
      await accountingSection
        .getByRole("combobox", {
          name: en ? "Export type" : "Exportart",
          exact: true,
        })
        .selectOption("accounting-export");
      await accountingSection
        .getByLabel(
          en
            ? "Period start (inclusive, UTC)"
            : "Zeitraumbeginn (einschließlich, UTC)",
          { exact: true },
        )
        .fill("2025-01-01");
      await accountingSection
        .getByLabel(
          en
            ? "Period end (exclusive, UTC)"
            : "Zeitraumende (ausschließlich, UTC)",
          { exact: true },
        )
        .fill("2027-01-01");
      await accountingSection
        .getByRole("button", {
          name: en ? "Review export" : "Export prüfen",
          exact: true,
        })
        .press("Enter");
      await both.advance(61000);
      await accountingSection
        .getByRole("button", {
          name: en
            ? "Send fresh proof code"
            : "Code für erneuten Nachweis senden",
          exact: true,
        })
        .press("Enter");
      await expect(
        accountingSection.getByLabel(en ? "Sign-in code" : "Anmeldecode", {
          exact: true,
        }),
      ).toBeVisible();
      await accountingSection
        .getByLabel(en ? "Sign-in code" : "Anmeldecode", { exact: true })
        .fill(await latestCode());
      const proofResult = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === "/v1/operator/fresh-proof",
      );
      await accountingSection
        .getByRole("button", {
          name: en ? "Confirm fresh proof" : "Erneuten Nachweis bestätigen",
          exact: true,
        })
        .press("Enter");
      expect((await proofResult).status()).toBe(200);
      await accountingSection
        .getByLabel(
          en
            ? "I confirm the export scope and support-case reason"
            : "Ich bestätige den Exportumfang und den Grund Supportfall",
        )
        .check();
      const accountingFiles: Promise<{ name: string; bytes: Buffer }>[] = [];
      const collectAccounting = (download: Download) =>
        accountingFiles.push(
          (async () => ({
            name: download.suggestedFilename(),
            bytes: await readFile(await download.path()),
          }))(),
        );
      page.on("download", collectAccounting);
      const apply = accountingSection.getByRole("button", {
        name: en ? "Arrange export" : "Export veranlassen",
        exact: true,
      });
      for (let file = 0; file < 100; file++) {
        await expect(apply).toBeEnabled();
        await apply.press("Enter");
        await expect(apply).toBeEnabled();
        if (
          (await accountingSection.getByRole("status").textContent()) ===
          (en ? "Download received" : "Download empfangen")
        )
          break;
      }
      await expect(accountingSection.getByRole("status")).toHaveText(
        en ? "Download received" : "Download empfangen",
      );
      const accountingManifest = page.waitForEvent("download", {
        predicate: (download) =>
          download.suggestedFilename().endsWith("-manifest.json"),
      });
      await accountingSection
        .getByRole("button", {
          name: en ? "Download manifest" : "Manifest herunterladen",
          exact: true,
        })
        .press("Enter");
      await accountingManifest;
      page.off("download", collectAccounting);
      const documents = await Promise.all(accountingFiles);
      const manifest = fileManifest(
        documents.find((file) => file.name.endsWith("-manifest.json"))!.bytes,
      );
      const bytes = Buffer.concat(
        documents
          .filter((file) => file.name.endsWith(".part"))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((file) => file.bytes),
      );
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        manifest.sha256,
      );
      const accounting = exportedData(bytes);
      expect(accounting.completeness).toBe("complete");
      expect(accounting.invoices).toHaveLength(3);
      expect(accounting.totals).toEqual([
        {
          country: "DE",
          currency: "EUR",
          netCents: "3000",
          taxCents: "570",
          grossCents: "3570",
          invoiceCount: 3,
        },
      ]);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    } finally {
      await both.stop();
      await Promise.all(
        [setup, setup + ".done"].map((p) => rm(p, { force: true })),
      );
    }
  });
