// SPDX-License-Identifier: AGPL-3.0-or-later
// Content stays in the client preview until normal Check persistence. A receipt
// authenticates that preview without a service-side manuscript cache.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { StructuringResult, Span } from "@source-taster/core";
import type { Principal } from "../entitlements.ts";
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}
export function previewReceipts(
  clock: { now(): number },
  configuration = () => "standalone",
) {
  const key = randomBytes(32);
  function signature(
    principal: Principal,
    text: string,
    regions: Span[] | undefined,
    result: StructuringResult,
    expiresAt: number,
  ) {
    const { receipt: _, ...data } = result;
    return createHmac("sha256", key)
      .update(
        canonical({
          measuredConfiguration: configuration(),
          ownerId: principal.ownerId,
          actorId: principal.actorId,
          text,
          regions,
          data,
          expiresAt,
        }),
      )
      .digest("hex");
  }
  return {
    sign(
      principal: Principal,
      text: string,
      regions: Span[] | undefined,
      result: StructuringResult,
    ) {
      const expiresAt = clock.now() + 300_000;
      return {
        ...result,
        receipt: {
          expiresAt,
          signature: signature(principal, text, regions, result, expiresAt),
        },
      };
    },
    verify(
      principal: Principal,
      text: string,
      regions: Span[] | undefined,
      result: StructuringResult,
    ) {
      const receipt = result.receipt;
      if (
        !receipt ||
        receipt.expiresAt <= clock.now() ||
        receipt.expiresAt > clock.now() + 300_000 ||
        !/^[a-f0-9]{64}$/u.test(receipt.signature)
      )
        return false;
      return timingSafeEqual(
        Buffer.from(receipt.signature, "hex"),
        Buffer.from(
          signature(principal, text, regions, result, receipt.expiresAt),
          "hex",
        ),
      );
    },
  };
}
