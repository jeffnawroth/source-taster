// SPDX-License-Identifier: AGPL-3.0-or-later
import { useLayoutEffect, useRef } from "react";
/** Keep the working viewport below the actual wrapped sticky layers. */
export function useStickySize(
  property: "--checking-topbar-height" | "--checking-strip-height",
) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () =>
      document.documentElement.style.setProperty(
        property,
        `${element.getBoundingClientRect().height}px`,
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty(property);
    };
  }, [property]);
  return ref;
}
