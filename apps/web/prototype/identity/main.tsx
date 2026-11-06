// PROTOTYPE (#191): throwaway. Question: which visual identity direction does
// Source Taster take? Three directions on one page, sub-shape B (new page):
// ?variant=A|B|C  &theme=light|dark  &grey=1  &lang=de|en
// Run: pnpm --filter @source-taster/web prototype:identity
// then open http://127.0.0.1:5191/?variant=A  (own Vite config, port 5191)
// Screenshots: node prototype/identity/capture.mjs <outDir> (from apps/web)
// Static synthetic data, no backend. Plain React state + history.replaceState
// (this entry has no router); variants share only the data and tiny pieces.
import { StrictMode, useEffect, useState, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/atkinson-hyperlegible-next";
import "@fontsource-variable/atkinson-hyperlegible-mono";
import "./proto.css";
import { BrandSheet } from "./Brand.tsx";
import { Results } from "./Results.tsx";
import type { Lang } from "./data.ts";
import { cssVars, variantNames, type Theme, type Variant } from "./tokens.ts";

const VARIANTS: Variant[] = ["A", "B", "C"];
const params = () => new URLSearchParams(location.search);

function usePar<T extends string>(key: string, def: T, ok: readonly T[]) {
  const [val, setVal] = useState<T>(() => {
    const p = params().get(key) as T | null;
    return p && ok.includes(p) ? p : def;
  });
  const set = (n: T) => {
    setVal(n);
    const p = params();
    p.set(key, n);
    history.replaceState(null, "", `?${p}`);
  };
  return [val, set] as const;
}

function App() {
  const [variant, setVariant] = usePar<Variant>("variant", "A", VARIANTS);
  const [theme, setTheme] = usePar<Theme>("theme", "light", ["light", "dark"]);
  const [lang, setLang] = usePar<Lang>("lang", "de", ["de", "en"]);
  const [grey, setGrey] = usePar<"0" | "1">("grey", "0", ["0", "1"]);
  const step = (d: number) =>
    setVariant(VARIANTS[(VARIANTS.indexOf(variant) + d + VARIANTS.length) % VARIANTS.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (el?.isContentEditable) return;
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.style.colorScheme = theme;
    document.body.style.background = "#888";
  }, [lang, theme]);

  const vars = cssVars(variant, theme) as CSSProperties;
  return (
    <>
      <div
        className={`proto v-${variant}${grey === "1" ? " grey" : ""}`}
        data-theme={theme}
        style={vars}
      >
        <main className="page">
          <h2 className="sec">1 · {lang === "de" ? "Markenblatt" : "Brand sheet"}</h2>
          <BrandSheet v={variant} lang={lang} />
          <h2 className="sec">2 · {lang === "de" ? "Ergebnisansicht, Webbreite" : "Results view, web width"}</h2>
          <div className="themed" id="results-web">
            <Results key={`w${variant}`} v={variant} lang={lang} mode="web" />
          </div>
          <h2 className="sec">3 · {lang === "de" ? "Seitenleiste, 360 px: Liste und Detail" : "Side panel, 360 px: list and detail"}</h2>
          <div className="panels">
            <div className="themed" id="results-panel-list">
              <Results key={`pl${variant}`} v={variant} lang={lang} mode="panel" initial={null} />
            </div>
            <div className="themed" id="results-panel-detail">
              <Results key={`pd${variant}`} v={variant} lang={lang} mode="panel" initial={2} />
            </div>
          </div>
        </main>
      </div>
      {import.meta.env.DEV && (
        <div className="switcher" role="toolbar" aria-label="Prototype switcher">
          <button onClick={() => step(-1)} aria-label="Previous variant">←</button>
          <span className="label">
            {variant} ({variantNames[variant]})
          </span>
          <button onClick={() => step(1)} aria-label="Next variant">→</button>
          <span className="sep" />
          <button aria-pressed={theme === "dark"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "Dark" : "Light"}
          </button>
          <button aria-pressed={grey === "1"} onClick={() => setGrey(grey === "1" ? "0" : "1")}>
            Grey
          </button>
          <button onClick={() => setLang(lang === "de" ? "en" : "de")}>{lang.toUpperCase()}</button>
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
