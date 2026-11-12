// SPDX-License-Identifier: AGPL-3.0-or-later
export {};
interface Result {
  data: () => Promise<{ url: string; meta: { title: string } }>;
}
interface Index {
  search: (query: string) => Promise<{ results: Result[] }>;
}
const dialog = document.querySelector<HTMLDialogElement>("[data-search]");
const triggers = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-search-open]"),
];
const trigger = triggers[0];
const form = dialog?.querySelector("form");
const input = dialog?.querySelector("input");
const close = dialog?.querySelector<HTMLButtonElement>("[data-search-close]");
const retry = dialog?.querySelector<HTMLButtonElement>("[data-search-retry]");
const status = document.getElementById("search-status");
const list = document.getElementById("search-results");
if (dialog && trigger && form && input && close && retry && status && list) {
  let generation = 0;
  let attempt = 0;
  let failed = false;
  let opener: HTMLElement | null = null;
  for (const button of triggers) button.hidden = false;
  function openSearch() {
    if (!dialog!.open) {
      opener =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : trigger!;
      dialog!.showModal();
    }
    input!.focus();
  }
  for (const button of triggers) button.addEventListener("click", openSearch);
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
  });
  close.addEventListener("click", () => dialog.close());
  // Search inputs can consume Esc to clear their value before the native
  // dialog sees it. Esc consistently dismisses this focused search surface.
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dialog.close();
    } else if (event.key === "Tab") {
      // Keep the keyboard loop within the modal rather than allowing the
      // native dialog's boundary to hand focus to browser chrome.
      const controls = [
        ...dialog.querySelectorAll<HTMLElement>(
          "button, input, a[href], select, textarea, [tabindex]",
        ),
      ].filter(
        (element) =>
          element.tabIndex >= 0 &&
          !element.matches(":disabled") &&
          element.getClientRects().length > 0,
      );
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });
  const resetResults = () => {
    generation++;
    list.replaceChildren();
    list.setAttribute("aria-busy", "false");
    status.textContent = "";
    retry.hidden = true;
  };
  input.addEventListener("input", resetResults);
  dialog.addEventListener("close", () => {
    resetResults();
    input.value = "";
    opener?.focus();
  });
  const search = async () => {
    resetResults();
    const current = generation;
    const query = input.value.trim();
    if (!query) return;
    status.textContent = dialog.dataset.loading ?? "";
    list.setAttribute("aria-busy", "true");
    // A failed ES module import is cached by the browser. A query-independent
    // retry counter creates a fresh module instance, including after a failed
    // Pagefind WASM/index fetch. User text never enters a resource URL.
    if (failed) {
      attempt++;
      failed = false;
    }
    try {
      const location = `/pagefind/${dialog.dataset.language}/pagefind.js${attempt ? `?retry=${attempt}` : ""}`;
      const index = (await import(/* @vite-ignore */ location)) as Index;
      const found = await index.search(query);
      const results = await Promise.all(
        found.results.slice(0, 20).map((result) => result.data()),
      );
      if (current !== generation) return;
      for (const result of results) {
        const url = new URL(result.url, window.location.origin);
        if (
          url.origin !== window.location.origin ||
          !url.pathname.startsWith(`/docs/${dialog.dataset.language}/`)
        )
          continue;
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = url.pathname;
        link.textContent = result.meta.title.replace(/ · Source Taster$/, "");
        item.append(link);
        list.append(item);
      }
      const count = list.children.length;
      status.textContent =
        count === 0
          ? (dialog.dataset.empty ?? "")
          : count === 1
            ? (dialog.dataset.one ?? "")
            : (dialog.dataset.many ?? "").replace(
                "{count}",
                new Intl.NumberFormat(dialog.dataset.language).format(count),
              );
    } catch {
      if (current === generation) {
        failed = true;
        status.textContent = dialog.dataset.failure ?? "";
        retry.hidden = false;
      }
    } finally {
      if (current === generation) list.setAttribute("aria-busy", "false");
    }
  };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void search();
  });
  retry.addEventListener("click", () => {
    input.focus();
    void search();
  });
}
