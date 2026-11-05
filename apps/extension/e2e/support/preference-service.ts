// SPDX-License-Identifier: AGPL-3.0-or-later
// The private session service for the Preferences-sync consent specs, replaced
// at its HTTP edge. It records every request so a spec can assert what was and
// was not sent.
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import { once } from "node:events";
import type { AddressInfo } from "node:net";

export const credential = "extension-session-" + "s".repeat(43);
export const account = {
  accountId: "11111111-1111-4111-8111-111111111111",
  ownerId: "22222222-2222-4222-8222-222222222222",
  email: "reader@example.org",
};

export interface Recorded {
  method: string;
  path: string;
  body: unknown;
}

/** The private session service, replaced at its HTTP edge. */
export async function startService() {
  const requests: Recorded[] = [];
  let stored = { language: "en", citationStyle: "chicago" };
  const server: Server = createServer((req, res) => {
    void respond(req, res);
  });
  const respond = async (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader("access-control-allow-origin", req.headers.origin ?? "*");
    res.setHeader(
      "access-control-allow-headers",
      "authorization, content-type, x-source-taster-client",
    );
    res.setHeader("access-control-allow-methods", "GET, POST, PATCH, OPTIONS");
    res.setHeader("cache-control", "no-store");
    if (req.method === "OPTIONS") return void res.writeHead(204).end();
    let raw = "";
    for await (const chunk of req) raw += String(chunk);
    const body: unknown = raw ? JSON.parse(raw) : null;
    requests.push({ method: req.method!, path: req.url!, body });
    res.setHeader("content-type", "application/json");
    const ok = (data: unknown) =>
      res.end(JSON.stringify({ data, quota: { status: "not-implemented" } }));
    if (req.url === "/v1/extension/session") return ok(account);
    if (req.url === "/v1/extension/sign-in/challenges")
      return ok({
        challengeId: "33333333-3333-4333-8333-333333333333",
        expiresIn: 300,
        resendAfter: 60,
        transactionCredential: "transaction-" + "t".repeat(43),
      });
    if (req.url === "/v1/extension/sign-in/confirm") {
      const sent = (body as { preferences?: typeof stored }).preferences;
      if (sent) stored = sent;
      return ok({ session: account, sessionCredential: credential });
    }
    if (req.url === "/v1/extension/preferences") {
      if (req.method === "PATCH")
        stored = { ...stored, ...(body as Partial<typeof stored>) };
      return ok(stored);
    }
    res.statusCode = 404;
    res.end("{}");
  };
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    requests,
    preferenceRequests: () =>
      requests.filter((r) => r.path === "/v1/extension/preferences"),
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}
