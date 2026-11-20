// SPDX-License-Identifier: AGPL-3.0-or-later
/** Accepted public source artifacts. Private sources remain in their own checkout. */
export const pins = {
  structure: {
    commit: "f6db1f512255bd404428212ade37abf5ea26f4a3",
    path: "apps/web/prototype/structure/prototype-194.html",
  },
  report: {
    commit: "267624a0de0b7e4b7e877aaf87990d53b0fb4f53",
    path: "apps/server/prototype/report/output/pdf/report-C-en.pdf",
  },
  website: {
    commit: "b6dfa14909b7ec8ed4f8a7057d4bc0ea94f14022",
    path: "apps/website/prototype/website/prototype-198.html",
  },
} as const;
