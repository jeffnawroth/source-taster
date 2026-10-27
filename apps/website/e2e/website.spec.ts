// SPDX-License-Identifier: AGPL-3.0-or-later
import { test, expect } from "@playwright/test";
const websiteOrigin = `http://127.0.0.1:${process.env.SOURCE_TASTER_WEBSITE_E2E_PORT ?? "53115"}`;
import { informationLinks } from "@source-taster/ui/information";

test("reader opens a documentation deep link and switches to its counterpart", async ({
  page,
  request,
}) => {
  const response = await request.get("/docs/en/how-the-check-works/");
  expect(response.status()).toBe(200);
  expect(response.headers()["set-cookie"]).toBeUndefined();
  expect(response.headers()["x-robots-tag"]).toContain("noindex");
  await page.goto("/docs/en/how-the-check-works/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "How the check works",
  );
  await expect(
    page.getByText("A Verdict is not proof of deception.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Deutsch", exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/de\/how-the-check-works\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "So funktioniert die Prüfung",
  );
});

test("bare entry follows browser language without changing explicit language URLs or storing Preferences", async ({
  browser,
  request,
}) => {
  for (const [locale, target] of [
    ["de-AT", "de"],
    ["fr-FR", "en"],
  ]) {
    // Negotiation is server-side: it must work without client scripts.
    const context = await browser.newContext({
      locale,
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    await page.goto("/?private-query=do-not-forward");
    await expect(page).toHaveURL(`${websiteOrigin}/${target}/`);
    await page.goto("/en/faq/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(await context.cookies()).toEqual([]);
    expect(
      await page.evaluate(() => ({
        local: Object.keys(localStorage),
        session: Object.keys(sessionStorage),
      })),
    ).toEqual({ local: [], session: [] });
    await context.close();
  }
  for (const [acceptLanguage, target] of [
    ["de-AT,de;q=0.9,en;q=0.8", "de"],
    ["fr-FR,en;q=0.5,de;q=0.4", "en"],
    ["fr-CH,de-CH;q=0.7,en;q=0.3", "de"],
    ["en;q=0,de;q=0.1", "de"],
    ["DE", "de"],
    ["fr", "en"],
    ["", "en"],
  ] as const) {
    const entry = await request.get("/?private-query=do-not-forward", {
      headers: { "accept-language": acceptLanguage },
      maxRedirects: 0,
    });
    expect(entry.status(), acceptLanguage).toBe(302);
    expect(entry.headers().location, acceptLanguage).toBe(`/${target}/`);
    expect(entry.headers().vary).toContain("Accept-Language");
    expect(entry.headers()["cache-control"]).toBe("no-store");
    expect(entry.headers()["set-cookie"]).toBeUndefined();
  }
  const canonical = await request.get("/de/faq", { maxRedirects: 0 });
  expect(canonical.status()).toBe(308);
  expect(canonical.headers().location).toBe("/de/faq/");
  expect((await request.get("/docs/en/missing/")).status()).toBe(404);
});

test("documentation search stays local, language-scoped and keyboard accessible", async ({
  page,
  context,
}) => {
  const requests: string[] = [];
  page.on("request", (req) => requests.push(req.url()));
  await page.goto("/docs/en/");
  const query = page.getByRole("searchbox", {
    name: "Search documentation",
    exact: true,
  });
  await query.fill("citation style");
  await query.press("Enter");
  const result = page.getByRole("link", {
    name: "Language and citation style",
    exact: true,
  });
  await expect(result).toHaveCount(2);
  const results = page.getByRole("region", {
    name: "Search results",
    exact: true,
  });
  await expect(
    results.getByRole("link", { name: "Language and citation style" }),
  ).toHaveAttribute("href", "/docs/en/preferences/");
  await query.fill("zzzzuniquenomatch");
  await query.press("Enter");
  await expect(page.getByRole("status")).toHaveText(
    "No matching pages. Try another word.",
  );
  await page.getByRole("link", { name: "Deutsch", exact: true }).click();
  await page.getByRole("searchbox").fill("Zitierstil");
  await page.getByRole("searchbox").press("Enter");
  await expect(
    page
      .getByRole("region", { name: "Suchergebnisse" })
      .getByRole("link", { name: "Sprache und Zitierstil" }),
  ).toHaveAttribute("href", "/docs/de/preferences/");
  expect(requests.every((url) => new URL(url).origin === websiteOrigin)).toBe(
    true,
  );
  expect(
    requests.some((url) => /citation|zzzzunique|Zitierstil/.test(url)),
  ).toBe(false);
  expect(await context.cookies()).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    })),
  ).toEqual({ local: [], session: [] });
});

test("every information page has a translated counterpart and versioned legal drafts", async ({
  page,
  request,
}) => {
  for (const language of ["en", "de"]) {
    for (const route of [
      "",
      "faq/",
      "contact/",
      "accessibility/",
      "legal-notice/",
      "terms/",
      "privacy/",
      "withdrawal/",
    ]) {
      await page.goto(`/${language}/${route}`);
      await expect(page.locator("html")).toHaveAttribute("lang", language);
      await expect(page.getByRole("heading", { level: 1 })).not.toBeEmpty();
      for (const legal of ["legal-notice", "terms", "privacy", "withdrawal"]) {
        const link = page.locator(`footer a[href='/${language}/${legal}/']`);
        await expect(link).toHaveCount(1);
        const response = await request.get(
          (await link.getAttribute("href")) ?? "",
        );
        expect(response.status()).toBe(200);
        expect(await response.text()).toContain("draft-2026-10-26.1");
      }
      const other = language === "en" ? "de" : "en";
      await expect(
        page.getByRole("link", {
          name: other === "de" ? "Deutsch" : "English",
          exact: true,
        }),
      ).toHaveAttribute("href", `/${other}/${route}`);
    }
  }
});

test("publication commands reject incomplete drafts and production cannot serve the preview", async () => {
  const { spawnSync } = await import("node:child_process");
  for (const args of [
    ["scripts/build.ts", "--publication"],
    ["scripts/serve.ts", "--publication", "--directory", "dist-preview"],
  ]) {
    const result = spawnSync(process.execPath, args, { encoding: "utf8" });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("real HTTPS domain");
    expect(result.stderr).toContain("monitored support address");
    expect(result.stderr).toContain("seller name");
    expect(result.stderr).toContain(
      "de/terms: approved legal version required",
    );
    expect(result.stderr).toContain(
      "en/terms: approved legal version required",
    );
    expect(result.stderr).toContain("claims: current release review required");
  }
  const productionPreview = spawnSync(
    process.execPath,
    ["scripts/serve.ts", "--preview"],
    { encoding: "utf8", env: { ...process.env, NODE_ENV: "production" } },
  );
  expect(productionPreview.status).not.toBe(0);
  expect(productionPreview.stderr).toContain("local-only");
});

test("every link the clients share through the UI seam opens its page in the same language", async ({
  page,
}) => {
  for (const language of ["de", "en"] as const) {
    const links = informationLinks(language);
    expect(links.map((link) => link.id)).toEqual([
      "help",
      "contact",
      "legal-notice",
      "terms",
      "privacy",
      "withdrawal",
    ]);
    for (const link of links) {
      const response = await page.goto(link.href);
      expect(response?.status(), link.href).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", language);
      await expect(page.getByRole("heading", { level: 1 })).not.toBeEmpty();
    }
  }
});

test("the Structuring preview is documented in both languages and found by search", async ({
  page,
}) => {
  for (const [language, query, title, searchbox] of [
    ["en", "Harvard", "Structuring References", "Search documentation"],
    ["de", "Harvard", "Referenzen strukturieren", "Dokumentation durchsuchen"],
  ] as const) {
    await page.goto(`/docs/${language}/`);
    const box = page.getByRole("searchbox", { name: searchbox, exact: true });
    await box.fill(query);
    await box.press("Enter");
    await page
      .locator("#search-results")
      .getByRole("link", { name: title, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/docs/${language}/structuring/$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator("article")).toContainText(
      language === "en" ? "not been verified" : "nicht geprüft",
    );
  }
});

test("retry help describes automatic progress reconnection in both languages", async ({
  page,
}) => {
  await page.goto("/docs/en/errors-and-retry/");
  await expect(page.locator("article")).toContainText(
    "automatically reconnects",
  );
  await expect(page.locator("article")).toContainText("last received event");
  await page.getByRole("link", { name: "Deutsch", exact: true }).click();
  await expect(page.locator("article")).toContainText("automatisch erneut");
  await expect(page.locator("article")).toContainText(
    "zuletzt empfangenen Ereignis",
  );
});

test("readers can download licenses and Corresponding Source bound to the served search WASM", async ({
  page,
  request,
}) => {
  const { createHash } = await import("node:crypto");
  await page.goto("/docs/en/");
  await page
    .getByRole("link", { name: "Search licenses and source", exact: true })
    .click();
  await expect(page).toHaveURL(/\/third-party\/pagefind\/en\/$/);
  await expect(
    page.getByRole("link", { name: "GNU GPL version 3", exact: true }),
  ).toBeVisible();
  const source = await request.get(
    "/third-party/pagefind/corresponding-source.tar.gz",
  );
  expect(source.status()).toBe(200);
  expect((await source.body()).length).toBeGreaterThan(100_000);
  const response = await request.get("/third-party/pagefind/manifest.json");
  expect(response.status()).toBe(200);
  const manifest = (await response.json()) as {
    version: string;
    licenses: { microjson: string };
    source: { sha256: string };
    objects: Record<string, string>;
  };
  expect(manifest.version).toBe("1.5.2");
  expect(manifest.licenses.microjson).toBe("GPL-3.0-only");
  expect(manifest.source.sha256).toBe(
    createHash("sha256")
      .update(await source.body())
      .digest("hex"),
  );
  for (const path of [
    "pagefind/de/wasm.de.pagefind",
    "pagefind/en/wasm.en.pagefind",
    "pagefind/en/wasm.unknown.pagefind",
  ]) {
    const object = await request.get(`/${path}`);
    expect(object.status()).toBe(200);
    expect(manifest.objects[path]).toBe(
      createHash("sha256")
        .update(await object.body())
        .digest("hex"),
    );
  }
  for (const path of [
    "/third-party/pagefind/GPL-3.0.txt",
    "/third-party/pagefind/NOTICE.txt",
  ]) {
    const text = await request.get(path);
    expect(text.status()).toBe(200);
    expect((await text.text()).length).toBeGreaterThan(100);
  }
});

test("source-access pages follow footer language, switch counterparts and serve every download", async ({
  page,
  request,
}) => {
  for (const [language, title, other, counterpart] of [
    ["de", "Suchlizenzen und Quellcode", "en", "English"],
    ["en", "Search licenses and source", "de", "Deutsch"],
  ] as const) {
    await page.goto(`/docs/${language}/`);
    await page.getByRole("link", { name: title, exact: true }).click();
    await expect(page).toHaveURL(
      new RegExp(`/third-party/pagefind/${language}/$`),
    );
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page).toHaveTitle(`${title} · Source Taster`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.+/,
    );
    for (const link of await page.locator("main ul a").all()) {
      const response = await request.get((await link.getAttribute("href"))!);
      expect(response.status()).toBe(200);
      expect((await response.body()).length).toBeGreaterThan(100);
    }
    await page.getByRole("link", { name: counterpart, exact: true }).click();
    await expect(page).toHaveURL(
      new RegExp(`/third-party/pagefind/${other}/$`),
    );
    await expect(page.locator("html")).toHaveAttribute("lang", other);
  }
});
