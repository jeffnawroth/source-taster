// SPDX-License-Identifier: AGPL-3.0-or-later
// The release image set. Dimensions follow docs/design/brand-assets.md and
// docs/research/brand-asset-requirements.md; the file names are the stable
// identifiers the manifest, the claims and the later store forms refer to.
export type Locale = "en" | "de";
export type ImageRole =
  | "store-cws"
  | "store-amo"
  | "promo-small"
  | "promo-marquee"
  | "social"
  | "x-card";
export type Story = "workspace" | "overview" | "evidence";

export interface ImageSpec {
  file: string;
  role: ImageRole;
  width: number;
  height: number;
  /** Absent for the language-neutral promo tiles. */
  locale?: Locale;
  /** The three-story series position for store screenshots. */
  story?: Story;
  /**
   * AMO takes one screenshot set (Extension Workshop). Present only on
   * `store-amo` images: true for the set to upload, false for the set that
   * stays in the repository and is not uploaded to AMO.
   */
  amoUpload?: boolean;
}

const stories: readonly Story[] = ["workspace", "overview", "evidence"];
const locales: readonly Locale[] = ["en", "de"];

/** The language of the one AMO screenshot set (owner decision, 12 November 2026). */
export const amoUploadLocale: Locale = "en";

const store = (
  role: "store-cws" | "store-amo",
  prefix: string,
  width: number,
  height: number,
): ImageSpec[] =>
  locales.flatMap((locale) =>
    stories.map((story, index) => ({
      file: `${prefix}-${locale}-${index + 1}-${story}.png`,
      role,
      width,
      height,
      locale,
      story,
      ...(role === "store-amo"
        ? { amoUpload: locale === amoUploadLocale }
        : {}),
    })),
  );

export const imageSpecs: readonly ImageSpec[] = [
  ...store("store-cws", "cws", 1280, 800),
  ...store("store-amo", "amo", 1280, 960),
  {
    file: "promo-small-440x280.png",
    role: "promo-small",
    width: 440,
    height: 280,
  },
  {
    file: "promo-marquee-1400x560.png",
    role: "promo-marquee",
    width: 1400,
    height: 560,
  },
  ...locales.map((locale) => ({
    file: `social-${locale}-1200x630.png`,
    role: "social" as const,
    width: 1200,
    height: 630,
    locale,
  })),
  // X documents an aspect ratio of 2:1 for the large-image Summary card, so the
  // 1.91:1 Open Graph files above are not reused for it.
  ...locales.map((locale) => ({
    file: `x-${locale}-1200x600.png`,
    role: "x-card" as const,
    width: 1200,
    height: 600,
    locale,
  })),
];
