// SPDX-License-Identifier: AGPL-3.0-or-later
// The message catalogues and RFC 9457 problem bodies that tests share. A test
// asserts the catalogue text of one key exactly, so a UI that fell back to the
// generic technical error (`problem_internal`) cannot pass for the wrong reason.
import { readFileSync } from "node:fs";
import type { Route } from "@playwright/test";

export type Language = "en" | "de";

const catalogues = Object.fromEntries(
  (["en", "de"] as const).map((language) => [
    language,
    JSON.parse(
      readFileSync(
        new URL(
          `../../../../packages/i18n/messages/${language}.json`,
          import.meta.url,
        ),
        "utf8",
      ),
    ) as Record<string, string>,
  ]),
) as Record<Language, Record<string, string>>;

/** The catalogue text of a key, with `{name}` placeholders filled in. */
export function message(
  language: Language,
  key: string,
  values: Record<string, string | number> = {},
) {
  const text = catalogues[language][key];
  if (text === undefined) throw new Error(`Unknown message key ${key}`);
  return text.replace(/\{(\w+)\}/gu, (_, name: string) => {
    const value = values[name];
    if (value === undefined) throw new Error(`Missing value for ${name}`);
    return String(value);
  });
}

/** A problem as the server sends it: code, status and catalogue key. */
export interface Problem {
  code: string;
  status: number;
  i18nKey: string;
}

/** Answers a request with this problem as `application/problem+json`. */
export function fulfillProblem(
  route: Route,
  problem: Problem,
  extra: Record<string, unknown> = {},
) {
  return route.fulfill({
    status: problem.status,
    contentType: "application/problem+json",
    body: JSON.stringify({
      type: `urn:source-taster:problem:${problem.code}`,
      title: problem.code,
      status: problem.status,
      code: problem.code,
      i18nKey: problem.i18nKey,
      ...extra,
    }),
  });
}
