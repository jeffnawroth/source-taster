// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFile } from "node:fs/promises";
export async function maintenanceNotice(file) {
  if (!file) return { state: "none" };
  const m = JSON.parse(await readFile(file, "utf8"));
  if (
    !["announced", "withdrawn"].includes(m.state) ||
    !Number.isFinite(Date.parse(m.startsAt)) ||
    !Number.isFinite(Date.parse(m.endsAt)) ||
    Date.parse(m.endsAt) <= Date.parse(m.startsAt) ||
    !Number.isFinite(Date.parse(m.announcedAt)) ||
    Date.parse(m.startsAt) - Date.parse(m.announcedAt) < 48 * 3600000
  )
    throw Error("maintenance-invalid");
  new Intl.DateTimeFormat("en", { timeZone: m.timeZone }).format();
  return {
    state: m.state,
    startsAt: m.startsAt,
    endsAt: m.endsAt,
    timeZone: m.timeZone,
    de:
      m.state === "announced"
        ? "Geplante Wartung. Während der Wartung kann der Dienst nicht verfügbar sein."
        : "Die geplante Wartung wurde zurückgezogen.",
    en:
      m.state === "announced"
        ? "Planned maintenance. The service may be unavailable during maintenance."
        : "The planned maintenance has been withdrawn.",
  };
}
