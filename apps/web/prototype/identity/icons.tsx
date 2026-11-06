// PROTOTYPE (#191): hand-drawn SVG, only meant to convey direction.
import type { Variant, VerdictKey } from "./tokens.ts";

/** Six distinct outline shapes, so the glyph alone separates all six verdicts. */
export function VerdictIcon({ k, size = 16 }: { k: VerdictKey; size?: number }) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };
  switch (k) {
    case "correct":
      return (
        <svg {...p}>
          <circle cx="8" cy="8" r="6.4" />
          <path d="M5 8.3l2 2 3.9-4.4" />
        </svg>
      );
    case "exists":
      return (
        <svg {...p}>
          <path d="M8 2L14.4 13.4H1.6Z" />
          <path d="M8 6.2v3.2" />
          <path d="M8 11.5v.1" />
        </svg>
      );
    case "mixed":
      return (
        <svg {...p}>
          <rect x="2" y="2" width="12" height="12" rx="2" />
          <path d="M2.4 2.4h11.2L2.4 13.6Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "doi":
      return (
        <svg {...p}>
          <path d="M8 1.6L14.4 8 8 14.4 1.6 8Z" />
          <path d="M5.6 6.8h4.8M5.6 9.4h4.8M9.6 4.8L6.4 11.4" />
        </svg>
      );
    case "notfound":
      return (
        <svg {...p}>
          <circle cx="8" cy="8" r="6.4" />
          <path d="M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8" />
        </svg>
      );
    case "unverifiable":
      return (
        <svg {...p}>
          <circle cx="8" cy="8" r="6.4" strokeDasharray="2.2 2.2" />
          <path d="M6.3 6.5a1.8 1.8 0 1 1 2.6 1.6c-.6.4-.9.7-.9 1.4" />
          <path d="M8 11.6v.1" />
        </svg>
      );
  }
}

/** Marks. A: ruled reference list whose middle line ends in a "tasted" dot.
 *  B: monochrome tile with a half-filled bowl and handle (a spoon, abstracted).
 *  C: honey drop with a check; the check's tail is a spoon handle. */
export function Mark({ v, size = 28 }: { v: Variant; size?: number }) {
  if (v === "A")
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="27" height="27" rx="2" stroke="var(--primary)" strokeWidth="1.8" />
        <path d="M8 10.5h16M8 21.5h10" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="square" />
        <path d="M8 16h9" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="square" />
        <circle cx="22" cy="16" r="3" fill="var(--accent)" />
      </svg>
    );
  if (v === "B")
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="var(--primary)" />
        <circle cx="14" cy="14" r="6" stroke="var(--primaryFg)" strokeWidth="2.2" />
        <path d="M8 14a6 6 0 0 0 12 0Z" fill="var(--primaryFg)" />
        <path d="M18.6 18.6L25 25" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 2.5c5.2 6.4 10 10.6 10 16.1a10 10 0 0 1-20 0c0-5.500 4.800-9.700 10-16.100Z" fill="var(--accent)" />
      <path d="M10.800 18.600l3.700 3.700 7.300-8.200" stroke="var(--text)" strokeWidth="2.600" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ v, size = 28 }: { v: Variant; size?: number }) {
  return (
    <span className={`wordmark wm-${v}`} style={{ ["--wm" as string]: `${size}px` }}>
      <Mark v={v} size={size} />
      {v === "A" && (
        <span className="wm-text">
          Source<b>Taster</b>
        </span>
      )}
      {v === "B" && (
        <span className="wm-text">
          source<i>/</i>taster
        </span>
      )}
      {v === "C" && (
        <span className="wm-text">
          Source Taster<span className="wm-dot" />
        </span>
      )}
    </span>
  );
}
