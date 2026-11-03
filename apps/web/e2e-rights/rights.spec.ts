// SPDX-License-Identifier: AGPL-3.0-or-later
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createHash, randomUUID } from "node:crypto";
import { writeFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { bothPrograms } from "../../server/test/support/both-programs.ts";
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
      verificationPublicOrigin: "https://verification.test.invalid",
      serviceAllowedOrigins: [
        "https://web.test.invalid",
        "https://service.test.invalid",
      ],
      serviceEnv: {
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
      await userPage.route(
        "https://verification.test.invalid/**",
        async (route) => {
          const u = new URL(route.request().url());
          await route.fulfill({
            response: await route.fetch({
              url: both.apiUrl + u.pathname + u.search,
            }),
          });
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
        const downloadPromise = userPage.waitForEvent("download");
        await button.press("Enter");
        const download = await downloadPromise;
        const path = await download.path();
        const data = JSON.parse(await readFile(path, "utf8")) as {
          format: string;
        };
        expect(data.format).toBe(format);
        await expect(userPage.getByRole("status")).toHaveText(
          en ? "Download received" : "Download empfangen",
        );
      }
      await context.close();
    } finally {
      await both.stop();
      await Promise.all(
        [setup, setup + ".done"].map((p) => rm(p, { force: true })),
      );
    }
  });
