// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  CheckResponse,
  PROBLEM_CONTENT_TYPE,
  ProblemDetails,
} from "@source-taster/contract-verification";
import { describe, expect, inject, it } from "vitest";

const api = inject("apiUrl");

const twoReferences = [
  "Doe, J. (2020). A study of things. Journal of Studies, 1(2), 3-4.",
  "Roe, R. (2021). Another study. Proceedings of Testing, 5-6.",
].join("\n");

function postCheck(body: unknown) {
  return fetch(`${api}/v1/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /v1/checks", () => {
  it("creates a running Check with one running Reference slot per pasted Reference", async () => {
    const response = await postCheck({ text: twoReferences });

    expect(response.status).toBe(201);
    const { data, quota } = CheckResponse.parse(await response.json());
    expect(quota).toBeNull();
    expect(data.state).toBe("running");
    expect(data.references).toEqual([
      {
        slot: 1,
        originalText:
          "Doe, J. (2020). A study of things. Journal of Studies, 1(2), 3-4.",
        outcome: { kind: "status", status: "running" },
        progress: "queued",
      },
      {
        slot: 2,
        originalText:
          "Roe, R. (2021). Another study. Proceedings of Testing, 5-6.",
        outcome: { kind: "status", status: "running" },
        progress: "queued",
      },
    ]);
  });

  it.each(["", "  \n\t \n"])(
    "rejects empty input %j as a problem",
    async (text) => {
      const response = await postCheck({ text });

      expect(response.status).toBe(400);
      expect(response.headers.get("content-type")).toBe(PROBLEM_CONTENT_TYPE);
      const problem = ProblemDetails.parse(await response.json());
      expect(problem).toMatchObject({
        status: 400,
        code: "input-empty",
        i18nKey: "problem_input_empty",
      });
    },
  );
});

// #71/#72: Check creation must enforce the same configured intake bound.
it("rejects 1001 Check References with a limit Problem before enqueueing", async () => {
  const response = await postCheck({
    text: Array(1001).fill("Doe, J. (2020). A study.").join("\n"),
  });
  expect(response.status).toBe(400);
  expect(ProblemDetails.parse(await response.json())).toMatchObject({
    code: "reference-limit",
    i18nKey: "problem_reference_limit",
    limit: 1000,
  });
});

it("uses the Operator-configured Check intake limit", async () => {
  const { startTestService } = await import("./support/service.ts");
  const service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_LIMIT_PORT ?? 34176),
    50,
    { SOURCE_TASTER_REFERENCE_LIMIT: "2" },
  );
  try {
    const response = await fetch(`${service.apiUrl}/v1/checks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: "One Reference\nTwo References\nThree References",
      }),
    });
    expect(response.status).toBe(400);
    expect(ProblemDetails.parse(await response.json())).toMatchObject({
      code: "reference-limit",
      limit: 2,
    });
  } finally {
    await service.stop();
  }
});
