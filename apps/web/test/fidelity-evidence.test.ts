// SPDX-License-Identifier: AGPL-3.0-or-later
import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  chmodSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { privateCoverage } from "../scripts/design-fidelity/evidence.ts";

await test("failed source extraction invalidates an earlier clean result before browser work", () => {
  const work = mkdtempSync(join(tmpdir(), "fidelity-preflight-test-"));
  const out = join(work, "evidence");
  mkdirSync(out);
  const git = join(work, "git");
  writeFileSync(git, "#!/bin/sh\nexit 42\n");
  chmodSync(git, 0o700);
  const script = fileURLToPath(
    new URL("../scripts/design-fidelity.ts", import.meta.url),
  );
  try {
    const old = JSON.stringify({
      complete: true,
      passed: true,
      results: [{ id: "stale", passed: true }],
    });
    for (const list of [true, false]) {
      writeFileSync(join(out, "results.json"), old);
      writeFileSync(join(out, "index.html"), "Earlier clean result");
      const result = spawnSync(
        process.execPath,
        [script, "--out", out, ...(list ? ["--list"] : [])],
        {
          env: { ...process.env, PATH: `${work}:${process.env.PATH}` },
          encoding: "utf8",
        },
      );
      assert.notEqual(result.status, 0);
      const evidence = JSON.parse(
        readFileSync(join(out, "results.json"), "utf8"),
      ) as { complete: boolean; passed?: boolean; results: unknown[] };
      assert.equal(evidence.complete, list);
      if (!list) {
        assert.equal(evidence.passed, false);
        assert.deepEqual(evidence.results, []);
        assert.match(
          readFileSync(join(out, "index.html"), "utf8"),
          /Run incomplete/,
        );
      }
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});
await test("private success requires a full unique matrix and every individual result", () => {
  const clean = {
    passed: true,
    coverage: { complete: true, total: 2, selected: 2, completed: 2 },
    results: [
      { id: "a", passed: true },
      { id: "b", passed: true },
    ],
  };
  assert.equal(privateCoverage(clean).passed, true);
  for (const bad of [
    { ...clean, coverage: { ...clean.coverage, complete: false } },
    { ...clean, results: clean.results.slice(1) },
    { ...clean, results: [clean.results[0]!, clean.results[0]!] },
    { ...clean, results: [{ id: "a", passed: false }, clean.results[1]!] },
  ])
    assert.equal(privateCoverage(bad).passed, false);
});
