// SPDX-License-Identifier: AGPL-3.0-or-later
// Account management belongs to the independently implemented private web UI.
import type { accountSessionClient } from "@source-taster/contract-service/client";
import { m } from "@source-taster/i18n";
export type SensitiveActions = ReturnType<
  typeof accountSessionClient
>["sensitive"];
export function AccountManagementLink({
  url,
  language,
}: {
  url: string;
  language: "de" | "en";
}) {
  const destination = new URL(url);
  if (
    !["https:", "http:"].includes(destination.protocol) ||
    destination.username ||
    destination.password
  )
    return null;
  destination.searchParams.set("language", language);
  return (
    <a href={destination.href} target="_blank" rel="noopener noreferrer">
      {m.sensitive_heading()}
    </a>
  );
}
