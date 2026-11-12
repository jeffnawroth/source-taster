// SPDX-License-Identifier: AGPL-3.0-or-later
// Adapted from Adobe's RAC Tailwind starter; see ../../NOTICE.md.
import { composeRenderProps } from "react-aria-components";
import { twMerge } from "tailwind-merge";
export function styles<T>(
  className: string | ((state: T) => string) | undefined,
  base: string,
) {
  return composeRenderProps(className, (value) => twMerge(base, value));
}
export { twMerge as cx } from "tailwind-merge";

export function describedBy(...ids: (string | undefined | false)[]) {
  return ids.filter(Boolean).join(" ") || undefined;
}
