// SPDX-License-Identifier: AGPL-3.0-or-later
// Data exchanged by the owned build, delivery and qualification CLIs.
export interface BuildReceipt {
  target: string;
  recipeSha256: string;
  files: Record<string, string>;
}
export interface SourcePackage {
  name: string;
  version: string;
  license: string;
  source: string | null;
  checksum?: string;
  manifestPath: string;
}
export interface BuildGraph {
  packages: SourcePackage[];
  target: string;
  features: string[];
  featureTreeSha256: string;
}
export interface NativeLoad {
  kind: "native" | "process";
  pid: number;
  requested: string;
  path?: string;
  controlled: boolean;
  loaded?: boolean;
  sha256?: string;
}
export interface DistributionManifest {
  recipeSha256: string;
  objects: Record<string, string>;
  source: { path: string; sha256: string };
}
export interface WebsiteArtifact {
  files: Record<string, string>;
  controlledBuild?: {
    receiptSha256: string;
    nativeTraceSha256: string;
    indexer: { sha256: string; languages: string[]; features: string[] };
  };
}
export interface SourceProvenance {
  sources: { folder: string; file: string; sha256: string }[];
}
