// SPDX-License-Identifier: AGPL-3.0-or-later
// Browser probes shared by the Q08 (#256) WCAG 2.2 AA passes. They measure what
// axe cannot judge. They are evidence inputs, not a conformance claim.
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const wcagTags = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
];

export interface Stop {
  tag: string;
  role: string | null;
  name: string;
  focusVisible: boolean;
  indicator: boolean;
  obscured: "none" | "partly" | "entirely";
  width: number;
  height: number;
  x: number;
  y: number;
  absX: number;
  absY: number;
  /** A link inside running text: exempt from 2.5.8 as an inline target. */
  inline: boolean;
  /** Pixels differ between the focused and the blurred element and its margin. */
  visibleChange: boolean | null;
}

/** Walks the Tab order from the top and measures every stop until it repeats. */
export async function tabPass(
  page: Page,
  limit = 150,
  pixels = true,
  captureTo?: string,
) {
  const stops: Stop[] = [];
  const seen = new Set<string>();
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  for (let index = 0; index < limit; index++) {
    await page.keyboard.press("Tab");
    // A smooth scroll that brings the focused element into view is still running
    // right after the key press; measure once the element's position holds still.
    await page.evaluate(
      () =>
        new Promise<void>((done) => {
          let last = Number.NaN;
          let still = 0;
          const started = performance.now();
          const frame = () => {
            const top = document.activeElement?.getBoundingClientRect().top;
            still = top === last ? still + 1 : 0;
            last = top ?? Number.NaN;
            if (still >= 4 || performance.now() - started > 1500) done();
            else requestAnimationFrame(frame);
          };
          requestAnimationFrame(frame);
        }),
    );
    const stop = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null;
      if (!element || element === document.body) return null;
      // A native checkbox or radio is operated through its associated label, so
      // the label's box is the target.
      const labelBox =
        element instanceof HTMLInputElement &&
        (element.type === "checkbox" || element.type === "radio")
          ? element.closest("label")
          : null;
      const rect = (labelBox ?? element).getBoundingClientRect();
      const scrollOffset = { x: 0, y: 0 };
      for (
        let ancestor: HTMLElement | null = element.parentElement;
        ancestor;
        ancestor = ancestor.parentElement
      ) {
        scrollOffset.x += ancestor.scrollLeft;
        scrollOffset.y += ancestor.scrollTop;
      }
      const style = getComputedStyle(element);
      const labelledby = element.getAttribute("aria-labelledby");
      const label =
        element.getAttribute("aria-label") ??
        (labelledby
          ? (document.getElementById(labelledby.split(" ")[0]!)?.textContent ??
            "")
          : "");
      const text = (
        label ||
        element.innerText ||
        element.getAttribute("title") ||
        element.getAttribute("placeholder") ||
        ""
      )
        .trim()
        .replace(/\s+/gu, " ")
        .slice(0, 60);
      const points: [number, number][] = [
        [rect.left + rect.width / 2, rect.top + rect.height / 2],
        [rect.left + 2, rect.top + 2],
        [rect.right - 2, rect.top + 2],
        [rect.left + 2, rect.bottom - 2],
        [rect.right - 2, rect.bottom - 2],
      ];
      const hits = points
        .filter(
          ([x, y]) =>
            x >= 0 && y >= 0 && x < innerWidth && y < innerHeight && rect.width,
        )
        .map(([x, y]) => {
          const top = document.elementFromPoint(x, y);
          return !!top && (element.contains(top) || top.contains(element));
        });
      const inViewport =
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top < innerHeight &&
        rect.left < innerWidth;
      const obscured: "none" | "partly" | "entirely" =
        !inViewport || hits.length === 0
          ? "none"
          : hits.every((hit) => !hit)
            ? "entirely"
            : hits.some((hit) => !hit)
              ? "partly"
              : "none";
      return {
        tag: element.tagName.toLowerCase(),
        role: element.getAttribute("role"),
        name: text,
        key: `${element.tagName}|${text}|${Math.round(rect.top + scrollY)}|${Math.round(rect.left)}`,
        focusVisible: element.matches(":focus-visible"),
        indicator:
          (style.outlineStyle !== "none" &&
            parseFloat(style.outlineWidth) > 0) ||
          style.boxShadow !== "none",
        obscured,
        width: Math.round(rect.width * 10) / 10,
        height: Math.round(rect.height * 10) / 10,
        x: Math.round(rect.left * 10) / 10,
        y: Math.round(rect.top * 10) / 10,
        // Position inside the scrolled content, so stops seen at different scroll
        // offsets of one container compare in one frame (2.5.8 spacing).
        absX: Math.round((rect.left + scrollOffset.x) * 10) / 10,
        absY: Math.round((rect.top + scrollOffset.y) * 10) / 10,
        inline:
          element.tagName === "A" &&
          !!element.parentElement &&
          [...element.parentElement.childNodes].some(
            (node) => node.nodeType === 3 && (node.textContent ?? "").trim(),
          ),
      };
    });
    if (!stop) continue;
    if (seen.has(stop.key)) break;
    seen.add(stop.key);
    const { key: _key, ...rest } = stop;
    stops.push({ ...rest, visibleChange: null });
    if (pixels) {
      const clip = {
        x: Math.max(0, rest.x - 6),
        y: Math.max(0, rest.y - 6),
        width: Math.max(1, Math.min(rest.width + 12, 640)),
        height: Math.max(1, Math.min(rest.height + 12, 200)),
      };
      const viewport = page.viewportSize();
      if (
        viewport &&
        clip.x + clip.width <= viewport.width &&
        clip.y + clip.height <= viewport.height &&
        rest.y >= 0
      ) {
        const focused = await page.screenshot({ clip });
        await page.evaluate(() => {
          const element = document.activeElement as HTMLElement;
          (window as unknown as { stFocus?: HTMLElement }).stFocus = element;
          element.blur();
        });
        const blurred = await page.screenshot({ clip });
        stops[stops.length - 1]!.visibleChange = !focused.equals(blurred);
        if (
          captureTo &&
          (!focused.equals(blurred) === false || !rest.indicator)
        ) {
          mkdirSync(captureTo, { recursive: true });
          writeFileSync(
            join(
              captureTo,
              `${stops.length}-${rest.name.replace(/[^\w]+/gu, "_").slice(0, 30)}.png`,
            ),
            focused,
          );
        }
        await page.evaluate(() =>
          (window as unknown as { stFocus?: HTMLElement }).stFocus?.focus(),
        );
      }
    }
  }
  return stops;
}

/** 2.5.8: an undersized target passes when a 24 px circle on its centre meets no other target. */
function spacingFailures(stops: Stop[]) {
  return stops.filter((stop, index) => {
    if ((stop.width >= 24 && stop.height >= 24) || stop.inline) return false;
    const cx = stop.absX + stop.width / 2;
    const cy = stop.absY + stop.height / 2;
    return stops.some((other, otherIndex) => {
      if (otherIndex === index) return false;
      // The Tab walk can meet one element twice at different scroll offsets.
      if (
        other.name === stop.name &&
        other.absX === stop.absX &&
        other.absY === stop.absY
      )
        return false;
      const small = other.width < 24 || other.height < 24;
      if (small) {
        const ox = other.absX + other.width / 2;
        const oy = other.absY + other.height / 2;
        return Math.hypot(cx - ox, cy - oy) < 24;
      }
      const dx = Math.max(other.absX - cx, 0, cx - (other.absX + other.width));
      const dy = Math.max(other.absY - cy, 0, cy - (other.absY + other.height));
      return Math.hypot(dx, dy) < 12;
    });
  });
}

export function keyboardSummary(stops: Stop[]) {
  return {
    stops: stops.length,
    focusIndicatorMissing: stops.filter((stop) => !stop.indicator),
    notFocusVisible: stops.filter((stop) => !stop.focusVisible).length,
    obscured: stops.filter((stop) => stop.obscured !== "none"),
    noVisibleChange: stops.filter((stop) => stop.visibleChange === false),
    smallTargets: stops.filter((stop) => stop.width < 24 || stop.height < 24),
    targetSpacingFailures: spacingFailures(stops),
    names: stops.map((stop) => `${stop.tag}:${stop.name}`),
  };
}

export async function axe(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  return {
    violations: result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes
        .map((node) => `${node.target.join(" ")} :: ${node.html.slice(0, 500)}`)
        .slice(0, 5),
    })),
    incomplete: result.incomplete.map((item) => item.id),
    passes: result.passes.length,
  };
}

export async function overflow(page: Page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
}

/** Clipped text that appears only after the 1.4.12 spacing overrides. */
export async function textSpacing(page: Page) {
  const probe = () =>
    page.evaluate(() => {
      const clipped: string[] = [];
      for (const element of document.querySelectorAll<HTMLElement>("body *")) {
        const hasText = [...element.childNodes].some(
          (node) => node.nodeType === 3 && node.textContent?.trim(),
        );
        if (!hasText) continue;
        const style = getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const clips = (value: string) =>
          value !== "visible" && value !== "auto" && value !== "scroll";
        if (
          (clips(style.overflowY) &&
            element.scrollHeight > element.clientHeight + 1) ||
          (clips(style.overflowX) &&
            element.scrollWidth > element.clientWidth + 1 &&
            style.textOverflow !== "ellipsis")
        )
          clipped.push(
            `${element.tagName.toLowerCase()}.${[...element.classList].slice(0, 2).join(".")}|${(element.textContent ?? "").trim().slice(0, 30)}`,
          );
      }
      return clipped;
    });
  const before = await probe();
  const handle = await page.addStyleTag({
    content:
      "*{line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important}p{margin-bottom:2em !important}",
  });
  await page.waitForTimeout(200);
  const after = await probe();
  const wide = await overflow(page);
  await handle.evaluate((node: Element) => {
    node.remove();
  });
  return {
    newlyClipped: after.filter((item) => !before.includes(item)),
    scrollWidth: wide.scrollWidth,
    clientWidth: wide.clientWidth,
  };
}

export async function structure(page: Page) {
  return page.evaluate(() => ({
    title: document.title,
    lang: document.documentElement.lang,
    landmarks: [
      ...document.querySelectorAll(
        "main,header,nav,aside,footer,[role=main],[role=banner],[role=navigation],[role=complementary],[role=contentinfo],[role=region][aria-label],[role=search],form[aria-label]",
      ),
    ].map(
      (element) =>
        `${element.tagName.toLowerCase()}${element.getAttribute("role") ? `[${element.getAttribute("role")}]` : ""}${element.getAttribute("aria-label") ? `:${element.getAttribute("aria-label")}` : ""}`,
    ),
    headings: [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(
      (element) =>
        `${element.tagName.toLowerCase()}:${(element.textContent ?? "").trim().slice(0, 40)}`,
    ),
    fields: [...document.querySelectorAll("input,textarea,select")].map(
      (element) => ({
        type: element.getAttribute("type") ?? element.tagName.toLowerCase(),
        name: element.getAttribute("name"),
        autocomplete: element.getAttribute("autocomplete"),
        label:
          element.getAttribute("aria-label") ??
          (element.id
            ? (document.querySelector(`label[for="${CSS.escape(element.id)}"]`)
                ?.textContent ?? null)
            : null),
      }),
    ),
    infiniteAnimations: document
      .getAnimations()
      .filter(
        (animation) =>
          animation.effect?.getComputedTiming().iterations === Infinity,
      ).length,
    embeddedMedia: document.querySelectorAll("video,audio,canvas,iframe")
      .length,
    positiveTabindex: [...document.querySelectorAll("[tabindex]")].filter(
      (element) => Number(element.getAttribute("tabindex")) > 0,
    ).length,
    linksWithoutText: [...document.querySelectorAll("a[href]")].filter(
      (element) =>
        !(element.textContent ?? "").trim() &&
        !element.getAttribute("aria-label") &&
        !element.querySelector("img[alt]"),
    ).length,
  }));
}
