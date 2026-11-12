// SPDX-License-Identifier: AGPL-3.0-or-later
// The pipeline's own controlled composition: the real verification service and
// worker, answering the invented capture References from a loopback HTTP edge.
// It reuses the shared fixture server but registers only its own routes; it
// never edits the shared preview fixtures and never calls a live provider.
import { startDoiFixtures } from "../../../apps/server/test/support/doi-fixtures.ts";
import { startTestService } from "../../../apps/server/test/support/service.ts";
import { captureReferences } from "../src/fixtures.ts";

export async function startCaptureService(port: number) {
  const fixtures = await startDoiFixtures();
  for (const reference of captureReferences) {
    fixtures.respond(
      `/api/handles/${reference.doi}`,
      reference.work ? 200 : 404,
      reference.work
        ? { responseCode: 1, handle: reference.doi }
        : { responseCode: 100, handle: reference.doi },
    );
    fixtures.respond(
      `/works/${reference.doi}`,
      reference.work ? 200 : 404,
      reference.work ? { message: reference.work } : {},
    );
  }
  const service = await startTestService(port, 50, fixtures.env);
  return {
    apiUrl: service.apiUrl,
    requests: fixtures.requests,
    stop: async () => {
      await service.stop();
      await fixtures.stop();
    },
  };
}
