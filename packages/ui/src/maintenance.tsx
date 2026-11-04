// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useState } from "react";
import { m } from "@source-taster/i18n";
interface Notice {
  state: "announced" | "withdrawn";
  startsAt: string;
  endsAt: string;
  timeZone: string;
}
export function MaintenanceNotice({
  baseUrl = "",
  language,
}: {
  baseUrl?: string;
  language: "de" | "en";
}) {
  const [notice, setNotice] = useState<Notice | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => {
      try {
        const r = await fetch(
          baseUrl.replace(/\/$/, "") + "/health/maintenance",
          { credentials: "omit", cache: "no-store", signal: controller.signal },
        );
        if (!r.ok) return;
        const value: unknown = await r.json();
        if (
          typeof value === "object" &&
          value !== null &&
          "state" in value &&
          ["announced", "withdrawn"].includes(String(value.state)) &&
          "startsAt" in value &&
          "endsAt" in value &&
          "timeZone" in value &&
          typeof value.startsAt === "string" &&
          typeof value.endsAt === "string" &&
          typeof value.timeZone === "string" &&
          Number.isFinite(Date.parse(value.startsAt)) &&
          Number.isFinite(Date.parse(value.endsAt))
        ) {
          new Intl.DateTimeFormat(language, {
            timeZone: value.timeZone,
          }).format();
          setNotice({
            state: value.state as Notice["state"],
            startsAt: value.startsAt,
            endsAt: value.endsAt,
            timeZone: value.timeZone,
          });
        } else setNotice(null);
      } catch {
        /* Existing service errors handle offline operation; retain the last valid notice. */
      }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 60000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [baseUrl, language]);
  if (!notice) return null;
  const format = new Intl.DateTimeFormat(language, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: notice.timeZone,
  });
  return (
    <aside role="status" aria-live="polite">
      <p>
        {notice.state === "withdrawn"
          ? m.maintenance_withdrawn({}, { locale: language })
          : m.maintenance_announcement(
              {
                start: format.format(new Date(notice.startsAt)),
                end: format.format(new Date(notice.endsAt)),
                zone: notice.timeZone,
              },
              { locale: language },
            )}
      </p>
    </aside>
  );
}
