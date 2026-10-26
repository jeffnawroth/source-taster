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
      },
      {
        slot: 2,
        originalText:
          "Roe, R. (2021). Another study. Proceedings of Testing, 5-6.",
        outcome: { kind: "status", status: "running" },
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
