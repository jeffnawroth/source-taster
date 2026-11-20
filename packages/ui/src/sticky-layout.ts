// SPDX-License-Identifier: AGPL-3.0-or-later
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
/** Keep the working viewport below the actual wrapped sticky layers. */
export function useStickySize(
  property:
    | "--checking-topbar-height"
    | "--checking-strip-height"
    | "--detail-header-height",
) {
  const ref = useRef<HTMLDivElement>(null);
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

/** D switches to the compact strip and the full-cover detail below 700 px. */
const NARROW = 700;
export function useNarrow(ref: RefObject<HTMLElement | null>) {
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => setNarrow(element.clientWidth < NARROW);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return narrow;
}
