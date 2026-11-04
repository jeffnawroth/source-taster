// SPDX-License-Identifier: AGPL-3.0-or-later
import { EntranceLimitProblem } from "@source-taster/contract-verification";
import { m } from "@source-taster/i18n";
import { getLocale } from "@source-taster/i18n/runtime";
function retry(error: unknown) {
  if (!error || typeof error !== "object" || !("problem" in error)) return null;
  const parsed = EntranceLimitProblem.safeParse(error.problem);
  if (!parsed.success) return null;
  return {
    iso: parsed.data.retryAt,
    text: new Intl.DateTimeFormat(getLocale(), {
      dateStyle: "medium",
      timeStyle: "long",
    }).format(new Date(parsed.data.retryAt)),
  };
}
/** Also used by controls that retain a plain error string rather than JSX. */
export function abuseMessage(error: unknown): string | null {
  const time = retry(error);
  return time
    ? `${m.problem_abuse_limit()} ${m.abuse_continue_at()} ${time.text}.`
    : null;
}
export function ContinuationTime({ error }: { error: unknown }) {
  const time = retry(error);
  return time ? (
    <>
      {" "}
      {m.abuse_continue_at()} <time dateTime={time.iso}>{time.text}</time>.
    </>
  ) : null;
}
