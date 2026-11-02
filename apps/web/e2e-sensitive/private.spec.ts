// SPDX-License-Identifier: AGPL-3.0-or-later
import { test, expect } from "@playwright/test";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { writeFile } from "node:fs/promises";
import {
  bothPrograms,
  eventually,
  freePort,
} from "../../server/test/support/both-programs.ts";
test("real service mail proves control and deletes the Account; Guest Quota stays lazy", async ({
  page,
}) => {
  const b = await bothPrograms({ accounts: true, startWorker: false });
  const port = await freePort(),
    url = `http://127.0.0.1:${port}`;
  let vite: ReturnType<typeof spawn> | undefined;
  try {
    b.serviceConfig.allowedOrigins = [url, "https://web.test.invalid"];
    await writeFile(b.serviceConfigPath, JSON.stringify(b.serviceConfig));
    await b.restartService();
    vite = spawn(
      process.execPath,
      [
        "node_modules/vite/bin/vite.js",
        "--config",
        "e2e-sensitive/vite.config.ts",
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--strictPort",
      ],
      {
        cwd: new URL("..", import.meta.url),
        env: {
          PATH: process.env.PATH,
          NODE_ENV: "test",
          SOURCE_TASTER_API_URL: b.apiUrl,
          VITE_SOURCE_TASTER_MODE: "hosted",
          VITE_SOURCE_TASTER_SERVICE_URL: b.serviceUrl,
          VITE_SOURCE_TASTER_SENSITIVE_ACCOUNT_ACTIONS: "enabled",
        },
        stdio: "pipe",
      },
    );
    await eventually(() =>
      fetch(url).then(
        (r) => r.ok,
        () => false,
      ),
    );
    await page.goto(url);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page
      .getByLabel("Email address", { exact: true })
      .fill("real-sensitive-ui@example.invalid");
    await page.getByRole("button", { name: "Send code", exact: true }).click();
    await expect(
      page.getByLabel("Six-digit code", { exact: true }),
    ).toBeVisible();
    await page
      .getByLabel("Six-digit code", { exact: true })
      .fill((await b.mail()).at(-1)!.text.match(/\b[0-9]{6}\b/)![0]);
    await page
      .getByRole("button", { name: "Confirm code", exact: true })
      .click();
    await expect(
      page.getByText("real-sensitive-ui@example.invalid", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Delete Account", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Send confirmation code", exact: true })
      .click();
    const proof = page.getByRole("region", { name: "Account security" });
    await expect(
      proof.getByLabel("Six-digit code", { exact: true }),
    ).toBeVisible();
    await proof
      .getByLabel("Six-digit code", { exact: true })
      .fill((await b.mail()).at(-1)!.text.match(/\b[0-9]{6}\b/)![0]);
    await proof.getByRole("button", { name: "Confirm", exact: true }).click();
    await proof
      .getByRole("checkbox", {
        name: /billing records are kept for eight years/,
      })
      .check();
    const requests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes(b.serviceUrl))
        requests.push(new URL(r.url()).pathname);
    });
    await proof
      .getByRole("button", { name: "Delete Account permanently", exact: true })
      .click();
    await expect(page.getByText(/Your Account was deleted/)).toBeVisible();
    await page.waitForTimeout(300);
    expect(requests.filter((p) => p.endsWith("guest-tokens"))).toEqual([]);
  } finally {
    if (vite && vite.exitCode === null) {
      const exited = once(vite, "exit");
      vite.kill("SIGTERM");
      await exited;
    }
    await b.stop();
  }
});
