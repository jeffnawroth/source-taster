// PROTOTYPE (#191): brand sheet per identity direction.
import type { CSSProperties } from "react";
import { Badge } from "./Results.tsx";
import { Mark, Wordmark } from "./icons.tsx";
import type { Lang } from "./data.ts";
import {
  checks,
  contrast,
  cssVars,
  oklchCss,
  surfaces,
  variantNames,
  verdictColours,
  verdictOrder,
  family,
  type Theme,
  type Variant,
} from "./tokens.ts";

const fonts: Record<Variant, { sans: string; mono: string; note: string }> = {
  A: { sans: "IBM Plex Sans", mono: "IBM Plex Mono", note: "Editorial precision" },
  B: { sans: "Geist Sans", mono: "Geist Mono", note: "Dense tool chrome" },
  C: { sans: "Atkinson Hyperlegible Next", mono: "Atkinson Hyperlegible Mono", note: "Legibility first" },
};
const t = {
  de: {
    brand: "Markenblatt",
    mark: "Wortmarke und Zeichen",
    palette: "Palette (OKLCH)",
    verdicts: "Urteile, Glyphe und Text",
    grey: "Graustufen-Probe",
    type: "Schrift",
    specimen: "Jede Referenz bekommt ein ruhiges, belegtes Urteil.",
    body: "Source Taster prüft, ob eine Quelle existiert und richtig zitiert ist. Ein Urteil ist ein Hinweis mit Belegen, kein Beweis. Wo etwas nicht verifizierbar ist, sagen wir das offen.",
    figures: "Tabellenziffern",
    primary: "Primär",
    accent: "Akzent",
    neutral: "Neutral",
    lowest: "Knappster Kontrast",
  },
  en: {
    brand: "Brand sheet",
    mark: "Wordmark and mark",
    palette: "Palette (OKLCH)",
    verdicts: "Verdicts, glyph and text",
    grey: "Greyscale check",
    type: "Type",
    specimen: "Every reference gets a calm, evidenced verdict.",
    body: "Source Taster checks whether a source exists and is cited correctly. A verdict is a pointer with evidence, not proof. Where something cannot be verified, we say so openly.",
    figures: "Tabular figures",
    primary: "Primary",
    accent: "Accent",
    neutral: "Neutral",
    lowest: "Tightest contrast",
  },
};

function Swatch({ name, c, on }: { name: string; c: readonly [number, number, number]; on: readonly [number, number, number] }) {
  return (
    <div className="swatch" style={{ background: oklchCss(c), color: oklchCss(on) }}>
      <b>{name}</b>
      <code>{`${c[0]} ${c[1]} ${c[2]}`}</code>
      <small>{contrast(c, on).toFixed(1)}:1</small>
    </div>
  );
}

function Panel({ v, theme, lang, children }: { v: Variant; theme: Theme; lang: Lang; children: React.ReactNode }) {
  void lang;
  return (
    <div className={`panel v-${v}`} data-theme={theme} style={cssVars(v, theme) as CSSProperties}>
      {children}
    </div>
  );
}

function Palette({ v, theme, lang }: { v: Variant; theme: Theme; lang: Lang }) {
  const s = surfaces[v][theme];
  const L = t[lang];
  return (
    <Panel v={v} theme={theme} lang={lang}>
      <h4>
        {L.palette} · {theme}
      </h4>
      <div className="swatches">
        <Swatch name={L.primary} c={s.primary} on={s.primaryFg} />
        <Swatch name={L.accent} c={s.accent} on={s.bg} />
        <Swatch name="bg" c={s.bg} on={s.text} />
        <Swatch name="surface" c={s.surface} on={s.text} />
        <Swatch name="sunken" c={s.sunken} on={s.muted} />
        <Swatch name="rule" c={s.rule} on={s.text} />
        <Swatch name="muted" c={s.muted} on={s.bg} />
        <Swatch name="text" c={s.text} on={s.bg} />
      </div>
    </Panel>
  );
}

function Verdicts({ v, theme, lang }: { v: Variant; theme: Theme; lang: Lang }) {
  const worst = checks(v, theme).filter((r) => r.min > 1).sort((a, b) => a.ratio / a.min - b.ratio / b.min)[0];
  return (
    <Panel v={v} theme={theme} lang={lang}>
      <h4>{theme}</h4>
      <div className="badges">
        {verdictOrder.map((k) => (
          <Badge key={k} k={k} lang={lang} />
        ))}
      </div>
      <p className="small muted">
        {t[lang].lowest}: {worst.name} {worst.ratio.toFixed(2)}:1 (min {worst.min})
      </p>
      <p className="small muted mono">
        {(["green", "amber", "red", "grey"] as const)
          .map((f) => `${f} text ${contrast(verdictColours[theme][f].fg, verdictColours[theme][f].bg).toFixed(1)}/icon ${contrast(verdictColours[theme][f].icon, verdictColours[theme][f].bg).toFixed(1)}`)
          .join(" · ")}
      </p>
    </Panel>
  );
}

export function BrandSheet({ v, lang }: { v: Variant; lang: Lang }) {
  const L = t[lang];
  void family;
  return (
    <section className={`sheet v-${v}`} id="brand">
      <h2 className="sheet-title">
        {L.brand} · {variantNames[v]} <span className="muted">— {fonts[v].note}</span>
      </h2>

      <div className="grid2">
        {(["light", "dark"] as const).map((th) => (
          <Panel key={th} v={v} theme={th} lang={lang}>
            <h4>{L.mark}</h4>
            <div className="lockups">
              <Wordmark v={v} size={44} />
              <div className="marksizes">
                {[16, 24, 32, 64].map((n) => (
                  <Mark key={n} v={v} size={n} />
                ))}
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid2">
        <Palette v={v} theme="light" lang={lang} />
        <Palette v={v} theme="dark" lang={lang} />
      </div>

      <h3>{L.verdicts}</h3>
      <div className="grid2">
        <Verdicts v={v} theme="light" lang={lang} />
        <Verdicts v={v} theme="dark" lang={lang} />
      </div>

      <h3>{L.grey}</h3>
      <div className="grid2 grey-always" id="verdict-grey">
        <Panel v={v} theme="light" lang={lang}>
          <div className="badges">
            {verdictOrder.map((k) => (
              <Badge key={k} k={k} lang={lang} />
            ))}
          </div>
        </Panel>
        <Panel v={v} theme="dark" lang={lang}>
          <div className="badges">
            {verdictOrder.map((k) => (
              <Badge key={k} k={k} lang={lang} />
            ))}
          </div>
        </Panel>
      </div>

      <h3>{L.type}</h3>
      <div className="grid2">
        {(["light", "dark"] as const).map((th) => (
          <Panel key={th} v={v} theme={th} lang={lang}>
            <p className="small muted">
              {fonts[v].sans} + {fonts[v].mono}
            </p>
            <p className="spec-h">{L.specimen}</p>
            <p className="spec-b">{L.body}</p>
            <div className="figs">
              <span className="small muted">{L.figures}</span>
              <span className="num">1.204 · 8.888 · 11.111</span>
              <span className="mono">doi:10.1038/sdata.2016.18</span>
              <span className="mono">https://doi.org/10.3217/zfhe-14-03/04</span>
            </div>
          </Panel>
        ))}
      </div>
    </section>
  );
}
