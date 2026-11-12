// SPDX-License-Identifier: AGPL-3.0-or-later
// The chosen #199 export set. `basis` separates platform mandates from chosen
// compatibility files and optional candidates (docs/research/brand-asset-requirements.md).

export type Group = "website" | "extension" | "toolbar" | "store";
export type Basis = "mandatory" | "chosen" | "optional";
export interface ExportJob {
  file: string;
  group: Group;
  basis: Basis;
  /** Square pixel size of a raster export. */
  size?: number;
  /** The SVG master in masters/ that this file is rendered or copied from. */
  master?: string;
  /** ICO only: the PNG favicon sizes it contains. */
  entries?: number[];
}

/** 16–32 px use the optical cut; 48 px and above the full artwork. */
const tile = (size: number) => (size <= 32 ? "mark-optical.svg" : "mark.svg");
const rasters = (
  prefix: string,
  sizes: number[],
  group: Group,
  basis: Basis,
  master: (size: number) => string,
): ExportJob[] =>
  sizes.map((size) => ({
    file: `${prefix}-${size}.png`,
    group,
    basis,
    size,
    master: master(size),
  }));
const toolbar = [16, 24, 32, 48, 64];

export const exportJobs: readonly ExportJob[] = [
  // Website: SVG plus 16/32/48/96 PNG and a 16/32/48 ICO are compatibility
  // choices; HTML mandates no fixed favicon set.
  {
    file: "favicon.svg",
    group: "website",
    basis: "chosen",
    master: "mark-optical.svg",
  },
  {
    file: "favicon.ico",
    group: "website",
    basis: "chosen",
    entries: [16, 32, 48],
  },
  ...rasters("favicon", [16, 32, 48, 96], "website", "chosen", tile),
  {
    file: "apple-touch-icon.png",
    group: "website",
    basis: "chosen",
    size: 180,
    master: "apple-touch-icon.svg",
  },
  // Optional manifest candidates; they select no PWA behaviour.
  ...rasters("web-app-any", [192, 512], "website", "optional", tile),
  ...rasters(
    "web-app-maskable",
    [192, 512],
    "website",
    "optional",
    () => "maskable.svg",
  ),
  {
    file: "safari-pinned-tab.svg",
    group: "website",
    basis: "optional",
    master: "safari-pinned-tab.svg",
  },
  // Browser package icons; the 128 PNG is the Chrome Web Store package icon.
  ...rasters(
    "extension",
    [16, 24, 32, 48, 64, 96],
    "extension",
    "chosen",
    tile,
  ),
  {
    file: "extension-128.png",
    group: "extension",
    basis: "mandatory",
    size: 128,
    master: "mark-cws-128.svg",
  },
  // Toolbar cuts, separate from the store's 128 padding.
  ...rasters("toolbar-default", toolbar, "toolbar", "chosen", tile),
  ...rasters("toolbar-on-light", toolbar, "toolbar", "chosen", (size) =>
    size <= 32 ? "mark-mono-optical-on-light.svg" : "mark-mono-on-light.svg",
  ),
  ...rasters("toolbar-on-dark", toolbar, "toolbar", "chosen", (size) =>
    size <= 32 ? "mark-mono-optical-on-dark.svg" : "mark-mono-on-dark.svg",
  ),
  // Store listing uploads; never packaged.
  {
    file: "store-cws-128.png",
    group: "store",
    basis: "mandatory",
    size: 128,
    master: "mark-cws-128.svg",
  },
  {
    file: "store-amo-128.png",
    group: "store",
    basis: "chosen",
    size: 128,
    master: "mark-amo-128.svg",
  },
  {
    file: "store-edge-300.png",
    group: "store",
    basis: "optional",
    size: 300,
    master: "mark-edge-300.svg",
  },
];
