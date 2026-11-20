// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

/** Show the actual end of the same content, without resizing, masking or restyling it. */
export async function scrollAppEnd(
  page: Page,
  prototype: boolean,
  kind: "feed" | "detail",
) {
  return page.evaluate(
    ({ prototype, kind }) => {
      const target = prototype
        ? document.querySelector<HTMLElement>(`.v-D [data-scroll="${kind}"]`)
        : kind === "detail"
          ? document.querySelector<HTMLElement>(".check-detail")
          : (document.scrollingElement as HTMLElement | null);
      if (!target) throw new Error(`Missing ${kind} scroll container`);
      target.scrollTop = target.scrollHeight - target.clientHeight;
      return {
        field: `viewport.${kind}-end`,
        reason:
          "Explicit scrolled state covers content beyond the first viewport; native size and original CSS are retained",
        scrollTop: target.scrollTop,
        scrollHeight: target.scrollHeight,
        clientHeight: target.clientHeight,
      };
    },
    { prototype, kind },
  );
}
