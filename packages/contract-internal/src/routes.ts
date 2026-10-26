// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import {
  MailRehearsalRequest,
  MailRehearsalResponse,
  MailRehearsalParams,
  ProblemDetails,
} from "./index.ts";
const problem = {
  description:
    "Problem Details; the local diagnostic is unavailable by default",
  content: { "application/problem+json": { schema: ProblemDetails } },
};
export const createMailRehearsal = createRoute({
  method: "post",
  path: "/internal/mail-rehearsals",
  summary: "Local SMTP rehearsal; fixed sink only, never an Account sign-in",
  request: {
    headers: z.object({ "idempotency-key": z.string().min(1).max(128) }),
    body: {
      required: true,
      content: { "application/json": { schema: MailRehearsalRequest } },
    },
  },
  responses: {
    201: {
      description: "Durable local rehearsal receipt",
      content: { "application/json": { schema: MailRehearsalResponse } },
    },
    400: problem,
    404: problem,
    409: problem,
  },
});
export const getMailRehearsal = createRoute({
  method: "get",
  path: "/internal/mail-rehearsals/{id}",
  summary: "Read local rehearsal delivery status",
  request: { params: MailRehearsalParams },
  responses: {
    200: {
      description: "Local rehearsal status",
      content: { "application/json": { schema: MailRehearsalResponse } },
    },
    400: problem,
    404: problem,
  },
});
export const routes = [createMailRehearsal, getMailRehearsal];
