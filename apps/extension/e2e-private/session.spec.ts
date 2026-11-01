// SPDX-License-Identifier: AGPL-3.0-or-later
import { createServer } from "node:http";
import { once } from "node:events";
import { test, expect } from "@playwright/test";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildExtension } from "../e2e/support/build.ts";
import { launchChromium, until } from "../e2e/support/chromium.ts";
import { launchFirefox } from "../e2e/support/firefox.ts";
import { bothPrograms } from "../../server/test/support/both-programs.ts";
const key = "source-taster-extension-session-v1";
async function allow(
  b: Awaited<ReturnType<typeof bothPrograms>>,
  origin: string,
) {
  const config = JSON.parse(
    await readFile(b.accountConfigPath, "utf8"),
  ) as Record<string, unknown>;
  await writeFile(
    b.accountConfigPath,
    JSON.stringify({
      ...config,
      extensionOrigins: [origin],
      ...(origin.startsWith("moz-extension:")
        ? { extensionSessionReadProfile: "firefox-originless-get" }
        : {}),
    }),
  );
  await b.restartService();
}
async function code(b: Awaited<ReturnType<typeof bothPrograms>>) {
  return until(
    async () => (await b.mail()).at(-1)?.text.match(/\b[0-9]{6}\b/)?.[0],
    "Captured mail did not arrive",
  );
}
for (const language of ["en", "de"] as const)
  test(`native Chromium uses real mail, opaque storage and restart in ${language}`, async () => {
    const b = await bothPrograms({ accounts: true });
    const profile = await mkdtemp(join(tmpdir(), "st98-real-profile-"));
    let browser: Awaited<ReturnType<typeof launchChromium>> | undefined;
    let build: Awaited<ReturnType<typeof buildExtension>> | undefined;
    try {
      build = await buildExtension("chromium", {
        SOURCE_TASTER_EXTENSION_MODE: "hosted",
        SOURCE_TASTER_EXTENSION_API_URL: b.apiUrl,
        SOURCE_TASTER_EXTENSION_SERVICE_URL: b.serviceUrl,
        SOURCE_TASTER_EXTENSION_WEBSITE_URL: "http://127.0.0.1:5001",
        SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN: "enabled",
      });
      browser = await launchChromium(
        build.outDir,
        profile,
        language === "de" ? "de-DE" : "en-GB",
      );
      test.info().annotations.push({
        type: "browser",
        description: `Chromium ${browser.context.browser()?.version()} exact origin ${browser.origin}`,
      });
      await allow(b, browser.origin);
      let panel = await browser.openPanel();
      const labels =
        language === "de"
          ? {
              signin: "Anmelden",
              email: "E-Mail-Adresse",
              send: "Code senden",
              code: "Sechsstelliger Code",
              confirm: "Code bestätigen",
              here: "Hier abmelden",
              everywhere: "Überall abmelden",
              reference: "Referenz",
            }
          : {
              signin: "Sign in",
              email: "Email address",
              send: "Send code",
              code: "Six-digit code",
              confirm: "Confirm code",
              here: "Sign out here",
              everywhere: "Sign out everywhere",
              reference: "Reference",
            };
      if (language === "de") await panel.select("combobox", "Language", "de");
      const email = `native-${language}@example.invalid`;
      await panel.click("button", labels.signin);
      await panel.fill("textbox", labels.email, email);
      await panel.click("button", labels.send);
      await panel.fill("textbox", labels.code, await code(b));
      await panel.click("button", labels.confirm);
      try {
        await panel.find("button", labels.here);
      } catch (error) {
        console.error(
          "Panel HTTP",
          panel.requests.map(
            (r) =>
              `${r.method} ${r.url} ${r.postData?.replace(/[0-9]{6}/, "<CODE>").replace(/"transactionCredential":"[^"]*"/, '"transactionCredential":"<T:"+r.postData?.length+">"') ?? ""}`,
          ),
          panel.responses.map((r) => `${r.status} ${r.url}`),
        );
        console.error("Service diagnostic", b.service().output());
        throw error;
      }
      const storage = await browser.storage();
      expect(storage[key]).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(
        Object.keys(storage).filter(
          (k) =>
            ![
              "source-taster-guest-id-v1",
              "source-taster-guest-preferences-v1",
            ].includes(k),
        ),
      ).toEqual([key]);
      expect(await panel.axe()).toEqual([]);
      await panel.fill(
        "textbox",
        labels.reference,
        "Never restore Account input",
      );
      panel.detach();
      await browser.close();
      browser = await launchChromium(
        build.outDir,
        profile,
        language === "de" ? "de-DE" : "en-GB",
      );
      panel = await browser.openPanel();
      await panel.find("button", labels.here);
      expect(
        await panel.call(
          await panel.find("textbox", labels.reference),
          "function(){return this.value;}",
        ),
      ).toBe("");
      expect((await browser.storage())[key]).toBe(storage[key]);
      await panel.click("button", labels.everywhere);
      await panel.find("button", labels.signin);
      expect((await browser.storage())[key]).toBeUndefined();
      panel.detach();
    } finally {
      await browser?.close();
      await build?.remove();
      await rm(profile, { recursive: true, force: true });
      await b.stop();
    }
  });

test("native Firefox real mail with one observed dynamic origin; deployment qualification remains open", async () => {
  const b = await bothPrograms({ accounts: true });
  const observed: {
    path?: string;
    method?: string;
    origin?: string;
    status: number;
  }[] = [];
  const proxy = createServer((req, res) => {
    void (async () => {
      const chunks: Buffer[] = [];
      for await (const chunk of req as AsyncIterable<Uint8Array>)
        chunks.push(Buffer.from(chunk));
      // LIMIT: the #101 private Preferences route is not part of this private
      // phase. The Firefox originless GET to it would be refused (403) and the
      // shared client treats 403 as an expired session. Answer only that one
      // read as "not found" so the #98 sign-in evidence stays real; #101 private
      // must add the route to the originless-GET profile and replace this stand-in.
      if (req.method === "GET" && req.url === "/v1/extension/preferences") {
        observed.push({
          path: req.url,
          method: req.method,
          origin: req.headers.origin,
          status: 404,
        });
        res.writeHead(404, { "content-type": "application/problem+json" });
        res.end(JSON.stringify({ code: "not-found", status: 404 }));
        return;
      }
      const reply = await fetch(b.serviceUrl + req.url!, {
        method: req.method,
        headers: req.headers as Record<string, string>,
        ...(req.method === "POST" ? { body: Buffer.concat(chunks) } : {}),
      });
      observed.push({
        path: req.url,
        method: req.method,
        origin: req.headers.origin,
        status: reply.status,
      });
      res.writeHead(reply.status, Object.fromEntries(reply.headers));
      res.end(Buffer.from(await reply.arrayBuffer()));
    })().catch(() => {
      res.writeHead(503);
      res.end();
    });
  });
  proxy.listen(5001, "127.0.0.1");
  await once(proxy, "listening");
  let build: Awaited<ReturnType<typeof buildExtension>> | undefined;
  let browser: Awaited<ReturnType<typeof launchFirefox>> | undefined;
  try {
    build = await buildExtension("firefox", {
      SOURCE_TASTER_EXTENSION_MODE: "hosted",
      SOURCE_TASTER_EXTENSION_API_URL: b.apiUrl,
      SOURCE_TASTER_EXTENSION_SERVICE_URL: "http://127.0.0.1:5001",
      SOURCE_TASTER_EXTENSION_WEBSITE_URL: "http://127.0.0.1:5001",
      SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN: "enabled",
    });
    browser = await launchFirefox(build.outDir);
    await browser.clickToolbarButton();
    const sidebar = await until(async () => {
      const s = await browser!.sidebar();
      return s.open && s.url ? s : false;
    }, "Sidebar did not open");
    const origin = sidebar.url!.match(/^moz-extension:\/\/[^/]+/)![0];
    test.info().annotations.push({
      type: "browser",
      description: `Firefox ${browser.version}, manually allowlisted observed dynamic origin ${origin}; no deployment qualification`,
    });
    await allow(b, origin);
    await browser.click(await browser.find("pushbutton", "Sign in"));
    await browser.click(await browser.find("entry", "Email address"));
    await browser.type("firefox-real@example.invalid");
    await browser.click(await browser.find("pushbutton", "Send code"));
    await browser.click(await browser.find("entry", "Six-digit code"));
    await browser.type(await code(b));
    await browser.click(await browser.find("pushbutton", "Confirm code"));
    try {
      await browser.find("pushbutton", "Sign out here");
    } catch (error) {
      console.error(
        "Firefox visible state",
        (await browser.tree()).map((n) => ({
          role: n.role,
          name: n.name.replace(/\b[0-9]{6}\b/g, "<CODE>"),
        })),
      );
      console.error("Observed HTTP", observed);
      console.error("Service diagnostic", b.service().output());
      throw error;
    }
    await browser.clickToolbarButton();
    await until(
      async () => !(await browser!.sidebar()).open,
      "Sidebar did not close",
    );
    await browser.clickToolbarButton();
    try {
      await browser.find("pushbutton", "Sign out here");
    } catch (error) {
      console.error("Observed HTTP", observed);
      console.error(
        "Reopened sidebar",
        (await browser.tree()).map((n) => ({
          role: n.role,
          name: n.name.replace(/\b[0-9]{6}\b/g, "<CODE>"),
        })),
      );
      throw error;
    }
    await browser.click(await browser.find("pushbutton", "Sign out here"));
    await browser.find("pushbutton", "Sign in");
  } finally {
    await browser?.close();
    await build?.remove();
    proxy.closeAllConnections();
    await new Promise<void>((resolve) => proxy.close(() => resolve()));
    await b.stop();
  }
});
