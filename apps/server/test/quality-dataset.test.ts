// SPDX-License-Identifier: AGPL-3.0-or-later
// #94 private dataset location. Synthetic sets are generated into a temporary
// directory by the test; no dataset content is committed.
import { chmod, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, expect, it } from "vitest";
import { loadDataset } from "../scripts/quality/dataset.ts";

let root: string;
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "st-94-dataset-"));
});
afterEach(async () => {
  await chmod(join(root, "reference-test-set"), 0o755).catch(() => {});
  await rm(root, { recursive: true, force: true });
});
async function writeSet(
  directory: string,
  manifest: object,
  records: unknown[] = [
    {
      id: "synthetic-1",
      input: "Alpha, A. (2021). Synthetic witness. Journal of Tests, 1, 1–2.",
      style: "apa",
      language: "en",
      sourceType: "article",
      class: "real-correct",
      acceptedIdentifiers: [{ type: "doi", value: "10.5555/synthetic-1" }],
      provenance: { reviewedBy: "synthetic", reviewedAt: "2026-10-31" },
    },
  ],
) {
  await mkdir(join(root, directory), { recursive: true });
  await writeFile(join(root, directory, "manifest.json"), JSON.stringify(manifest));
  await writeFile(join(root, directory, "records.json"), JSON.stringify(records));
  await writeFile(
    join(root, directory, "fixtures.json"),
    JSON.stringify({ recordedAt: "2026-10-31", entries: [] }),
  );
}

it("loads a set from the private location with its version and fixture state", async () => {
  await writeSet("development-set", { kind: "development-set", version: "dev-1" });
  const set = await loadDataset(root, "development-set");
  expect(set.version).toBe("dev-1");
  expect(set.records.map((r) => r.id)).toEqual(["synthetic-1"]);
  expect(set.fixtureState).toMatch(/^sha256:[0-9a-f]{64}$/);
});

it("refuses a location inside this repository, also through a symlink", async () => {
  const inside = fileURLToPath(new URL("./fixtures", import.meta.url));
  await expect(loadDataset(inside, "development-set")).rejects.toThrow(
    /outside the open-core repository/,
  );
  const link = join(root, "linked");
  await symlink(inside, link);
  await expect(loadDataset(link, "development-set")).rejects.toThrow(
    /outside the open-core repository/,
  );
});

it("refuses a set whose manifest declares the other kind before reading its records", async () => {
  await writeSet(
    "development-set",
    { kind: "reference-test-set", version: "rts-1" },
    // Unparseable records prove they are never read.
    "not json" as unknown as unknown[],
  );
  await writeFile(join(root, "development-set", "records.json"), "not json");
  await expect(loadDataset(root, "development-set")).rejects.toThrow(
    /declares reference-test-set, expected development-set/,
  );
  await writeSet("reference-test-set", { kind: "development-set", version: "d" });
  await expect(loadDataset(root, "reference-test-set")).rejects.toThrow(
    /declares development-set, expected reference-test-set/,
  );
});

it("loads the Development set while the Reference test set is unreadable", async () => {
  await writeSet("development-set", { kind: "development-set", version: "dev-1" });
  await writeSet("reference-test-set", { kind: "reference-test-set", version: "r" });
  await chmod(join(root, "reference-test-set"), 0o000);
  await expect(loadDataset(root, "development-set")).resolves.toMatchObject({
    kind: "development-set",
  });
});

it("rejects a record without a known class", async () => {
  await writeSet("development-set", { kind: "development-set", version: "dev-1" }, [
    { id: "x", input: "x", style: "apa", language: "en", sourceType: "article", class: "guess" },
  ]);
  await expect(loadDataset(root, "development-set")).rejects.toThrow(
    /records\.json is invalid/,
  );
});
