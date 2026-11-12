// SPDX-License-Identifier: AGPL-3.0-or-later
// React-free: this entry point is also used by static Astro templates.
import { tv } from "tailwind-variants/lite";

export const focusRing =
  "st-focus outline-offset-2 focus-visible:outline-2 focus-visible:outline-focus-ring";
const control = `${focusRing} st-control relative inline-flex max-w-full min-w-6 items-center justify-center gap-2 whitespace-normal rounded-full border text-center font-sans text-base [overflow-wrap:anywhere]`;
export const buttonRecipe = tv({
  base: control,
  variants: {
    variant: { primary: "", secondary: "", ghost: "", danger: "" },
    size: { md: "min-h-9 px-4 py-1", sm: "min-h-7 px-3 py-0" },
    isDisabled: {
      true: "st-disabled border-border bg-surface-sunken text-text-muted",
    },
  },
  defaultVariants: { variant: "secondary", size: "md", isDisabled: false },
  compoundVariants: [
    {
      variant: "primary",
      isDisabled: false,
      class: "border-transparent bg-accent text-on-accent",
    },
    {
      variant: "secondary",
      isDisabled: false,
      class:
        "border-border-strong bg-surface text-text enabled:hover:bg-surface-sunken",
    },
    {
      variant: "ghost",
      isDisabled: false,
      class:
        "border-transparent bg-transparent text-text enabled:hover:bg-surface-sunken",
    },
    {
      variant: "danger",
      isDisabled: false,
      class: "border-transparent bg-feedback-danger text-surface",
    },
  ],
});
export const linkRecipe = tv({
  base: `${focusRing} inline-flex min-h-6 min-w-6 max-w-full items-center gap-1 rounded-xs text-accent-text underline decoration-1 underline-offset-[0.2em] hover:decoration-2 [overflow-wrap:anywhere]`,
});
export const badgeRecipe = tv({
  base: "inline-flex min-h-7 max-w-full items-center gap-1 rounded-full border border-border bg-surface-sunken px-2 py-0.5 text-xs text-text-secondary [overflow-wrap:anywhere]",
});
export const bannerRecipe = tv({
  base: "st-banner flex min-w-0 flex-wrap items-start gap-3 rounded-lg border border-border p-4 text-base text-text [overflow-wrap:anywhere]",
  variants: {
    tone: {
      info: "bg-feedback-info-tint",
      success: "bg-feedback-success-tint",
      warning: "bg-feedback-warning-tint",
      danger: "bg-feedback-danger-tint",
    },
  },
  defaultVariants: { tone: "info" },
});
export const kbdRecipe = tv({
  base: "inline-flex items-center rounded-sm border border-border bg-surface-sunken px-1.5 py-0.5 font-mono text-2xs text-text-secondary",
});
