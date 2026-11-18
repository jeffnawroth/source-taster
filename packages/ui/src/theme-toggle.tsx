// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useState } from "react";
import { m } from "@source-taster/i18n";
import { Button } from "./primitives/index.ts";
import type { Theme } from "./preferences.ts";

/** The website's 36px circular appearance control, shared by both app hosts. */
export function ThemeToggle({
  theme,
  onChange,
}: {
  theme: Theme;
  onChange: (theme: Theme) => void;
}) {
  const [systemDark, setSystemDark] = useState(
    () => matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const change = () => setSystemDark(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  const dark = theme === "dark" || (theme === "system" && systemDark);
  const label = dark ? m.theme_switch_light() : m.theme_switch_dark();
  return (
    <Button
      className="theme-toggle"
      aria-label={label}
      onPress={() => onChange(dark ? "light" : "dark")}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {dark ? (
          <>
            <rect x="4" y="4" width="16" height="16" rx="5" />
            <path d="M4 14l6-6 10 10" />
          </>
        ) : (
          <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5 8 8 0 1 0 19.5 14.5z" />
        )}
      </svg>
    </Button>
  );
}
