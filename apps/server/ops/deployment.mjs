// SPDX-License-Identifier: AGPL-3.0-or-later
// Local preflight, no deployment side effects. CI remains the authority for builds.
import { readFile } from "node:fs/promises";
import { createHash, verify } from "node:crypto";
import { spawnSync } from "node:child_process";
const required = [
  "ci",
  "security",
  "licenses",
  "source-publication",
  "quality",
  "calibration",
  "load-replay",
  "live-load",
  "sources",
  "providers",
  "isolation",
  "browser",
  "legal-tax",
  "selected-dependencies",
  "hosting",
  "recovery",
  "active-configuration",
];
try {
  const bytes = await readFile(process.env.OPS_DEPLOY_CONFIG),
    c = JSON.parse(bytes);
  const sha = createHash("sha256").update(bytes).digest("hex");
  const head = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
  if (
    head.status !== 0 ||
    !/^[a-f0-9]{40}$/.test(c.commit) ||
    c.commit !== head.stdout.trim() ||
    c.commit !== process.env.OPS_COMMIT ||
    sha !== process.env.OPS_CONFIG_SHA256 ||
    c.program !== "verification" ||
    c.region !== "osc-fr1" ||
    !/^[a-f0-9-]{36}$/.test(c.appId) ||
    c.runtime !== "node24-pg18" ||
    c.mode !== "hosted" ||
    c.extraction?.enforcement !== "os-enforced" ||
    !/^sha256:[a-f0-9]{64}$/.test(c.extraction?.image) ||
    !/^sha256:[a-f0-9]{64}$/.test(c.measuredConfiguration) ||
    !/^sha256:[a-f0-9]{64}$/.test(c.configurationDigest) ||
    !/^sha256:[a-f0-9]{64}$/.test(c.measuredConfigurationEvidence) ||
    !/^[a-f0-9]{64}$/.test(c.registrySha256) ||
    !/^[a-f0-9]{64}$/.test(c.providerRegisterSha256)
  )
    throw Error("deployment-configuration");
  // Approval packet is signed outside the repository by the Operator/deputy.
  // It does not replace recomputation of release/quality/load/CI checks.
  const packetBytes = await readFile(process.env.OPS_APPROVAL_PACKET),
    packet = JSON.parse(packetBytes);
  if (
    !verify(
      null,
      packetBytes,
      await readFile(process.env.OPS_APPROVAL_PUBLIC_KEY),
      Buffer.from(
        await readFile(process.env.OPS_APPROVAL_SIGNATURE, "utf8"),
        "base64",
      ),
    ) ||
    packet.commit !== c.commit ||
    packet.configSha256 !== sha ||
    Date.parse(packet.expiresAt) <= Date.now() ||
    Date.parse(packet.issuedAt) > Date.now() ||
    Date.now() - Date.parse(packet.issuedAt) > 86400000 ||
    !Number.isFinite(Date.parse(packet.issuedAt)) ||
    !Number.isFinite(Date.parse(packet.expiresAt)) ||
    !required.every(
      (name) =>
        packet.gates?.[name]?.status === "passed" &&
        /^[a-f0-9]{64}$/.test(packet.gates[name].evidenceSha256),
    )
  )
    throw Error("deployment-evidence");
  if (
    !process.env.SOURCE_TASTER_MEASURED_CONFIGURATIONS ||
    !process.env.SOURCE_TASTER_QUALITY_CONFIGURATION ||
    !process.env.SOURCE_TASTER_QUALITY_ROOT ||
    !process.env.SOURCE_TASTER_LOAD_REPORT
  )
    throw Error("measured-configuration");
  // Existing release guard recomputes the frozen quality/calibration/load report.
  const release = spawnSync(
    process.execPath,
    ["apps/server/scripts/release-check.ts"],
    { stdio: "ignore", env: process.env },
  );
  if (release.status !== 0) throw Error("release-not-qualified");
  const registryBytes = await readFile(
    process.env.SOURCE_TASTER_MEASURED_CONFIGURATIONS,
  );
  if (
    createHash("sha256").update(registryBytes).digest("hex") !==
    c.registrySha256
  )
    throw Error("registry-binding");
  const { readConfigurationFile } =
    await import("../src/quality/configuration.ts");
  if (
    (
      await readConfigurationFile(
        process.env.SOURCE_TASTER_QUALITY_CONFIGURATION,
      )
    ).digest !== c.configurationDigest
  )
    throw Error("configuration-binding");
  const { measuredConfigurations } =
    await import("../src/quality/activation.ts");
  const selected = await measuredConfigurations().resolve(
    c.measuredConfiguration,
    c.measuredConfigurationEvidence,
  );
  if (
    !selected.summary.eligible ||
    selected.summary.codeVersion !== c.commit ||
    selected.summary.configurationDigest !== c.configurationDigest
  )
    throw Error("selected-configuration-not-qualified");
  console.log(
    JSON.stringify({
      version: 1,
      program: "verification",
      commit: c.commit,
      configSha256: sha,
      region: c.region,
      appId: c.appId,
      configuration: c.measuredConfiguration,
      measuredConfiguration: c.measuredConfiguration,
      registrySha256: c.registrySha256,
      releaseCheckExitCode: release.status,
      issuedAt: packet.issuedAt,
      expiresAt: packet.expiresAt,
      gates: packet.gates,
      activationEvidenceSha256:
        packet.gates["active-configuration"].evidenceSha256,
      configurationDigest: c.configurationDigest,
      evidenceDigest: c.measuredConfigurationEvidence,
      complete: true,
    }),
  );
} catch {
  console.error(JSON.stringify({ code: "deployment-refused" }));
  process.exitCode = 78;
}
