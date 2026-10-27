// SPDX-License-Identifier: AGPL-3.0-or-later
// #115 / ADR-0020: no analytics, tracking, third-party resources or embeds,
// and requirement IDs stay internal.
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const root = new URL("../dist-preview/", import.meta.url);
const artifact = JSON.parse(
  readFileSync(new URL("website-artifact.json", root), "utf8"),
) as { files: Record<string, string> };
const files = Object.keys(artifact.files);
const text = (file: string) => readFileSync(new URL(file, root), "utf8");

test("the built site references no third-party resource, embed or requirement ID", () => {
  const offending: string[] = [];
  for (const file of files.filter((name) => /\.(html|css|js)$/.test(name))) {
    const content = text(file);
    if (file.endsWith(".html")) {
      for (const [tag] of content.matchAll(
        /<(?:script|link|img|iframe|frame|embed|object|source|video|audio|track|form)\b[^>]*>/gi,
      ))
        if (
          /\b(?:src|href|action|data|srcset|poster)=["']?(?:https?:)?\/\//i.test(
            tag,
          )
        )
          offending.push(`${file}: ${tag}`);
      if (/<(?:iframe|frame|embed|object)\b/i.test(content))
        offending.push(`${file}: embed`);
      if (/\bFA-[A-Z]{3}-\d/.test(content))
        offending.push(`${file}: requirement ID`);
    }
    if (
      file.endsWith(".css") &&
      /(?:url\(|@import)\s*["']?(?:https?:)?\/\//i.test(content)
    )
      offending.push(`${file}: remote CSS resource`);
    if (
      /google-analytics|googletagmanager|plausible|matomo|posthog|segment\.io|hotjar|sentry/i.test(
        content,
      )
    )
      offending.push(`${file}: analytics vendor`);
  }
  expect(offending).toEqual([]);
});

test("reading every page stays on this origin and stores nothing", async ({
  page,
  context,
  baseURL,
}) => {
  const origins = new Set<string>();
  const cookies: string[] = [];
  page.on("request", (request) => origins.add(new URL(request.url()).origin));
  page.on("response", async (response) => {
    const value = await response.headerValue("set-cookie");
    if (value) cookies.push(`${response.url()}: ${value}`);
  });
  for (const file of files.filter((name) => name.endsWith("index.html")))
    await page.goto(`/${file.slice(0, -"index.html".length)}`);
  expect([...origins]).toEqual([new URL(baseURL ?? "").origin]);
  expect(cookies).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  expect(
    await page.evaluate(() => [
      ...Object.keys(localStorage),
      ...Object.keys(sessionStorage),
    ]),
  ).toEqual([]);
});
