// SPDX-License-Identifier: AGPL-3.0-or-later
// The colour scheme follows the system unless the visitor flips it. The same
// `data-theme` attribute on <html> that packages/design-tokens/theme.css keys
// off is set here. Nothing is stored: ADR-0020 forbids extra storage, so the
// choice lasts for this page view and the next page follows the system again.
const toggle = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
if (toggle) {
  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    const root = document.documentElement;
    const dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
  });
}
