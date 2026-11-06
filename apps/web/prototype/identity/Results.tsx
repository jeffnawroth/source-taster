// PROTOTYPE (#191): results view (ADR-0016 structure) rendered in one of three identities.
import { useState } from "react";
import { copy, refs, verdictLabel, verdictShort, type Lang, type Ref } from "./data.ts";
import { VerdictIcon, Wordmark } from "./icons.tsx";
import { family, verdictOrder, type Variant, type VerdictKey } from "./tokens.ts";

export function Badge({
  k,
  lang,
  short,
}: {
  k: VerdictKey;
  lang: Lang;
  short?: boolean;
}) {
  return (
    <span className={`badge b-${family[k]}`} data-verdict={k}>
      <VerdictIcon k={k} size={15} />
      <span>{(short ? verdictShort : verdictLabel)[k][lang]}</span>
    </span>
  );
}

function Detail({
  r,
  lang,
  v,
  onBack,
}: {
  r: Ref;
  lang: Lang;
  v: Variant;
  onBack?: () => void;
}) {
  return (
    <article className="detail" aria-label={r.title}>
      {onBack && (
        <button className="back" onClick={onBack}>
          <span aria-hidden="true">←</span> {copy.back[lang]}
        </button>
      )}
      <header className="dhead">
        <Badge k={r.verdict} lang={lang} />
        <h3>{r.title}</h3>
        <p className="by">{r.byline}</p>
        <p className="venue">{r.venue}</p>
        {r.doi && <p className="doi mono">doi:{r.doi}</p>}
      </header>
      <p className="explain">{r.explain[lang]}</p>

      {r.fields ? (
        <section className="cmp" aria-label={copy.bestMatch[lang]}>
          <div className="cmp-head">
            <span>{copy.field[lang]}</span>
            <span>{copy.reference[lang]}</span>
            <span>{copy.bestMatch[lang]}</span>
          </div>
          {r.fields.map((f) => (
            <div className={`cmp-row${f.differs ? " is-diff" : ""}`} key={f.field.en}>
              <span className="cmp-field">{f.field[lang]}</span>
              <span className="cmp-ref" data-label={copy.reference[lang]}>
                <span className="val">{f.ref}</span>
              </span>
              <span className="cmp-match" data-label={copy.bestMatch[lang]}>
                <span className="val">{f.match}</span>
                <em className="cmp-flag">{f.differs ? `≠ ${copy.differs[lang]}` : `= ${copy.matches[lang]}`}</em>
              </span>
            </div>
          ))}
        </section>
      ) : (
        <p className="nomatch">{copy.noMatch[lang]}</p>
      )}

      {r.suggestion && (
        <section className="suggest">
          <h4>{copy.suggestion[lang]}</h4>
          <p className="mono">{r.suggestion}</p>
          <p className="note">{copy.suggestionNote[lang]}</p>
          <button className="btn">{copy.copy[lang]}</button>
        </section>
      )}

      <section className="sources">
        <h4>{copy.checked[lang]}</h4>
        <ul>
          {r.sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
      <span hidden>{v}</span>
    </article>
  );
}

export function Results({
  v,
  lang,
  mode,
  initial = null,
}: {
  v: Variant;
  lang: Lang;
  mode: "web" | "panel";
  initial?: number | null;
}) {
  const [filter, setFilter] = useState<VerdictKey | "all">("all");
  const [sel, setSel] = useState<number | null>(
    initial ?? (mode === "web" ? 2 : null),
  );
  const shown = refs.filter((r) => filter === "all" || r.verdict === filter);
  const current = refs.find((r) => r.id === sel) ?? null;
  const counts = (k: VerdictKey) => refs.filter((r) => r.verdict === k).length;

  const list = (
    <ol className="list" aria-label="Referenzen">
      {shown.map((r) => (
        <li key={r.id}>
          <button
            className="row"
            aria-current={sel === r.id ? "true" : undefined}
            onClick={() => setSel(r.id)}
          >
            <span className="idx mono">{String(r.id).padStart(2, "0")}</span>
            <Badge k={r.verdict} lang={lang} short={v === "B"} />
            <span className="rtitle">{r.title}</span>
            <span className="rby">{r.byline}</span>
          </button>
        </li>
      ))}
    </ol>
  );

  return (
    <div className={`frame frame-${mode} v-${v}`}>
      <header className="apphead">
        <Wordmark v={v} size={mode === "web" ? 26 : 22} />
        {mode === "web" ? (
          <nav>
            <span>{copy.history[lang]}</span>
            <span className="btn-primary">{copy.newCheck[lang]}</span>
          </nav>
        ) : (
          <span className="menu" aria-hidden="true">
            ≡
          </span>
        )}
      </header>
      {(mode === "web" || !current) && (
        <div className="checkhead">
          <h2>{copy.checkTitle[lang]}</h2>
          <p className="meta">{copy.checkMeta[lang]}</p>
          <p className="summary">{copy.summary[lang]}</p>
          <div className="chips" role="group" aria-label="Filter">
            <button
              className="chip"
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
            >
              {copy.all[lang]} <b className="num">{refs.length}</b>
            </button>
            {verdictOrder.map((k) => (
              <button
                key={k}
                className={`chip c-${family[k]}`}
                aria-pressed={filter === k}
                onClick={() => setFilter(filter === k ? "all" : k)}
              >
                <VerdictIcon k={k} size={14} />
                {verdictShort[k][lang]} <b className="num">{counts(k)}</b>
              </button>
            ))}
          </div>
        </div>
      )}
      {mode === "web" ? (
        <div className="split">
          {list}
          <div className="pane">
            {current ? <Detail r={current} lang={lang} v={v} /> : null}
          </div>
        </div>
      ) : current ? (
        <Detail r={current} lang={lang} v={v} onBack={() => setSel(null)} />
      ) : (
        list
      )}
    </div>
  );
}
