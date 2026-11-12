// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  devPreviewNotice,
  imageAlt,
  imageClaims,
  type DevPreviewNotice,
} from "./copy.ts";
import { fixtureSha256 } from "./fixtures.ts";
import type { GateResult } from "./gate.ts";
import {
  imageSpecs,
  type ImageRole,
  type Locale,
  type Story,
} from "./specs.ts";

export interface CaptureRecord {
  /** Raw capture file, relative to the output directory. */
  file: string;
  sha256: string;
  language: Locale;
  story: Story;
  /** Whether the product's development-preview notice is inside the captured viewport. */
  devPreviewNoticeInViewport: boolean;
  /** The Verdict labels the capture read from the rendered list, in input order. */
  verdictsRead: string[];
}

export interface ManifestImage {
  file: string;
  role: ImageRole;
  width: number;
  height: number;
  format: "png";
  sha256: string;
  /**
   * `store-amo` images only. AMO takes one screenshot set: true for the set to
   * upload (English), false for the set that is not uploaded to AMO.
   */
  amoUpload?: boolean;
  /** Claim ids pictured or written in this image (see claims.ts). */
  claims: string[];
  /** Accessible description per language. */
  alt: Record<Locale, string>;
  /** The product's development-preview notice on this image, or why it cannot carry one. */
  devPreviewNotice: DevPreviewNotice;
  sources: {
    /** Raw captures this image is composed from. */
    captures: string[];
    /** The composition that produced it. */
    compose: string;
  };
}

export interface Manifest {
  /** `dry-run` output is never committed; `final` passed the capture gate. */
  status: "dry-run" | "final";
  /** Always false: the pictured behaviour is implemented, not release-qualified. */
  releaseQualified: boolean;
  fixtureSha256: string;
  /** Source commit the capture ran from. */
  commit: string;
  gate: GateResult;
  captures: CaptureRecord[];
  images: ManifestImage[];
}

export function buildManifest(input: {
  status: Manifest["status"];
  commit: string;
  gate: GateResult;
  captures: CaptureRecord[];
  /** SHA-256 of a produced image file, by name. */
  sha256: (file: string) => string;
}): Manifest {
  return {
    status: input.status,
    releaseQualified: false,
    fixtureSha256,
    commit: input.commit,
    gate: input.gate,
    captures: input.captures,
    images: imageSpecs.map((spec) => ({
      file: spec.file,
      role: spec.role,
      width: spec.width,
      height: spec.height,
      format: "png",
      sha256: input.sha256(spec.file),
      ...(spec.amoUpload === undefined ? {} : { amoUpload: spec.amoUpload }),
      claims: imageClaims(spec),
      alt: { ...imageAlt(spec) },
      devPreviewNotice: devPreviewNotice(spec),
      sources: {
        captures:
          spec.story && spec.locale
            ? [`captures/${spec.locale}-${spec.story}.png`]
            : [],
        compose: "scripts/compose.ts",
      },
    })),
  };
}
