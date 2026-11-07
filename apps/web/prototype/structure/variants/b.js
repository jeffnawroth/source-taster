/* PROTOTYPE (#194) — variant B "Three-pane workbench". Throwaway.
   Dense productivity tool: nav rail | facet sidebar | compact list | tabbed detail. Intake is a form inside the
   workbench (replaces list + detail). At 360 px the rail becomes a top segmented control, the facets a chip row,
   and detail replaces the list (Back restores filter + scroll). */
(() => {
  const css = `
.v-B{display:flex;flex-direction:column;min-height:100%;color:var(--st-text);font-size:var(--st-text-sm);line-height:1.45;background:radial-gradient(60% 34% at 15% -4%,var(--st-bg-glow),transparent 72%),var(--st-bg)}
.v-B *{min-width:0}
.v-B h1,.v-B h2,.v-B h3,.v-B h4,.v-B p,.v-B ul,.v-B ol,.v-B figure,.v-B blockquote{margin:0;padding:0}
.v-B ul,.v-B ol{list-style:none}
.v-B button{cursor:pointer}
.v-B button:disabled,.v-B [aria-disabled="true"]{cursor:not-allowed}
.v-B svg{flex:none}

/* ---------- grid: narrow base ---------- */
.v-B .bench{flex:1;display:grid;grid-template-columns:minmax(0,1fr);grid-template-areas:"rail" "facets" "list" "detail" "page";align-content:start}
.v-B .rail{grid-area:rail}.v-B .facets{grid-area:facets}.v-B .listcol{grid-area:list}.v-B .detail{grid-area:detail}.v-B .page{grid-area:page}
.v-B .facets{display:block}.v-B .listcol{display:flex;flex-direction:column}.v-B .detail{display:block}.v-B .page{display:block}
.v-B .bench[data-mode="page"] :is(.facets,.listcol,.detail),
.v-B .bench[data-mode="intake"] :is(.listcol,.detail),
.v-B .bench[data-mode="work"] .page,
.v-B .bench[data-mode="work"][data-sel="1"] :is(.facets,.listcol),
.v-B .bench[data-mode="work"][data-sel="0"] .detail{display:none}

/* ---------- rail ---------- */
.v-B .rail{position:sticky;top:0;z-index:var(--st-z-topbar);display:flex;align-items:center;gap:6px;margin:8px;padding:5px 6px;border-radius:var(--st-radius-full)}
.v-B .rail-mark{display:flex;align-items:center;gap:8px;padding:0 4px}
.v-B .rail-name{display:none;font-weight:700}
.v-B .rail-seg{display:flex;flex:1;gap:2px;padding:2px;border-radius:var(--st-radius-full);background:var(--st-surface-sunken);border:1px solid var(--st-border)}
.v-B .rn{position:relative;display:flex;align-items:center;justify-content:center;gap:5px;height:32px;padding:0 6px;border:0;border-radius:var(--st-radius-full);background:transparent;color:var(--st-text-secondary);font-size:var(--st-text-xs);font-weight:500;white-space:nowrap}
.v-B .rail-seg .rn{flex:1}
.v-B .rn .ico{width:16px;height:16px}
.v-B .rn:hover{background:var(--st-accent-tint);color:var(--st-text)}
.v-B .rn[aria-current="page"]{background:var(--st-surface);color:var(--st-accent-text);box-shadow:var(--st-shadow-raised),var(--st-highlight-inset);font-weight:700}
.v-B .rn .lbl{overflow:hidden;text-overflow:ellipsis}
.v-B .rn .tip{display:none}
.v-B .rail-cmd .rn,.v-B .rail-set .rn{width:34px;padding:0}
.v-B .rail-cmd .lbl,.v-B .rail-set .lbl{display:none}
.v-B kbd,.v-B .kbd{font-family:var(--st-font-mono);font-size:var(--st-text-2xs);padding:1px 6px;border:1px solid var(--st-border-strong);border-bottom-width:2px;border-radius:var(--st-radius-sm);background:var(--st-surface);color:var(--st-text-secondary);white-space:nowrap}

/* ---------- shared bits ---------- */
.v-B .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:32px;padding:5px 13px;border:1px solid var(--st-border-strong);border-radius:var(--st-radius-full);background:var(--st-surface);color:var(--st-text);font-size:var(--st-text-sm);font-weight:500;line-height:1.2;text-align:center}
.v-B .btn:hover:not(:disabled):not([aria-disabled="true"]){background:var(--st-accent-tint);border-color:var(--st-border-emphasis)}
.v-B .btn:disabled,.v-B .btn[aria-disabled="true"]{opacity:.55}
.v-B .btn.primary{border-color:transparent;background:linear-gradient(180deg,var(--st-button-primary-from),var(--st-button-primary-to));color:var(--st-on-accent);font-weight:700;box-shadow:0 6px 16px -8px var(--st-accent-glow)}
.v-B .btn.primary:hover:not(:disabled){background:linear-gradient(180deg,var(--st-button-primary-from),var(--st-button-primary-to));filter:brightness(1.05)}
.v-B .btn.sm{min-height:28px;padding:3px 10px;font-size:var(--st-text-xs)}
.v-B .btn.danger{color:var(--st-feedback-danger)}
.v-B .btn.link{border-color:transparent;background:transparent;color:var(--st-accent-text);text-decoration:underline;text-underline-offset:3px}
.v-B .btn.icon{width:30px;min-height:30px;padding:0}
.v-B .btn[aria-pressed="true"]{background:var(--st-accent-tint);border-color:var(--st-accent);color:var(--st-accent-text)}
.v-B .muted{color:var(--st-text-muted)}
.v-B .small{font-size:var(--st-text-xs)}
.v-B .tag{display:inline-flex;align-items:center;gap:4px;padding:0 7px;border:1px solid var(--st-border-strong);border-radius:var(--st-radius-full);font-size:var(--st-text-2xs);font-weight:600;line-height:1.7;white-space:nowrap;color:var(--st-text-secondary);background:var(--st-surface)}
.v-B .tag .ico{width:11px;height:11px}
.v-B .tag.manual{border-color:var(--st-border-emphasis);color:var(--st-accent-text);background:var(--st-accent-tint)}
.v-B .tag.amend{border-style:dashed;border-color:var(--st-feedback-warning);color:var(--st-feedback-warning);background:var(--st-feedback-warning-tint);white-space:normal}
.v-B .note{display:flex;gap:8px;align-items:flex-start;padding:8px 10px;border-radius:var(--st-radius-md);background:var(--st-feedback-info-tint);color:var(--st-text);font-size:var(--st-text-xs)}
.v-B .note .ico{color:var(--st-feedback-info);margin-top:2px}
.v-B .note.warn{background:var(--st-feedback-warning-tint)}.v-B .note.warn .ico{color:var(--st-feedback-warning)}
.v-B .note.danger{background:var(--st-feedback-danger-tint)}.v-B .note.danger .ico{color:var(--st-feedback-danger)}
.v-B .spin{animation:vb-spin 1s linear infinite}
@keyframes vb-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.v-B .spin{animation:none}}
html[data-still] .v-B .spin{animation:none}
.v-B .meter{height:5px;border-radius:var(--st-radius-full);background:var(--st-chart-track);border:1px solid var(--st-border);overflow:hidden}
.v-B .meter>i{display:block;height:100%;background:var(--st-accent);border-radius:inherit}

/* ---------- banner ---------- */
.v-B .banner{display:flex;align-items:center;gap:8px;margin:8px 8px 0;padding:8px 12px;border-radius:var(--st-radius-md);background:var(--st-feedback-warning-tint);border:1px solid var(--st-feedback-warning);font-size:var(--st-text-xs)}
.v-B .banner .ico{color:var(--st-feedback-warning)}

/* ---------- facets ---------- */
.v-B .facets{min-width:0;overflow:hidden}
.v-B .side-top,.v-B .fh,.v-B .sum,.v-B .fsep-h{display:none}
.v-B .facet-list{display:flex;gap:6px;overflow-x:auto;padding:6px 10px 8px;scrollbar-width:thin}
.v-B .facet{display:inline-flex;align-items:center;gap:6px;flex:none;padding:5px 11px;border:1px solid var(--st-border-strong);border-radius:var(--st-radius-full);background:var(--st-surface);color:var(--st-text);font-size:var(--st-text-xs);font-weight:500;white-space:nowrap}
.v-B .facet:hover:not(:disabled){border-color:var(--st-border-emphasis)}
.v-B .facet[aria-pressed="true"]{background:var(--vt,var(--st-accent-tint));border-color:var(--vm,var(--st-accent));font-weight:700}
.v-B .facet.zero{color:var(--st-text-muted)}
.v-B .facet .n{font-family:var(--st-font-mono);font-size:var(--st-text-2xs);font-variant-numeric:tabular-nums;color:var(--st-text-secondary)}
.v-B .facet .full{display:none}
.v-B .fsep{flex:none;width:1px;align-self:stretch;margin:2px 4px;background:var(--st-border-strong)}
.v-B .facet .ico.st-failed{color:var(--st-feedback-danger)}

/* ---------- list column ---------- */
.v-B .lt{padding:8px 12px 6px;display:flex;flex-direction:column;gap:8px}
.v-B .lt-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.v-B .lt-row h2{font-size:var(--st-text-md);font-weight:700;letter-spacing:-.01em;margin-right:auto}
.v-B .lt-row h2 .n{font-family:var(--st-font-mono);font-size:var(--st-text-xs);font-weight:500;color:var(--st-text-muted);margin-left:4px}
.v-B .prog{height:4px;border-radius:var(--st-radius-full);background:var(--st-chart-track);border:1px solid var(--st-border);overflow:hidden}
.v-B .prog>i{display:block;height:100%;background:var(--st-accent);border-radius:inherit}
.v-B .fchip{display:inline-flex;align-items:center;gap:6px;padding:2px 4px 2px 10px;border-radius:var(--st-radius-full);background:var(--vt,var(--st-accent-tint));border:1px solid var(--vb,var(--st-border-strong));font-size:var(--st-text-xs);font-weight:600}
.v-B .cbar{margin:0 12px 8px;padding:10px 12px;border-radius:var(--st-radius-md);background:var(--st-feedback-info-tint);border:1px solid var(--st-border-strong);display:flex;flex-direction:column;gap:8px;font-size:var(--st-text-xs)}
.v-B .cbar.warn{background:var(--st-feedback-warning-tint);border-color:var(--st-feedback-warning)}
.v-B .cbar .btns{display:flex;flex-wrap:wrap;gap:6px}
.v-B .cbar .head{display:flex;gap:8px;align-items:flex-start}
.v-B .rows{display:flex;flex-direction:column;background:var(--st-surface);border-top:1px solid var(--st-border)}
.v-B .rows>li{border-bottom:1px solid var(--st-border)}
.v-B .row{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:2px 10px;width:100%;padding:9px 12px 9px 9px;border:0;border-left:3px solid transparent;background:transparent;color:inherit;text-align:left}
.v-B .row:hover{background:var(--st-surface-sunken)}
.v-B .row[aria-current="true"]{background:var(--st-accent-tint);border-left-color:var(--st-accent)}
.v-B .row .lead{padding-top:1px}
.v-B .row .lead .gly,.v-B .row .lead .ico{width:20px;height:20px}
.v-B .row .t{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-weight:500;overflow-wrap:anywhere;line-height:1.35}
.v-B .row .num{font-family:var(--st-font-mono);font-size:var(--st-text-2xs);color:var(--st-text-muted);padding-top:2px;font-variant-numeric:tabular-nums}
.v-B .row .vl{display:flex;flex-wrap:wrap;align-items:center;gap:2px 8px;font-size:var(--st-text-xs);color:var(--st-text-secondary)}
.v-B .row .vt{font-weight:700;color:var(--st-text)}
.v-B .row .mt{font-size:var(--st-text-xs);color:var(--st-text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.v-B .row .prog{margin-top:3px}
.v-B .row .ico.st-failed{color:var(--st-feedback-danger)}
.v-B .row .ico.st-running{color:var(--st-accent)}
.v-B .row .ico{color:var(--st-text-secondary)}
.v-B .row .ico.st-queued,.v-B .row .ico.st-not-checked,.v-B .row .ico.st-cancelled{color:var(--st-text-muted)}
.v-B .empty-list{padding:24px 16px;text-align:center;color:var(--st-text-secondary);display:flex;flex-direction:column;gap:10px;align-items:center}

/* ---------- detail ---------- */
.v-B .detail{container:detail / inline-size;background:var(--st-surface)}
.v-B .dwrap{padding:12px 14px 28px}
.v-B .dnav{display:flex;align-items:center;gap:6px}
.v-B .dnav .pos{margin-right:auto;font-family:var(--st-font-mono);font-size:var(--st-text-xs);color:var(--st-text-muted)}
.v-B .only-narrow{display:inline-flex}
.v-B .dt{margin-top:10px;font-size:var(--st-text-lg);line-height:1.3;letter-spacing:-.015em;font-weight:700;overflow-wrap:anywhere}
.v-B .dmeta{margin-top:4px;color:var(--st-text-secondary);font-size:var(--st-text-xs);overflow-wrap:anywhere}
.v-B .vcard{margin-top:12px;padding:12px 14px;border:1px solid var(--vb,var(--st-border-strong));border-radius:var(--st-radius-lg);background:var(--vt,var(--st-surface-sunken));display:grid;grid-template-columns:auto minmax(0,1fr);gap:2px 12px;align-items:center}
.v-B .vcard>.gly,.v-B .vcard>.ico{width:30px;height:30px;grid-row:span 2;align-self:start}
.v-B .vcard .ico.st-failed{color:var(--st-feedback-danger)}.v-B .vcard .ico{color:var(--st-text-secondary)}
.v-B .vcard .vn{font-weight:700;font-size:var(--st-text-md);display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;overflow-wrap:anywhere}
.v-B .vcard .why{grid-column:2;color:var(--st-text);overflow-wrap:anywhere}
.v-B .vcard .sub{grid-column:1/-1;margin-top:6px;padding-top:8px;border-top:1px solid var(--vb,var(--st-border));font-size:var(--st-text-xs);color:var(--st-text-secondary);display:flex;flex-direction:column;gap:4px}
.v-B .disc{margin-top:8px;font-size:var(--st-text-xs);color:var(--st-text-muted)}
.v-B .dact{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.v-B .judge{margin-top:8px;padding:10px;border:1px solid var(--st-border-strong);border-radius:var(--st-radius-md);background:var(--st-surface-sunken);display:flex;flex-direction:column;gap:8px}
.v-B .judge .opts{display:flex;flex-wrap:wrap;gap:6px}
.v-B .tabs{display:flex;gap:2px;overflow-x:auto;margin-top:14px;border-bottom:1px solid var(--st-border-strong);background:var(--st-surface);scrollbar-width:thin}
.v-B .tab{flex:none;padding:8px 12px;border:0;border-bottom:2px solid transparent;margin-bottom:-1px;background:transparent;color:var(--st-text-secondary);font-weight:500;white-space:nowrap}
.v-B .tab:hover{color:var(--st-text)}
.v-B .tab[aria-selected="true"]{color:var(--st-accent-text);border-bottom-color:var(--st-accent);font-weight:700}
.v-B .tp{padding-top:12px;display:flex;flex-direction:column;gap:14px}
.v-B .tp h3{font-size:var(--st-text-sm);font-weight:700}
.v-B .sec{display:flex;flex-direction:column;gap:8px}
.v-B .orig{padding:8px 10px;border-left:3px solid var(--st-border-emphasis);background:var(--st-surface-sunken);border-radius:0 var(--st-radius-sm) var(--st-radius-sm) 0;font-family:var(--st-font-mono);font-size:calc(var(--st-font-mono-scale) * var(--st-text-xs));overflow-wrap:anywhere;color:var(--st-text-secondary)}
.v-B .fhead{display:none}
.v-B .frow{display:grid;grid-template-columns:minmax(0,1fr);gap:4px;padding:8px 0;border-bottom:1px solid var(--st-border)}
.v-B .frow .fk{display:flex;flex-wrap:wrap;gap:2px 8px;align-items:center;font-weight:700;font-size:var(--st-text-xs)}
.v-B .frow .flag,.v-B .frow .okf{display:inline-flex;gap:3px;align-items:center;font-weight:500;color:var(--st-text-secondary)}
.v-B .frow .flag .ico{color:var(--st-verdict-deviations-mark)}.v-B .frow .okf .ico{color:var(--st-feedback-success)}
.v-B .frow .cap{display:block;font-size:var(--st-text-2xs);color:var(--st-text-muted);text-transform:uppercase;letter-spacing:var(--st-tracking-caps)}
.v-B .frow .val{overflow-wrap:anywhere}
.v-B .frow.k-doi .val,.v-B .frow.k-isbn .val,.v-B .frow.k-pages .val{font-family:var(--st-font-mono);font-size:calc(var(--st-font-mono-scale) * 1em)}
.v-B .frow .by{display:block;margin-top:2px;font-family:var(--st-font-mono);font-size:var(--st-text-2xs);color:var(--st-text-muted)}
.v-B .frow.dev .fb .val{font-weight:600}
.v-B .fin{width:100%;padding:6px 8px;border:1px solid var(--st-border-strong);border-radius:var(--st-radius-sm);background:var(--st-surface);color:var(--st-text);font:inherit;resize:vertical}
.v-B .hist-block{padding:10px;border:1px dashed var(--st-border-strong);border-radius:var(--st-radius-md);opacity:.85}
.v-B .sug{padding:12px;border:1px solid var(--st-border-strong);border-radius:var(--st-radius-lg);background:var(--st-surface-sunken);display:flex;flex-direction:column;gap:8px}
.v-B .sug .track{font-size:var(--st-text-sm);overflow-wrap:anywhere;line-height:1.7}
.v-B .sug .acts{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.v-B .trail{display:flex;flex-direction:column;gap:0;position:relative}
.v-B .trail li{display:grid;grid-template-columns:26px minmax(0,1fr);gap:8px;padding:7px 0;border-bottom:1px solid var(--st-border)}
.v-B .trail .rd{width:22px;height:22px;border-radius:var(--st-radius-full);display:grid;place-items:center;border:1px solid var(--st-border-strong);background:var(--st-surface)}
.v-B .trail .rd .ico{width:13px;height:13px}
.v-B .trail .ok .rd{color:var(--st-feedback-success)}.v-B .trail .diff .rd,.v-B .trail .warn .rd{color:var(--st-feedback-warning)}.v-B .trail .bad .rd{color:var(--st-feedback-danger)}.v-B .trail .none .rd{color:var(--st-text-muted)}
.v-B .trail .pending{opacity:.5}
.v-B .trail .rw{font-size:var(--st-text-2xs);font-weight:700;text-transform:uppercase;letter-spacing:var(--st-tracking-caps);color:var(--st-text-muted);margin-left:6px}
.v-B .src{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;padding:8px 0;border-bottom:1px solid var(--st-border)}
.v-B .src .sn{font-family:var(--st-font-mono);font-size:calc(var(--st-font-mono-scale) * 1em);font-weight:600}
.v-B .src .ms{font-family:var(--st-font-mono);font-size:var(--st-text-2xs);color:var(--st-text-muted);font-variant-numeric:tabular-nums}
.v-B .src .sr{grid-column:1/-1;color:var(--st-text-secondary);font-size:var(--st-text-xs)}
.v-B details.cand{border:1px solid var(--st-border-strong);border-radius:var(--st-radius-md);padding:6px 10px;background:var(--st-surface)}
.v-B details.cand summary{cursor:pointer;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;font-weight:600}
.v-B details.cand .score{font-family:var(--st-font-mono);font-size:var(--st-text-xs);font-variant-numeric:tabular-nums;color:var(--st-text-muted)}
.v-B .revs li{padding:8px 0 8px 12px;border-left:2px solid var(--st-border-strong);display:flex;flex-direction:column;gap:3px}
.v-B .revs li.cur{border-left-color:var(--st-accent)}
.v-B .revs .rv{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-weight:700}
.v-B .empty-d{height:100%;min-height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center}
.v-B .empty-d h2{font-size:var(--st-text-md)}
.v-B .keys{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px 12px;align-items:center;text-align:left}
.v-B .keys dt{justify-self:end;display:flex;gap:4px}.v-B .keys dd{margin:0;color:var(--st-text-secondary)}

/* ---------- page (intake / history / account) ---------- */
.v-B .page{background:var(--st-surface)}
.v-B .pg{padding:16px 14px 28px;display:flex;flex-direction:column;gap:14px;max-width:820px;margin:0 auto}
.v-B .pg h2{font-size:var(--st-text-xl);line-height:1.2;letter-spacing:-.02em;font-weight:700}
.v-B .pg .lead{color:var(--st-text-secondary);font-size:var(--st-text-base)}
.v-B .seg{display:inline-flex;gap:2px;padding:2px;border-radius:var(--st-radius-full);background:var(--st-surface-sunken);border:1px solid var(--st-border);align-self:flex-start;max-width:100%}
.v-B .seg button{padding:5px 12px;border:0;border-radius:var(--st-radius-full);background:transparent;font-size:var(--st-text-xs);font-weight:500;color:var(--st-text-secondary);display:inline-flex;gap:5px;align-items:center;white-space:nowrap}
.v-B .seg button[aria-pressed="true"]{background:var(--st-surface);color:var(--st-accent-text);font-weight:700;box-shadow:var(--st-shadow-raised),var(--st-highlight-inset)}
.v-B .seg .ico{width:14px;height:14px}
.v-B .ta{width:100%;min-height:200px;padding:12px;border:1px solid var(--st-border-strong);border-radius:var(--st-radius-lg);background:var(--st-surface);color:var(--st-text);font-family:var(--st-font-mono);font-size:calc(var(--st-font-mono-scale) * var(--st-text-sm));line-height:1.55;resize:vertical}
.v-B .drop{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px;border:1px dashed var(--st-border-emphasis);border-radius:var(--st-radius-lg);background:var(--st-surface-sunken)}
.v-B .drop .ico.big{width:22px;height:22px;color:var(--st-accent-text)}
.v-B .doc{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:12px;border:1px solid var(--st-border-strong);border-radius:var(--st-radius-lg)}
.v-B .doc b{overflow-wrap:anywhere}
.v-B .checkrow{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.v-B .region{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 10px;border:1px solid var(--st-border-strong);border-radius:var(--st-radius-md);background:var(--st-surface)}
.v-B .cb{width:22px;height:22px;display:grid;place-items:center;border:2px solid var(--st-border-emphasis);border-radius:var(--st-radius-xs);background:var(--st-surface);padding:0;color:var(--st-on-accent)}
.v-B .cb[aria-checked="true"]{background:var(--st-accent);border-color:var(--st-accent)}
.v-B .cb .ico{width:14px;height:14px;stroke-width:3}
.v-B .rej{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:8px 10px;border:1px dashed var(--st-border-strong);border-radius:var(--st-radius-md)}
.v-B .rej .mono{overflow-wrap:anywhere}
.v-B .hentry{padding:12px;border:1px solid var(--st-border-strong);border-radius:var(--st-radius-lg);background:var(--st-surface);display:flex;flex-direction:column;gap:8px}
.v-B .hentry.locked{background:var(--st-surface-sunken)}
.v-B .hentry .hn{font-weight:700;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.v-B .hcounts{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:var(--st-text-xs)}
.v-B .hcounts span{display:inline-flex;align-items:center;gap:4px;font-family:var(--st-font-mono);font-variant-numeric:tabular-nums}
.v-B .hacts{display:flex;flex-wrap:wrap;gap:6px}
.v-B .kv{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 14px}
.v-B .kv dt{color:var(--st-text-muted)}.v-B .kv dd{margin:0;overflow-wrap:anywhere}
.v-B .card{padding:14px;border:1px solid var(--st-border-strong);border-radius:var(--st-radius-lg);background:var(--st-surface);display:flex;flex-direction:column;gap:10px}

/* ---------- overlays ---------- */
.v-B .ov{position:fixed;inset:0;z-index:var(--st-z-command);display:flex;justify-content:center;align-items:flex-start;padding:10vh 12px 12px}
.v-B[data-surface="panel"] .ov{position:absolute;inset:auto;left:0;right:0;top:var(--ov-top,0px);height:var(--ov-h,100%);padding:10px}
.v-B .scrim{position:absolute;inset:0;background:var(--st-scrim)}
.v-B .dlg{position:relative;width:min(560px,100%);max-height:100%;overflow:auto;border-radius:var(--st-radius-xl);padding:16px;display:flex;flex-direction:column;gap:12px}
.v-B .dlg header{display:flex;gap:8px;align-items:center}
.v-B .dlg header h2{font-size:var(--st-text-lg);font-weight:700;margin-right:auto;letter-spacing:-.015em}
.v-B .cmd input{width:100%;padding:10px 12px;border:1px solid var(--st-border-strong);border-radius:var(--st-radius-md);background:var(--st-surface);color:var(--st-text);font:inherit;font-size:var(--st-text-base)}
.v-B .cmd ul{display:flex;flex-direction:column;gap:2px;max-height:min(52vh,420px);overflow:auto}
.v-B .cmd li[role="option"]{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--st-radius-md);cursor:pointer}
.v-B .cmd li[aria-selected="true"]{background:var(--st-accent-tint);outline:1px solid var(--st-border-emphasis)}
.v-B .cmd li[aria-disabled="true"]{opacity:.55;cursor:not-allowed}
.v-B .cmd li .g{margin-left:auto;font-size:var(--st-text-2xs);color:var(--st-text-muted);text-transform:uppercase;letter-spacing:var(--st-tracking-caps)}
.v-B .toast-wrap{position:fixed;left:0;right:0;bottom:64px;display:flex;justify-content:center;pointer-events:none;z-index:var(--st-z-toast);padding:0 12px}
.v-B[data-surface="panel"] .toast-wrap{position:sticky;bottom:8px}
.v-B .toast{pointer-events:auto;display:flex;align-items:center;gap:10px;padding:8px 8px 8px 14px;border-radius:var(--st-radius-full);max-width:100%;font-size:var(--st-text-sm)}
.v-B .howlist{display:flex;flex-direction:column;gap:6px}
.v-B .howlist li{display:flex;gap:8px;align-items:center}
.v-B ol.steps{list-style:decimal;padding-left:20px;display:flex;flex-direction:column;gap:4px}

/* ---------- medium: rail | (chips over) list + detail ---------- */
@container app (min-width: 700px){
  .v-B{height:100vh;height:100dvh;padding-bottom:52px}
  .v-B .bench{min-height:0;grid-template-columns:60px minmax(250px,340px) minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);grid-template-areas:"rail facets facets" "rail list detail";gap:8px;padding:8px 8px 0 0;align-content:stretch}
  .v-B .bench[data-mode="intake"]{grid-template-areas:"rail facets facets" "rail page page"}
  .v-B .bench[data-mode="page"]{grid-template-areas:"rail page page" "rail page page"}
  .v-B .bench>*{min-height:0}
  .v-B .bench[data-mode="work"][data-sel="1"] .facets,.v-B .bench[data-mode="work"][data-sel="1"] .detail{display:block}
  .v-B .bench[data-mode="work"][data-sel="1"] .listcol,.v-B .bench[data-mode="work"][data-sel="0"] .listcol{display:flex}
  .v-B .bench[data-mode="work"][data-sel="0"] .detail{display:block}
  .v-B .bench[data-mode="intake"] .facets,.v-B .bench[data-mode="intake"] .page{display:block}
  .v-B .bench[data-mode="page"] .page{display:block}
  .v-B .rail{position:relative;top:auto;flex-direction:column;align-items:center;margin:0 0 0 8px;padding:10px 6px;border-radius:var(--st-radius-xl);z-index:5;gap:6px}
  .v-B .rail-mark{padding:0 0 6px}
  .v-B .rail-seg{flex:none;flex-direction:column;background:transparent;border:0;padding:0;gap:4px}
  .v-B .rail-seg .rn,.v-B .rail-cmd .rn,.v-B .rail-set .rn{width:44px;height:44px;flex:none;border-radius:var(--st-radius-md);padding:0}
  .v-B .rn .ico{width:20px;height:20px}
  .v-B .rn .lbl{display:none}
  .v-B .rn[aria-current="page"]{background:var(--st-accent-tint);box-shadow:none;color:var(--st-accent-text)}
  .v-B .rn .tip{display:flex;gap:8px;align-items:center;position:absolute;left:calc(100% + 10px);top:50%;transform:translateY(-50%);padding:4px 9px;border-radius:var(--st-radius-sm);background:var(--st-text);color:var(--st-bg);font-size:var(--st-text-xs);font-weight:500;white-space:nowrap;pointer-events:none;opacity:0;z-index:var(--st-z-overlay);transition:opacity var(--st-duration-fast) var(--st-ease-standard)}
  .v-B .rn:hover .tip,.v-B .rn:focus-visible .tip{opacity:1}
  .v-B .rn .tip .kbd{background:transparent;color:inherit;border-color:currentColor}
  .v-B .rail-set{margin-top:auto}
  .v-B .facets,.v-B .listcol,.v-B .detail,.v-B .page{background:var(--st-surface);border:1px solid var(--st-border);border-radius:var(--st-radius-lg);box-shadow:var(--st-shadow-raised),var(--st-highlight-inset)}
  .v-B .listcol{overflow:auto}
  .v-B .listcol .rows{flex:1 0 160px}
  @container app (min-width: 1040px){.v-B .listcol{overflow:hidden}.v-B .listcol .rows{flex:1;min-height:0;overflow:auto}}
  .v-B .detail,.v-B .page{overflow:auto}
  .v-B .only-narrow{display:none}
  .v-B .tabs{position:sticky;top:0;z-index:var(--st-z-sticky)}
}
.v-B .sheet-btn{display:inline-flex}
.v-B .sheet{margin:0 12px 8px;padding:10px 12px;border:1px solid var(--st-border-strong);border-radius:var(--st-radius-md);background:var(--st-surface);display:flex;flex-direction:column;gap:10px}
@container app (max-width: 480px){.v-B .rail-mark{display:none}.v-B .rn{padding:0 4px}}
@container app (max-width: 699px){
  .v-B .sheet .acts{display:flex;flex-wrap:wrap;gap:6px}
  .v-B .listcol,.v-B .facets{background:var(--st-surface)}
  .v-B .facets{margin:0 0 4px;border-bottom:1px solid var(--st-border)}
  .v-B .detail,.v-B .page{min-height:60vh}
}
.v-B .sheet .acts{display:flex;flex-wrap:wrap;gap:6px}
.v-B .sheet{flex:none}
.v-B .cbar,.v-B .lt{flex:none}
@container app (min-width: 1040px){.v-B .sheet-btn,.v-B .sheet{display:none}}

/* ---------- wide: rail | facets | list | detail ---------- */
@container app (min-width: 1040px){
  .v-B .bench{grid-template-columns:60px 256px minmax(300px,380px) minmax(0,1fr);grid-template-rows:minmax(0,1fr);grid-template-areas:"rail facets list detail"}
  .v-B .bench[data-mode="intake"]{grid-template-areas:"rail facets page page"}
  .v-B .bench[data-mode="page"]{grid-template-areas:"rail page page page"}
  .v-B .facets{overflow:auto;display:block}
  .v-B .bench[data-mode="work"] .facets,.v-B .bench[data-mode="intake"] .facets{display:block}
  .v-B .side-top{display:flex;flex-direction:column;gap:10px;padding:12px;border-bottom:1px solid var(--st-border)}
  .v-B .side-top .grp{display:flex;flex-direction:column;gap:5px}
  .v-B .side-top .acts{display:flex;flex-direction:column;gap:4px}
  .v-B .side-top .acts .btn{justify-content:flex-start;border-radius:var(--st-radius-md);min-height:30px;width:100%}
  .v-B .side-top .grp.quiet-g{gap:3px}
  .v-B .side-top .gate{grid-column:1/-1}
  .v-B .badge{display:inline-flex;gap:6px;align-items:center;font-weight:600}
  .v-B .fh{display:block;padding:12px 14px 4px}
  .v-B .sum{display:block;padding:2px 14px 8px;color:var(--st-text-secondary);font-size:var(--st-text-xs)}
  .v-B .sum b{display:block;color:var(--st-text);font-size:var(--st-text-md);letter-spacing:-.01em}
  .v-B .facet-list{flex-direction:column;gap:2px;overflow:visible;padding:2px 8px 12px}
  .v-B .facet{display:grid;grid-template-columns:20px minmax(0,1fr) auto;gap:8px;border-radius:var(--st-radius-md);border-color:transparent;background:transparent;padding:7px 8px;white-space:normal;font-size:var(--st-text-sm);text-align:left}
  .v-B .facet:hover:not(:disabled){background:var(--st-surface-sunken);border-color:transparent}
  .v-B .facet[aria-pressed="true"]{border-color:var(--vb,var(--st-border-emphasis))}
  .v-B .facet .gly,.v-B .facet .ico{width:18px;height:18px}
  .v-B .facet .full{display:inline}.v-B .facet .short{display:none}
  .v-B .fsep{display:none}
  .v-B .fsep-h{display:block;padding:12px 6px 2px;margin-top:6px;border-top:1px solid var(--st-border)}
  .v-B .only-wide-hide{display:none}
}
@container app (max-width: 1039px){.v-B .side-top{display:none}}

/* ---------- detail pane: own container ---------- */
@container detail (min-width: 560px){
  .v-B .fhead{display:grid;grid-template-columns:150px minmax(0,1fr) minmax(0,1fr);gap:12px;padding:4px 0;font-size:var(--st-text-2xs);color:var(--st-text-muted);text-transform:uppercase;letter-spacing:var(--st-tracking-caps);border-bottom:1px solid var(--st-border-strong)}
  .v-B .frow{grid-template-columns:150px minmax(0,1fr) minmax(0,1fr);gap:12px}
  .v-B .frow .cap{display:none}
  .v-B .dwrap{padding:14px 22px 32px}
}
@media (prefers-reduced-transparency:reduce){.v-B .toast{background:var(--st-glass-base-strong)}}
`;

  ST.strings({
    de: {
      sheetBtn: 'Prüfung', verdictsHeading: 'Urteile', tabFields: 'Felder', tabEvidence: 'Nachweise', tabSources: 'Quellen', tabHistory: 'Verlauf', tabHistoryFull: 'Verlauf dieses Eintrags',
      detailLabel: 'Referenzdetail', listTitle: 'Referenzen', settings: 'Einstellungen', close: 'Schließen', apply: 'Anwenden',
      emptyDetail: 'Referenz auswählen', emptyDetailLead: 'Urteil, Feldvergleich, Nachweise und Quellen erscheinen hier.',
      kUpDown: 'Referenz wählen', kLR: 'Zwischen Referenzen blättern', kNum: 'Nach Urteil filtern', kNum0: 'Filter aufheben', kEsc: 'Schließen, zurück', kCmd: 'Befehle',
      inputUnchanged: 'Ihre Eingabe wird nicht verändert.', clearOverride: 'Manuelle Beurteilung aufheben', judgePick: 'Wirksames Urteil wählen',
      resWord: { ok: 'bestätigt', none: 'kein Treffer', diff: 'Abweichung', bad: 'Konflikt', warn: 'unsicher' },
      kindWord: { s: 'Datenquelle', f: 'Befund', e: 'Ende' }, pending: 'ausstehend',
      stepOf: (a, b) => `Schritt ${a} von ${b}`, revision: (n) => `Revision ${n}`, currentRev: 'aktuell', originalImmutable: 'Ihre ursprüngliche Eingabe (unveränderlich)',
      overrideReset: 'Das manuelle Urteil gehörte zum früheren Ergebnis und wurde mit der neuen Prüfung zurückgesetzt.', seeSuggestion: 'Korrekturvorschlag ansehen',
      historicalNewFields: (n) => `Neue Felder (Revision ${n}) werden geprüft`, ready: 'Bereit', draftStale: 'Das angezeigte Ergebnis gilt für die gespeicherten Felder, nicht für Ihren Entwurf.',
      pasteTab: 'Einfügen', fileTab: 'Datei', selectionTab: 'Auswahl', newCheck: 'Neue Prüfung', adopted: 'Übernommen', docMeta: (p, sz) => `${p} Seiten · ${sz}`, regionCount: (n) => `${n} Referenzen`,
      structuring: 'Referenzen werden erkannt. Das ist kostenlos.', historyWillSave: 'Wird im Verlauf gespeichert. Das Löschdatum steht fest, sobald die Prüfung läuft.',
      historyConsent: 'Einwilligung im Konto erteilt.', currentEntry: 'Aktuell', historyDeleted: 'Eintrag gelöscht (Prototyp).', historyPrototype: 'Beispieleinträge des Prototyps.',
      howStep1: 'Referenzen werden erkannt. Das kostet kein Kontingent.', howStep2: 'Jede Referenz wird in mehreren Datenquellen gesucht.', howStep3: 'Treffer werden Feld für Feld verglichen und bewertet.', howStep4: 'Das Urteil ist ein Befund, kein Beweis. Unbekannte Evidenz bleibt unbekannt.',
      editListStub: 'Hier erscheint eine Vorschau der hinzugefügten und entfernten Einträge samt zusätzlichem Verbrauch, bevor etwas angewendet wird. Bereits verbrauchtes Kontingent wird nicht erstattet.', editListProto: 'Platzhalter im Prototyp.',
      downloadStub: 'Download gestartet (Prototyp).', reportStub: 'Bericht wird erstellt (Prototyp).', signInStub: 'Anmeldung (Prototyp).', planStub: 'Planwechsel (Prototyp).', copyFail: 'Kopieren nicht möglich.',
      themeLight: 'Hell', themeDark: 'Dunkel', historyToggle: 'Verlauf speichern', resetTitle: 'Prüfung zurücksetzen?', confirm: 'Bestätigen', exportFmt: 'Format', noMatch: 'Keine Treffer.', cmdNav: 'Navigation', cmdAct: 'Aktionen', cmdFilter: 'Filter', cmdRef: 'Referenz', gated: 'Gesperrt',
      noneInFilter: 'Keine Referenzen mit diesem Filter.', accountPlan: 'Plan', accountQuota: 'Kontingent', sourcesNote: 'Abgefragte Datenquellen und ihre Antwort', ms: (n) => n ? (n >= 1000 ? `${n / 1000} s` : `${n} ms`) : '–'
    },
    en: {
      sheetBtn: 'Check', verdictsHeading: 'Verdicts', tabFields: 'Fields', tabEvidence: 'Evidence', tabSources: 'Sources', tabHistory: 'History', tabHistoryFull: 'History of this slot',
      detailLabel: 'Reference detail', listTitle: 'References', settings: 'Settings', close: 'Close', apply: 'Apply',
      emptyDetail: 'Select a Reference', emptyDetailLead: 'Verdict, field comparison, evidence and sources appear here.',
      kUpDown: 'Select a Reference', kLR: 'Step through References', kNum: 'Filter by Verdict', kNum0: 'Clear filter', kEsc: 'Close, back', kCmd: 'Commands',
      inputUnchanged: 'Your input is not changed.', clearOverride: 'Clear manual judgment', judgePick: 'Choose the effective Verdict',
      resWord: { ok: 'confirmed', none: 'no hit', diff: 'deviation', bad: 'conflict', warn: 'uncertain' },
      kindWord: { s: 'Data source', f: 'Finding', e: 'End' }, pending: 'pending',
      stepOf: (a, b) => `Step ${a} of ${b}`, revision: (n) => `Revision ${n}`, currentRev: 'current', originalImmutable: 'Your original input (immutable)',
      overrideReset: 'The manual judgment belonged to the earlier result and was reset with the new check.', seeSuggestion: 'View Correction suggestion',
      historicalNewFields: (n) => `New fields (Revision ${n}) are being checked`, ready: 'Ready', draftStale: 'The result shown applies to the saved fields, not to your draft.',
      pasteTab: 'Paste', fileTab: 'File', selectionTab: 'Selection', newCheck: 'New Check', adopted: 'Adopted', docMeta: (p, sz) => `${p} pages · ${sz}`, regionCount: (n) => `${n} References`,
      structuring: 'Recognising References. This is free.', historyWillSave: 'Will be saved to History. The deletion date is set once the Check runs.',
      historyConsent: 'Consent given in Account.', currentEntry: 'Current', historyDeleted: 'Entry deleted (prototype).', historyPrototype: 'Prototype sample entries.',
      howStep1: 'References are recognised. This uses no Quota.', howStep2: 'Every Reference is searched in several Data sources.', howStep3: 'Hits are compared field by field and scored.', howStep4: 'A Verdict is a finding, not proof. Unknown evidence stays unknown.',
      editListStub: 'A preview of added and dropped entries and the extra consumption appears here before anything is applied. Quota already used is never refunded.', editListProto: 'Placeholder in the prototype.',
      downloadStub: 'Download started (prototype).', reportStub: 'Creating report (prototype).', signInStub: 'Sign-in (prototype).', planStub: 'Plan change (prototype).', copyFail: 'Copy not possible.',
      themeLight: 'Light', themeDark: 'Dark', historyToggle: 'Save History', resetTitle: 'Reset the Check?', confirm: 'Confirm', exportFmt: 'Format', noMatch: 'No matches.', cmdNav: 'Navigation', cmdAct: 'Actions', cmdFilter: 'Filters', cmdRef: 'Reference', gated: 'Locked',
      noneInFilter: 'No References with this filter.', accountPlan: 'Plan', accountQuota: 'Quota', sourcesNote: 'Data sources queried and their answer', ms: (n) => n ? (n >= 1000 ? `${n / 1000} s` : `${n} ms`) : '–'
    }
  });

  ST.variant({
    key: 'B', name: 'Three-pane workbench', css,
    mount(root, ctx) {
      const panel = ctx.surface === 'panel';
      const s = ST.state;
      const app = document.getElementById('app');
      const t = ST.t, L = ST.L, esc = ST.esc, ico = ST.ico, gly = ST.gly, stat = ST.stat;
      const VERD = ['correct', 'deviations', 'mixed', 'doi-conflict', 'not-found', 'not-verifiable'];
      const STAT = ['running', 'queued', 'cancelled', 'failed', 'not-checked'];
      const vName = (k) => t('verdict')[k], vShort = (k) => t('verdictShort')[k], sName = (k) => t('status')[k];
      const local = { tab: 'fields', sheet: false, judge: false, sub: null, cmdQ: '', cmdIdx: 0, ov: false, trigger: null, ovTop: 0, ovH: 0, fmt: 'csl', style: 'APA 7' };
      let typing = false, pendingScroll = null, focusAfter = null, lastSel = s.selected, lastToast = null, toastTimer = 0, lastLive = '', lastFocusKey = null, rowCache = {}, tabFocus = false;
      const regions = {};

      root.dataset.surface = ctx.surface;
      root.innerHTML = `
        <div data-r="banner"></div>
        <div class="bench" data-r="bench" data-mode="work" data-sel="0">
          <nav class="rail st-glass quiet" data-r="rail" aria-label="${esc(t('navLabel'))}"></nav>
          <aside class="facets" data-r="facets" data-scroll="facets" aria-label="${esc(t('filterActive'))}"></aside>
          <section class="listcol" data-scroll="listcol" aria-label="${esc(t('listTitle'))}"><div data-r="listtop"></div><ul class="rows" data-r="rows" data-scroll="list"></ul></section>
          <section class="detail" data-r="detail" data-scroll="detail" aria-label="${esc(t('detailLabel'))}"></section>
          <section class="page" data-r="page" data-scroll="page"></section>
        </div>
        <div class="toast-wrap" data-r="toast"></div>
        <div data-r="overlay"></div>
        <div class="sr-only" aria-live="polite" role="status" data-r="live"></div>`;
      const R = (n) => root.querySelector(`[data-r="${n}"]`);
      const bench = R('bench');
      const patch = (name, html) => { if (regions[name] === html) return false; regions[name] = html; R(name).innerHTML = html; return true; };

      /* ---------- small helpers ---------- */
      const sc = () => panel ? app : (document.scrollingElement || document.documentElement);
      const wide = () => root.clientWidth >= 1040;
      const narrow = () => root.clientWidth < 700;
      const mode = () => s.view !== 'check' ? 'page' : (s.stage === 'intake' || s.stage === 'structuring') ? 'intake' : 'work';
      const busy = () => ST.isBusy() || s.refs.some((r) => r.status === 'running' || r.status === 'queued' || r.status === 'rechecking');
      const stKey = (r) => r.status === 'rechecking' ? 'running' : r.status;
      const sub = () => s.filter === 'status' ? local.sub : null;
      const visList = () => ST.visible().filter((r) => !sub() || stKey(r) === sub());
      const origOf = (r) => ST.REFS.find((x) => x.id === r.id);
      const metaOf = (r) => Array.isArray(r.meta) ? L(r.meta) : r.meta;
      const canEdit = (r) => ['done', 'failed', 'cancelled', 'not-checked'].includes(r.status);
      const bt = (key, act, inner, o = {}) => `<button type="button" class="${o.cls || ''}" data-k="${key}" data-act="${act}"${o.id != null ? ` data-id="${o.id}"` : ''}${o.arg != null ? ` data-arg="${esc(o.arg)}"` : ''}${o.pressed != null ? ` aria-pressed="${o.pressed}"` : ''}${o.dis ? ' disabled' : ''}${o.adis ? ' aria-disabled="true"' : ''}${o.label ? ` aria-label="${esc(o.label)}"` : ''}${o.title ? ` title="${esc(o.title)}"` : ''}${o.extra || ''}>${inner}</button>`;
      const manualTag = () => `<span class="tag manual">${ico('i-pen')}${esc(t('manualTag'))}</span>`;
      const stepText = (r) => { const tr = r.trail[Math.max(0, r.step - 1)]; if (!tr) return ''; return tr[0] === 's' ? t('step').searching(L(tr[1])) : L(tr[1]); };
      const track = (tr) => tr.map((p) => typeof p === 'string' ? esc(p) : Array.isArray(p) ? `<span class="st-del">${esc(p[0])}</span><span class="st-ins">${esc(p[1])}</span>` : `<i>${esc(p.i)}</i>`).join('');
      const trackPlain = (tr) => tr.map((p) => typeof p === 'string' ? p : Array.isArray(p) ? p[1] : p.i).join('');

      /* ---------- rail ---------- */
      function railHtml() {
        const items = [['check', 'navCheck', 'i-search'], ['history', 'navHistory', 'i-history'], ['account', 'navAccount', 'i-user']];
        const rn = (key, act, arg, icon, label, cur, extraTip = '') => bt(key, act, `${ico(icon)}<span class="lbl">${esc(label)}</span><span class="tip" aria-hidden="true">${esc(label)}${extraTip}</span>`, { cls: 'rn', arg, label, extra: cur ? ' aria-current="page"' : '' });
        return `<div class="rail-mark">${ST.mark(28)}<span class="rail-name">${esc(t('productName'))}</span></div>
          <div class="rail-seg">${items.map(([v, k, i]) => rn('nav-' + v, 'nav', v, i, t(k), s.view === v)).join('')}</div>
          <div class="rail-cmd">${rn('cmd', 'cmd', '', 'i-cmd', t('cmdHint'), false, ' <span class="kbd">⌘K</span>')}</div>
          <div class="rail-set">${rn('settings', 'dialog', 'settings', 'i-gear', t('settings'), false)}</div>`;
      }

      /* ---------- session + actions (side-top on wide, sheet when narrower) ---------- */
      function sessionHtml() {
        const guest = s.account === 'guest';
        const started = s.stage !== 'intake' && s.stage !== 'structuring';
        const store = s.historyOn ? (started ? t('storageHistory', ST.date(ST.HISTORY[0].deletes)) : t('historyWillSave')) : t('storageTemp');
        const av = ST.available(), gr = s.quota.granted, pct = Math.max(0, Math.min(100, av / gr * 100));
        return `<div class="grp"><span class="badge">${ico('i-user')}${guest ? esc(t('guest')) : esc(t('signedInAs', ST.ACCOUNT.free.name))}</span>
            ${guest ? `<div class="note warn">${ico('i-info')}<div>${esc(t('guestNotice'))} ${bt('signin' + (local.sheet ? '-s' : ''), 'signin', esc(t('signIn')), { cls: 'btn link sm' })}</div></div>` : ''}</div>
          <div class="grp small"><span class="eyebrow">${esc(t('quotaLabel'))}</span>
            <div class="meter" role="img" aria-label="${esc(t('quotaMeter', av, gr))}"><i style="width:${pct}%"></i></div>
            <span class="tnum">${esc(t('quotaMeter', av, gr))}${s.quota.reserved ? ' · ' + esc(t('quotaReserved', s.quota.reserved)) : ''}</span></div>
          <div class="grp small"><span class="eyebrow">${esc(guest ? t('navHistory') : t('navHistory'))}</span>
            <span>${ico(s.historyOn ? 'i-history' : 'i-info')} ${esc(store)}</span>${s.historyOn ? `<span class="muted">${esc(t('historyConsent'))}</span>` : ''}</div>`;
      }
      function actionsHtml(p) {
        const st = s.stage, has = st === 'counted' || st === 'running' || st === 'done';
        const bz = busy(), anyDone = s.refs.some((r) => r.status === 'done');
        const o = [];
        if (st === 'running') o.push(bt(p + 'stop', 'stop', ico('i-stop') + esc(t('stop')), { cls: 'btn sm danger' }));
        if (st !== 'intake' && st !== 'structuring') o.push(bt(p + 'reset', 'reset', ico('i-reset') + esc(t('reset')), { cls: 'btn sm' }));
        if (has) o.push(bt(p + 'editlist', 'editlist', ico('i-edit-list') + esc(t('editList')), { cls: 'btn sm', adis: bz, extra: bz ? ` aria-describedby="${p}gate"` : '' }));
        if (has) o.push(bt(p + 'export', 'dialog', ico('i-download') + esc(t('exportAction')), { cls: 'btn sm', arg: 'export', dis: !anyDone, title: anyDone ? '' : t('checkDisabledHint') }));
        if (has) o.push(bt(p + 'report', 'dialog', ico('i-pdf') + esc(t('reportAction')), { cls: 'btn sm', arg: 'report', dis: !anyDone }));
        o.push(bt(p + 'how', 'dialog', ico('i-help') + esc(t('howItWorks')), { cls: 'btn sm', arg: 'how' }));
        return `<div class="acts">${o.join('')}${has && bz ? `<p class="gate small muted" id="${p}gate">${ico('i-lock')} ${esc(t('editListGated'))}</p>` : ''}</div>
          ${p === 's-' ? `<p class="disc">${esc(t('disclaimer'))}</p>` : ''}`;
      }
      const sideTopHtml = () => `<div class="side-top">${sessionHtml()}${actionsHtml('w-')}</div>`;

      /* ---------- facets ---------- */
      function facetsHtml() {
        const C = ST.counts(), n = ST.N(), started = s.stage !== 'intake' && s.stage !== 'structuring';
        const ok = C.verdicts.correct;
        const vf = VERD.map((v) => { const c = C.verdicts[v]; return bt('f-' + v, 'filter', `${gly(v)}<span class="fl"><span class="full">${esc(vName(v))}</span><span class="short">${esc(vShort(v))}</span></span><span class="n">${c}</span>`, { cls: 'facet' + (c ? '' : ' zero'), arg: v, pressed: s.filter === v, extra: ` data-v="${v}"` }); }).join('');
        const sf = STAT.map((k) => { const c = C.statuses[k]; return bt('f-s-' + k, 'sfilter', `${stat(k, k === 'running' ? 'spin' : '')}<span class="fl"><span class="full">${esc(sName(k))}</span><span class="short">${esc(sName(k))}</span></span><span class="n">${c}</span>`, { cls: 'facet' + (c ? '' : ' zero'), arg: k, pressed: s.filter === 'status' && local.sub === k }); }).join('');
        return `${sideTopHtml()}
          <div class="fh eyebrow">${esc(t('verdictsHeading'))}</div>
          ${started && ST.counts().done ? `<p class="sum"><b>${esc(t('summarySentence', ok, n))}</b>${esc(t('summaryRest'))}</p>` : ''}
          <div class="facet-list" data-scroll="chips" role="group" aria-label="${esc(t('verdictsHeading'))}">${vf}<span class="fsep" role="separator"></span><div class="fsep-h eyebrow">${esc(t('statusesHeading'))}</div>${sf}</div>`;
      }

      /* ---------- list ---------- */
      function countBarHtml() {
        if (s.stage !== 'counted') return '';
        const n = ST.N(), av = ST.available();
        if (av >= n) return `<div class="cbar" role="status"><div class="head">${ico('i-info')}<div><b>${esc(t('detected', n))}</b> · ${esc(t('quotaPreview', n, av, av - n))} ${esc(t('autoStart'))}</div></div><div class="btns">${bt('cb-cancel', 'resetok', esc(t('cancel')), { cls: 'btn sm' })}</div></div>`;
        return `<div class="cbar warn" role="group" aria-label="${esc(t('quotaChoiceHeading'))}"><div class="head">${ico('i-info')}<div><b>${esc(t('detected', n))}</b><br><b>${esc(t('quotaChoiceHeading'))}</b><br>${esc(t('quotaChoiceBody', n, av))}</div></div>
          <div class="btns">${bt('cb-first', 'run', esc(t('quotaChoiceFirst', av)), { cls: 'btn sm primary', arg: av })}
          ${bt('cb-up', 'upgrade', panel ? esc(t('quotaUpgradeWeb')) + ico('i-ext') : esc(t('quotaUpgrade')), { cls: panel ? 'btn sm link' : 'btn sm' })}
          ${bt('cb-cancel', 'resetok', esc(t('cancel')), { cls: 'btn sm' })}</div></div>`;
      }
      function listTopHtml() {
        const C = ST.counts(), n = ST.N(), run = s.stage === 'running';
        const pct = Math.round(C.done / n * 100);
        const fl = s.filter ? (s.filter === 'status' ? (local.sub ? sName(local.sub) : t('statusesHeading')) : vName(s.filter)) : '';
        return `<div class="lt"><div class="lt-row"><h2>${esc(t('listTitle'))} <span class="n">${n}</span></h2>
            ${bt('sheetbtn', 'sheet', esc(t('sheetBtn')) + ico('i-more'), { cls: 'btn sm sheet-btn', pressed: local.sheet, extra: ' aria-expanded="' + local.sheet + '"' })}
            ${bt('how-l', 'dialog', ico('i-help'), { cls: 'btn sm icon', arg: 'how', label: t('howItWorks'), title: t('howItWorks') })}</div>
          ${run || busy() ? `<div><div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${C.done}" aria-label="${esc(t('running'))}"><i style="width:${pct}%"></i></div><p class="small muted">${esc(t('progress', C.done, n))} · ${esc(t('orderNote'))}</p></div>` : ''}
          ${s.filter ? `<div class="lt-row"><span class="fchip"${VERD.includes(s.filter) ? ` data-v="${s.filter}"` : ''}>${esc(t('filterActive'))}: ${VERD.includes(s.filter) ? gly(s.filter) : ''}${esc(fl)}${bt('fclear', 'fclear', ico('i-x'), { cls: 'btn icon sm', label: t('filterClear'), title: t('filterClear') })}</span></div>` : ''}</div>
          ${local.sheet ? `<div class="sheet">${sessionHtml()}${actionsHtml('s-')}</div>` : ''}${countBarHtml()}`;
      }
      function rowHtml(r) {
        const sel = s.selected === r.id, st = r.status;
        let lead, vl = '', mt = `${esc(r.au)} · ${esc(r.yr)}`, bar = '';
        if (st === 'done') { const ev = ST.effective(r); lead = gly(ev); vl = `<span class="vt">${esc(vName(ev))}</span>${r.override ? manualTag() : ''}`; }
        else if (st === 'rechecking') { lead = stat('running', 'spin'); vl = `<span class="vt">${esc(t('recheckRunning'))}</span>${r.hist && r.hist.verdict ? `<span class="muted">${esc(t('historicalResult'))}: ${esc(vShort(r.hist.verdict))}</span>` : ''}`; }
        else if (st === 'running') { lead = stat('running', 'spin'); vl = `<span class="vt">${esc(sName('running'))}</span><span class="tnum mono">${r.step}/${r.trail.length}</span>`; mt = esc(stepText(r) || t('step').searching('…')); bar = `<div class="prog"><i style="width:${Math.round(r.step / r.trail.length * 100)}%"></i></div>`; }
        else if (st === 'failed') { lead = stat('failed'); vl = `<span class="vt">${esc(sName('failed'))}</span><span class="muted">${esc(t('notBilled'))}</span>`; }
        else if (st === 'idle') { lead = stat('queued'); vl = `<span class="vt">${esc(t('ready'))}</span>`; }
        else { lead = stat(st); vl = `<span class="vt">${esc(sName(st))}</span>`; }
        return `<li data-rid="${r.id}"><button type="button" class="row" data-k="row-${r.id}" data-act="open" data-id="${r.id}" aria-current="${sel}"${r.status === 'done' && r.verdict ? ` data-v="${ST.effective(r)}"` : ''}>
          <span class="lead">${lead}</span><span><span class="t">${esc(r.title)}</span><span class="vl">${vl}</span><span class="mt" style="display:block">${mt}</span>${bar}</span><span class="num">#${r.id}</span></button></li>`;
      }
      function patchRows() {
        const host = R('rows'), vis = visList(), items = vis.map((r) => ({ id: r.id, html: rowHtml(r) }));
        const emptyMsg = vis.length ? '' : `<li class="empty-list"><span>${esc(t('noneInFilter'))}</span>${bt('fclear2', 'fclear', esc(t('filterClear')), { cls: 'btn sm' })}</li>`;
        const key = items.map((i) => i.id).join(',') + (vis.length ? '' : '|' + (s.filter || '') + (local.sub || ''));
        if (host.dataset.ids !== key) { host.innerHTML = items.map((i) => i.html).join('') + emptyMsg; host.dataset.ids = key; }
        else items.forEach((i) => { if (rowCache[i.id] !== i.html) { const el = host.querySelector(`[data-rid="${i.id}"]`); if (el) el.outerHTML = i.html; } });
        rowCache = Object.fromEntries(items.map((i) => [i.id, i.html]));
      }

      /* ---------- detail ---------- */
      function emptyDetail() {
        const k = (keys, d) => `<dt>${keys}</dt><dd>${esc(d)}</dd>`;
        return `<div class="empty-d">${ST.mark(36)}<h2>${esc(t('emptyDetail'))}</h2><p class="muted">${esc(t('emptyDetailLead'))}</p>
          <dl class="keys">${k('<kbd>↑</kbd><kbd>↓</kbd>', t('kUpDown'))}${k('<kbd>←</kbd><kbd>→</kbd>', t('kLR'))}${k('<kbd>1</kbd>–<kbd>6</kbd>', t('kNum'))}${k('<kbd>0</kbd>', t('kNum0'))}${k('<kbd>Esc</kbd>', t('kEsc'))}${k('<kbd>⌘K</kbd>', t('kCmd'))}</dl>
          <p class="disc">${esc(t('disclaimer'))}</p></div>`;
      }
      function cmpRows(r, o) {
        const rows = o.hist ? r.rows.map(([k, y, b, , by]) => ({ key: k, label: L(ST.FIELDS[k]), yours: y, best: b, deviates: y !== b, by })) : ST.rows(r);
        const head = `<div class="fhead"><span>${esc(t('field'))}</span><span>${esc(t('yours'))}</span><span>${esc(t('bestMatch'))}</span></div>`;
        return head + rows.map((x) => {
          const yours = o.edit ? `<textarea class="fin" rows="${x.key === 'title' ? 3 : 1}" data-k="d-${x.key}" data-draft="1" data-id="${r.id}" data-key="${x.key}" aria-label="${esc(x.label)}">${esc(r.draft[x.key] ?? '')}</textarea>` : `<span class="val ${x.deviates ? 'st-dev' : ''}">${x.yours ? esc(x.yours) : `<span class="muted">${esc(t('unknown'))}</span>`}</span>`;
          return `<div class="frow k-${x.key} ${x.deviates ? 'dev' : ''}"><div class="fk"><span>${esc(x.label)}</span>${o.edit ? '' : x.deviates ? `<span class="flag">${ico('e-diff')}${esc(t('deviates'))}</span>` : `<span class="okf">${ico('e-ok')}${esc(t('matches'))}</span>`}</div>
            <div class="fy"><span class="cap">${esc(t('yours'))}</span>${yours}</div>
            <div class="fb"><span class="cap">${esc(t('bestMatch'))}</span><span class="val">${esc(x.best)}</span>${x.by && x.by.length ? `<span class="by">${esc(t('backedBy'))}: ${x.by.map(esc).join(' · ')}</span>` : ''}</div></div>`;
        }).join('');
      }
      function suggestionHtml(r) {
        const g = r.suggestion; if (!g || r.status !== 'done') return '';
        const m = s.corrModel;
        let act = '';
        if (m === 'export') act = `${bt('s-export', 'pick', ico(r.exportPick ? 'i-check' : 'i-plus') + esc(r.exportPick ? t('usedForExport') : t('useForExport')), { cls: 'btn sm', id: r.id, pressed: r.exportPick })}<span class="small muted">${esc(t('useForExportNote'))} ${esc(t('inputUnchanged'))}</span>`;
        else if (m === 'draft') act = r.draft ? `<span class="small muted">${esc(t('draftNote'))}</span>` : `${bt('s-apply', 'applyfields', ico('i-pen') + esc(t('applyToFields')), { cls: 'btn sm', id: r.id })}<span class="small muted">${esc(t('applyToFieldsNote'))}</span>`;
        else act = `${bt('s-accept', 'accept', ico('i-check') + esc(r.accepted ? t('corrected') : t('acceptCorrection')), { cls: 'btn sm', id: r.id, pressed: r.accepted })}<span class="tag amend">${ico('i-info')}${esc(t('needsAmendment'))}</span>${r.accepted ? `<span class="small muted">${esc(t('acceptedNote'))}</span>` : ''}`;
        return `<section class="sug" aria-label="${esc(t('suggestionHeading'))}"><div><h3>${esc(t('suggestionHeading'))}</h3><span class="eyebrow">${esc(g.style)} · ${esc(g.by.join(' · '))}</span></div>
          <p class="track">${track(g.track)}</p>
          <div class="acts">${bt('s-copy', 'copy', ico('i-copy') + esc(t('copy')), { cls: 'btn sm', id: r.id })}${act}</div></section>`;
      }
      function fieldsTab(r) {
        const out = [];
        const o = origOf(r);
        if (r.status === 'rechecking') {
          out.push(`<div class="note">${stat('running', 'spin')}<div><b>${esc(t('recheckRunning'))}</b><br>${esc(t('historicalNewFields', r.revision))}</div></div>`);
          out.push(`<div class="sec"><h3>${esc(t('historicalNewFields', r.revision))}</h3><dl class="kv">${Object.entries(r.fields || { title: r.title }).map(([k, v]) => `<dt>${esc(L(ST.FIELDS[k]))}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>`);
          out.push(`<div class="hist-block"><div class="eyebrow">${esc(t('historicalResult'))}</div>${r.rows ? `<div class="sec">${cmpRows(r, { hist: true })}</div>` : `<p class="small muted">${esc(t('noCandidate'))}</p>`}</div>`);
          return out.join('');
        }
        out.push(`<div class="sec"><h3>${esc(t('original'))}</h3><blockquote class="orig" title="${esc(t('originalImmutable'))}">${esc(`${o.au} (${o.yr}). ${o.title}. ${metaOf(o)}.`)}</blockquote></div>`);
        if (r.draft) {
          out.push(`<div class="note warn">${ico('i-info')}<div>${esc(t('draftNote'))} ${esc(t('draftStale'))}</div></div>`);
          out.push(`<div class="sec"><h3>${esc(t('compare'))}</h3>${r.rows ? cmpRows(r, { edit: true }) : Object.keys(r.draft).map((k) => `<div class="frow k-${k}"><div class="fk"><span>${esc(L(ST.FIELDS[k]))}</span></div><div class="fy"><textarea class="fin" rows="3" data-k="d-${k}" data-draft="1" data-id="${r.id}" data-key="${k}" aria-label="${esc(L(ST.FIELDS[k]))}">${esc(r.draft[k] ?? '')}</textarea></div></div>`).join('')}</div>`);
          const billed = r.verdict != null && r.status === 'done';
          out.push(`<div class="dact">${bt('d-save', 'save', ico('i-undo') + esc(t('saveRecheck')), { cls: 'btn primary', id: r.id })}${bt('d-discard', 'discard', esc(t('discardDraft')), { cls: 'btn', id: r.id })}</div><p class="small muted">${billed ? esc(t('recheckFree')) : ''}</p>`);
        } else if (r.rows) {
          out.push(`<div class="sec"><h3>${esc(t('compare'))}</h3>${cmpRows(r, {})}</div>`);
        } else if (r.status === 'done' || r.status === 'failed') {
          out.push(`<div class="note">${ico('i-info')}<div>${esc(t('noCandidate'))}</div></div>`);
        }
        out.push(suggestionHtml(r));
        return out.join('');
      }
      function evidenceTab(r) {
        const live = r.status === 'running' || r.status === 'queued';
        const items = r.trail.map((e, i) => {
          const pend = live && i >= r.step;
          const [kind, txt, res] = e;
          const label = kind === 's' ? `${t('kindWord').s}: ${L(txt)}` : L(txt);
          return `<li class="${res} ${pend ? 'pending' : ''}"><span class="rd">${ico(kind === 'e' ? 'e-end' : 'e-' + res)}</span><span>${esc(label)}${pend ? `<span class="rw">${esc(t('pending'))}</span>` : `<span class="rw">${esc(t('resWord')[res])}</span>`}</span></li>`;
        }).join('');
        return `<div class="sec"><h3>${esc(t('trailHeading'))}${live ? ` · ${esc(t('stepOf', r.step, r.trail.length))}` : ''}</h3><ol class="trail">${items}</ol></div>`;
      }
      function sourcesTab(r) {
        const sr = r.srcs.map(([name, res, note, ms]) => `<li class="src"><span class="sn">${esc(name)}</span><span class="ms">${esc(t('ms', ms))}</span><span class="sr">${ico('e-' + res)} <b>${esc(t('resWord')[res])}</b> · ${esc(L(note))}</span></li>`).join('');
        const cands = (r.candidates || []).map((c) => `<details class="cand"><summary><span class="mono">${esc(c.src)}</span><span class="score">${esc(t('score'))} ${c.score.toFixed(2)}</span><span>${esc(c.title)}</span></summary><p class="small muted" style="padding-top:6px">${esc(c.yr)} · ${esc(c.src)} · ${esc(t('score'))} ${c.score.toFixed(2)}</p></details>`).join('');
        return `<div class="sec"><h3>${esc(t('sourcesHeading'))}</h3><ul>${sr}</ul></div>${cands ? `<div class="sec"><h3>${esc(t('candidatesHeading'))}</h3>${cands}</div>` : ''}${r.rows ? '' : `<div class="note">${ico('i-info')}<div>${esc(t('noCandidate'))}</div></div>`}`;
      }
      function historyTab(r) {
        const o = origOf(r);
        const curLabel = r.status === 'done' ? (r.verdict ? `${gly(ST.effective(r))} ${esc(vName(ST.effective(r)))}` : '') : `${stat(stKey(r))} ${esc(sName(stKey(r)))}`;
        const hist = r.hist ? `<li><div class="rv">${esc(t('revision', r.hist.revision))} <span class="tag">${esc(t('historicalResult'))}</span></div><div>${r.hist.verdict ? `${gly(r.hist.verdict)} ${esc(vName(r.hist.verdict))}` : ''}</div>${r.hist.override ? `<p class="small muted">${manualTag()} ${esc(t('manualVerdict', vName(r.hist.override.verdict)))} · ${esc(t('overrideReset'))}</p>` : ''}</li>` : '';
        return `<ol class="revs"><li class="cur"><div class="rv">${esc(t('revision', r.revision))} <span class="tag">${esc(t('currentRev'))}</span></div><div>${curLabel}</div>${r.override ? `<p class="small muted">${manualTag()} ${esc(t('manualVerdict', vName(r.override.verdict)))}</p>` : ''}</li>${hist}
          <li><div class="rv">${esc(t('original'))}</div><p class="orig">${esc(`${o.au} (${o.yr}). ${o.title}. ${metaOf(o)}.`)}</p><p class="small muted">${esc(t('originalImmutable'))}</p></li></ol>
          <p class="small muted">${esc(r.verdict != null || r.hist ? t('recheckFree') : t('notBilled'))}</p>`;
      }
      function verdictCard(r) {
        const st = r.status;
        if (st === 'done') {
          const ev = ST.effective(r);
          return `<div class="vcard" data-v="${ev}">${gly(ev)}<div class="vn">${esc(vName(ev))}${r.override ? manualTag() : ''}</div><p class="why">${esc(L(r.reason))}</p>
            ${r.override ? `<div class="sub"><span>${esc(t('manualVerdict', vName(ev)))}</span><span>${esc(t('systemVerdict', vName(r.sysVerdict)))}</span>${r.override.note ? `<span>“${esc(L(r.override.note))}”</span>` : ''}</div>` : ''}</div>`;
        }
        if (st === 'rechecking') return `<div class="vcard">${stat('running', 'spin')}<div class="vn">${esc(sName('running'))} · ${esc(t('recheckRunning'))}</div><p class="why">${esc(t('recheckFree'))}</p>
            ${r.hist ? `<div class="sub" data-v="${r.hist.verdict || ''}"><span class="eyebrow">${esc(t('historicalResult'))}</span><span>${r.hist.verdict ? gly(r.hist.verdict) + ' ' + esc(vName(r.hist.verdict)) : ''}${r.hist.override ? ' ' + manualTag() : ''}</span></div>` : ''}</div>`;
        if (st === 'failed') return `<div class="vcard" style="--vt:var(--st-feedback-danger-tint);--vb:var(--st-feedback-danger)">${stat('failed')}<div class="vn">${esc(sName('failed'))}</div><p class="why">${esc(L(r.reason))}</p></div>`;
        if (st === 'running') return `<div class="vcard">${stat('running', 'spin')}<div class="vn">${esc(sName('running'))} · <span class="mono tnum">${esc(t('stepOf', r.step, r.trail.length))}</span></div><p class="why">${esc(stepText(r))}</p></div>`;
        return `<div class="vcard">${stat(st === 'idle' ? 'queued' : st)}<div class="vn">${esc(st === 'idle' ? t('ready') : sName(st))}</div></div>`;
      }
      function actionsRow(r) {
        const out = [];
        if (r.status === 'failed') out.push(bt('d-retry', 'retry', ico('i-undo') + esc(t('retry')), { cls: 'btn primary', id: r.id }));
        if (canEdit(r) && !r.draft) out.push(bt('d-edit', 'edit', ico('i-pen') + esc(t('editFields')), { cls: 'btn', id: r.id }));
        if (r.status === 'done') {
          out.push(bt('d-confirm', 'override', ico('i-check') + esc(t('confirmVerdict')), { cls: 'btn', id: r.id, arg: r.sysVerdict }));
          out.push(bt('d-judge', 'judge', ico('i-shield') + esc(t('judgeManually')), { cls: 'btn', pressed: local.judge }));
          if (r.override) out.push(bt('d-clear', 'clearov', esc(t('clearOverride')), { cls: 'btn', id: r.id }));
          if (r.suggestion && local.tab !== 'fields') out.push(bt('d-seesug', 'tab', esc(t('seeSuggestion')), { cls: 'btn link sm', arg: 'fields' }));
        }
        let html = out.length ? `<div class="dact">${out.join('')}</div>` : '';
        if (r.status === 'done' && local.judge) html += `<div class="judge"><b class="small">${esc(t('judgePick'))}</b><div class="opts">${VERD.map((v) => bt('j-' + v, 'override', `${gly(v)}${esc(vShort(v))}`, { cls: 'btn sm', id: r.id, arg: v, pressed: ST.effective(r) === v, extra: ` data-v="${v}"` })).join('')}</div><p class="small muted">${esc(t('overrideNote'))}</p></div>`;
        return html;
      }
      function detailHtml() {
        const r = ST.ref(s.selected);
        if (!r) return emptyDetail();
        const vis = visList(), idx = vis.findIndex((x) => x.id === r.id);
        const tabs = [['fields', 'tabFields'], ['evidence', 'tabEvidence'], ['sources', 'tabSources'], ['history', 'tabHistory']];
        const body = local.tab === 'evidence' ? evidenceTab(r) : local.tab === 'sources' ? sourcesTab(r) : local.tab === 'history' ? historyTab(r) : fieldsTab(r);
        return `<div class="dwrap"><div class="dnav">${bt('back', 'back', ico('i-back') + esc(t('back')), { cls: 'btn sm only-narrow', label: t('backToList') })}
            <span class="pos">${esc(t('refPos', idx >= 0 ? idx + 1 : r.id, idx >= 0 ? vis.length : ST.N()))} · #${r.id}</span>
            ${bt('d-prev', 'step', ico('i-back'), { cls: 'btn icon', arg: '-1', label: t('prev'), title: t('prev') + ' (←)' })}${bt('d-next', 'step', ico('i-chev'), { cls: 'btn icon', arg: '1', label: t('next'), title: t('next') + ' (→)' })}</div>
          <h2 class="dt">${esc(r.title)}</h2><p class="dmeta mono">${esc(r.au)} · ${esc(r.yr)} · ${esc(metaOf(r))}</p>
          ${verdictCard(r)}${r.draft && r.status === 'done' ? `<p class="small muted" style="margin-top:6px">${esc(t('draftStale'))}</p>` : ''}${actionsRow(r)}
          <p class="disc">${esc(t('disclaimer'))}</p>
          <div class="tabs" role="tablist" aria-label="${esc(t('detailLabel'))}">${tabs.map(([k, l]) => bt('tab-' + k, 'tab', esc(t(l)), { cls: 'tab', arg: k, label: k === 'history' ? t('tabHistoryFull') : '', extra: ` role="tab" aria-selected="${local.tab === k}"` })).join('')}</div>
          <div class="tp" role="tabpanel">${body}</div></div>`;
      }

      /* ---------- page: intake / history / account ---------- */
      function intakeHtml() {
        if (s.stage === 'structuring') return `<div class="pg"><h2>${esc(t('newCheck'))}</h2><div class="note" role="status">${stat('running', 'spin')}<div>${esc(t('step').structuring)} ${esc(t('structuring'))}</div></div></div>`;
        const src = s.intakeSource;
        const tabs = [['paste', 'pasteTab', 'i-pen'], ['file', 'fileTab', 'i-doc']].concat(panel ? [['selection', 'selectionTab', 'i-panel']] : []);
        const segs = tabs.map(([k, l, i]) => bt('src-' + k, 'src', ico(i) + esc(t(l)), { arg: k, pressed: src === k })).join('');
        let body = '';
        if (src === 'file') {
          const D = ST.DOCUMENT;
          body = `<div class="doc">${ico('i-doc', 'big')}<div><b>${esc(D.name)}</b><br><span class="small muted">${esc(t('docMeta', D.pages, D.size))}</span></div>${bt('in-file', 'file', esc(t('intakeFile')), { cls: 'btn sm' })}</div>
            ${s.account === 'guest' ? `<div class="note warn">${ico('i-info')}<div>${esc(t('aiGuest'))}</div></div>` : ''}
            <div class="sec"><h3>${esc(t('regionsHeading'))}</h3><p class="small muted">${esc(t('regionsHint'))}</p>
            ${s.regions.map((g) => `<div class="region">${bt('rg-' + g.id, 'region', ico('i-check'), { cls: 'cb', arg: g.id, label: L(g.label), extra: ` role="checkbox" aria-checked="${g.selected}"` })}<span>${esc(L(g.label))}</span><span class="small muted tnum">${esc(t('regionCount', g.count))}</span></div>`).join('')}</div>
            <div class="sec"><h3>${esc(t('rejectedHeading'))}</h3>${s.rejected.map((x) => `<div class="rej"><span class="mono">${esc(L(ST.DOCUMENT.rejected[+x.id.slice(1)]))}</span>${bt('rj-' + x.id, 'adopt', x.adopted ? ico('i-check') + esc(t('adopted')) : esc(t('rejectedAdopt')), { cls: 'btn sm', arg: x.id, dis: x.adopted })}</div>`).join('')}</div>`;
        } else {
          body = `${src === 'selection' ? `<div class="note">${ico('i-panel')}<div>${esc(t('selectionTaken', ST.SELECTION.count, ST.SELECTION.page))}</div></div>` : ''}
            <textarea class="ta" data-k="in" data-input="1" placeholder="${esc(t('intakePlaceholder'))}" aria-label="${esc(t('intakeTitle'))}" spellcheck="false">${esc(s.input)}</textarea>
            <div class="checkrow">${bt('in-example', 'example', ico('i-plus') + esc(t('intakeExample')), { cls: 'btn sm' })}<span class="small muted">${esc(t('intakeHint'))}</span></div>
            <div class="drop">${ico('i-upload', 'big')}<div style="flex:1"><b>${esc(t('intakeDrop'))}</b><br><span class="small muted">${esc(t('intakeFormats'))}</span></div>${bt('in-file', 'file', esc(t('intakeFile')), { cls: 'btn sm' })}</div>`;
        }
        const can = ST.act.canStart();
        return `<div class="pg"><div><span class="eyebrow">${esc(t('newCheck'))}</span><h2>${esc(t('intakeTitle'))}</h2></div><p class="lead">${esc(t('intakeLead'))}</p>
          <div class="seg" role="group" aria-label="${esc(t('intakeTitle'))}">${segs}</div>${body}
          <div class="checkrow">${bt('check', 'start', esc(t('checkAction')) + ' <span class="kbd" aria-hidden="true">⌘↵</span>', { cls: 'btn primary', dis: !can, extra: ' aria-describedby="check-hint"' })}<span class="small muted" id="check-hint" data-hint ${can ? 'hidden' : ''}>${esc(t('checkDisabledHint'))}</span></div></div>`;
      }
      function historyHtml() {
        const rows = ST.HISTORY.map((h) => {
          const counts = Object.entries(h.counts).map(([v, n]) => `<span title="${esc(vName(v))}">${gly(v)}<span class="sr-only">${esc(vName(v))}</span>${n}</span>`).join('');
          return `<li class="hentry${h.locked ? ' locked' : ''}"><div class="hn">${esc(L(h.name))}${h.current ? `<span class="tag manual">${esc(t('currentEntry'))}</span>` : ''}${h.locked ? `<span class="tag">${ico('i-lock')}${esc(t('historyLocked'))}</span>` : ''}</div>
            <div class="small muted">${esc(ST.date(h.date))} · ${esc(t('historyCount', h.refs))} · ${esc(t('historyExpires', ST.date(h.deletes)))}</div><div class="hcounts" aria-label="${esc(t('verdictsHeading'))}">${counts}</div>
            <div class="hacts">${bt('ho-' + h.id, 'hopen', esc(t('historyOpen')), { cls: 'btn sm primary', arg: h.id, dis: !!h.locked })}${bt('hn-' + h.id, 'hnew', ico('i-reset') + esc(t('historyRestart')), { cls: 'btn sm', arg: h.id, dis: !!h.locked })}${bt('hd-' + h.id, 'hdel', ico('i-trash') + esc(t('historyDelete')), { cls: 'btn sm danger', arg: h.id })}</div>
            ${h.locked ? '' : `<div class="note warn">${ico('i-info')}<div>${esc(t('historyBillable', h.refs))}</div></div>`}</li>`;
        }).join('');
        return `<div class="pg"><h2>${esc(t('historyHeading'))}</h2>
          ${s.historyOn ? `<p class="small muted">${esc(t('historyConsent'))} ${esc(t('historyPrototype'))}</p>` : `<div class="note">${ico('i-info')}<div>${esc(t('historyOff'))} ${esc(t('storageTemp'))} ${bt('h-on', 'histon', esc(t('historyEnable')), { cls: 'btn link sm' })}<br><span class="muted">${esc(t('historyPrototype'))}</span></div></div>`}
          <ul style="display:flex;flex-direction:column;gap:10px">${rows}</ul></div>`;
      }
      function accountHtml() {
        const guest = s.account === 'guest', A = ST.ACCOUNT, av = ST.available(), gr = s.quota.granted;
        return `<div class="pg"><h2>${esc(t('navAccount'))}</h2><p class="lead">${esc(t('accountStub'))}</p>
          <div class="card">${guest ? `<div class="note warn">${ico('i-info')}<div>${esc(t('guestNotice'))}</div></div>${bt('ac-signin', 'signin', esc(t('signIn')), { cls: 'btn primary' })}`
            : `<dl class="kv"><dt>${esc(t('signedInAs', ''))}</dt><dd>${esc(A.free.name)} · ${esc(A.free.email)}</dd></dl>`}
            <dl class="kv"><dt>${esc(t('accountPlan'))}</dt><dd>${guest ? esc(t('guest')) : esc(A.free.plan)}</dd><dt>${esc(t('accountQuota'))}</dt><dd><span class="tnum">${esc(t('quotaMeter', av, gr))}</span><div class="meter" style="margin-top:4px"><i style="width:${Math.max(0, av / gr * 100)}%"></i></div></dd></dl>
            ${panel ? `<p class="small muted">${esc(t('planWebOnly'))}</p>${bt('ac-plan', 'upgrade', esc(t('quotaUpgradeWeb')) + ico('i-ext'), { cls: 'btn link' })}` : bt('ac-plan', 'upgrade', esc(t('quotaUpgrade')), { cls: 'btn' })}</div>
          <div class="card"><h3>${esc(t('preferences'))}</h3>
            <div class="checkrow">${bt('ac-hist', 'histtoggle', esc(t('historyToggle')), { cls: 'btn', pressed: s.historyOn })}<span class="small muted">${esc(s.historyOn ? t('historyConsent') : t('storageTemp'))}</span></div>
            ${bt('ac-set', 'dialog', ico('i-gear') + esc(t('settings')), { cls: 'btn sm', arg: 'settings' })}</div></div>`;
      }
      const pageHtml = () => s.view === 'history' ? historyHtml() : s.view === 'account' ? accountHtml() : mode() === 'intake' ? intakeHtml() : '';

      /* ---------- overlays ---------- */
      function cmdItems() {
        const out = [], g = (x) => x;
        [['check', 'navCheck', 'i-search'], ['history', 'navHistory', 'i-history'], ['account', 'navAccount', 'i-user']].forEach(([v, k, i]) => out.push({ g: t('cmdNav'), label: t(k), icon: i, run: () => ST.act.nav(v) }));
        const st = s.stage, has = st === 'counted' || st === 'running' || st === 'done', bz = busy(), anyDone = s.refs.some((r) => r.status === 'done');
        if (st === 'running') out.push({ g: t('cmdAct'), label: t('stop'), icon: 'i-stop', run: () => ST.act.stop() });
        if (st !== 'intake' && st !== 'structuring') out.push({ g: t('cmdAct'), label: t('reset'), icon: 'i-reset', run: () => ST.act.dialog('reset') });
        if (has) out.push({ g: t('cmdAct'), label: t('editList'), icon: 'i-edit-list', dis: bz ? t('editListGated') : '', run: () => ST.act.dialog('editlist') });
        if (has && anyDone) { out.push({ g: t('cmdAct'), label: t('exportAction'), icon: 'i-download', run: () => ST.act.dialog('export') }); out.push({ g: t('cmdAct'), label: t('reportAction'), icon: 'i-pdf', run: () => ST.act.dialog('report') }); }
        out.push({ g: t('cmdAct'), label: t('howItWorks'), icon: 'i-help', run: () => ST.act.dialog('how') });
        out.push({ g: t('cmdAct'), label: t('settings'), icon: 'i-gear', run: () => ST.act.dialog('settings') });
        if (st !== 'intake' && st !== 'structuring') {
          out.push({ g: t('cmdFilter'), label: t('filterAll'), icon: 'i-filter', run: () => { local.sub = null; if (s.filter) ST.act.setFilter(s.filter); } });
          VERD.forEach((v) => out.push({ g: t('cmdFilter'), label: vName(v), glyph: v, run: () => { local.sub = null; if (s.filter !== v) ST.act.setFilter(v); } }));
          s.refs.forEach((r) => out.push({ g: t('cmdRef'), label: `#${r.id} ${r.title}`, icon: 'i-doc', run: () => { ST.act.nav('check'); openRef(r.id); } }));
        }
        return out;
      }
      const cmdFiltered = () => { const q = local.cmdQ.trim().toLowerCase(); return cmdItems().filter((i) => !q || i.label.toLowerCase().includes(q) || i.g.toLowerCase().includes(q)); };
      function updateCmdResults() {
        const host = root.querySelector('[data-cmdres]'); if (!host) return;
        const items = cmdFiltered(); local.cmdIdx = Math.max(0, Math.min(local.cmdIdx, items.length - 1));
        host.innerHTML = items.length ? items.map((i, n) => `<li role="option" id="cmd-o-${n}" aria-selected="${n === local.cmdIdx}"${i.dis ? ' aria-disabled="true"' : ''} data-act="cmdrun" data-arg="${n}">${i.glyph ? gly(i.glyph) : ico(i.icon)}<span>${esc(i.label)}</span>${i.dis ? `<span class="small muted">${ico('i-lock')} ${esc(i.dis)}</span>` : ''}<span class="g">${esc(i.g)}</span></li>`).join('') : `<li class="muted small" style="padding:8px">${esc(t('noMatch'))}</li>`;
        const inp = root.querySelector('[data-cmdq]'); if (inp) inp.setAttribute('aria-activedescendant', items.length ? 'cmd-o-' + local.cmdIdx : '');
        const sel = host.querySelector('[aria-selected="true"]'); if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
      }
      function dialogBody(name) {
        const closeBtn = bt('dlg-close', 'close', ico('i-x'), { cls: 'btn icon', label: t('close') });
        const wrap = (title, inner) => `<div class="dlg st-glass quiet" role="dialog" aria-modal="true" aria-labelledby="dlg-t"><header><h2 id="dlg-t">${esc(title)}</h2>${closeBtn}</header>${inner}</div>`;
        if (name === 'how') return wrap(t('howItWorks'), `<ol class="steps">${['howStep1', 'howStep2', 'howStep3', 'howStep4'].map((k) => `<li>${esc(t(k))}</li>`).join('')}</ol><ul class="howlist">${VERD.map((v) => `<li>${gly(v)} <b>${esc(vName(v))}</b></li>`).join('')}</ul><p class="disc">${esc(t('disclaimer'))}</p>`);
        if (name === 'export') { const n = s.refs.filter((r) => r.exportPick).length; return wrap(t('exportHeading'), `<p class="small muted">${esc(t('exportHint'))}</p><div class="sec"><span class="eyebrow">${esc(t('exportFormat'))}</span><div class="seg" role="group">${bt('fmt-csl', 'fmt', 'CSL-JSON', { arg: 'csl', pressed: local.fmt === 'csl' })}${bt('fmt-bib', 'fmt', 'BibTeX', { arg: 'bib', pressed: local.fmt === 'bib' })}</div></div><div class="sec"><label class="eyebrow" for="style-sel">${esc(t('exportStyle'))}</label><select id="style-sel" class="fin" data-k="style-sel" data-model="style">${['APA 7', 'MLA 9', 'Chicago 17', 'DIN ISO 690'].map((x) => `<option${x === local.style ? ' selected' : ''}>${x}</option>`).join('')}</select></div><p class="small">${esc(t('exportSelected', n))}</p>${bt('dl', 'download', ico('i-download') + esc(t('exportDownload')), { cls: 'btn primary' })}`); }
        if (name === 'report') return wrap(t('reportHeading'), `<p class="small muted">${esc(t('reportHint'))}</p>${bt('mk', 'mkreport', ico('i-pdf') + esc(t('reportCreate')), { cls: 'btn primary' })}`);
        if (name === 'editlist') return wrap(t('editList'), `<p>${esc(t('editListStub'))}</p><div class="note warn">${ico('i-lock')}<div>${esc(busy() ? t('editListGated') : t('editListProto'))}</div></div>${bt('el-apply', 'close', esc(t('apply')), { cls: 'btn primary', dis: true })}`);
        if (name === 'reset') return wrap(t('resetTitle'), `<p>${esc(t('resetConfirm'))}</p><div class="dact">${bt('rs-ok', 'resetok', ico('i-reset') + esc(t('reset')), { cls: 'btn danger' })}${bt('rs-no', 'close', esc(t('cancel')), { cls: 'btn' })}</div>`);
        if (name === 'settings') return wrap(t('settings'), `<div class="sec"><span class="eyebrow">${esc(t('language'))}</span><div class="seg" role="group">${bt('lg-de', 'lang', 'Deutsch', { arg: 'de', pressed: ST.lang() === 'de' })}${bt('lg-en', 'lang', 'English', { arg: 'en', pressed: ST.lang() === 'en' })}</div></div><div class="sec"><span class="eyebrow">${esc(t('theme'))}</span><div class="seg" role="group">${bt('th-l', 'theme', esc(t('themeLight')), { arg: 'light', pressed: document.documentElement.dataset.theme !== 'dark' })}${bt('th-d', 'theme', esc(t('themeDark')), { arg: 'dark', pressed: document.documentElement.dataset.theme === 'dark' })}</div></div>`);
        return '';
      }
      function renderOverlay() {
        const open = s.cmdOpen || !!s.dialog;
        if (open && !local.ov) {
          local.ov = true; local.trigger = lastFocusKey;
          if (panel) { local.ovTop = app.scrollTop; local.ovH = app.clientHeight; app.style.overflow = 'hidden'; }
          if (s.cmdOpen) { local.cmdQ = ''; local.cmdIdx = 0; }
        }
        let html = '';
        const style = panel ? ` style="--ov-top:${local.ovTop}px;--ov-h:${local.ovH}px"` : '';
        if (s.cmdOpen) html = `<div class="ov cmd"${style}><div class="scrim" data-act="close"></div><div class="dlg st-glass quiet" role="dialog" aria-modal="true" aria-label="${esc(t('cmdHint'))}"><input data-k="cmd-input" data-cmdq="1" role="combobox" aria-expanded="true" aria-controls="cmd-list" aria-autocomplete="list" placeholder="${esc(t('cmdPlaceholder'))}" autocomplete="off" spellcheck="false"><ul id="cmd-list" role="listbox" data-cmdres></ul></div></div>`;
        else if (s.dialog) html = `<div class="ov"${style}><div class="scrim" data-act="close"></div>${dialogBody(s.dialog)}</div>`;
        const changed = patch('overlay', html);
        if (!open && local.ov) { local.ov = false; if (panel) app.style.overflow = ''; focusAfter = local.trigger; return; }
        if (changed && s.cmdOpen) { const inp = root.querySelector('[data-cmdq]'); inp.value = local.cmdQ; updateCmdResults(); inp.focus({ preventScroll: true }); }
        else if (changed && open) { const f = root.querySelector('.ov [data-k]'); if (f && !root.querySelector('.ov').contains(document.activeElement)) f.focus({ preventScroll: true }); }
        if (s.cmdOpen && !changed) updateCmdResults();
      }

      /* ---------- banner / toast / live ---------- */
      function renderToast() {
        if (s.toast !== lastToast) { lastToast = s.toast; clearTimeout(toastTimer); if (s.toast) toastTimer = setTimeout(() => { if (s.toast === lastToast) { s.toast = null; renderToast(); } }, 4200); }
        patch('toast', s.toast ? `<div class="toast st-glass quiet" role="status"><span>${esc(s.toast)}</span>${bt('toast-x', 'toastx', ico('i-x'), { cls: 'btn icon sm', label: t('close') })}</div>` : '');
      }
      function renderLive() {
        const C = ST.counts(), txt = s.stage === 'running' ? t('progress', C.done, ST.N()) : s.stage === 'done' ? t('done') : s.stage === 'counted' ? t('detected', ST.N()) : '';
        if (txt !== lastLive) { lastLive = txt; R('live').textContent = txt; }
      }

      /* ---------- render with focus + scroll preservation ---------- */
      function snapshot() {
        const a = document.activeElement; let focus = null;
        if (a && root.contains(a) && a.dataset && a.dataset.k) focus = { k: a.dataset.k, s: a.selectionStart, e: a.selectionEnd, txt: a.matches && a.matches('input,textarea') };
        const sc2 = {}; root.querySelectorAll('[data-scroll]').forEach((el) => { sc2[el.dataset.scroll] = [el.scrollTop, el.scrollLeft]; });
        return { focus, sc2, page: sc().scrollTop };
      }
      function restore(sn, selChanged) {
        root.querySelectorAll('[data-scroll]').forEach((el) => { const v = sn.sc2[el.dataset.scroll]; if (!v) return; if (el.dataset.scroll === 'detail' && selChanged) return; el.scrollTop = v[0]; el.scrollLeft = v[1]; });
        if (pendingScroll != null) { sc().scrollTop = pendingScroll; pendingScroll = null; } else sc().scrollTop = sn.page;
        const k = focusAfter || (sn.focus && sn.focus.k); const keepSel = !focusAfter && sn.focus; focusAfter = null;
        if (k) { const el = root.querySelector(`[data-k="${k}"]`); if (el && document.activeElement !== el) { el.focus({ preventScroll: true }); if (keepSel && sn.focus.txt && sn.focus.s != null) { try { el.setSelectionRange(sn.focus.s, sn.focus.e); } catch (e) { /* ignore */ } } } }
      }
      function render() {
        const sn = snapshot();
        const selChanged = lastSel !== s.selected; lastSel = s.selected;
        const m = mode();
        bench.dataset.mode = m; bench.dataset.sel = (m === 'work' && s.selected != null) ? '1' : '0';
        patch('banner', s.connection === 'reconnecting' ? `<div class="banner" role="status">${ico('i-wifi-off')}<span>${esc(t('reconnecting'))}</span></div>` : '');
        patch('rail', railHtml());
        if (m === 'work' || m === 'intake') patch('facets', facetsHtml()); else patch('facets', '');
        if (m === 'work') { patch('listtop', listTopHtml()); patchRows(); patch('detail', detailHtml()); } else { patch('listtop', ''); R('rows').innerHTML = ''; R('rows').dataset.ids = ''; rowCache = {}; patch('detail', ''); }
        patch('page', pageHtml());
        renderOverlay(); renderToast(); renderLive();
        restore(sn, selChanged);
      }
      function renderTyping() { const b = root.querySelector('[data-k="check"]'); const can = ST.act.canStart(); if (b) b.disabled = !can; const h = root.querySelector('[data-hint]'); if (h) h.hidden = can; regions.page = null; }

      /* ---------- navigation helpers ---------- */
      function openRef(id) {
        const was = s.selected;
        if (narrow()) { if (was == null) s.scrollMemo = sc().scrollTop; pendingScroll = 0; focusAfter = 'back'; }
        else focusAfter = 'row-' + id;
        ST.act.select(id);
      }
      function goBack() {
        const id = s.selected; if (id == null) return;
        if (narrow()) pendingScroll = s.scrollMemo || 0;
        focusAfter = 'row-' + id; ST.act.back();
      }
      function stepRef(dir) {
        const vis = visList(); if (!vis.length || s.selected == null) return;
        if (narrow()) pendingScroll = 0;
        if (!sub()) { ST.act.step(dir); return; }
        const i = vis.findIndex((r) => r.id === s.selected); ST.act.select(vis[(i + dir + vis.length) % vis.length].id);
      }
      function moveRow(dir, fromId) {
        const vis = visList(); if (!vis.length) return;
        const i = vis.findIndex((r) => r.id === fromId); const n = vis[Math.max(0, Math.min(vis.length - 1, (i < 0 ? (dir > 0 ? 0 : vis.length - 1) : i + dir)))];
        if (!n) return;
        if (wide() || !narrow()) { focusAfter = 'row-' + n.id; ST.act.select(n.id); } else { const el = root.querySelector(`[data-k="row-${n.id}"]`); el && el.focus(); }
      }
      async function copyText(txt) {
        let ok = false;
        try { await navigator.clipboard.writeText(txt); ok = true; } catch (e) {
          try { const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch (e2) { ok = false; }
        }
        ST.act.toast(ok ? t('copied') : t('copyFail'));
      }

      /* ---------- actions ---------- */
      function act(a, d) {
        const id = d.id != null ? +d.id : null, arg = d.arg;
        switch (a) {
          case 'nav': return ST.act.nav(arg);
          case 'cmd': return ST.act.cmd();
          case 'filter': local.sub = null; return ST.act.setFilter(arg);
          case 'sfilter':
            if (s.filter === 'status' && local.sub === arg) { local.sub = null; return ST.act.setFilter('status'); }
            local.sub = arg; if (s.filter !== 'status') return ST.act.setFilter('status'); return render();
          case 'fclear': local.sub = null; return s.filter && ST.act.setFilter(s.filter);
          case 'open': return openRef(id);
          case 'back': return goBack();
          case 'step': return stepRef(+arg);
          case 'tab': local.tab = arg; return render();
          case 'sheet': local.sheet = !local.sheet; return render();
          case 'judge': local.judge = !local.judge; return render();
          case 'stop': return ST.act.stop();
          case 'reset': return ST.act.dialog('reset');
          case 'resetok': ST.act.dialog(null); return ST.act.reset();
          case 'run': return ST.act.run(+arg);
          case 'upgrade': return ST.act.toast(panel ? t('planWebOnly') : t('planStub'));
          case 'signin': return ST.act.toast(t('signInStub'));
          case 'editlist': return ST.act.dialog('editlist');
          case 'dialog': return ST.act.dialog(arg);
          case 'close': if (s.cmdOpen) return ST.act.cmd(false); return ST.act.dialog(null);
          case 'fmt': local.fmt = arg; return render();
          case 'download': ST.act.dialog(null); return ST.act.toast(t('downloadStub'));
          case 'mkreport': ST.act.dialog(null); return ST.act.toast(t('reportStub'));
          case 'lang': ST.cfg.lang = arg; return ST.rerenderVariant();
          case 'theme': ST.cfg.theme = arg; return ST.rerenderVariant();
          case 'toastx': s.toast = null; return render();
          case 'cmdrun': { const it = cmdFiltered()[+arg]; if (!it || it.dis) return; ST.act.cmd(false); return it.run(); }
          case 'src': if (arg === 'paste') { s.intakeSource = 'paste'; return ST.act.setInput(s.input); } if (arg === 'file') return ST.act.useFile(); return ST.act.useSelection();
          case 'file': return ST.act.useFile();
          case 'example': return ST.act.example();
          case 'start': return ST.act.start();
          case 'region': return ST.act.toggleRegion(arg);
          case 'adopt': return ST.act.adoptRejected(arg);
          case 'edit': return ST.act.editFields(id);
          case 'applyfields': local.tab = 'fields'; return ST.act.editFields(id, 'suggestion');
          case 'discard': return ST.act.discardDraft(id);
          case 'save': return ST.act.saveRecheck(id);
          case 'retry': return ST.act.retry(id);
          case 'override': return ST.act.override(id, arg);
          case 'clearov': local.judge = false; return ST.act.clearOverride(id);
          case 'pick': return ST.act.pickExport(id);
          case 'accept': return ST.act.accept(id);
          case 'copy': { const r = ST.ref(id); return r && r.suggestion && copyText(trackPlain(r.suggestion.track)); }
          case 'hopen': if (s.stage === 'intake') ST.act.jump('done'); return ST.act.nav('check');
          case 'hnew': ST.act.nav('check'); ST.act.reset(); return ST.act.example();
          case 'hdel': return ST.act.toast(t('historyDeleted'));
          case 'histon': return ST.act.setHistory(true);
          case 'histtoggle': return ST.act.setHistory(!s.historyOn);
        }
      }
      const onClick = (e) => {
        const el = e.target.closest('[data-act]'); if (!el || !root.contains(el)) return;
        if (el.disabled || el.getAttribute('aria-disabled') === 'true') return;
        act(el.dataset.act, el.dataset);
      };
      const onInput = (e) => {
        const el = e.target;
        if (el.matches('[data-input]')) { typing = true; try { ST.act.setInput(el.value); } finally { typing = false; } }
        else if (el.dataset.draft) ST.act.setDraft(+el.dataset.id, el.dataset.key, el.value);
        else if (el.matches('[data-cmdq]')) { local.cmdQ = el.value; local.cmdIdx = 0; updateCmdResults(); }
      };
      const onChange = (e) => { const el = e.target; if (el.dataset && el.dataset.model === 'style') local.style = el.value; };
      const onFocusIn = (e) => { const el = e.target; if (el.dataset && el.dataset.k && !el.closest('.ov')) lastFocusKey = el.dataset.k; };

      /* ---------- keyboard ---------- */
      function onKey(e) {
        if (e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return;
        const mod = e.metaKey || e.ctrlKey;
        if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); return ST.act.cmd(); }
        if (mod && e.key === 'Enter' && e.target.matches && e.target.matches('[data-input]')) { e.preventDefault(); return ST.act.start(); }
        const inField = e.target.closest && e.target.closest('input,textarea,select,[contenteditable]');
        if (e.key === 'Escape') {
          if (s.cmdOpen) { e.preventDefault(); return ST.act.cmd(false); }
          if (s.dialog) { e.preventDefault(); return ST.act.dialog(null); }
          if (local.sheet) { local.sheet = false; return render(); }
          if (inField) { e.target.blur(); return; }
          if (s.view === 'check' && s.selected != null) { e.preventDefault(); return goBack(); }
          return;
        }
        if (s.cmdOpen) {
          const n = cmdFiltered().length;
          if (e.key === 'ArrowDown') { e.preventDefault(); local.cmdIdx = Math.min(n - 1, local.cmdIdx + 1); updateCmdResults(); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); local.cmdIdx = Math.max(0, local.cmdIdx - 1); updateCmdResults(); }
          else if (e.key === 'Enter') { e.preventDefault(); act('cmdrun', { arg: local.cmdIdx }); }
          else if (e.key === 'Tab') e.preventDefault();
          return;
        }
        if (s.dialog) {
          if (e.key === 'Tab') { const f = [...root.querySelectorAll('.ov button:not(:disabled),.ov select,.ov input')]; if (!f.length) return; const i = f.indexOf(document.activeElement); const nx = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i === f.length - 1 ? 0 : i + 1); e.preventDefault(); f[nx].focus(); }
          return;
        }
        if (mod || e.altKey || inField || s.view !== 'check' || mode() !== 'work') return;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { if (s.selected != null) { e.preventDefault(); stepRef(e.key === 'ArrowRight' ? 1 : -1); } return; }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          const dir = e.key === 'ArrowDown' ? 1 : -1, inRows = e.target.closest && e.target.closest('.rows');
          if (inRows) { e.preventDefault(); return moveRow(dir, +(e.target.closest('[data-rid]') || {}).dataset?.rid); }
          const plain = !(e.target.closest && e.target.closest('button,a,summary,[tabindex],.detail,.facets,.sheet'));
          if (plain && wide()) { e.preventDefault(); moveRow(dir, s.selected); }
          return;
        }
        if (/^[0-6]$/.test(e.key)) { local.sub = null; if (e.key === '0') { if (s.filter) ST.act.setFilter(s.filter); } else ST.act.setFilter(VERD[+e.key - 1]); }
      }

      /* ---------- wire up ---------- */
      root.addEventListener('click', onClick);
      root.addEventListener('input', onInput);
      root.addEventListener('change', onChange);
      root.addEventListener('focusin', onFocusIn);
      document.addEventListener('keydown', onKey);
      const off = ST.on((a) => {
        if (a === 'draft-input') return;
        if (a === 'input' && typing) return renderTyping();
        render();
      });
      render();

      return function unmount() {
        off(); clearTimeout(toastTimer);
        root.removeEventListener('click', onClick); root.removeEventListener('input', onInput); root.removeEventListener('change', onChange); root.removeEventListener('focusin', onFocusIn);
        document.removeEventListener('keydown', onKey);
        if (panel) app.style.overflow = '';
      };
    }
  });
})();
