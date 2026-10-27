// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Only migrations need the URL; `prisma generate` runs without a database.
  datasource: { url: process.env.DATABASE_URL },
});
