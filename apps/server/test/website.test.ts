// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0020: the website is served by the existing web process, next to the
// API, and the publication gate keeps drafts out of production.
import { ProblemDetails } from "@source-taster/contract-verification";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startProcess, testDatabase } from "./support/processes.ts";
import { startTestService } from "./support/service.ts";

describe("website mounted in the web process", () => {
  let service: Awaited<ReturnType<typeof startTestService>>;
  beforeAll(async () => {
    service = await startTestService(
      Number(process.env.SOURCE_TASTER_TEST_WEBSITE_PORT ?? 3103),
      50,
      {
        SOURCE_TASTER_WEBSITE_MODE: "preview",
      },
    );
  });
  afterAll(() => service?.stop());

  it("serves the bilingual draft preview with its security headers", async () => {
    for (const language of ["de", "en"]) {
      const response = await fetch(`${service.apiUrl}/${language}/`);
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("text/html");
      expect(response.headers.get("content-security-policy")).toContain(
        "default-src 'none'",
      );
      expect(response.headers.get("x-robots-tag")).toContain("noindex");
      expect(response.headers.get("set-cookie")).toBeNull();
      expect(await response.text()).toContain(`<html lang="${language}"`);
    }
    const entry = await fetch(`${service.apiUrl}/`, {
      headers: { "accept-language": "de-DE,en;q=0.5" },
      redirect: "manual",
    });
    expect(entry.status).toBe(302);
    expect(entry.headers.get("location")).toBe("/de/");
  });

  it("leaves the API and health surface to the API", async () => {
    const health = await fetch(`${service.apiUrl}/health`);
    expect(health.status).toBe(200);
    expect(health.headers.get("content-security-policy")).toBeNull();
    for (const path of [
      "/v1/unknown",
      "/v1/checks/unknown/also-unknown",
      "/internal/unknown",
      "/v2/unknown",
    ]) {
      const response = await fetch(`${service.apiUrl}${path}`);
      expect(response.status, path).toBe(404);
      expect(response.headers.get("content-security-policy"), path).toBeNull();
      expect(await response.text(), path).not.toContain("<html");
    }
    const unknownCheck = await fetch(
      `${service.apiUrl}/v1/checks/00000000-0000-4000-8000-000000000000`,
    );
    expect(unknownCheck.status).toBe(404);
    expect(ProblemDetails.parse(await unknownCheck.json()).code).toBe(
      "check-not-found",
    );
  });
});

describe("website publication gate in the web process", () => {
  it("refuses to start while the legal drafts and reviews are missing", async () => {
    const web = startProcess("web", {
      SOURCE_TASTER_MODE: "standalone",
      DATABASE_URL: testDatabase().appUrl,
      SOURCE_TASTER_PORT: "3104",
      SOURCE_TASTER_WEBSITE_MODE: "publication",
    });
    const code = await web.exited;
    expect(code).not.toBe(0);
    for (const missing of [
      "real HTTPS domain",
      "monitored support address",
      "seller name",
      "de/terms: approved legal version required",
      "claims: current release review required",
    ])
      expect(web.output()).toContain(missing);
  });

  it("refuses on the gate itself, not on database reachability", async () => {
    // The gate is a pure artifact-and-input check. Nothing about the database
    // (unreachable, wrong credentials, restore fence) may stand in front of it.
    const web = startProcess("web", {
      SOURCE_TASTER_MODE: "standalone",
      DATABASE_URL: "postgres://nobody:nothing@127.0.0.1:1/none",
      SOURCE_TASTER_PORT: "3106",
      SOURCE_TASTER_WEBSITE_MODE: "publication",
    });
    expect(await web.exited).not.toBe(0);
    expect(web.output()).toContain("real HTTPS domain");
    expect(web.output()).not.toContain("ECONNREFUSED");
  });

  it("refuses the draft preview in production", async () => {
    const web = startProcess("web", {
      SOURCE_TASTER_MODE: "standalone",
      DATABASE_URL: testDatabase().appUrl,
      SOURCE_TASTER_PORT: "3105",
      SOURCE_TASTER_WEBSITE_MODE: "preview",
      NODE_ENV: "production",
    });
    expect(await web.exited).not.toBe(0);
    expect(web.output()).toContain("Draft preview is local-only");
  });
});
