/* PROTOTYPE (#194) — variant C "Document / report-first". Throwaway.
   The result IS the user's bibliography, rendered as an annotated document: one centred column (~720 px measure),
   each Reference as its original citation text, verdict glyph + label in the margin, deviating parts inline (.st-dev),
   the suggestion inline as a tracked change (.st-del/.st-ins). Lede paragraph whose verdict words are the filters.
   Detail: right-hand inspector at web width (narrows the document), full-height sheet replacing the document in the panel. */
(() => {
  const css = `
.v-C { --c-top: 52px; --c-side: 20px; --c-stack: 0px; position: relative; min-height: var(--ov-h, 100vh); color: var(--st-text); font-family: var(--st-font-sans);
  background: radial-gradient(70% 380px at 50% 0, var(--st-bg-glow), transparent 75%), var(--st-bg); }
.v-C h1, .v-C h2, .v-C h3, .v-C p, .v-C ul, .v-C ol, .v-C blockquote, .v-C fieldset { margin: 0; padding: 0; }
.v-C ul, .v-C ol { list-style: none; }
.v-C fieldset { border: 0; min-width: 0; }
.v-C [hidden] { display: none !important; }

/* ---------- buttons ---------- */
.v-C .btn { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 6px 14px; border-radius: var(--st-radius-full); border: 1px solid var(--st-border-strong);
  background: var(--st-surface); color: var(--st-text); font-size: var(--st-text-sm); font-weight: 500; line-height: 1.25; text-align: left; cursor: pointer; }
.v-C .btn:hover:not(:disabled) { border-color: var(--st-border-emphasis); }
.v-C .btn:disabled { color: var(--st-text-muted); background: var(--st-surface-sunken); cursor: not-allowed; }
.v-C .btn.primary { background: linear-gradient(var(--st-button-primary-from), var(--st-button-primary-to)); color: var(--st-on-accent); border-color: transparent; font-weight: 700; box-shadow: var(--st-highlight-inset), 0 8px 18px -10px var(--st-accent-glow); }
.v-C .btn.primary:disabled { background: var(--st-surface-sunken); color: var(--st-text-muted); border-color: var(--st-border-strong); box-shadow: none; }
.v-C .btn.quiet { background: transparent; border-color: transparent; }
.v-C .btn.quiet:hover:not(:disabled) { background: var(--st-accent-tint); border-color: transparent; }
.v-C .btn.danger { color: var(--st-feedback-danger); }
.v-C .btn.sm { min-height: 30px; padding: 3px 11px; font-size: var(--st-text-xs); }
.v-C .btn[aria-pressed="true"] { border-color: var(--st-accent); background: var(--st-accent-tint); font-weight: 700; }
.v-C .btn small.why { display: block; font-size: var(--st-text-2xs); font-weight: 400; color: var(--st-text-secondary); margin-top: 1px; }
.v-C .link { background: none; border: 0; padding: 0; color: var(--st-accent-text); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; font-size: inherit; }

/* ---------- top bar ---------- */
.v-C .top { position: sticky; top: 0; z-index: var(--st-z-topbar); height: var(--c-top); border-width: 0 0 1px; border-radius: 0; }
.v-C .top-in { height: 100%; max-width: 1360px; margin: 0 auto; padding: 0 var(--c-side); display: flex; align-items: center; gap: 12px; }
.v-C .brand { display: inline-flex; align-items: center; gap: 8px; background: none; border: 0; padding: 4px 6px; border-radius: var(--st-radius-sm); color: var(--st-text); font-weight: 800; font-size: var(--st-text-md); letter-spacing: -0.01em; cursor: pointer; }
.v-C .top nav { display: flex; gap: 2px; }
.v-C .top nav button { background: none; border: 0; padding: 6px 12px; border-radius: var(--st-radius-full); font-size: var(--st-text-sm); font-weight: 500; color: var(--st-text-secondary); cursor: pointer; }
.v-C .top nav button:hover { background: var(--st-accent-tint); }
.v-C .top nav button[aria-current="page"] { color: var(--st-accent-text); font-weight: 700; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 6px; }
.v-C .cmdbtn { margin-left: auto; display: inline-flex; align-items: center; gap: 8px; min-height: 34px; padding: 4px 8px 4px 12px; border-radius: var(--st-radius-full); border: 1px solid var(--st-border-strong); background: var(--st-surface); color: var(--st-text-secondary); font-size: var(--st-text-sm); cursor: pointer; }
.v-C .cmdbtn kbd { font-family: var(--st-font-mono); font-size: var(--st-text-2xs); padding: 2px 6px; border-radius: var(--st-radius-sm); background: var(--st-surface-sunken); border: 1px solid var(--st-border); color: var(--st-text-secondary); }
@container app (max-width: 560px) { .v-C .brand .bn, .v-C .cmdbtn .hint { display: none; } .v-C .top-in { gap: 4px; --c-side: 10px; } .v-C .top nav button { padding: 6px 9px; } }

/* ---------- banners ---------- */
.v-C .recon { position: sticky; top: var(--c-top); z-index: 15; display: flex; gap: 10px; align-items: flex-start; padding: 8px var(--c-side); background: var(--st-feedback-warning-tint); border-bottom: 1px solid var(--st-border-strong); color: var(--st-text); font-size: var(--st-text-xs); min-height: 38px; }
.v-C .recon .ico { color: var(--st-feedback-warning); margin-top: 1px; }

/* ---------- layout ---------- */
.v-C .layout { max-width: 1360px; margin: 0 auto; padding: 12px var(--c-side) 112px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 24px; align-items: start; }
.v-C .inspector { display: none; }
.v-C .layout[data-open] .inspector { display: block; }
@container app (min-width: 980px) { .v-C .layout[data-open] { grid-template-columns: minmax(0, 1fr) 420px; } }
@container app (max-width: 979px) { .v-C .layout[data-open] .docwrap { display: none; } .v-C .layout[data-open] { padding-top: 0; } }
@container app (max-width: 560px) { .v-C .layout { padding: 0 0 112px; } .v-C .layout[data-open] { padding: 0; } }
.v-C .docwrap { container: docw / inline-size; min-width: 0; }

/* ---------- toolbar ---------- */
.v-C .toolbar { position: sticky; top: calc(var(--c-top) + var(--c-stack)); z-index: var(--st-z-sticky); display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 6px 8px;
  width: fit-content; max-width: 100%; margin: 0 0 12px auto; padding: 6px; border-radius: var(--st-radius-xl); }
.v-C .tb-inline, .v-C .tb-prim { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; justify-content: flex-end; }
.v-C .tb-inline { padding-right: 8px; margin-right: 2px; border-right: 1px solid var(--st-border-strong); }
.v-C .tb-inline:empty { display: none; }
.v-C .check-hint { font-size: var(--st-text-xs); color: var(--st-text-secondary); padding-left: 8px; }
.v-C .menu-wrap { display: none; position: static; }
.v-C .menu { position: absolute; right: 0; top: calc(100% + 8px); z-index: 20; width: 248px; max-width: calc(100cqw - 16px); padding: 6px; display: grid; gap: 2px; border-radius: var(--st-radius-lg); background: var(--st-surface); border: 1px solid var(--st-border-strong); box-shadow: var(--st-shadow-lifted); }
.v-C .menu .btn { border-radius: var(--st-radius-md); width: 100%; border-color: transparent; background: transparent; }
.v-C .menu .btn:hover:not(:disabled) { background: var(--st-accent-tint); }
.v-C .menu .btn:disabled { background: transparent; }
@container docw (max-width: 760px) { .v-C .tb-inline { display: none; } .v-C .menu-wrap { display: block; } .v-C .toolbar { margin-right: 8px; } }
@container app (max-width: 560px) { .v-C .toolbar { margin-right: 6px; margin-top: 6px; } }

/* ---------- the sheet (document) ---------- */
.v-C .sheet { max-width: 968px; margin: 0 auto; background: var(--st-surface); border: 1px solid var(--st-border); border-radius: var(--st-radius-xl); box-shadow: var(--st-shadow-raised), var(--st-highlight-inset); padding: 40px 40px 28px; }
@container docw (max-width: 760px) { .v-C .sheet { padding: 28px 24px 20px; } }
@container app (max-width: 560px) { .v-C .sheet { border-radius: 0; border-width: 1px 0; padding: 22px 16px 18px; box-shadow: none; } }
.v-C .dochead { margin-bottom: 20px; max-width: 720px; margin-left: auto; margin-right: auto; }
.v-C .sheet > * { max-width: 968px; }
.v-C .dochead h1 { font-size: var(--st-text-2xl); line-height: 1.15; letter-spacing: -0.025em; font-weight: 700; margin-top: 4px; text-wrap: balance; }
@container app (max-width: 560px) { .v-C .dochead h1 { font-size: var(--st-text-xl); letter-spacing: -0.02em; } }
.v-C .dochead .lead { margin-top: 8px; color: var(--st-text-secondary); font-size: var(--st-text-md); line-height: 1.5; }
.v-C .meta { display: grid; gap: 4px; margin-top: 12px; font-size: var(--st-text-xs); color: var(--st-text-secondary); }
.v-C .meta p { display: flex; gap: 8px; align-items: flex-start; }
.v-C .meta p .ico { flex: none; }
@container app (max-width: 560px) { .v-C .legend .sep { display: none; } }
.v-C .meta .ico { margin-top: 2px; }
.v-C .colo { max-width: 720px; margin: 20px auto 0; padding-top: 14px; border-top: 1px solid var(--st-border); display: grid; gap: 6px; font-size: var(--st-text-xs); color: var(--st-text-secondary); }
.v-C .colo p { display: flex; gap: 8px; align-items: flex-start; }
.v-C .colo .ico { margin-top: 2px; flex: none; }
.v-C .sheet-in { max-width: 888px; margin: 0 auto; }

/* ---------- intake ---------- */
.v-C .paper { max-width: 720px; margin: 0 auto; }
.v-C .page-ta { display: block; width: 100%; min-height: 340px; resize: vertical; padding: 16px 18px; border-radius: var(--st-radius-md); border: 1px dashed var(--st-border-emphasis); background: var(--st-surface-sunken); color: var(--st-text);
  font-family: var(--st-font-sans); font-size: var(--st-text-md); line-height: 1.7; }
.v-C .page-ta::placeholder { color: var(--st-text-muted); }
.v-C .page-ta:focus-visible { outline-offset: 2px; border-style: solid; }
.v-C .sources { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 12px; }
.v-C .hintline { margin-top: 10px; font-size: var(--st-text-xs); color: var(--st-text-secondary); }
.v-C .drop-on .page-ta, .v-C .drop-on .filecard { border-style: solid; border-color: var(--st-accent); background: var(--st-accent-tint); }
.v-C .filecard { display: flex; gap: 12px; align-items: center; padding: 14px 16px; border-radius: var(--st-radius-md); border: 1px dashed var(--st-border-emphasis); background: var(--st-surface-sunken); }
.v-C .filecard .ico { width: 1.6em; height: 1.6em; color: var(--st-accent-text); }
.v-C .filecard b { overflow-wrap: anywhere; }
.v-C .regions { margin-top: 16px; display: grid; gap: 8px; }
.v-C .regions legend, .v-C .rej h3 { font-weight: 700; font-size: var(--st-text-md); margin-bottom: 4px; padding: 0; }
.v-C .rg { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 10px 12px; border-radius: var(--st-radius-md); border: 1px solid var(--st-border-strong); background: var(--st-surface); font-size: var(--st-text-sm); cursor: pointer; }
.v-C .rg input { width: 18px; height: 18px; accent-color: var(--st-accent); }
.v-C .rg span:first-of-type { overflow-wrap: anywhere; }
.v-C .rej { margin-top: 20px; }
.v-C .rej li { display: flex; gap: 10px; align-items: flex-start; justify-content: space-between; padding: 8px 0; border-top: 1px solid var(--st-border); font-size: var(--st-text-sm); }
.v-C .rej li span.t { overflow-wrap: anywhere; color: var(--st-text-secondary); }
.v-C .note-box { display: flex; gap: 10px; padding: 10px 12px; border-radius: var(--st-radius-md); border: 1px solid var(--st-border-strong); background: var(--st-surface-sunken); font-size: var(--st-text-sm); line-height: 1.45; }
.v-C .note-box .ico { margin-top: 2px; flex: none; }
.v-C .note-box.info { background: var(--st-feedback-info-tint); } .v-C .note-box.info .ico { color: var(--st-feedback-info); }
.v-C .note-box.warn { background: var(--st-feedback-warning-tint); } .v-C .note-box.warn .ico { color: var(--st-feedback-warning); }
.v-C .note-box.amend { background: var(--st-feedback-warning-tint); border-style: dashed; border-color: var(--st-feedback-warning); font-weight: 600; }
.v-C .note-box.amend .ico { color: var(--st-feedback-warning); }

/* ---------- count before start ---------- */
.v-C .count { max-width: 720px; margin: 0 auto 18px; padding: 16px 18px; border-radius: var(--st-radius-lg); background: var(--st-accent-tint); border: 1px solid var(--st-border-strong); display: grid; gap: 8px; }
.v-C .count .n { font-size: var(--st-text-lg); font-weight: 700; letter-spacing: -0.015em; display: flex; gap: 8px; align-items: center; }
.v-C .count p { font-size: var(--st-text-sm); color: var(--st-text-secondary); line-height: 1.5; }
.v-C .count .acts { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 4px; }
.v-C .cutline { grid-column: 1 / -1; display: flex; gap: 8px; align-items: center; margin: 0 -12px; padding: 8px 12px; font-size: var(--st-text-xs); font-weight: 600; color: var(--st-feedback-warning); border-top: 2px dashed var(--st-feedback-warning); }

/* ---------- lede + legend ---------- */
.v-C .summary { max-width: 720px; margin: 0 auto 18px; }
.v-C .lede { font-size: var(--st-text-xl); line-height: 1.38; letter-spacing: -0.015em; font-weight: 400; text-wrap: pretty; }
@container app (min-width: 1180px) { .v-C .lede { font-size: var(--st-text-xl); } }
@container app (max-width: 560px) { .v-C .lede { font-size: var(--st-text-md); line-height: 1.5; letter-spacing: 0; } }
.v-C .lede .vw { font: inherit; letter-spacing: inherit; color: inherit; font-weight: 700; background: transparent; border: 0; padding: 0 3px; margin: 0 -1px; border-radius: var(--st-radius-xs); cursor: pointer; text-decoration: underline; text-decoration-color: var(--vm); text-decoration-thickness: 3px; text-underline-offset: 4px; }
.v-C .lede .vw .gly { width: .78em; height: .78em; margin-right: .22em; vertical-align: -0.05em; }
.v-C .lede .vw:hover { background: var(--vt); }
.v-C .lede .vw[aria-pressed="true"] { background: var(--vt); box-shadow: 0 0 0 2px var(--vb); }
.v-C .bar { height: 6px; border-radius: var(--st-radius-full); background: var(--st-chart-track); box-shadow: inset 0 0 0 1px var(--st-border); overflow: hidden; margin-top: 12px; }
.v-C .bar i { display: block; height: 100%; background: var(--st-accent); border-radius: inherit; }
.v-C .sub { margin-top: 6px; font-size: var(--st-text-sm); color: var(--st-text-secondary); }
.v-C .legend { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 16px; }
.v-C .chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px 4px 8px; border-radius: var(--st-radius-full); border: 1px solid var(--vb, var(--st-border-strong)); background: var(--vt, var(--st-surface)); font-size: var(--st-text-xs); font-weight: 500; color: var(--st-text); cursor: pointer; line-height: 1.3; }
.v-C .chip b { font-variant-numeric: tabular-nums; font-weight: 700; }
.v-C .chip.zero { opacity: .72; }
.v-C .chip[aria-pressed="true"] { opacity: 1; outline: 2px solid var(--st-accent); outline-offset: 1px; font-weight: 700; }
.v-C .chip.status { border-style: dashed; border-color: var(--st-border-emphasis); background: var(--st-surface-sunken); }
.v-C .chip.status small { color: var(--st-text-secondary); font-size: var(--st-text-2xs); font-weight: 400; }
.v-C .legend .sep { display: none; width: 1px; align-self: stretch; background: var(--st-border-strong); margin: 0 4px; }
.v-C .legend .grp { font-size: var(--st-text-2xs); }
.v-C .keyrow { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 10px; font-size: var(--st-text-xs); color: var(--st-text-secondary); }
.v-C .fnote { display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: center; margin-top: 12px; padding: 8px 12px; border-radius: var(--st-radius-md); background: var(--st-accent-tint); font-size: var(--st-text-sm); }

/* ---------- paragraphs ---------- */
.v-C .paras { max-width: 888px; margin: 0 auto; }
.v-C .para { display: grid; grid-template-columns: 176px minmax(0, 1fr); column-gap: 24px; padding: 16px 12px; margin: 0 -12px; border-top: 1px solid var(--st-border); }
.v-C .para:first-child { border-top: 0; }
.v-C .para[aria-current="true"] { background: var(--st-accent-tint); border-radius: var(--st-radius-md); box-shadow: inset 3px 0 0 var(--st-accent); border-top-color: transparent; }
.v-C .m { display: flex; flex-direction: column; align-items: flex-end; text-align: right; gap: 4px; font-size: var(--st-text-sm); padding-top: 4px; min-width: 0; }
.v-C .ord { font-size: var(--st-text-xs); color: var(--st-text-muted); }
.v-C .vd { display: inline-flex; flex-direction: row-reverse; gap: 6px; align-items: flex-start; justify-content: flex-start; text-align: right; font-weight: 700; line-height: 1.3; }
.v-C .vd .gly, .v-C .vd .ico { margin-top: 1px; }
.v-C .vd.st { font-weight: 600; color: var(--st-text-secondary); }
.v-C .vd .st-failed { color: var(--st-feedback-danger); } .v-C .vd .st-running { color: var(--st-accent-text); }
.v-C .vd.hv { font-weight: 500; color: var(--st-text-secondary); font-size: var(--st-text-xs); opacity: .9; }
.v-C .stp { font-size: var(--st-text-xs); color: var(--st-text-secondary); line-height: 1.35; }
.v-C .tag { display: inline-flex; gap: 4px; align-items: center; padding: 1px 8px; border-radius: var(--st-radius-full); border: 1px solid var(--st-border-emphasis); font-size: var(--st-text-2xs); font-weight: 700; text-transform: uppercase; letter-spacing: var(--st-tracking-caps); color: var(--st-text-secondary); background: var(--st-surface); white-space: nowrap; }
.v-C .tag .ico { width: .95em; height: .95em; }
.v-C .tag.amend { border-style: dashed; border-color: var(--st-feedback-warning); color: var(--st-text); background: var(--st-feedback-warning-tint); text-transform: none; letter-spacing: 0; white-space: normal; }
.v-C .cite { font-size: var(--st-text-md); line-height: 1.72; max-width: 720px; overflow-wrap: anywhere; hyphens: auto; }
.v-C .para[data-st="idle"] .cite, .v-C .para[data-st="queued"] .cite, .v-C .para[data-st="not-checked"] .cite, .v-C .para[data-st="cancelled"] .cite { color: var(--st-text-secondary); }
.v-C .cite del, .v-C .cite ins { text-decoration-line: none; }
.v-C .cite del.st-del { text-decoration-line: line-through; }
.v-C .cite ins.st-ins { text-decoration-line: underline; }
.v-C .note { margin-top: 6px; font-size: var(--st-text-sm); color: var(--st-text-secondary); line-height: 1.5; max-width: 720px; overflow-wrap: anywhere; }
.v-C .pacts { display: flex; flex-wrap: wrap; gap: 6px 8px; align-items: center; margin-top: 8px; }
.v-C .pill { display: inline-flex; gap: 5px; align-items: center; padding: 1px 9px; border-radius: var(--st-radius-full); border: 1px solid var(--st-border-strong); font-size: var(--st-text-xs); color: var(--st-text-secondary); background: var(--st-surface); }
@container docw (max-width: 760px) {
  .v-C .para { grid-template-columns: minmax(0, 1fr); row-gap: 6px; }
  .v-C .m { flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: flex-start; text-align: left; gap: 4px 12px; padding-top: 0; }
  .v-C .vd { flex-direction: row; text-align: left; }
}
@container app (max-width: 560px) { .v-C .para { padding: 14px 16px; margin: 0 -16px; } .v-C .cutline { margin: 0 -16px; padding: 8px 16px; } }
.v-C .st-running { animation: c-spin .9s linear infinite; transform-box: fill-box; transform-origin: center; }
@keyframes c-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .v-C .st-running { animation: none; } }
:root[data-still] .v-C .st-running { animation: none; }

/* ---------- inspector / sheet ---------- */
.v-C .inspector { background: var(--st-surface); border: 1px solid var(--st-border); border-radius: var(--st-radius-xl); box-shadow: var(--st-shadow-raised), var(--st-highlight-inset); min-width: 0; }
@container app (min-width: 980px) {
  .v-C .inspector { position: sticky; top: calc(var(--c-top) + var(--c-stack) + 8px); max-height: calc(var(--ov-h, 100vh) - var(--c-top) - var(--c-stack) - 16px); overflow: auto; overscroll-behavior: contain; }
}
@container app (max-width: 979px) { .v-C .inspector { border-radius: 0; border-width: 0; box-shadow: none; min-height: calc(var(--ov-h, 100vh) - var(--c-top) - var(--c-stack)); } }
.v-C .insp-top { position: sticky; top: 0; z-index: 5; display: flex; gap: 8px; align-items: center; padding: 10px 12px; border-radius: 0; border-width: 0 0 1px; }
@container app (max-width: 979px) { .v-C .insp-top { top: calc(var(--c-top) + var(--c-stack)); } }
.v-C .insp-top .pos { margin-left: auto; font-size: var(--st-text-xs); color: var(--st-text-secondary); text-align: right; }
.v-C .insp-body { padding: 18px 20px 28px; display: grid; gap: 20px; }
@container app (max-width: 560px) { .v-C .insp-body { padding: 16px 16px 28px; } }
.v-C .insp-h { font-size: var(--st-text-xl); line-height: 1.2; letter-spacing: -0.02em; font-weight: 700; }
.v-C .insp-h:focus { outline: none; }
.v-C .insp-h:focus-visible { outline: 2px solid var(--st-focus-ring); outline-offset: 4px; border-radius: var(--st-radius-xs); }
.v-C .vb-h { display: flex; gap: 10px; align-items: center; }
.v-C .gly.lg { width: 1.7rem; height: 1.7rem; }
.v-C .ico.lg { width: 1.7rem; height: 1.7rem; }
.v-C .vb .reason, .v-C .vb .sys, .v-C .vb .onote { margin-top: 8px; font-size: var(--st-text-base); line-height: 1.5; color: var(--st-text-secondary); }
.v-C .vb .reason { color: var(--st-text); }
.v-C .vb .manual-line { margin-top: 8px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: var(--st-text-sm); font-weight: 600; }
.v-C .sec > h3 { margin-bottom: 8px; }
.v-C .orig { font-size: var(--st-text-md); line-height: 1.65; padding-left: 14px; border-left: 3px solid var(--st-border-emphasis); overflow-wrap: anywhere; }
.v-C .cmp { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0 12px; font-size: var(--st-text-sm); }
.v-C .cmp .ch { font-size: var(--st-text-2xs); text-transform: uppercase; letter-spacing: var(--st-tracking-caps); font-weight: 600; color: var(--st-text-muted); padding-bottom: 4px; border-bottom: 1px solid var(--st-border-strong); }
.v-C .cmp .fl { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 2px 8px; align-items: baseline; padding-top: 10px; font-weight: 700; font-size: var(--st-text-xs); }
.v-C .cmp .fl .by { font-weight: 400; color: var(--st-text-muted); font-family: var(--st-font-mono); font-size: var(--st-text-2xs); }
.v-C .cmp .fl .dv { font-weight: 700; color: var(--st-text); display: inline-flex; gap: 4px; align-items: center; padding: 0 8px; border-radius: var(--st-radius-full); background: var(--st-verdict-deviations-tint); border: 1px solid var(--st-verdict-deviations-border); }
.v-C .cmp .fl .ok { font-weight: 400; color: var(--st-text-secondary); }
.v-C .cmp .fv { overflow-wrap: anywhere; line-height: 1.45; padding: 4px 0 2px; min-width: 0; }
.v-C .cmp .unk { color: var(--st-text-muted); font-style: italic; }
.v-C .mono { overflow-wrap: anywhere; }
.v-C .fld { display: grid; gap: 4px; font-size: var(--st-text-sm); }
.v-C .fld span { font-weight: 700; font-size: var(--st-text-xs); }
.v-C .fld textarea { width: 100%; resize: vertical; min-height: 40px; padding: 8px 10px; border-radius: var(--st-radius-md); border: 1px solid var(--st-border-emphasis); background: var(--st-surface); color: var(--st-text); font: inherit; field-sizing: content; overflow-wrap: anywhere; }
.v-C .formgrid { display: grid; gap: 12px; }
.v-C .acts-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.v-C .small { font-size: var(--st-text-xs); color: var(--st-text-secondary); line-height: 1.45; }
.v-C .sugg { padding: 12px 14px; border-radius: var(--st-radius-md); border: 1px solid var(--st-border-strong); background: var(--st-surface-sunken); }
.v-C .sugg .cite { font-size: var(--st-text-base); line-height: 1.7; }
.v-C .sugg .by { margin-top: 6px; font-size: var(--st-text-2xs); color: var(--st-text-muted); font-family: var(--st-font-mono); }
.v-C .src { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 2px 10px; align-items: baseline; padding: 7px 0; border-top: 1px solid var(--st-border); font-size: var(--st-text-sm); }
.v-C .src:first-child { border-top: 0; }
.v-C .src .s-n { font-size: var(--st-text-xs); font-weight: 600; grid-column: 2; }
.v-C .src .ev { grid-row: 1 / span 2; align-self: start; padding-top: 2px; }
.v-C .src .s-t { grid-column: 2; color: var(--st-text-secondary); overflow-wrap: anywhere; }
.v-C .src .ms { grid-column: 3; grid-row: 1; font-size: var(--st-text-2xs); color: var(--st-text-muted); }
.v-C .ev.ok { color: var(--st-feedback-success); } .v-C .ev.none { color: var(--st-text-muted); } .v-C .ev.warn, .v-C .ev.diff { color: var(--st-feedback-warning); } .v-C .ev.bad { color: var(--st-feedback-danger); }
.v-C .trail li { display: flex; gap: 8px; align-items: flex-start; padding: 5px 0; font-size: var(--st-text-sm); line-height: 1.4; }
.v-C .trail li .evl { color: var(--st-text-muted); font-size: var(--st-text-xs); }
.v-C .trail li.cur { font-weight: 700; }
.v-C .trail .ico { margin-top: 2px; }
.v-C details.cand summary { cursor: pointer; font-size: var(--st-text-sm); font-weight: 600; padding: 4px 0; }
.v-C .cand li { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 2px 10px; padding: 7px 0; border-top: 1px solid var(--st-border); font-size: var(--st-text-sm); }
.v-C .cand li .sc { font-family: var(--st-font-mono); font-size: var(--st-text-xs); font-variant-numeric: tabular-nums; }
.v-C .vgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px; }
@container app (max-width: 560px) { .v-C .vgrid { grid-template-columns: 1fr; } }
.v-C .vgrid .btn { border-radius: var(--st-radius-md); background: var(--vt); border-color: var(--vb); }
.v-C .hist-box { padding: 10px 12px; border-radius: var(--st-radius-md); border: 1px dashed var(--st-border-emphasis); background: var(--st-surface-sunken); display: grid; gap: 4px; }

/* ---------- history / account ---------- */
.v-C .he { padding: 18px 0; border-top: 1px solid var(--st-border); display: grid; gap: 8px; max-width: 720px; margin: 0 auto; }
.v-C .he:first-of-type { border-top: 0; }
.v-C .he h2 { font-size: var(--st-text-lg); line-height: 1.3; letter-spacing: -0.015em; }
.v-C .he .row { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: center; font-size: var(--st-text-sm); color: var(--st-text-secondary); }
.v-C .he .chips { display: flex; flex-wrap: wrap; gap: 6px; }
.v-C .he .chips .chip { cursor: default; }
.v-C .he[data-locked] h2 { color: var(--st-text-secondary); }
.v-C .page-sec { max-width: 720px; margin: 0 auto; display: grid; gap: 14px; }
.v-C .kv { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 6px 16px; font-size: var(--st-text-sm); }
.v-C .kv dt { color: var(--st-text-secondary); } .v-C .kv dd { margin: 0; font-weight: 600; overflow-wrap: anywhere; }
.v-C .meter { height: 8px; border-radius: var(--st-radius-full); background: var(--st-chart-track); box-shadow: inset 0 0 0 1px var(--st-border); overflow: hidden; }
.v-C .meter i { display: block; height: 100%; background: var(--st-accent); }

/* ---------- overlays (sticky anchor: #app is a containing block / scroller, so no position:fixed) ---------- */
.v-C .ov { position: sticky; top: 0; height: 0; z-index: var(--st-z-command); }
.v-C .ov-in { position: absolute; left: 0; top: 0; width: 100%; height: var(--ov-h, 100vh); pointer-events: none; overflow: hidden; }
.v-C .ov-in > * { pointer-events: auto; }
.v-C .scrim { position: absolute; inset: 0; background: var(--st-scrim); backdrop-filter: blur(4px) saturate(1.1); -webkit-backdrop-filter: blur(4px) saturate(1.1); border: 0; padding: 0; cursor: default; }
.v-C .cmd, .v-C .dlg { position: absolute; left: 50%; transform: translateX(-50%); width: min(620px, calc(100% - 24px)); border-radius: var(--st-radius-2xl); }
.v-C .cmd { top: 12vh; max-height: calc(var(--ov-h, 100vh) - 12vh - 16px); display: flex; flex-direction: column; overflow: hidden; background: radial-gradient(60% 120% at 12% 0%, var(--st-glass-sheen), transparent 60%), var(--st-glass-base-overlay); backdrop-filter: blur(var(--st-glass-blur)) saturate(var(--st-glass-saturate)); -webkit-backdrop-filter: blur(var(--st-glass-blur)) saturate(var(--st-glass-saturate)); border: 1px solid var(--st-glass-border); box-shadow: var(--st-shadow-glass), inset 0 1px 0 var(--st-glass-rim-1); }
@container app (max-width: 560px) { .v-C .cmd { top: 8px; max-height: calc(var(--ov-h, 100vh) - 24px); } }
.v-C .cmd-in { display: flex; gap: 10px; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--st-border-strong); }
.v-C .cmd-in input { flex: 1; min-width: 0; background: transparent; border: 0; font: inherit; font-size: var(--st-text-md); color: var(--st-text); padding: 4px 0; }
.v-C .cmd-in input:focus-visible { outline-offset: 6px; }
.v-C .cmd-list { overflow: auto; padding: 6px; }
.v-C .cmd-list h3 { padding: 8px 10px 2px; }
.v-C .cmd-list .btn { width: 100%; border-radius: var(--st-radius-md); border-color: transparent; background: transparent; min-height: 40px; justify-content: flex-start; }
.v-C .cmd-list .btn:hover:not(:disabled), .v-C .cmd-list .btn:focus-visible { background: var(--st-accent-tint); }
.v-C .cmd-list .btn:disabled { background: transparent; }
.v-C .cmd-list .btn span.l { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.v-C .cmd-list .btn small { color: var(--st-text-secondary); font-size: var(--st-text-2xs); }
.v-C .dlg { top: 8vh; max-height: calc(var(--ov-h, 100vh) - 8vh - 16px); overflow: auto; padding: 22px 24px; background: var(--st-surface); border: 1px solid var(--st-border-strong); box-shadow: var(--st-shadow-lifted); display: grid; gap: 14px; align-content: start; }
@container app (max-width: 560px) { .v-C .dlg { top: 8px; max-height: calc(var(--ov-h, 100vh) - 24px); padding: 18px 16px; border-radius: var(--st-radius-xl); } }
.v-C .dlg h2 { font-size: var(--st-text-lg); letter-spacing: -0.015em; }
.v-C .dlg ol { list-style: decimal; padding-left: 20px; display: grid; gap: 6px; font-size: var(--st-text-sm); line-height: 1.5; }
.v-C .dlg .row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.v-C .dlg label.opt { display: inline-flex; gap: 6px; align-items: center; padding: 6px 12px; border-radius: var(--st-radius-full); border: 1px solid var(--st-border-strong); font-size: var(--st-text-sm); cursor: pointer; }
.v-C .dlg label.opt:has(input:checked) { border-color: var(--st-accent); background: var(--st-accent-tint); font-weight: 700; }
.v-C .dlg select { font: inherit; padding: 6px 10px; border-radius: var(--st-radius-md); border: 1px solid var(--st-border-strong); background: var(--st-surface); color: var(--st-text); max-width: 100%; }
.v-C .toast { position: absolute; left: 50%; bottom: 72px; transform: translateX(-50%); z-index: 3; display: flex; gap: 10px; align-items: center; width: max-content; max-width: calc(100% - 24px); padding: 8px 8px 8px 16px; border-radius: var(--st-radius-full); font-size: var(--st-text-sm); }
`;

  ST.strings({
    de: {
      currentTag: 'Aktuell', searchingIn: (n) => `Suche in ${n} …`, docTitle: 'Ihre Literaturliste', useSelection: 'Auswahl übernehmen', pasteInstead: 'Stattdessen einfügen', or: 'oder',
      pagesN: (n) => `${n} Seiten`, adopted: 'Übernommen',
      cutLine: (n, N) => `Ab hier nicht geprüft: Das Kontingent reicht nur für die ersten ${n} von ${N}.`,
      stepOf: (i, n) => `Schritt ${i} von ${n}`,
      ledeIntro: (N) => `Von ${N} Referenzen sind`,
      vClause: {
        correct: (n, f) => f ? `${n} korrekt zitiert` : `${n} ${n === 1 ? 'ist' : 'sind'} korrekt zitiert`,
        deviations: (n, f) => f ? `${n} nur mit Abweichungen vorhanden` : `${n} ${n === 1 ? 'existiert' : 'existieren'} mit Abweichungen`,
        mixed: (n, f) => f ? `${n} gemischt zitiert` : `${n} ${n === 1 ? 'ist' : 'sind'} gemischt zitiert`,
        'doi-conflict': (n, f) => f ? `${n} mit DOI-Konflikt` : `${n} ${n === 1 ? 'hat' : 'haben'} einen DOI-Konflikt`,
        'not-found': (n, f) => f ? `${n} nicht gefunden` : `${n} ${n === 1 ? 'wurde' : 'wurden'} nicht gefunden`,
        'not-verifiable': (n, f) => f ? `${n} nicht verifizierbar` : `${n} ${n === 1 ? 'ist' : 'sind'} nicht verifizierbar`
      },
      and: 'und', ledeNone: 'Noch liegt kein Urteil vor.', ledeRunning: (d, n) => `Prüfung läuft: ${d} von ${n} geprüft.`,
      keyDev: 'Wellenlinie: weicht vom besten Treffer ab', keyTrack: 'Durchgestrichen / eingefügt: Korrekturvorschlag',
      manualCount: (n) => `${n} manuell beurteilt`, filterShowing: (a, b) => `${a} von ${b} Referenzen sichtbar`, noMatch: 'Keine Referenz passt zu diesem Filter.',
      editedTag: 'Felder bearbeitet', draftTag: 'Entwurf', inputUnchanged: 'Ihre Eingabe bleibt unverändert.', undoAccept: 'Übernahme zurücknehmen',
      moreActions: 'Weitere Aktionen', detailsBtn: 'Belege und Details', toolbarLabel: 'Aktionen der Prüfung',
      howSteps: ['Die Liste wird kostenlos in einzelne Referenzen zerlegt. Erst danach wird die Anzahl der Prüfungen angezeigt.', 'Jede Referenz wird mit mehreren Datenquellen abgeglichen. Die Reihenfolge Ihrer Liste bleibt erhalten.', 'Aus den Treffern entsteht ein Urteil mit Begründung und Nachweisspur. Was unbekannt bleibt, wird als unbekannt angezeigt.', 'Ein Urteil ist ein Befund, kein Beweis für Täuschung. Die Entscheidung treffen Sie.'],
      editListStub: 'Referenzen hinzufügen oder entfernen und erkannte Bereiche korrigieren. Vor dem Übernehmen sehen Sie eine Vorschau. (Prototyp-Platzhalter)',
      close: 'Schließen', confirm: 'Bestätigen', fmtCsl: 'CSL-JSON', fmtBib: 'BibTeX',
      historyConsent: 'Mit dem Aktivieren speichern wir Ihre Prüfungen 90 Tage im Verlauf, danach werden sie gelöscht. Sie können die Einwilligung jederzeit widerrufen.',
      protoStub: 'Prototyp: nur der aktuelle Check ist hinterlegt.', downloaded: 'Download gestartet (Prototyp).', reportMade: 'Bericht wird erstellt (Prototyp).', deleted: 'Eintrag gelöscht (Prototyp).',
      openWeb: 'In der Web-App öffnen', planName: 'Plan', cmdGroups: { nav: 'Navigation', act: 'Aktionen', filter: 'Filter', ref: 'Referenzen' }, cmdNone: 'Keine Treffer.',
      filterCmd: (l, n) => `Filter: ${l} (${n})`, ev: { ok: 'Treffer', none: 'Kein Treffer', diff: 'Abweichung', bad: 'Widerspruch', warn: 'Hinweis' },
      reasonHeading: 'Begründung', manualHeading: 'Ihre Beurteilung', clearManual: 'Manuelle Beurteilung zurücknehmen', setManual: 'Wirksames Urteil wählen', sampleEdit: 'Beispieländerung einsetzen',
      totalsNote: 'Die Summen gelten für die aktuelle Liste. Verbrauchte Prüfungen können bereits abgerechnete, entfernte Referenzen enthalten.', sheetLabel: 'Details zur Referenz',
      accountEmail: 'E-Mail', signOutBtn: 'Abmelden (Prototyp: wechselt zu Gast)', newCheckNote: 'Neuer Check, neue Abrechnung.', hideDetail: 'Detail schließen', draftFor: 'Entwurf für diese Referenz', notEditable: 'Nur fertige Referenzen sind bearbeitbar.',
      copiedToast: 'Korrekturvorschlag kopiert.'
    },
    en: {
      currentTag: 'Current', searchingIn: (n) => `Searching ${n} …`, docTitle: 'Your reference list', useSelection: 'Use current selection', pasteInstead: 'Paste instead', or: 'or',
      pagesN: (n) => `${n} pages`, adopted: 'Adopted',
      cutLine: (n, N) => `Not checked from here on: your Quota covers only the first ${n} of ${N}.`,
      stepOf: (i, n) => `Step ${i} of ${n}`,
      ledeIntro: (N) => `Of ${N} References,`,
      vClause: {
        correct: (n) => `${n} ${n === 1 ? 'is' : 'are'} cited correctly`,
        deviations: (n) => `${n} ${n === 1 ? 'exists' : 'exist'} with deviations`,
        mixed: (n) => `${n} ${n === 1 ? 'is a mixed citation' : 'are mixed citations'}`,
        'doi-conflict': (n) => `${n} ${n === 1 ? 'has' : 'have'} a DOI conflict`,
        'not-found': (n) => `${n} ${n === 1 ? 'was' : 'were'} not found`,
        'not-verifiable': (n) => `${n} ${n === 1 ? 'is' : 'are'} not verifiable`
      },
      and: 'and', ledeNone: 'No Verdict yet.', ledeRunning: (d, n) => `Check in progress: ${d} of ${n} checked.`,
      keyDev: 'Wavy underline: deviates from the Best match', keyTrack: 'Struck through / inserted: Correction suggestion',
      manualCount: (n) => `${n} judged manually`, filterShowing: (a, b) => `${a} of ${b} References shown`, noMatch: 'No Reference matches this filter.',
      editedTag: 'Fields edited', draftTag: 'Draft', inputUnchanged: 'Your input is not changed.', undoAccept: 'Undo acceptance',
      moreActions: 'More actions', detailsBtn: 'Evidence and details', toolbarLabel: 'Check actions',
      howSteps: ['The list is split into individual References for free. Only then is the number of checks shown.', 'Each Reference is matched against several Data sources. The order of your list is kept.', 'The hits become a Verdict with an explanation and an evidence trail. What stays unknown is shown as unknown.', 'A Verdict is a finding, not proof of deception. You make the decision.'],
      editListStub: 'Add or remove References and correct detected regions. You see a preview before anything is applied. (prototype placeholder)',
      close: 'Close', confirm: 'Confirm', fmtCsl: 'CSL-JSON', fmtBib: 'BibTeX',
      historyConsent: 'Turning this on saves your Checks to History for 90 days, then deletes them. You can withdraw consent at any time.',
      protoStub: 'Prototype: only the current Check is stored.', downloaded: 'Download started (prototype).', reportMade: 'Report is being created (prototype).', deleted: 'Entry deleted (prototype).',
      openWeb: 'Open in the web app', planName: 'Plan', cmdGroups: { nav: 'Navigation', act: 'Actions', filter: 'Filters', ref: 'References' }, cmdNone: 'No matches.',
      filterCmd: (l, n) => `Filter: ${l} (${n})`, ev: { ok: 'Hit', none: 'No hit', diff: 'Deviation', bad: 'Conflict', warn: 'Notice' },
      reasonHeading: 'Explanation', manualHeading: 'Your judgment', clearManual: 'Clear manual judgment', setManual: 'Choose the effective Verdict', sampleEdit: 'Insert sample edit',
      totalsNote: 'Totals cover the current list. Checks used can include already billed, removed References.', sheetLabel: 'Reference details',
      accountEmail: 'Email', signOutBtn: 'Sign out (prototype: switches to Guest)', newCheckNote: 'New Check, new billing.', hideDetail: 'Close detail', draftFor: 'Draft for this Reference', notEditable: 'Only finished References can be edited.',
      copiedToast: 'Correction suggestion copied.'
    }
  });

  ST.variant({
    key: 'C', name: 'Document / report-first', css,
    mount(root, ctx) {
      const s = ST.state, panel = ctx.surface === 'panel';
      const app = document.getElementById('app');
      const esc = ST.esc, t = ST.t, L = ST.L, gly = ST.gly, ico = ST.ico, eff = ST.effective;
      const VERDICTS = ['correct', 'deviations', 'mixed', 'doi-conflict', 'not-found', 'not-verifiable'];
      const V = (v) => t('verdict')[v], VS = (v) => t('verdictShort')[v], SL = (x) => t('status')[x];
      const K = (x) => `data-k="${x}"`;
      const isMac = /Mac|iPhone|iPad/.test(navigator.platform || '');
      const kbd = isMac ? '⌘K' : 'Ctrl K';
      const ui = { menu: false, cmdQ: '', cmdItems: [], fmt: 'csl', style: 'APA 7', manual: {}, cand: {}, restoreK: null, drop: false };
      let typing = false, toastTimer = null, lastToast = null, lastLive = '';
      let prevSel = s.selected, prevOverlay = null, prevView = s.view, prevCmd = s.cmdOpen;

      root.innerHTML = '<div class="sr-only" role="status" aria-live="polite" data-live></div><div class="c-view"></div>';
      const view = root.querySelector('.c-view'), live = root.querySelector('[data-live]');

      /* ---------- scroll helpers (window on web, #app in the panel) ---------- */
      const getY = () => panel ? app.scrollTop : window.scrollY;
      const setY = (y) => { if (panel) app.scrollTop = y; else window.scrollTo(0, y); };
      const isSheet = () => app.clientWidth < 980;
      const vh = () => panel ? app.clientHeight : window.innerHeight;

      /* ---------- small builders ---------- */
      const B = (cls, key, act, label, extra = '') => `<button type="button" class="btn ${cls}" ${K(key)} data-a="${act}" ${extra}>${label}</button>`;
      const metaText = (r) => Array.isArray(r.meta) ? L(r.meta) : r.meta;
      const sec = (title, inner, cls = '') => `<section class="sec ${cls}"><h3 class="eyebrow">${title}</h3>${inner}</section>`;
      const stepText = (r) => {
        const it = r.trail[Math.max(r.step - 1, 0)];
        const one = (x) => x[0] === 's' ? t('searchingIn', L(x[1])) : L(x[1]);
        if (!it || r.step === 0) return r.trail[0] ? one(r.trail[0]) : t('step').scoring;
        return one(it);
      };
      const progressOf = () => {
        const scope = s.refs.filter((r) => r.status !== 'not-checked').length;
        const d = s.refs.filter((r) => r.status === 'done' || r.status === 'failed' || r.status === 'cancelled').length;
        return { scope, d };
      };

      /* citation text with deviating parts marked inline */
      function cite(r, marks) {
        const rows = marks && r.revision === 1 && r.status === 'done' ? ST.rows(r) : null;
        const dev = {}; if (rows) rows.forEach((x) => { if (x.deviates) dev[x.key] = x.yours; });
        const w = (txt, key) => dev[key] != null ? `<span class="st-dev">${esc(txt)}</span><span class="sr-only"> (${t('deviates')})</span>` : esc(txt);
        const m = metaText(r); const ranges = [];
        for (const key of Object.keys(dev)) { if (key === 'author' || key === 'year' || key === 'title') continue; const v = dev[key]; const i = v ? m.indexOf(v) : -1; if (i >= 0) ranges.push([i, i + v.length]); }
        ranges.sort((a, b) => a[0] - b[0]);
        let p = 0, mh = '';
        for (const [a, b] of ranges) { if (a < p) continue; mh += esc(m.slice(p, a)) + `<span class="st-dev">${esc(m.slice(a, b))}</span><span class="sr-only"> (${t('deviates')})</span>`; p = b; }
        mh += esc(m.slice(p));
        return `${w(r.au, 'author')} (${w(r.yr, 'year')}). ${w(r.title, 'title')}. ${mh}.`;
      }
      const trackHTML = (r, final) => r.suggestion.track.map((p) => typeof p === 'string' ? esc(p) : Array.isArray(p) ? (final ? esc(p[1]) : `<del class="st-del">${esc(p[0])}</del><ins class="st-ins">${esc(p[1])}</ins>`) : `<i>${esc(p.i)}</i>`).join('');
      const trackText = (r) => r.suggestion.track.map((p) => typeof p === 'string' ? p : Array.isArray(p) ? p[1] : p.i).join('');
      const hasSugg = (r) => r.suggestion && r.status === 'done' && r.revision === 1;

      /* ---------- shell ---------- */
      function topbar() {
        const nav = [['check', 'navCheck'], ['history', 'navHistory'], ['account', 'navAccount']];
        return `<header class="top st-glass"><div class="top-in">
          <button type="button" class="brand" ${K('brand')} data-a="nav" data-v="check" aria-label="${t('productName')}">${ST.mark(24, 'mark-sm')}<span class="bn">${t('productName')}</span></button>
          <nav aria-label="${t('navLabel')}">${nav.map(([v, key]) => `<button type="button" ${K('nav-' + v)} data-a="nav" data-v="${v}" ${s.view === v ? 'aria-current="page"' : ''}>${t(key)}</button>`).join('')}</nav>
          <button type="button" class="cmdbtn" ${K('cmdbtn')} data-a="cmd" aria-haspopup="dialog" aria-label="${t('cmdHint')} (${kbd})">${ico('i-search')}<span class="hint">${t('cmdHint')}</span><kbd>${kbd}</kbd></button>
        </div></header>`;
      }
      function reconBanner() {
        return s.connection === 'reconnecting' ? `<div class="recon" role="status" ${K('recon')}>${ico('i-wifi-off')}<span>${t('reconnecting')}</span></div>` : '';
      }
      function docHead(intake) {
        const histEntry = ST.HISTORY[0];
        const storage = s.historyOn ? t('storageHistory', ST.date(histEntry.deletes)) : t('storageTemp');
        return `<header class="dochead">
          <span class="eyebrow">${t('navCheck')}</span>
          <h1>${intake ? t('intakeTitle') : (s.intakeSource === 'file' ? esc(ST.DOCUMENT.name) : t('docTitle'))}</h1>
          ${intake ? `<p class="lead">${t('intakeLead')}</p>` : ''}
          <div class="meta">
            <p>${ico(s.historyOn ? 'i-history' : 'i-shield')}<span>${storage}</span></p>
            ${s.account === 'guest' ? `<p>${ico('i-user')}<span>${t('guestNotice')} <button type="button" class="link" ${K('signin')} data-a="signin">${t('signIn')}</button></span></p>` : ''}
          </div></header>`;
      }
      function colophon() {
        const used = s.refs.filter((r) => r.status === 'done').length;
        return `<footer class="colo">
          <p>${ico('i-info')}<span>${t('disclaimer')} <button type="button" class="link" ${K('how-link')} data-a="dialog" data-v="how">${t('howItWorks')}</button></span></p>
          ${s.stage === 'running' || s.stage === 'done' ? `<p>${ico('i-list')}<span>${t('consumed', used)} · ${t('totalsNote')}</span></p>` : ''}
        </footer>`;
      }

      /* ---------- toolbar (sticky, right-aligned) ---------- */
      function toolbar() {
        const busy = ST.isBusy(), run = s.stage === 'running' || s.stage === 'done';
        const items = [{ k: 'how', a: 'dialog', v: 'how', icon: 'i-help', label: t('howItWorks') }];
        if (run) items.push({ k: 'edit', a: 'dialog', v: 'editlist', icon: 'i-edit-list', label: t('editList'), disabled: busy, why: t('editListGated') },
          { k: 'export', a: 'dialog', v: 'export', icon: 'i-download', label: t('exportAction') }, { k: 'report', a: 'dialog', v: 'report', icon: 'i-pdf', label: t('reportAction') });
        const item = (it, pre) => `<button type="button" class="btn ${pre === 'tb-' ? 'sm' : ''}" ${K(pre + it.k)} data-a="${it.a}" data-v="${it.v}" ${it.disabled ? `disabled aria-describedby="why-${pre}${it.k}"` : ''}>${ico(it.icon)}<span>${it.label}${it.disabled ? `<small class="why" id="why-${pre}${it.k}">${it.why}</small>` : ''}</span></button>`;
        let prim = '', hint = '';
        if (s.stage === 'intake') {
          const ok = ST.act.canStart();
          prim = B('primary', 'check', 'check', `${ico('i-check')}${t('checkAction')}`, ok ? '' : 'disabled aria-describedby="chk-hint"');
          hint = `<span class="check-hint" id="chk-hint" ${ok ? 'hidden' : ''}>${t('checkDisabledHint')}</span>`;
        } else {
          if (s.stage === 'running') prim += B('sm', 'stop', 'stop', `${ico('i-stop')}${t('stop')}`);
          prim += B('sm', 'reset', 'reset', `${ico('i-reset')}${t('reset')}`);
        }
        return `<div class="toolbar st-glass quiet" role="toolbar" aria-label="${t('toolbarLabel')}">${hint}
          <div class="tb-inline">${items.map((it) => item(it, 'tb-')).join('')}</div>
          <div class="menu-wrap"><button type="button" class="btn sm" ${K('menu')} data-a="menu" aria-expanded="${ui.menu}" aria-controls="tb-menu">${ico('i-more')}${t('moreActions')}</button>
            ${ui.menu ? `<div class="menu" id="tb-menu">${items.map((it) => item(it, 'm-')).join('')}</div>` : ''}</div>
          <div class="tb-prim">${prim}</div></div>`;
      }

      /* ---------- intake: the empty page ---------- */
      function intake() {
        const src = s.intakeSource;
        let body = '';
        if (src === 'file') {
          const D = ST.DOCUMENT;
          body = `<div class="filecard">${ico('i-doc')}<div><b>${esc(D.name)}</b><div class="small">${t('pagesN', D.pages)} · ${D.size}</div></div></div>
            ${s.account === 'guest' ? `<div class="note-box info" style="margin-top:12px">${ico('i-info')}<span>${t('aiGuest')}</span></div>` : ''}
            <fieldset class="regions"><legend>${t('regionsHeading')}</legend><p class="small">${t('regionsHint')}</p>
              ${s.regions.map((r) => `<label class="rg"><input type="checkbox" ${K('rg-' + r.id)} data-a="region" data-id="${r.id}" ${r.selected ? 'checked' : ''}><span>${L(r.label)}</span><span class="mono tnum">${t('historyCount', r.count)}</span></label>`).join('')}
            </fieldset>
            <section class="rej" aria-labelledby="rej-h"><h3 id="rej-h">${t('rejectedHeading')}</h3><ul>
              ${s.rejected.map((x) => `<li><span class="t">${esc(L(x.text))}</span>${x.adopted ? `<span class="pill">${ico('i-check')}${t('adopted')}</span>` : B('sm', 'adopt-' + x.id, 'adopt', t('rejectedAdopt'), `data-id="${x.id}"`)}</li>`).join('')}</ul></section>
            <div class="sources">${B('quiet sm', 'paste-instead', 'paste', `${ico('i-back')}${t('pasteInstead')}`)}</div>`;
        } else {
          body = `${src === 'selection' ? `<div class="note-box info" style="margin-bottom:12px">${ico('i-info')}<span>${t('selectionTaken', ST.SELECTION.count, esc(ST.SELECTION.page))}</span></div>` : ''}
            <textarea class="page-ta" ${K('ta')} data-intake aria-label="${t('intakeTitle')}" placeholder="${esc(t('intakePlaceholder'))}" spellcheck="false">${esc(s.input)}</textarea>
            <div class="sources">${B('', 'example', 'example', `${ico('i-plus')}${t('intakeExample')}`)}${B('', 'file', 'file', `${ico('i-upload')}${t('intakeFile')}`)}${panel ? B('', 'selection', 'selection', `${ico('i-panel')}${t('useSelection')}`) : ''}</div>
            <p class="hintline">${t('intakeHint')} ${t('intakeDrop')} · ${t('intakeFormats')}</p>`;
        }
        return `<div class="paper ${ui.drop ? 'drop-on' : ''}" data-drop>${body}</div>`;
      }

      /* ---------- count before start ---------- */
      function countBlock() {
        const N = s.refs.length, av = ST.available();
        if (s.stage === 'structuring') return `<div class="count" role="status"><div class="n">${ST.stat('running')}${t('step').structuring}</div></div>`;
        const enough = av >= N;
        if (enough) return `<div class="count"><div class="n">${ico('i-list')}<span class="tnum">${t('detected', N)}</span></div><p>${t('quotaPreview', N, av, av - N)}</p><p>${ico('i-play' in {} ? 'i-arrow' : 'i-arrow')} ${t('autoStart')}</p></div>`;
        return `<div class="count"><div class="n">${ico('i-list')}<span class="tnum">${t('detected', N)}</span></div>
          <div class="note-box warn">${ico('i-info')}<div><b>${t('quotaChoiceHeading')}</b><p style="margin-top:4px">${t('quotaChoiceBody', N, av)}</p></div></div>
          <div class="acts">${B('primary', 'first-n', 'run', `${ico('i-check')}${t('quotaChoiceFirst', av)}`, `data-n="${av}"`)}
            ${panel ? `<a class="link" href="#" ${K('plan-link')} data-a="weblink">${ico('i-ext')} ${t('quotaUpgradeWeb')}</a>` : B('quiet sm', 'plan', 'nav', t('quotaUpgrade'), 'data-v="account"')}</div></div>`;
      }

      /* ---------- lede + legend ---------- */
      function summary() {
        const c = ST.counts(), N = s.refs.length, { scope, d } = progressOf();
        const run = s.stage === 'running';
        let lede;
        if (run) {
          lede = `<p class="lede">${t('ledeRunning', d, scope)} ${t('orderNote')}</p><div class="bar" aria-hidden="true"><i style="width:${scope ? Math.round(100 * d / scope) : 0}%"></i></div>`;
        } else {
          const present = VERDICTS.filter((v) => c.verdicts[v] > 0);
          const clauses = present.map((v, i) => `<button type="button" class="vw" ${K('lede-' + v)} data-a="filter" data-v="${v}" aria-pressed="${s.filter === v}">${gly(v)}${t('vClause')[v](c.verdicts[v], i === 0)}</button>`);
          const join = clauses.length > 1 ? clauses.slice(0, -1).join(', ') + ` ${t('and')} ` + clauses[clauses.length - 1] : clauses[0] || '';
          lede = `<p class="lede">${present.length ? `${t('ledeIntro', N)} ${join}.` : t('ledeNone')}</p>`;
        }
        const manual = s.refs.filter((r) => r.status === 'done' && r.override).length;
        const stTotal = Object.values(c.statuses).reduce((a, b) => a + b, 0);
        const stDetail = Object.entries(c.statuses).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${SL(k)}`).join(' · ');
        const legend = `<div class="legend" role="group" aria-label="${t('filterActive')}">
          ${VERDICTS.map((v) => `<button type="button" class="chip ${c.verdicts[v] ? '' : 'zero'}" ${K('f-' + v)} data-a="filter" data-v="${v}" data-v-attr data-v2 aria-pressed="${s.filter === v}" data-v="${v}">${gly(v)}<span>${VS(v)}</span><b>${c.verdicts[v]}</b>${s.filter === v ? ico('i-check') : ''}</button>`).join('')}
          ${stTotal ? `<span class="sep" aria-hidden="true"></span><button type="button" class="chip status" ${K('f-status')} data-a="filter" data-v="status" aria-pressed="${s.filter === 'status'}"><span>${t('statusesHeading')}</span><b>${stTotal}</b><small>${stDetail}</small>${s.filter === 'status' ? ico('i-check') : ''}</button>` : ''}
          ${manual ? `<span class="pill">${ico('i-pen')}${t('manualCount', manual)}</span>` : ''}</div>
          <div class="keyrow"><span><span class="st-dev">${t('deviates')}</span> — ${t('keyDev')}</span><span><del class="st-del">a</del><ins class="st-ins">b</ins> — ${t('keyTrack')}</span>
            <span>${t('quotaLabel')}: ${t('quotaMeter', ST.available(), s.quota.granted)}${s.quota.reserved ? ' · ' + t('quotaReserved', s.quota.reserved) : ''}</span></div>`;
        let fnote = '';
        if (s.filter) {
          const label = s.filter === 'status' ? t('statusesHeading') : V(s.filter);
          fnote = `<div class="fnote"><span>${t('filterActive')}: <b>${label}</b> · ${t('filterShowing', ST.visible().length, N)}</span>${B('sm', 'fclear', 'filter-clear', `${ico('i-x')}${t('filterClear')}`)}</div>`;
        }
        return `<section class="summary" aria-label="${t('done')}">${lede}${legend}${fnote}</section>`;
      }

      /* ---------- the annotated paragraphs ---------- */
      function margin(r, i) {
        const st = r.status; let h = `<span class="ord mono tnum" aria-hidden="true">${i + 1}</span>`;
        if (st === 'done') {
          const e = eff(r);
          h += `<span class="vd">${gly(e)}<span>${V(e)}</span></span>`;
          if (r.override) h += `<span class="tag">${ico('i-pen')}${t('manualTag')}</span>`;
          if (r.revision > 1) h += `<span class="stp">${t('editedTag')}</span>`;
        } else if (st === 'rechecking') {
          h += `<span class="vd st">${ST.stat('running')}<span>${t('recheckRunning')}</span></span><span class="stp">${t('stepOf', r.step, r.trail.length)}</span>`;
          if (r.hist && r.hist.verdict) h += `<span class="vd hv">${gly(r.hist.verdict)}<span>${t('historicalResult')}: ${V(r.hist.verdict)}</span></span>`;
        } else if (st === 'running') {
          h += `<span class="vd st">${ST.stat('running')}<span>${SL('running')}</span></span><span class="stp">${t('stepOf', r.step, r.trail.length)}</span><span class="stp">${esc(stepText(r))}</span>`;
        } else if (st !== 'idle') {
          h += `<span class="vd st">${ST.stat(st)}<span>${SL(st)}</span></span>`;
        }
        if (r.draft) h += `<span class="tag">${ico('i-pen')}${t('draftTag')}</span>`;
        return `<div class="m">${h}</div>`;
      }
      function paragraph(r, i) {
        const st = r.status, N = s.refs.length;
        let text;
        if (hasSugg(r) && r.accepted && s.corrModel === 'apply') text = trackHTML(r, true);
        else if (hasSugg(r)) text = trackHTML(r, false);
        else text = cite(r, true);
        let note = '';
        if (st === 'done' || st === 'failed') note = esc(L(r.reason));
        else if (st === 'rechecking') note = esc(stepText(r));
        const pills = [];
        if (hasSugg(r) && r.accepted && s.corrModel === 'apply') pills.push(`<span class="tag">${ico('i-check')}${t('corrected')}</span><span class="tag amend">${ico('i-info')}${t('needsAmendment')}</span>`);
        if (hasSugg(r) && r.exportPick && s.corrModel === 'export') pills.push(`<span class="pill">${ico('i-check')}${t('usedForExport')}</span>`);
        const showOpen = st !== 'idle' && st !== 'queued';
        const open = showOpen ? B('sm', 'open-' + r.id, 'open', `${t('detailsBtn')}${ico('i-chev')}<span class="sr-only"> · ${t('refPos', i + 1, N)}</span>`, `data-id="${r.id}" aria-label="${esc(t('detailsBtn'))} · ${esc(t('refPos', i + 1, N))}"`) : '';
        const stFlag = st === 'rechecking' ? 'running' : st;
        return `<li class="para" data-id="${r.id}" data-st="${stFlag}" ${st === 'done' ? `data-v="${eff(r)}"` : ''} ${s.selected === r.id ? 'aria-current="true"' : ''}>
          ${margin(r, i)}
          <div class="body"><p class="cite">${text}</p>${note ? `<p class="note">${note}</p>` : ''}
            ${pills.length || open ? `<div class="pacts">${open}${pills.join('')}</div>` : ''}</div></li>`;
      }
      function paragraphs() {
        const counted = s.stage === 'structuring' || s.stage === 'counted';
        const list = counted ? s.refs : ST.visible();
        if (!list.length) return `<p class="sub paper" style="margin:16px auto">${t('noMatch')}</p>`;
        const short = s.stage === 'counted' && ST.available() < s.refs.length;
        const n = ST.available();
        let h = '';
        list.forEach((r) => {
          const i = s.refs.indexOf(r);
          if (short && i === n) h += `<li class="cutline" role="note">${ico('i-info')}${t('cutLine', n, s.refs.length)}</li>`;
          h += paragraph(r, i);
        });
        return `<ol class="paras" aria-label="${t('docTitle')}">${h}</ol>`;
      }

      /* ---------- check view ---------- */
      function checkView() {
        const stg = s.stage; let body;
        if (stg === 'intake') body = intake();
        else body = (stg === 'structuring' || stg === 'counted' ? countBlock() : summary()) + paragraphs();
        return `<div class="docwrap">${toolbar()}<article class="sheet" aria-label="${t('docTitle')}">${docHead(stg === 'intake')}<div class="sheet-in">${body}</div>${colophon()}</article></div>`;
      }

      /* ---------- inspector ---------- */
      function inspector(r) {
        const i = s.refs.indexOf(r), N = s.refs.length, st = r.status, vis = ST.visible();
        const top = `<div class="insp-top st-glass quiet">${B('sm', 'back', 'back', `${ico('i-back')}${t('back')}`, `aria-label="${esc(t('back'))}"`)}
          <span class="pos">${t('refPos', i + 1, N)}</span>
          <button type="button" class="btn sm" ${K('prev')} data-a="step" data-d="-1" aria-label="${esc(t('prev'))}" ${vis.length < 2 ? 'disabled' : ''}>${ico('i-back')}</button>
          <button type="button" class="btn sm" ${K('next')} data-a="step" data-d="1" aria-label="${esc(t('next'))}" ${vis.length < 2 ? 'disabled' : ''}>${ico('i-chev')}</button></div>`;
        let vb = '';
        if (st === 'done') {
          const e = eff(r);
          vb = `<div class="vb" data-v="${e}"><div class="vb-h">${gly(e, 'lg')}<h2 class="insp-h" tabindex="-1" ${K('insp-h')}>${V(e)}</h2></div>`;
          if (r.override) vb += `<p class="manual-line"><span class="tag">${ico('i-pen')}${t('manualTag')}</span>${t('manualVerdict', V(e))}</p><p class="sys">${t('systemVerdict', V(r.verdict))}</p>${r.override.note ? `<p class="onote">${esc(L(r.override.note))}</p>` : ''}`;
          vb += `<p class="reason">${esc(L(r.reason))}</p></div>`;
        } else if (st === 'failed') {
          vb = `<div class="vb"><div class="vb-h">${ST.stat('failed', 'lg')}<h2 class="insp-h" tabindex="-1" ${K('insp-h')}>${SL('failed')}</h2></div><p class="reason">${esc(L(r.reason))}</p>
            <div class="acts-row" style="margin-top:12px">${B('primary', 'retry', 'retry', `${ico('i-undo')}${t('retry')}`, `data-id="${r.id}"`)}</div></div>`;
        } else if (st === 'rechecking') {
          vb = `<div class="vb"><div class="vb-h">${ST.stat('running', 'lg')}<h2 class="insp-h" tabindex="-1" ${K('insp-h')}>${t('recheckRunning')}</h2></div><p class="reason">${esc(stepText(r))} · ${t('stepOf', r.step, r.trail.length)}</p>
            ${r.hist ? `<div class="hist-box" style="margin-top:12px"><span class="eyebrow">${t('historicalResult')}</span><span class="vd">${gly(r.hist.verdict)}<span>${V(r.hist.verdict)}</span></span></div>` : ''}</div>`;
        } else {
          vb = `<div class="vb"><div class="vb-h">${ST.stat(st === 'idle' ? 'queued' : st, 'lg')}<h2 class="insp-h" tabindex="-1" ${K('insp-h')}>${SL(st === 'idle' ? 'queued' : st)}</h2></div>${st === 'running' ? `<p class="reason">${esc(stepText(r))} · ${t('stepOf', r.step, r.trail.length)}</p>` : ''}</div>`;
        }

        /* original input + field comparison / edit */
        let cmp;
        const rows = ST.rows(r);
        if (r.draft) {
          cmp = `<div class="formgrid"><p class="small">${t('draftNote')}</p>
            ${Object.keys(r.draft).map((key) => `<label class="fld"><span>${L(ST.FIELDS[key] || [key, key])}</span><textarea rows="1" ${K('d-' + key)} data-draft="${key}" data-id="${r.id}">${esc(r.draft[key])}</textarea></label>`).join('')}
            ${r.recheck && r.draft.title === r.title ? `<div>${B('quiet sm', 'sample', 'sample', t('sampleEdit'), `data-id="${r.id}"`)}</div>` : ''}
            <div class="acts-row">${B('primary', 'save', 'save', `${ico('i-undo')}${t('saveRecheck')}`, `data-id="${r.id}"`)}${B('', 'discard', 'discard', t('discardDraft'), `data-id="${r.id}"`)}</div>
            <p class="small">${t('recheckFree')}</p></div>`;
        } else if (rows) {
          cmp = `<div class="cmp"><div class="ch">${t('yours')}</div><div class="ch">${t('bestMatch')}</div>
            ${rows.map((x) => {
              const val = (v) => v == null || v === '' ? `<span class="unk">${t('unknown')}</span>` : esc(v);
              return `<div class="fl"><span>${x.label}</span>${x.deviates ? `<span class="dv">${ico('i-info')}${t('deviates')}</span>` : `<span class="ok">${t('matches')}</span>`}<span class="by">${(x.by || []).map(esc).join(' · ')}</span></div>
                <div class="fv"><span class="sr-only">${t('yours')}: </span>${x.deviates ? `<span class="st-dev">${val(x.yours)}</span>` : val(x.yours)}</div>
                <div class="fv"><span class="sr-only">${t('bestMatch')}: </span>${val(x.best)}</div>`;
            }).join('')}</div>`;
        } else {
          cmp = `<div class="note-box">${ico('i-info')}<span>${t('noCandidate')}</span></div>`;
        }
        const canEdit = st === 'done' && !r.draft;
        const editBtn = canEdit ? `<div class="acts-row" style="margin-top:12px">${B('', 'edit', 'edit', `${ico('i-pen')}${t('editFields')}`, `data-id="${r.id}"`)}</div>` : '';
        const orig = sec(t('original'), `<blockquote class="orig">${cite(r, true)}</blockquote>`);
        const fields = sec(t('compare'), cmp + editBtn);

        /* historical result while re-checking */
        const histSec = st === 'rechecking' && r.hist ? sec(t('historicalResult'), `<div class="hist-box"><span class="vd">${gly(r.hist.verdict)}<span>${V(r.hist.verdict)}</span></span><span class="small">${t('recheckFree')}</span></div>`) : '';

        /* correction suggestion + the three models */
        let sugg = '';
        if (hasSugg(r)) {
          const m = s.corrModel; let acts = '';
          if (!r.draft) {
            if (m === 'export') acts = `${B('', 'pick', 'pickexport', r.exportPick ? `${ico('i-check')}${t('usedForExport')}` : t('useForExport'), `data-id="${r.id}" aria-pressed="${r.exportPick}"`)}<p class="small" style="flex-basis:100%">${t('useForExportNote')} <b>${t('inputUnchanged')}</b></p>`;
            else if (m === 'draft') acts = `${B('', 'applyf', 'edit-sug', `${ico('i-pen')}${t('applyToFields')}`, `data-id="${r.id}"`)}<p class="small" style="flex-basis:100%">${t('applyToFieldsNote')}</p>`;
            else acts = `${B('', 'accept', 'accept', r.accepted ? `${ico('i-undo')}${t('undoAccept')}` : `${ico('i-check')}${t('acceptCorrection')}`, `data-id="${r.id}"`)}<div class="note-box amend" style="flex-basis:100%">${ico('i-info')}<span>${t('needsAmendment')}</span></div>${r.accepted ? `<p class="small" style="flex-basis:100%">${t('acceptedNote')}</p>` : ''}`;
          }
          sugg = sec(t('suggestionHeading'), `<div class="sugg"><p class="cite">${trackHTML(r, r.accepted && m === 'apply')}</p><p class="by">${esc(r.suggestion.style)} · ${t('backedBy')}: ${r.suggestion.by.map(esc).join(' · ')}</p></div>
            <div class="acts-row" style="margin-top:10px">${B('sm', 'copy', 'copy', `${ico('i-copy')}${t('copy')}`, `data-id="${r.id}"`)}${acts}</div>`);
        }

        /* manual judgment */
        let manual = '';
        if (st === 'done' && r.sysVerdict) {
          const open = !!ui.manual[r.id];
          manual = sec(t('manualHeading'), `<div class="acts-row">
              ${!r.override ? B('', 'confirmv', 'override', `${ico('i-check')}${t('confirmVerdict')}`, `data-id="${r.id}" data-v="${r.verdict}"`) : ''}
              ${B('', 'judge', 'toggle-manual', `${ico('i-pen')}${t('judgeManually')}`, `data-id="${r.id}" aria-expanded="${open}"`)}
              ${r.override ? B('sm', 'clearov', 'clearov', t('clearManual'), `data-id="${r.id}"`) : ''}</div>
            ${open ? `<div class="vgrid" role="group" aria-label="${t('setManual')}">${VERDICTS.map((v) => `<button type="button" class="btn" ${K('ov-' + v)} data-a="override" data-id="${r.id}" data-v="${v}" data-v="${v}" aria-pressed="${!!r.override && r.override.verdict === v}">${gly(v)}${V(v)}</button>`).join('')}</div>` : ''}
            <p class="small" style="margin-top:8px">${t('overrideNote')}</p>`);
        }

        /* sources, candidates, trail */
        const srcs = sec(t('sourcesHeading'), `<ul>${r.srcs.map(([src, res, txt, ms]) => `<li class="src"><span class="ev ${res}">${ico('e-' + res)}<span class="sr-only">${t('ev')[res]}</span></span><span class="s-n mono">${esc(src)}</span><span class="s-t">${esc(L(txt))}</span><span class="ms tnum">${ms ? ms + ' ms' : '—'}</span></li>`).join('')}</ul>`);
        const cands = r.candidates ? `<details class="cand" ${K('cand-' + r.id)} data-cand="${r.id}" ${ui.cand[r.id] ? 'open' : ''}><summary>${t('candidatesHeading')} (${r.candidates.length})</summary><ul>${[...r.candidates].sort((a, b) => b.score - a.score).map((c) => `<li><span class="sc">${t('score')} ${c.score.toFixed(2)}</span><span><span class="mono">${esc(c.src)}</span> · ${esc(c.title)} (${esc(c.yr)})</span></li>`).join('')}</ul></details>` : '';
        const shown = st === 'running' || st === 'rechecking' ? r.trail.slice(0, r.step) : st === 'queued' || st === 'idle' ? [] : r.trail;
        const trail = shown.length ? sec(t('trailHeading'), `<ol class="trail">${shown.map(([kind, txt, res], j) => `<li class="${(st === 'running' || st === 'rechecking') && j === shown.length - 1 ? 'cur' : ''}"><span class="ev ${res}">${ico(kind === 'e' ? 'e-end' : 'e-' + res)}</span><span>${kind === 's' ? `<span class="mono">${esc(L(txt))}</span> <span class="evl">${t('ev')[res]}</span>` : esc(L(txt))}</span></li>`).join('')}</ol>`) : '';

        return `<div class="chrome-wrap">${top}<div class="insp-body">${vb}${orig}${histSec}${fields}${sugg}${manual}${srcs}${cands ? `<div>${cands}</div>` : ''}${trail}</div></div>`;
      }

      /* ---------- history / account ---------- */
      function historyView() {
        let body;
        if (!s.historyOn) {
          body = `<div class="page-sec"><div class="note-box info">${ico('i-info')}<span>${t('historyOff')}</span></div><p class="small">${t('historyConsent')}</p><div>${B('primary', 'hist-on', 'hist-on', t('historyEnable'))}</div></div>`;
        } else {
          body = ST.HISTORY.map((h) => `<article class="he" ${h.locked ? 'data-locked' : ''}>
            <h2>${esc(L(h.name))}${h.current ? ` <span class="tag">${t('currentTag')}</span>` : ''}</h2>
            <div class="row"><span class="mono tnum">${ST.date(h.date)}</span><span>${t('historyCount', h.refs)}</span><span>${t('historyExpires', ST.date(h.deletes))}</span></div>
            <div class="chips">${Object.entries(h.counts).map(([v, n]) => `<span class="chip" data-v="${v}">${gly(v)}<span>${VS(v)}</span><b>${n}</b></span>`).join('')}</div>
            ${h.locked ? `<p class="small">${ico('i-lock')} ${t('historyLocked')}</p>` : ''}
            <div class="acts-row">${B('', 'ho-' + h.id, 'hist-open', t('historyOpen'), `data-id="${h.id}" ${h.locked ? 'disabled' : ''}`)}${B('', 'hn-' + h.id, 'hist-new', `${ico('i-undo')}${t('historyRestart')}`, `data-id="${h.id}" ${h.locked ? 'disabled' : ''}`)}${B('quiet danger sm', 'hd-' + h.id, 'hist-del', `${ico('i-trash')}${t('historyDelete')}`, `data-id="${h.id}"`)}</div>
            ${h.locked ? '' : `<div class="note-box warn">${ico('i-info')}<span>${t('historyBillable', h.refs)}</span></div>`}</article>`).join('');
        }
        return `<div class="docwrap"><article class="sheet"><header class="dochead"><span class="eyebrow">${t('navHistory')}</span><h1>${t('historyHeading')}</h1></header><div class="sheet-in">${body}</div>${colophon()}</article></div>`;
      }
      function accountView() {
        const A = ST.account || ST.ACCOUNT, acc = ST.ACCOUNT[s.account] || ST.ACCOUNT.guest, guest = s.account === 'guest';
        const rem = ST.available(), gr = s.quota.granted;
        const body = `<div class="page-sec"><p class="small" style="font-size:var(--st-text-sm)">${t('accountStub')}</p>
          <dl class="kv"><dt>${t('navAccount')}</dt><dd>${guest ? t('guest') : esc(acc.name)}</dd>
            ${guest ? '' : `<dt>${t('accountEmail')}</dt><dd>${esc(acc.email)}</dd>`}
            <dt>${t('planName')}</dt><dd>${guest ? t('guest') : esc(acc.plan)}</dd></dl>
          ${guest ? `<div class="note-box info">${ico('i-user')}<span>${t('guestNotice')}</span></div><div>${B('primary', 'signin', 'signin', t('signIn'))}</div>` : `<div>${B('', 'signout', 'signout', `${ico('i-user')}${t('signOutBtn')}`)}</div>`}
          <section aria-labelledby="q-h"><h3 class="eyebrow" id="q-h">${t('quotaLabel')}</h3><p style="margin:6px 0">${t('quotaMeter', rem, gr)}${s.quota.reserved ? ' · ' + t('quotaReserved', s.quota.reserved) : ''}</p><div class="meter" aria-hidden="true"><i style="width:${Math.round(100 * rem / gr)}%"></i></div></section>
          <section><h3 class="eyebrow">${t('planName')}</h3>${panel ? `<p class="small" style="font-size:var(--st-text-sm);margin:6px 0">${t('planWebOnly')}</p><a class="link" href="#" data-a="weblink" ${K('plan-link')}>${ico('i-ext')} ${t('openWeb')}</a>` : `<div style="margin-top:8px">${B('', 'plan-change', 'plan', t('quotaUpgrade'))}</div>`}</section></div>`;
        return `<div class="docwrap"><article class="sheet"><header class="dochead"><span class="eyebrow">${t('navAccount')}</span><h1>${t('navAccount')}</h1></header><div class="sheet-in">${body}</div>${colophon()}</article></div>`;
      }

      /* ---------- overlays ---------- */
      function cmdItems() {
        const it = []; const run = s.stage === 'running' || s.stage === 'done';
        const G = t('cmdGroups');
        [['check', 'navCheck', 'i-check'], ['history', 'navHistory', 'i-history'], ['account', 'navAccount', 'i-user']].forEach(([v, key, ic]) => it.push({ g: G.nav, label: t(key), icon: ic, run: () => ST.act.nav(v) }));
        if (s.stage === 'intake') it.push({ g: G.act, label: t('checkAction'), icon: 'i-check', disabled: !ST.act.canStart(), why: t('checkDisabledHint'), run: () => { ST.act.nav('check'); ST.act.start(); } });
        if (s.stage === 'running') it.push({ g: G.act, label: t('stop'), icon: 'i-stop', run: () => ST.act.stop() });
        if (s.stage !== 'intake') it.push({ g: G.act, label: t('reset'), icon: 'i-reset', run: () => ST.act.dialog('reset') });
        it.push({ g: G.act, label: t('howItWorks'), icon: 'i-help', run: () => ST.act.dialog('how') });
        if (run) {
          it.push({ g: G.act, label: t('editList'), icon: 'i-edit-list', disabled: ST.isBusy(), why: t('editListGated'), run: () => ST.act.dialog('editlist') },
            { g: G.act, label: t('exportAction'), icon: 'i-download', run: () => ST.act.dialog('export') }, { g: G.act, label: t('reportAction'), icon: 'i-pdf', run: () => ST.act.dialog('report') });
          const c = ST.counts();
          VERDICTS.forEach((v) => it.push({ g: G.filter, label: t('filterCmd', V(v), c.verdicts[v]), icon: 'i-filter', run: () => { ST.act.nav('check'); if (s.filter !== v) ST.act.setFilter(v); } }));
          it.push({ g: G.filter, label: t('filterCmd', t('statusesHeading'), Object.values(c.statuses).reduce((a, b) => a + b, 0)), icon: 'i-filter', run: () => { ST.act.nav('check'); if (s.filter !== 'status') ST.act.setFilter('status'); } });
          if (s.filter) it.push({ g: G.filter, label: t('filterClear'), icon: 'i-x', run: () => ST.act.setFilter(s.filter) });
          s.refs.forEach((r, i) => { if (r.status !== 'idle' && r.status !== 'queued') it.push({ g: G.ref, label: `${i + 1}. ${r.au} ${r.title}`, icon: 'i-doc', run: () => { ST.act.nav('check'); ST.act.select(r.id); } }); });
        }
        const q = ui.cmdQ.trim().toLowerCase();
        return it.filter((x) => !q || x.label.toLowerCase().includes(q));
      }
      function cmdListHTML() {
        ui.cmdItems = cmdItems();
        if (!ui.cmdItems.length) return `<p class="sub" style="padding:14px 12px">${t('cmdNone')}</p>`;
        let g = '', h = '';
        ui.cmdItems.forEach((x, i) => {
          if (x.g !== g) { g = x.g; h += `<h3 class="eyebrow">${g}</h3>`; }
          h += `<button type="button" class="btn" ${K('ci-' + i)} data-a="cmd-run" data-i="${i}" ${x.disabled ? 'disabled' : ''}>${ico(x.icon)}<span class="l">${esc(x.label)}${x.disabled && x.why ? `<br><small>${x.why}</small>` : ''}</span></button>`;
        });
        return h;
      }
      function dialogHTML(name) {
        let inner;
        const close = B('', 'dclose', 'dialog-close', t('close'));
        if (name === 'how') inner = `<h2 id="dlg-h">${t('howItWorks')}</h2><ol>${t('howSteps').map((x) => `<li>${x}</li>`).join('')}</ol><div class="note-box info">${ico('i-info')}<span>${t('disclaimer')}</span></div><div class="row">${close}</div>`;
        else if (name === 'export') {
          const n = s.refs.filter((r) => r.exportPick).length;
          inner = `<h2 id="dlg-h">${t('exportHeading')}</h2><p class="small">${t('exportHint')}</p>
            <fieldset><legend class="eyebrow" style="margin-bottom:6px">${t('exportFormat')}</legend><div class="row">
              <label class="opt"><input type="radio" name="fmt" value="csl" data-fmt ${ui.fmt === 'csl' ? 'checked' : ''} ${K('fmt-csl')}>${t('fmtCsl')}</label><label class="opt"><input type="radio" name="fmt" value="bib" data-fmt ${ui.fmt === 'bib' ? 'checked' : ''} ${K('fmt-bib')}>${t('fmtBib')}</label></div></fieldset>
            <label class="fld"><span>${t('exportStyle')}</span><select data-style ${K('style')}>${['APA 7', 'Chicago', 'DIN ISO 690'].map((x) => `<option ${ui.style === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
            <p class="small">${t('exportSelected', n)}</p>
            <div class="row">${B('primary', 'dl', 'download', `${ico('i-download')}${t('exportDownload')}`)}${close}</div>`;
        } else if (name === 'report') inner = `<h2 id="dlg-h">${t('reportHeading')}</h2><p class="small">${t('reportHint')}</p><div class="row">${B('primary', 'mk', 'report-make', `${ico('i-pdf')}${t('reportCreate')}`)}${close}</div>`;
        else if (name === 'reset') inner = `<h2 id="dlg-h">${t('reset')}</h2><p>${t('resetConfirm')}</p><div class="row">${B('primary', 'rok', 'reset-ok', `${ico('i-reset')}${t('reset')}`)}${close}</div>`;
        else inner = `<h2 id="dlg-h">${t('editList')}</h2>${ST.isBusy() ? `<div class="note-box warn">${ico('i-info')}<span>${t('editListGated')}</span></div>` : `<p>${t('editListStub')}</p>`}<div class="row">${close}</div>`;
        return `<button type="button" class="scrim" tabindex="-1" aria-label="${esc(t('close'))}" data-a="dialog-close"></button><div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlg-h" data-ov>${inner}</div>`;
      }
      function overlays() {
        let h = '';
        if (s.cmdOpen) h += `<button type="button" class="scrim" tabindex="-1" aria-label="${esc(t('close'))}" data-a="cmd-close"></button>
          <div class="cmd" role="dialog" aria-modal="true" aria-label="${esc(t('cmdPlaceholder'))}" data-ov><div class="cmd-in">${ico('i-search')}<input type="text" ${K('cmd-in')} data-cmdq data-autofocus value="${esc(ui.cmdQ)}" placeholder="${esc(t('cmdPlaceholder'))}" aria-label="${esc(t('cmdPlaceholder'))}" autocomplete="off" spellcheck="false"></div><div class="cmd-list" data-cmdlist>${cmdListHTML()}</div></div>`;
        else if (s.dialog) h += dialogHTML(s.dialog);
        if (s.toast) h += `<div class="toast st-glass" role="status">${esc(s.toast)}${B('quiet sm', 'toastx', 'toast-close', `${ico('i-x')}<span class="sr-only">${t('close')}</span>`)}</div>`;
        return `<div class="ov"><div class="ov-in">${h}</div></div>`;
      }

      /* ---------- render ---------- */
      const overlayKey = () => s.cmdOpen ? 'cmd' : s.dialog ? 'dlg:' + s.dialog : null;
      function render() {
        /* capture */
        const a = document.activeElement; let fk = null, ss = null, se = null;
        if (a && root.contains(a)) { const el = a.closest('[data-k]'); fk = el && el.dataset.k; if (el === a && a.selectionStart != null) { try { ss = a.selectionStart; se = a.selectionEnd; } catch (_) { /* checkbox etc. */ } } }
        const y = getY(); const oldInsp = view.querySelector('.inspector'); const inspY = oldInsp ? oldInsp.scrollTop : 0;
        const sheet = isSheet();
        if (s.selected !== prevSel && prevSel == null && s.selected != null) s.scrollMemo = y;
        if (s.cmdOpen && !prevCmd) ui.cmdQ = '';
        root.style.setProperty('--ov-h', vh() + 'px');

        const selRef = s.selected != null && s.view === 'check' ? ST.ref(s.selected) : null;
        const main = s.view === 'history' ? historyView() : s.view === 'account' ? accountView() : checkView();
        view.innerHTML = `${overlays()}${topbar()}${reconBanner()}
          <div class="layout" ${selRef ? 'data-open' : ''}>${main}${s.view === 'check' ? `<aside class="inspector" aria-label="${t('sheetLabel')}">${selRef ? inspector(selRef) : ''}</aside>` : ''}</div>`;
        const rb = view.querySelector('.recon');
        root.style.setProperty('--c-stack', (rb ? rb.offsetHeight : 0) + 'px');
        view.querySelectorAll('.st-running').forEach((el) => { el.style.animationDelay = '-' + Math.round(performance.now() % 900) + 'ms'; });

        /* scroll */
        let ny = y, ni = inspY;
        if (s.view !== prevView) ny = 0;
        else if (s.selected !== prevSel) { ni = 0; if (sheet) ny = s.selected != null ? 0 : s.scrollMemo; }
        setY(ny);
        const insp = view.querySelector('.inspector'); if (insp) insp.scrollTop = ni;

        /* focus */
        const ok = overlayKey(); const selChanged = s.selected !== prevSel;
        let target = null;
        if (ok && ok !== prevOverlay) target = view.querySelector('[data-ov] [data-autofocus]') || view.querySelector('[data-ov] .btn');
        else if (!ok && prevOverlay && !selChanged) target = ui.restoreK ? view.querySelector(`[data-k="${CSS.escape(ui.restoreK)}"]`) : null;
        else if (selChanged && s.selected != null) target = view.querySelector('[data-k="insp-h"]') || view.querySelector('[data-k="back"]');
        else if (selChanged && s.selected == null && prevSel != null) target = view.querySelector(`[data-k="open-${prevSel}"]`);
        if (!target && fk && !selChanged) target = view.querySelector(`[data-k="${CSS.escape(fk)}"]`);
        if (target) { target.focus({ preventScroll: true }); if (ss != null && target.setSelectionRange && target.dataset.k === fk) { try { target.setSelectionRange(ss, se); } catch (_) { /* ignore */ } } }
        if (target && ok && ok !== prevOverlay && target.select) target.select();

        prevSel = s.selected; prevOverlay = ok; prevView = s.view; prevCmd = s.cmdOpen;

        /* single polite live region: overall progress only */
        let msg = '';
        if (s.stage === 'running') { const p = progressOf(); msg = `${t('running')}: ${t('progress', p.d, p.scope)}`; }
        else if (s.stage === 'done') msg = t('done');
        else if (s.stage === 'counted') msg = t('detected', s.refs.length);
        else if (s.stage === 'structuring') msg = t('step').structuring;
        if (msg !== lastLive) { lastLive = msg; live.textContent = msg; }

        /* toast auto-dismiss (stop() sets one without a timer) */
        if (s.toast && s.toast !== lastToast) { clearTimeout(toastTimer); const cur = s.toast; toastTimer = setTimeout(() => { if (s.toast === cur) { s.toast = null; render(); } }, 4200); }
        lastToast = s.toast;
      }

      /* ---------- events ---------- */
      const rememberFocus = () => { const a = document.activeElement; const el = a && root.contains(a) ? a.closest('[data-k]') : null; ui.restoreK = el ? el.dataset.k : null; };
      const toast = (txt) => ST.act.toast(txt);
      const H = {
        nav: (d) => ST.act.nav(d.v),
        cmd: () => { rememberFocus(); ST.act.cmd(true); },
        'cmd-close': () => ST.act.cmd(false),
        'cmd-run': (d) => { const x = ui.cmdItems[+d.i]; if (!x || x.disabled) return; ST.act.cmd(false); x.run(); },
        check: () => ST.act.start(), example: () => ST.act.example(), file: () => ST.act.useFile(), selection: () => ST.act.useSelection(),
        paste: () => { s.intakeSource = 'paste'; ST.act.setInput(''); },
        adopt: (d) => ST.act.adoptRejected(d.id), run: (d) => ST.act.run(+d.n), stop: () => ST.act.stop(),
        reset: () => { rememberFocus(); ST.act.dialog('reset'); }, 'reset-ok': () => { ST.act.dialog(null); ST.act.reset(); },
        dialog: (d) => { rememberFocus(); ST.act.dialog(d.v); }, 'dialog-close': () => ST.act.dialog(null),
        menu: () => { ui.menu = !ui.menu; render(); },
        filter: (d) => ST.act.setFilter(d.v), 'filter-clear': () => ST.act.setFilter(s.filter),
        open: (d) => ST.act.select(+d.id), back: () => ST.act.back(), step: (d) => ST.act.step(+d.d),
        edit: (d) => ST.act.editFields(+d.id), 'edit-sug': (d) => ST.act.editFields(+d.id, 'suggestion'), discard: (d) => ST.act.discardDraft(+d.id), save: (d) => ST.act.saveRecheck(+d.id), retry: (d) => ST.act.retry(+d.id),
        sample: (d) => { const r = ST.ref(+d.id); if (r && r.recheck) { ST.act.setDraft(r.id, 'title', r.recheck.value); const ta = view.querySelector('[data-draft="title"]'); if (ta) ta.value = r.recheck.value; } },
        override: (d) => ST.act.override(+d.id, d.v), clearov: (d) => ST.act.clearOverride(+d.id),
        'toggle-manual': (d) => { ui.manual[d.id] = !ui.manual[d.id]; render(); },
        pickexport: (d) => ST.act.pickExport(+d.id), accept: (d) => ST.act.accept(+d.id),
        copy: (d) => { const r = ST.ref(+d.id); try { navigator.clipboard && navigator.clipboard.writeText(trackText(r)); } catch (_) { /* clipboard may be blocked */ } toast(t('copiedToast')); },
        download: () => { ST.act.dialog(null); toast(t('downloaded')); }, 'report-make': () => { ST.act.dialog(null); toast(t('reportMade')); },
        'hist-on': () => ST.act.setHistory(true),
        'hist-open': (d) => { if (d.id === 'h1') { ST.act.jump('done'); ST.act.nav('check'); } else toast(t('protoStub')); },
        'hist-new': () => { ST.act.reset(); ST.act.example(); ST.act.nav('check'); },
        'hist-del': () => toast(t('deleted')),
        signin: () => ST.act.setAccount('free'), signout: () => ST.act.setAccount('guest'),
        plan: () => ST.act.nav('account'), weblink: () => toast(t('planWebOnly')),
        'toast-close': () => { s.toast = null; render(); }
      };
      const onClick = (e) => {
        const el = e.target.closest('[data-a]');
        if (!el || !root.contains(el)) { if (ui.menu && !e.target.closest('.menu-wrap')) { ui.menu = false; render(); } return; }
        if (el.disabled) return;
        const h = H[el.dataset.a]; if (!h) return;
        if (el.type !== 'checkbox') e.preventDefault();
        if (ui.menu && el.dataset.a !== 'menu') ui.menu = false;
        h(el.dataset, el);
      };
      const onChange = (e) => {
        const el = e.target;
        if (el.matches('[data-a="region"]')) ST.act.toggleRegion(el.dataset.id);
        else if (el.matches('[data-fmt]')) ui.fmt = el.value;
        else if (el.matches('[data-style]')) ui.style = el.value;
      };
      const onInput = (e) => {
        const el = e.target;
        if (el.matches('[data-intake]')) { typing = true; ST.act.setInput(el.value); typing = false; }
        else if (el.matches('[data-draft]')) ST.act.setDraft(+el.dataset.id, el.dataset.draft, el.value);
        else if (el.matches('[data-cmdq]')) { ui.cmdQ = el.value; const l = view.querySelector('[data-cmdlist]'); if (l) l.innerHTML = cmdListHTML(); }
      };
      const onToggle = (e) => { const el = e.target; if (el.matches && el.matches('details[data-cand]')) ui.cand[el.dataset.cand] = el.open; };
      const onDrag = (e) => {
        if (!e.target.closest || !e.target.closest('[data-drop]')) return;
        if (e.type === 'dragover') { e.preventDefault(); if (!ui.drop) { ui.drop = true; const p = view.querySelector('[data-drop]'); p && p.classList.add('drop-on'); } }
        else if (e.type === 'dragleave') { ui.drop = false; const p = view.querySelector('[data-drop]'); p && p.classList.remove('drop-on'); }
        else if (e.type === 'drop') { e.preventDefault(); ui.drop = false; ST.act.useFile(); }
      };
      const onKey = (e) => {
        const inField = e.target.closest && e.target.closest('input, textarea, select, [contenteditable]');
        if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (!s.cmdOpen) rememberFocus(); ST.act.cmd(); return; }
        if (e.key === 'Enter' && e.target.matches && e.target.matches('[data-draft]')) { e.preventDefault(); return; }
        if (e.key === 'Escape') {
          if (ui.menu) { ui.menu = false; render(); return; }
          if (s.cmdOpen) { ST.act.cmd(false); return; }
          if (s.dialog) { ST.act.dialog(null); return; }
          if (s.selected != null && s.view === 'check') ST.act.back();
          return;
        }
        if (s.cmdOpen || s.dialog) {
          const ov = view.querySelector('[data-ov]');
          if (e.key === 'Tab' && ov) {
            const f = [...ov.querySelectorAll('button:not(:disabled), input, select, textarea, a[href]')].filter((x) => x.offsetParent !== null);
            if (!f.length) return;
            const first = f[0], last = f[f.length - 1];
            if (e.shiftKey && (document.activeElement === first || !ov.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && (document.activeElement === last || !ov.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
            return;
          }
          if (s.cmdOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            const f = [view.querySelector('[data-cmdq]'), ...view.querySelectorAll('.cmd-list .btn:not(:disabled)')].filter(Boolean);
            const i = f.indexOf(document.activeElement); const n = f[(i + (e.key === 'ArrowDown' ? 1 : -1) + f.length) % f.length];
            if (n) { e.preventDefault(); n.focus(); }
            return;
          }
          if (s.cmdOpen && e.key === 'Enter' && e.target.matches && e.target.matches('[data-cmdq]')) { const f = view.querySelector('.cmd-list .btn:not(:disabled)'); if (f) { e.preventDefault(); f.click(); } }
          return;
        }
        if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey && s.selected != null && s.view === 'check' && !inField) {
          e.preventDefault(); ST.act.step(e.key === 'ArrowLeft' ? -1 : 1);
        }
      };
      const onResize = () => { root.style.setProperty('--ov-h', vh() + 'px'); };

      root.addEventListener('click', onClick);
      root.addEventListener('change', onChange);
      root.addEventListener('input', onInput);
      root.addEventListener('toggle', onToggle, true);
      root.addEventListener('dragover', onDrag); root.addEventListener('dragleave', onDrag); root.addEventListener('drop', onDrag);
      document.addEventListener('keydown', onKey);
      window.addEventListener('resize', onResize);

      const off = ST.on((a) => {
        if (a === 'draft-input') return;
        if (a === 'input' && typing) {
          const b = view.querySelector('[data-k="check"]'), ok = ST.act.canStart();
          if (b) { b.disabled = !ok; if (ok) b.removeAttribute('aria-describedby'); else b.setAttribute('aria-describedby', 'chk-hint'); }
          const h = view.querySelector('#chk-hint'); if (h) h.hidden = ok;
          return;
        }
        render();
      });
      render();

      return () => {
        off(); clearTimeout(toastTimer);
        root.removeEventListener('click', onClick); root.removeEventListener('change', onChange); root.removeEventListener('input', onInput);
        root.removeEventListener('toggle', onToggle, true);
        root.removeEventListener('dragover', onDrag); root.removeEventListener('dragleave', onDrag); root.removeEventListener('drop', onDrag);
        document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize);
      };
    }
  });
})();
