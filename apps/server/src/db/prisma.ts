// SPDX-License-Identifier: AGPL-3.0-or-later
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PRISMA_SCHEMA } from "./schemas.ts";

export type Db = PrismaClient;

export function createPrisma(databaseUrl: string): Db {
  return new PrismaClient({
    adapter: new PrismaPg(
      { connectionString: databaseUrl },
      { schema: PRISMA_SCHEMA },
    ),
  });
}
