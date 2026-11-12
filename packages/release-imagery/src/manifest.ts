// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ImageRole, Locale } from "./specs.ts";

export interface ManifestImage {
  file: string;
  role: ImageRole;
  width: number;
  height: number;
  format: "png";
  sha256: string;
  /** Claim ids pictured or written in this image (see claims.ts). */
  claims: string[];
  /** Accessible description per language. */
  alt: Record<Locale, string>;
  sources: {
    /** Raw capture files this image is composed from, by manifest name. */
    captures: string[];
    /** The composition template that produced it. */
    compose: string;
  };
}

export interface Manifest {
  /** `dry-run` output is never committed; `final` passed the capture gate. */
  status: "dry-run" | "final";
  fixtureSha256: string;
  /** Git commit the capture ran from. */
  commit: string;
  images: ManifestImage[];
}
