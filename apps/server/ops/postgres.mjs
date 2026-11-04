// SPDX-License-Identifier: AGPL-3.0-or-later
// libpq defaults are individual fields: never put credentials in argv.
export function postgresEnvironment(value) {
  const u = new URL(value);
  if (
    !["postgres:", "postgresql:"].includes(u.protocol) ||
    !u.username ||
    !u.password ||
    !u.pathname.slice(1)
  )
    throw Error("database-config");
  return {
    PATH: process.env.PATH,
    PGDATABASE: decodeURIComponent(u.pathname.slice(1)),
    PGUSER: decodeURIComponent(u.username),
    PGPASSWORD: decodeURIComponent(u.password),
    PGHOST: u.hostname,
    PGPORT: u.port || "5432",
    PGCONNECT_TIMEOUT: "10",
    PGSSLMODE: u.searchParams.get("sslmode") ?? process.env.PGSSLMODE,
    PGSSLROOTCERT: process.env.PGSSLROOTCERT,
  };
}
