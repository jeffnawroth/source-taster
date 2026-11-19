// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Browser } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pixelDiff } from "./measurements.ts";

/** Overlapping native-size views cover the middle as well as both endpoints. */
export function scrollOffsets(
  scrollHeight: number,
  clientHeight: number,
  sharedStep?: number,
) {
  if (
    !Number.isFinite(scrollHeight) ||
    !Number.isFinite(clientHeight) ||
    clientHeight <= 0
  )
    throw new Error("Invalid scroll geometry");
  const end = Math.max(0, scrollHeight - clientHeight);
  if (end <= 1) return [];
  // A driver whose two sides scroll roots of different heights passes one
  // shared step, so slice N sits at the same offset on both sides.
  const step = Math.max(
    1,
    Math.min(384, Math.floor(clientHeight / 2), sharedStep ?? Infinity),
  );
  const offsets = [0];
  for (let offset = step; offset < end; offset += step) offsets.push(offset);
  offsets.push(end);
  return offsets;
}

type ScrollRoot = {
  key: string;
  scrollHeight: number;
  clientHeight: number;
  initial: number;
};
export type ScrollRequest = {
  prototype: boolean;
  action: "read" | "move" | "restore";
  key?: string;
  offset?: number;
  positions?: { key: string; offset: number }[];
};

/** Self-contained so the exact same discovery runs in a native SIDE_PANEL. */
export function scrollCoverageDom(request: ScrollRequest): ScrollRoot[] {
  const visible = (element: HTMLElement) => {
    const box = element.getBoundingClientRect();
    return (
      box.width > 0 &&
      box.height > 0 &&
      getComputedStyle(element).visibility !== "hidden" &&
      !element.closest('[inert],[aria-hidden="true"]')
    );
  };
  const roots = new Map<string, HTMLElement>();
  const pick = (key: string, selector: string) => {
    const element = Array.from(
      document.querySelectorAll<HTMLElement>(selector),
    ).find(visible);
    if (element) roots.set(key, element);
  };
  pick(
    "dialog",
    request.prototype ? ".v-D .dlg" : ".st-modal:not([data-st-layer])",
  );
  if (!roots.has("dialog")) {
    pick(
      "detail",
      request.prototype ? '.v-D [data-scroll="detail"]' : ".check-detail",
    );
    if (request.prototype) pick("feed", '.v-D [data-scroll="feed"]');
    // An open modal (the command palette is one) blocks page scrolling, as
    // D's palette makes its feed inert; the page behind it is no scroll root.
    else if (
      document.scrollingElement &&
      !Array.from(document.querySelectorAll<HTMLElement>(".st-modal")).some(
        visible,
      )
    )
      roots.set("feed", document.scrollingElement as HTMLElement);
  }
  // Textareas scroll independently even when their enclosing form is also long.
  const scope = roots.get("dialog") ?? roots.get("detail") ?? document;
  Array.from(scope.querySelectorAll<HTMLTextAreaElement>("textarea"))
    .filter(visible)
    .forEach((element, index) => roots.set(`textarea-${index}`, element));
  // A non-scrollable modal may delegate scrolling to its dialog content.
  const dialog = roots.get("dialog");
  if (
    dialog &&
    dialog.scrollHeight <= dialog.clientHeight + 1 &&
    !request.prototype
  ) {
    const content = dialog.querySelector<HTMLElement>(".st-dialog");
    if (content && content.scrollHeight > content.clientHeight + 1)
      roots.set("dialog", content);
  }
  if (request.action === "move") {
    const element = roots.get(request.key!);
    if (!element) throw new Error(`Missing scroll root ${request.key}`);
    // Bring an independently scrolling form control into view without resizing it.
    if (request.key!.startsWith("textarea-"))
      element.scrollIntoView({ block: "center", behavior: "instant" });
    element.scrollTop = request.offset!;
  } else if (request.action === "restore") {
    // Restore controls first and enclosing containers last.
    for (const position of [...(request.positions ?? [])].reverse()) {
      const element = roots.get(position.key);
      if (element) element.scrollTop = position.offset;
    }
  }
  return Array.from(roots, ([key, element]) => ({
    key,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
    initial: element.scrollTop,
  }));
}

export type ScrollCoverage = {
  roots: ScrollRoot[];
  slices: { key: string; offset: number; path: string }[];
  complete: boolean;
};
export async function captureScrollCoverage(
  evaluate: (request: ScrollRequest) => Promise<ScrollRoot[]>,
  screenshot: (path: string) => Promise<unknown>,
  out: string,
  id: string,
  prototype: boolean,
  sharedStep?: number,
): Promise<ScrollCoverage> {
  const roots = await evaluate({ prototype, action: "read" });
  const slices: ScrollCoverage["slices"] = [];
  const positions = roots.map((root) => ({
    key: root.key,
    offset: root.initial,
  }));
  try {
    for (const root of roots) {
      const offsets = scrollOffsets(
        root.scrollHeight,
        root.clientHeight,
        sharedStep,
      );
      for (const [index, offset] of offsets.entries()) {
        await evaluate({ prototype, action: "restore", positions });
        const moved = await evaluate({
          prototype,
          action: "move",
          key: root.key,
          offset,
        });
        const actual = moved.find((entry) => entry.key === root.key);
        if (!actual || Math.abs(actual.initial - offset) > 1)
          throw new Error(
            `Scroll coverage ${root.key} did not reach ${offset}px`,
          );
        const path = join(
          out,
          `${id}.scroll-${root.key}-${index}.${prototype ? "prototype" : "built"}.png`,
        );
        await screenshot(path);
        slices.push({ key: `${root.key}-${index}`, offset, path });
      }
    }
  } finally {
    await evaluate({ prototype, action: "restore", positions });
  }
  return { roots, slices, complete: true };
}

export async function compareScrollCoverage(
  browser: Browser,
  source: ScrollCoverage | undefined,
  built: ScrollCoverage | undefined,
  out: string,
  id: string,
) {
  const failures: string[] = [];
  const comparisons: {
    key: string;
    ratio: number;
    passed: boolean;
    diff: string;
  }[] = [];
  if (!source?.complete || !built?.complete)
    return { failures: ["Scroll coverage capture incomplete"], comparisons };
  const keys = new Set(
    [...source.slices, ...built.slices].map((slice) => slice.key),
  );
  for (const key of keys) {
    const a = source.slices.find((slice) => slice.key === key);
    const b = built.slices.find((slice) => slice.key === key);
    if (!a || !b) {
      failures.push(
        `Scroll coverage ${key}: missing ${!a ? "prototype" : "built"} slice`,
      );
      continue;
    }
    const metric = await pixelDiff(
      browser,
      readFileSync(a.path),
      readFileSync(b.path),
    );
    const diff = join(out, `${id}.scroll-${key}.diff.png`);
    writeFileSync(diff, Buffer.from(metric.image, "base64"));
    comparisons.push({ key, ratio: metric.ratio, passed: metric.passed, diff });
    if (!metric.passed)
      failures.push(
        `Scroll coverage ${key}: ${(metric.ratio * 100).toFixed(3)}% exceeds fixed 1% or dimensions differ`,
      );
  }
  return { failures, comparisons };
}
