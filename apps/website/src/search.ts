export {};
// SPDX-License-Identifier: AGPL-3.0-or-later
interface Result {
  data: () => Promise<{ url: string; meta: { title: string } }>;
}
interface Index {
  search: (query: string) => Promise<{ results: Result[] }>;
}
const section = document.querySelector<HTMLElement>("[data-search]");
const form = section?.querySelector("form");
const input = section?.querySelector("input");
const status = document.getElementById("search-status");
const list = document.getElementById("search-results");
let generation = 0;
if (section && form && input && status && list) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const current = ++generation;
    list.replaceChildren();
    const query = input.value.trim();
    status.textContent = query ? (section.dataset.loading ?? "") : "";
    if (!query) return;
    void (async () => {
      try {
        // Pagefind resolves only bundled public assets. No query is put in a URL.
        const location = `/pagefind/${section.dataset.language}/pagefind.js`;
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
            !url.pathname.startsWith(`/docs/${section.dataset.language}/`)
          )
            continue;
          const item = document.createElement("li");
          const link = document.createElement("a");
          link.href = url.pathname;
          link.textContent = result.meta.title.replace(/ · Source Taster$/, "");
          item.append(link);
          list.append(item);
        }
        status.textContent = list.children.length
          ? ""
          : (section.dataset.empty ?? "");
      } catch {
        if (current === generation)
          status.textContent = section.dataset.failure ?? "";
      }
    })();
  });
}
