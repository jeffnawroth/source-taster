/* PROTOTYPE (#194) — throwaway. Variant A "Canvas → Workspace".
   Shell: floating glass top bar (mark, Prüfen/Verlauf/Konto, ⌘K, account chip), no sidebar.
   Intake: a large centred canvas that collapses into a slim input strip once structuring starts.
   Summary: hero (sentence + ring + six filter tiles + separate status row) above a 40/60 list|detail split.
   Detail: Verdict + reason, then the user's own reference text with the correction as a tracked change. */
(() => {
  'use strict';
  const KEY = 'A';
  const VERDICTS = ['correct', 'deviations', 'mixed', 'doi-conflict', 'not-found', 'not-verifiable'];
  const STATUSES = ['running', 'queued', 'cancelled', 'failed', 'not-checked'];
  const WIDE = 880;

  ST.strings({
    de: {
      heroSentence: (ok, n, bad) => `${ok} von ${n} Referenzen stimmen; ${bad} brauchen einen Blick.`,
      heroAllOk: (n) => `Alle ${n} Referenzen stimmen.`,
      heroNoVerdict: 'Noch kein Urteil vorhanden.',
      heroStatusTail: (k) => `${k} ohne Urteil, siehe Status.`,
      liveStep: (i, txt) => `Referenz ${i}: ${txt}`,
      recognised: 'Erkannt', undo: 'Rückgängig', inputUnchanged: 'Ihre Eingabe bleibt unverändert.',
      srcOk: 'Treffer', srcNone: 'Kein Treffer', srcWarn: 'Störung',
      trailQuery: (s) => `${s} abgefragt`, stepOf: (i, n) => `Schritt ${i} von ${n}`,
      howSteps: ['Wir erkennen jede Referenz in Ihrem Text. Das ist kostenlos.', 'Jede Referenz wird mit Crossref, OpenAlex, DNB und weiteren Datenquellen abgeglichen.', 'Sie sehen pro Referenz ein Urteil mit Belegen. Was unbekannt bleibt, bleibt unbekannt.'],
      pickRef: 'Wählen Sie links eine Referenz, um Belege, Vergleich und Korrekturvorschlag zu sehen.',
      close: 'Schließen', openWeb: 'Im Web öffnen', srcPaste: 'Einfügen', srcFile: 'Datei', srcSel: 'Auswahl',
      refsList: 'Referenzen', showing: (a, b) => `${a} von ${b}`, listEmpty: 'Keine Referenz passt zum Filter.',
      cmdGroupNav: 'Navigation', cmdGroupAct: 'Aktionen', cmdGroupFilter: 'Filter', cmdGroupRef: 'Referenzen', cmdNone: 'Nichts gefunden.',
      editListPreview: 'Änderungen an der Liste zeigen wir vorab als Vorschau. Bereits verbrauchte Prüfungen werden nicht erstattet.',
      exportStub: 'Export vorbereitet (Prototyp).', reportStub: 'PDF-Bericht wird erstellt (Prototyp).', historyDelStub: 'Eintrag gelöscht (Prototyp).',
      adopted: 'Übernommen', current: 'Aktuell', planLabel: 'Plan', deviating: (n) => (n === 1 ? '1 Feld weicht ab' : `${n} Felder weichen ab`),
      historyConsent: 'Mit dem Verlauf speichern wir Ihre Checks bis zur angezeigten Löschfrist. Das gilt nur mit Ihrer ausdrücklichen Einwilligung. Beim Widerruf wird bestehender Verlauf nach Bestätigung gelöscht.',
      historyDisable: 'Verlauf deaktivieren', historyNeedsAccount: 'Der Verlauf braucht ein Konto.',
      legendYours: 'Ihr Text', legendSuggest: 'Vorschlag', correctedText: 'Korrigierter Text', keepOriginal: 'Ihre ursprüngliche Eingabe',
      clearOvr: 'Manuelles Urteil entfernen', guestDismiss: 'Hinweis schließen', styleLabel: 'Stil', pending: 'Noch kein Ergebnis.',
      editHint: 'Entwurf. Erst „Speichern und erneut prüfen“ übernimmt die Änderungen.', fieldsLocked: 'Felder gesperrt, solange die erneute Prüfung läuft.',
      previousResult: 'Ergebnis der vorherigen Fassung', savedFields: 'Gespeicherte Felder', byWord: 'Belegt durch',
      cmdEmptyHint: 'Navigation, Aktionen, Filter und Referenzen', downloadBtn: 'Herunterladen',
      dropOrPaste: 'Einfügen oder Datei wählen', tabsLabel: 'Eingabequelle', pagesWord: 'S.', recheckNotBilled: 'Technische Fehler werden nicht abgerechnet.',
      stopHint: 'Abgeschlossene Urteile bleiben erhalten.', webOnlyShort: 'Nur im Web', quotaBreakdown: 'Kontingent nach Gewährung und Ablauf wird im Konto aufgeschlüsselt.',
      counted: 'Erkannt', startsNow: 'Startet gleich …', removedNote: 'Entfernte Referenzen erscheinen nicht mehr in Liste, Export und Bericht.'
    },
    en: {
      heroSentence: (ok, n, bad) => `${ok} of ${n} References look right; ${bad} need a look.`,
      heroAllOk: (n) => `All ${n} References look right.`,
      heroNoVerdict: 'No Verdict yet.',
      heroStatusTail: (k) => `${k} without a Verdict, see Status.`,
      liveStep: (i, txt) => `Reference ${i}: ${txt}`,
      recognised: 'Recognised', undo: 'Undo', inputUnchanged: 'Your input is not changed.',
      srcOk: 'Hit', srcNone: 'No hit', srcWarn: 'Fault',
      trailQuery: (s) => `Queried ${s}`, stepOf: (i, n) => `Step ${i} of ${n}`,
      howSteps: ['We recognise every Reference in your text. This is free.', 'Each Reference is matched against Crossref, OpenAlex, DNB and more Data sources.', 'You get a Verdict with evidence per Reference. What is unknown stays unknown.'],
      pickRef: 'Pick a Reference on the left to see evidence, comparison and Correction suggestion.',
      close: 'Close', openWeb: 'Open on the web', srcPaste: 'Paste', srcFile: 'File', srcSel: 'Selection',
      refsList: 'References', showing: (a, b) => `${a} of ${b}`, listEmpty: 'No Reference matches the filter.',
      cmdGroupNav: 'Navigation', cmdGroupAct: 'Actions', cmdGroupFilter: 'Filters', cmdGroupRef: 'References', cmdNone: 'Nothing found.',
      editListPreview: 'We preview list changes before they apply. Checks already used are not refunded.',
      exportStub: 'Export prepared (prototype).', reportStub: 'Creating PDF report (prototype).', historyDelStub: 'Entry deleted (prototype).',
      adopted: 'Adopted', current: 'Current', planLabel: 'Plan', deviating: (n) => (n === 1 ? '1 field deviates' : `${n} fields deviate`),
      historyConsent: 'With History on we keep your Checks until the deletion date shown. This needs your explicit consent. On withdrawal, existing History is deleted after you confirm.',
      historyDisable: 'Turn off History', historyNeedsAccount: 'History needs an Account.',
      legendYours: 'Your text', legendSuggest: 'Suggestion', correctedText: 'Corrected text', keepOriginal: 'Your original input',
      clearOvr: 'Remove manual Verdict', guestDismiss: 'Dismiss notice', styleLabel: 'Style', pending: 'No result yet.',
      editHint: 'Draft. Only “Save and re-check” commits the changes.', fieldsLocked: 'Fields are locked while the Re-check runs.',
      previousResult: 'Result of the previous revision', savedFields: 'Saved fields', byWord: 'Backed by',
      cmdEmptyHint: 'Navigation, actions, filters and References', downloadBtn: 'Download',
      dropOrPaste: 'Paste or choose a file', tabsLabel: 'Input source', pagesWord: 'pp.', recheckNotBilled: 'Technical failures are not billed.',
      stopHint: 'Completed Verdicts are kept.', webOnlyShort: 'Web only', quotaBreakdown: 'Quota by grant and expiry is itemised in the Account.',
      counted: 'Recognised', startsNow: 'Starting …', removedNote: 'Removed References no longer appear in the list, export or report.'
    }
  });

  const css = `
.v-A{--pad:24px;position:relative;min-height:100%;color:var(--st-text);font-size:var(--st-text-base);
  background:radial-gradient(1000px 520px at 14% -12%,var(--st-bg-glow),transparent 72%),radial-gradient(760px 440px at 106% 4%,var(--st-glass-field-2),transparent 70%),var(--st-bg)}
.v-A h1,.v-A h2,.v-A h3,.v-A h4,.v-A p,.v-A ul,.v-A ol{margin:0}
.v-A ul,.v-A ol{padding:0;list-style:none}
.v-A button{cursor:pointer;font-family:inherit}
.v-A [hidden]{display:none!important}
.v-A .a-app{display:flex;flex-direction:column;min-height:100%}
.v-A .muted{color:var(--st-text-muted)}
.v-A .wrap{overflow-wrap:anywhere}
.v-A .ico{width:1.1em;height:1.1em}

/* buttons */
.v-A .btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:38px;padding:0 16px;border-radius:var(--st-radius-full);border:1px solid var(--st-border-strong);background:var(--st-surface);color:var(--st-text);font-weight:600;font-size:var(--st-text-sm);line-height:1.2;text-align:center;box-shadow:var(--st-shadow-raised),var(--st-highlight-inset);transition:transform var(--st-duration-fast) var(--st-ease-standard),border-color var(--st-duration-fast)}
.v-A .btn:hover{border-color:var(--st-border-emphasis)}
.v-A .btn:active{transform:scale(.97)}
.v-A .btn.sm{min-height:32px;padding:0 12px;font-size:var(--st-text-xs)}
.v-A .btn.primary{border-color:transparent;color:var(--st-on-accent);background:linear-gradient(180deg,var(--st-button-primary-from),var(--st-button-primary-to));box-shadow:inset 0 1px 0 var(--st-glass-rim-1),0 8px 20px -8px var(--st-accent-glow)}
.v-A .btn.ghost{background:transparent;border-color:transparent;box-shadow:none;color:var(--st-text-secondary)}
.v-A .btn.ghost:hover{background:var(--st-accent-tint);color:var(--st-text)}
.v-A .btn.danger{color:var(--st-feedback-danger)}
.v-A .btn[aria-pressed="true"]{border-color:var(--st-accent);background:var(--st-accent-tint);color:var(--st-accent-text)}
.v-A .btn[disabled]{opacity:.5;cursor:not-allowed;pointer-events:none;box-shadow:none}
.v-A .btn.icon{width:32px;padding:0}

/* chips */
.v-A .chip{display:inline-flex;align-items:center;gap:6px;max-width:100%;min-height:24px;padding:2px 10px 2px 5px;border-radius:var(--st-radius-full);font-size:var(--st-text-xs);font-weight:700;line-height:1.25;background:var(--vt);border:1px solid var(--vb);color:var(--st-text)}
.v-A .chip .gly{width:18px;height:18px}
.v-A .chip.st{--vt:transparent;--vb:var(--st-border-strong);color:var(--st-text-secondary);font-weight:600;padding-left:7px}
.v-A .chip.st[data-s="failed"]{--vt:var(--st-feedback-danger-tint);--vb:var(--st-feedback-danger);color:var(--st-feedback-danger)}
.v-A .chip.st[data-s="running"]{--vt:var(--st-accent-tint);--vb:var(--st-accent);color:var(--st-accent-text)}
.v-A .chip .man{display:inline-flex;align-items:center;gap:3px;margin-left:4px;padding-left:7px;border-left:1px solid var(--st-border-strong);font-weight:600;color:var(--st-text-secondary)}
.v-A .ico.st-running{animation:a-spin 1.1s linear infinite;animation-delay:calc(var(--ph,0ms)*-1)}
@keyframes a-spin{to{transform:rotate(360deg)}}

/* top bar */
.v-A .top{position:sticky;top:12px;z-index:var(--st-z-topbar);flex:none;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;min-height:56px;margin:12px var(--pad) 0;padding:8px 10px 8px 14px;border-radius:var(--st-radius-xl)}
.v-A .brand{display:flex;align-items:center;gap:9px;font-weight:800;letter-spacing:-.02em;white-space:nowrap}
.v-A .brand svg{flex:none}
.v-A .seg{display:flex;gap:2px;padding:3px;border-radius:var(--st-radius-full);background:var(--st-surface-sunken);border:1px solid var(--st-border)}
.v-A .seg button{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:32px;padding:0 16px;border:0;border-radius:var(--st-radius-full);background:transparent;color:var(--st-text-secondary);font-weight:600;font-size:var(--st-text-sm);white-space:nowrap}
.v-A .seg button .ico{display:none}
.v-A .seg button:hover{color:var(--st-text)}
.v-A .seg button[aria-current="page"]{background:var(--st-surface);color:var(--st-text);box-shadow:0 1px 2px var(--st-border-strong),inset 0 0 0 1px var(--st-border)}
.v-A .tr{display:flex;align-items:center;justify-content:flex-end;gap:8px}
.v-A .kbtn{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:0 10px 0 12px;border-radius:var(--st-radius-full);border:1px solid var(--st-border-strong);background:var(--st-surface-sunken);color:var(--st-text-secondary);font-size:var(--st-text-sm)}
.v-A .kbtn:hover{color:var(--st-text);border-color:var(--st-border-emphasis)}
.v-A .kbtn kbd{font-family:var(--st-font-mono);font-size:var(--st-text-xs);padding:1px 6px;border-radius:var(--st-radius-xs);border:1px solid var(--st-border-strong);background:var(--st-surface)}
.v-A .acc{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:0 12px 0 5px;border-radius:var(--st-radius-full);border:1px solid var(--st-border-strong);background:var(--st-surface);font-weight:600;font-size:var(--st-text-sm);max-width:200px;white-space:nowrap}
.v-A .acc span{overflow:hidden;text-overflow:ellipsis}
.v-A .acc .av{flex:none;display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--st-accent-tint);color:var(--st-accent-text);font-size:var(--st-text-xs);font-weight:800}

/* notes (banners) */
.v-A .notes{flex:none;display:grid;gap:8px;margin:10px var(--pad) 0}
.v-A .note{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 12px;border-radius:var(--st-radius-lg);border:1px solid var(--st-border-strong);background:var(--st-surface);font-size:var(--st-text-sm);box-shadow:var(--st-shadow-raised)}
.v-A .note>span{flex:1 1 220px}
.v-A .note.warn{background:var(--st-feedback-warning-tint);border-color:var(--st-feedback-warning);color:var(--st-text)}
.v-A .note.info{background:var(--st-feedback-info-tint)}
.v-A .note .ico{color:var(--st-feedback-info)}
.v-A .note.warn .ico{color:var(--st-feedback-warning)}

/* main */
.v-A .a-main{flex:1;padding:14px var(--pad) 28px;display:flex;flex-direction:column;gap:12px}
.v-A .a-main.center{justify-content:center}
.v-A .page{width:100%;max-width:880px;margin:0 auto;display:grid;gap:14px}
.v-A .page h1{font-size:var(--st-text-xl);letter-spacing:-.02em}

/* canvas */
.v-A .canvas{width:100%;max-width:780px;margin:auto;padding:26px 26px 20px;border-radius:var(--st-radius-2xl);display:grid;gap:14px}
.v-A .canvas h1{font-size:var(--st-text-xl);font-weight:800;letter-spacing:-.025em;line-height:1.15}
.v-A .canvas .lead{color:var(--st-text-on-glass-secondary);font-size:var(--st-text-sm);max-width:56ch}
.v-A .tabs{display:flex;flex-wrap:wrap;gap:6px}
.v-A .ta{width:100%;min-height:220px;resize:vertical;padding:14px 16px;border-radius:var(--st-radius-lg);border:1px solid var(--st-border-strong);background:var(--st-surface);color:var(--st-text);font:inherit;font-size:var(--st-text-base);line-height:1.5}
.v-A .ta::placeholder{color:var(--st-text-muted)}
.v-A .cv-bar{display:flex;align-items:center;flex-wrap:wrap;gap:10px}
.v-A .cv-bar .sp{flex:1 1 40px}
.v-A .cv-gate{font-size:var(--st-text-xs);color:var(--st-text-on-glass-secondary)}
.v-A .small{font-size:var(--st-text-xs);color:var(--st-text-on-glass-secondary);display:flex;align-items:flex-start;gap:6px;line-height:1.4}
.v-A .small .ico{margin-top:1px}
.v-A .canvas-in{animation:a-fade var(--st-duration-slow) var(--st-ease-standard) both}
@keyframes a-fade{from{opacity:0;transform:translateY(8px) scale(.99)}to{opacity:1;transform:none}}
.v-A .filebox,.v-A .selbox{padding:14px;border-radius:var(--st-radius-lg);border:1px dashed var(--st-border-strong);background:var(--st-surface);display:grid;gap:10px}
.v-A .fname{display:flex;align-items:center;gap:8px;font-weight:700}
.v-A .region{display:flex;align-items:flex-start;gap:10px;padding:8px 10px;border-radius:var(--st-radius-md);border:1px solid var(--st-border);background:var(--st-surface-sunken)}
.v-A .region input{width:18px;height:18px;margin:2px 0 0;accent-color:var(--st-accent);flex:none}
.v-A .region label{display:grid;gap:0;flex:1}
.v-A .region small{color:var(--st-text-muted)}
.v-A .rej{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 10px;border-radius:var(--st-radius-md);border:1px solid var(--st-border);font-size:var(--st-text-sm)}
.v-A .rej span.rt{flex:1 1 180px}
.v-A h3.eb{font-size:var(--st-text-2xs);font-weight:700;text-transform:uppercase;letter-spacing:var(--st-tracking-caps);color:var(--st-text-muted)}

/* strip */
.v-A .strip{flex:none;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 14px;align-items:center;padding:10px 14px;border-radius:var(--st-radius-xl)}
.v-A .strip .src{display:flex;align-items:center;gap:9px;min-width:0;font-size:var(--st-text-sm)}
.v-A .strip .src .tx{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--st-text-secondary)}
.v-A .strip .cnt{flex:none;font-weight:800;white-space:nowrap}
.v-A .strip .acts{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
.v-A .strip .qline{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;font-size:var(--st-text-xs);color:var(--st-text-on-glass-secondary)}
.v-A .strip .qline .ico{margin-right:4px}
.v-A .meter{display:inline-block;width:90px;height:6px;border-radius:var(--st-radius-full);background:var(--st-chart-track);overflow:hidden;vertical-align:middle;margin-right:6px}
.v-A .meter i{display:block;height:100%;background:var(--st-accent)}
.v-A .offer{grid-column:1/-1;display:grid;gap:8px;padding:10px 12px;border-radius:var(--st-radius-lg);background:var(--st-feedback-warning-tint);border:1px solid var(--st-feedback-warning)}
.v-A .offer h2{font-size:var(--st-text-sm);font-weight:800}
.v-A .offer p{font-size:var(--st-text-sm)}
.v-A .offer .oa{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.v-A .strip.collapse{overflow:hidden;animation:a-collapse var(--st-duration-slow) var(--st-ease-standard) both}
@keyframes a-collapse{from{max-height:420px;padding-block:68px;opacity:.55;transform:scale(1.015)}to{max-height:260px;padding-block:10px;opacity:1;transform:none}}

/* hero */
.v-A .hero{flex:none;display:grid;gap:10px;padding:14px;border-radius:var(--st-radius-xl);box-shadow:var(--st-shadow-lifted);border:1px solid var(--st-glass-border);
  background:radial-gradient(60% 150% at 8% 0%,var(--st-hero-field-1),transparent 65%),radial-gradient(50% 130% at 92% 100%,var(--st-hero-field-2),transparent 65%),radial-gradient(40% 110% at 52% 118%,var(--st-hero-field-3),transparent 65%),var(--st-hero-base)}
.v-A .hl{display:flex;align-items:center;gap:14px}
.v-A .ringw{position:relative;flex:none;width:68px;height:68px}
.v-A .ring{width:100%;height:100%;transform:rotate(-90deg)}
.v-A .ring circle{fill:none;stroke-width:5}
.v-A .ring .trk{stroke:var(--st-chart-track)}
.v-A .ring .seg{stroke:var(--vm)}
.v-A .rl{position:absolute;inset:0;display:grid;place-items:center;font-weight:800;font-size:var(--st-text-xs);font-variant-numeric:tabular-nums}
.v-A .hs{font-size:var(--st-text-md);font-weight:800;letter-spacing:-.02em;line-height:1.25;text-wrap:balance}
.v-A .hsub{margin-top:3px;font-size:var(--st-text-xs);color:var(--st-text-secondary);line-height:1.35}
.v-A .tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.v-A .tile{display:grid;grid-template-columns:auto 1fr;grid-template-areas:"g n" "l l";align-items:center;gap:3px 8px;padding:8px 10px;text-align:left;border-radius:var(--st-radius-md);border:1px solid var(--vb);background:color-mix(in oklch,var(--st-surface) 78%,transparent);color:var(--st-text);position:relative}
.v-A .tile .gly{grid-area:g;width:22px;height:22px}
.v-A .tile .n{grid-area:n;justify-self:end;font-size:var(--st-text-xl);font-weight:800;line-height:1;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.v-A .tile .lb{grid-area:l;font-size:var(--st-text-2xs);font-weight:600;line-height:1.2;color:var(--st-text-secondary);overflow-wrap:anywhere}
.v-A .tile[aria-pressed="true"]{border-color:var(--st-text);box-shadow:0 0 0 2px var(--st-text),var(--st-shadow-raised);background:var(--st-surface)}
.v-A .tile[aria-pressed="true"] .lb::after{content:' ✓';font-weight:800}
.v-A .tile[disabled]{opacity:.5;cursor:default}
.v-A .srow{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;padding:6px 10px;border-radius:var(--st-radius-md);border:1px dashed var(--st-border-strong);background:color-mix(in oklch,var(--st-surface) 55%,transparent);text-align:left;color:var(--st-text)}
.v-A .srow[aria-pressed="true"]{border-style:solid;border-color:var(--st-text);box-shadow:0 0 0 1px var(--st-text)}
.v-A .srow .sh{font-size:var(--st-text-2xs);font-weight:700;text-transform:uppercase;letter-spacing:var(--st-tracking-caps);color:var(--st-text-secondary)}
.v-A .hfoot{font-size:var(--st-text-2xs);color:var(--st-text-secondary);line-height:1.35}

/* split, list, rows */
.v-A .split{display:block}
.v-A .split[data-sel="1"] .list{display:none}
.v-A .split[data-sel="0"] .dtl{display:none}
.v-A .lh{display:grid;gap:8px;padding:2px 2px 10px}
.v-A .lh-t{display:flex;align-items:baseline;gap:8px;font-size:var(--st-text-md);font-weight:800;letter-spacing:-.01em}
.v-A .tb{display:flex;flex-wrap:wrap;gap:6px;align-items:flex-start}
.v-A .gatewrap{display:grid;gap:3px;max-width:100%}
.v-A .gate{font-size:var(--st-text-xs);color:var(--st-text-muted);max-width:36ch;line-height:1.3}
.v-A .rows{display:grid;gap:8px;padding:2px}
.v-A .row{display:grid;grid-template-columns:26px minmax(0,1fr);gap:3px 10px;width:100%;text-align:left;padding:11px 14px 11px 12px;border-radius:var(--st-radius-lg);background:var(--st-surface);border:1px solid var(--st-border);box-shadow:var(--st-shadow-raised),var(--st-highlight-inset);color:var(--st-text)}
.v-A .row:hover{border-color:var(--st-border-emphasis)}
.v-A .row[aria-current="true"]{border-color:var(--st-accent);box-shadow:0 0 0 1px var(--st-accent),var(--st-shadow-lifted);background:color-mix(in oklch,var(--st-accent-tint),var(--st-surface))}
.v-A .row .ix{font-family:var(--st-font-mono);font-size:var(--st-text-xs);color:var(--st-text-muted);padding-top:2px}
.v-A .rb{display:grid;gap:4px;min-width:0}
.v-A .rtitle{font-weight:700;font-size:var(--st-text-sm);line-height:1.3;letter-spacing:-.005em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
.v-A .rl2{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;min-width:0}
.v-A .rmeta{font-family:var(--st-font-mono);font-size:var(--st-text-xs);color:var(--st-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
.v-A .rsub{font-size:var(--st-text-xs);color:var(--st-text-secondary);line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere}
.v-A .rbar{display:block;height:4px;border-radius:var(--st-radius-full);background:var(--st-border);overflow:hidden}
.v-A .rbar i{display:block;height:100%;background:var(--st-accent)}
.v-A .row .prog{font-family:var(--st-font-mono);font-size:var(--st-text-xs);color:var(--st-text-muted)}
.v-A .skel li{height:74px;border-radius:var(--st-radius-lg);background:var(--st-surface-sunken);border:1px solid var(--st-border)}
.v-A .skel{display:grid;gap:8px}
.v-A .none{padding:24px 12px;text-align:center;color:var(--st-text-muted)}
.v-A .fchip{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:var(--st-text-xs);color:var(--st-text-secondary)}

/* detail */
.v-A .detail{display:grid;gap:12px;align-content:start}
.v-A .dnav{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.v-A .dnav .pos{flex:1;font-family:var(--st-font-mono);font-size:var(--st-text-xs);color:var(--st-text-muted);white-space:nowrap}
.v-A .dhead{display:grid;gap:8px}
.v-A .dtitle{font-size:var(--st-text-lg);font-weight:800;letter-spacing:-.02em;line-height:1.2;overflow-wrap:anywhere}
.v-A .dmeta{font-family:var(--st-font-mono);font-size:var(--st-text-xs);color:var(--st-text-muted);overflow-wrap:anywhere}
.v-A .dreason{font-size:var(--st-text-sm);color:var(--st-text-secondary);line-height:1.45}
.v-A .dverd{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.v-A .sec{display:grid;gap:10px;padding:14px 16px;border-radius:var(--st-radius-lg);background:var(--st-surface);border:1px solid var(--st-border);box-shadow:var(--st-shadow-raised),var(--st-highlight-inset)}
.v-A .sec>h3{font-size:var(--st-text-2xs);font-weight:700;text-transform:uppercase;letter-spacing:var(--st-tracking-caps);color:var(--st-text-muted)}
.v-A .sec.hl2{border-color:var(--st-accent);background:color-mix(in oklch,var(--st-accent-tint),var(--st-surface))}
.v-A .reftext{font-size:var(--st-text-md);line-height:1.75;overflow-wrap:anywhere}
.v-A .legend{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:var(--st-text-xs);color:var(--st-text-secondary)}
.v-A .corr{display:grid;gap:8px;padding-top:10px;border-top:1px solid var(--st-border)}
.v-A .corr .ca{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.v-A .note-s{font-size:var(--st-text-xs);color:var(--st-text-secondary);line-height:1.4;display:flex;gap:6px;align-items:flex-start}
.v-A .note-s .ico{margin-top:1px;flex:none}
.v-A .amend{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:var(--st-radius-full);border:1px dashed var(--st-feedback-danger);color:var(--st-feedback-danger);font-size:var(--st-text-xs);font-weight:700;background:var(--st-feedback-danger-tint)}
.v-A .cmp{display:grid;gap:6px}
.v-A .cmp-h{display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:var(--st-text-2xs);font-weight:700;text-transform:uppercase;letter-spacing:var(--st-tracking-caps);color:var(--st-text-muted)}
.v-A .cmp-h span:first-child{display:none}
.v-A .cmp-r{display:grid;grid-template-columns:1fr 1fr;gap:3px 10px;padding:8px 10px;border-radius:var(--st-radius-md);border:1px solid var(--st-border);background:var(--st-surface-sunken)}
.v-A .cmp-r.dev{border-color:var(--st-verdict-deviations-border);background:var(--st-verdict-deviations-tint)}
.v-A .cf{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:var(--st-text-xs);font-weight:700;color:var(--st-text-secondary)}
.v-A .devtag,.v-A .oktag{display:inline-flex;align-items:center;gap:4px;font-weight:600;font-size:var(--st-text-2xs)}
.v-A .oktag{color:var(--st-text-muted)}
.v-A .cy,.v-A .cb{font-size:var(--st-text-sm);overflow-wrap:anywhere;line-height:1.4}
.v-A .cb small{display:block;margin-top:2px;color:var(--st-text-muted);font-size:var(--st-text-2xs)}
.v-A .srcs{display:grid;gap:6px}
.v-A .src{display:grid;grid-template-columns:auto auto minmax(0,1fr);gap:2px 8px;align-items:baseline;padding:7px 10px;border-radius:var(--st-radius-md);background:var(--st-surface-sunken);font-size:var(--st-text-sm)}
.v-A .src .sn{font-weight:700}
.v-A .src .sx{grid-column:3;overflow-wrap:anywhere;color:var(--st-text-secondary)}
.v-A .src .sm{grid-column:3;font-size:var(--st-text-2xs);color:var(--st-text-muted)}
.v-A .src .tag{grid-column:2;font-size:var(--st-text-2xs);font-weight:700;text-transform:uppercase;letter-spacing:var(--st-tracking-caps);color:var(--st-text-muted)}
.v-A .src.ok .ico{color:var(--st-feedback-success)}
.v-A .src.warn .ico{color:var(--st-feedback-warning)}
.v-A .trail{display:grid;gap:0}
.v-A .trail li{display:grid;grid-template-columns:24px minmax(0,1fr);gap:8px;padding:6px 0;position:relative;font-size:var(--st-text-sm)}
.v-A .trail li+li::before{content:'';position:absolute;left:11px;top:-8px;height:14px;border-left:2px solid var(--st-border-strong)}
.v-A .trail .tic{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;border:1.5px solid var(--st-border-strong);background:var(--st-surface)}
.v-A .trail .tic .ico{width:13px;height:13px;stroke-width:2.4}
.v-A .trail .ok .tic{color:var(--st-feedback-success);border-color:var(--st-feedback-success)}
.v-A .trail .diff .tic,.v-A .trail .warn .tic{color:var(--st-feedback-warning);border-color:var(--st-feedback-warning)}
.v-A .trail .bad .tic{color:var(--st-feedback-danger);border-color:var(--st-feedback-danger)}
.v-A .trail .none .tic{color:var(--st-text-muted)}
.v-A .trail .pending{opacity:.45}
.v-A .trail .tx{overflow-wrap:anywhere}
.v-A .trail .tx small{color:var(--st-text-muted);font-size:var(--st-text-2xs);margin-left:6px}
.v-A .actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.v-A .ovr{display:grid;gap:6px}
.v-A .ovr .opts{display:grid;gap:6px}
.v-A .ovr .opts .btn{justify-content:flex-start}
.v-A .editf{display:grid;gap:10px}
.v-A .fld{display:grid;gap:3px;font-size:var(--st-text-xs);font-weight:700;color:var(--st-text-secondary)}
.v-A .inp{width:100%;min-height:38px;padding:7px 12px;border-radius:var(--st-radius-md);border:1px solid var(--st-border-strong);background:var(--st-surface);color:var(--st-text);font:inherit;font-size:var(--st-text-sm);font-weight:400}
.v-A .inp[disabled]{opacity:.65;background:var(--st-surface-sunken)}
.v-A .hist{display:grid;gap:6px;padding:10px 12px;border-radius:var(--st-radius-md);border:1px dashed var(--st-border-strong);background:var(--st-surface-sunken)}
.v-A .hist .hh{font-size:var(--st-text-xs);font-weight:700;color:var(--st-text-secondary);display:flex;gap:6px;align-items:center}
.v-A .hist.old{opacity:.88}
.v-A .cand{display:grid;gap:6px}
.v-A .cand li{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline;padding:7px 10px;border-radius:var(--st-radius-md);background:var(--st-surface-sunken);font-size:var(--st-text-sm)}
.v-A .cand .sc{font-family:var(--st-font-mono);font-size:var(--st-text-xs);color:var(--st-text-muted)}
.v-A .empty{display:grid;gap:14px;padding:20px 22px;border-radius:var(--st-radius-xl);background:var(--st-surface);border:1px solid var(--st-border);box-shadow:var(--st-shadow-raised),var(--st-highlight-inset);align-content:start}
.v-A .empty h2{font-size:var(--st-text-lg);font-weight:800;letter-spacing:-.02em}
.v-A .how{display:grid;gap:10px;counter-reset:s}
.v-A .how li{display:grid;grid-template-columns:28px minmax(0,1fr);gap:10px;align-items:start;counter-increment:s;font-size:var(--st-text-sm);line-height:1.45}
.v-A .how li::before{content:counter(s);display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--st-accent-tint);color:var(--st-accent-text);font-weight:800;font-size:var(--st-text-xs)}
.v-A .disc{display:flex;gap:8px;padding:10px 12px;border-radius:var(--st-radius-md);background:var(--st-feedback-info-tint);font-size:var(--st-text-sm);line-height:1.45}
.v-A .disc .ico{color:var(--st-feedback-info);margin-top:2px}
.v-A .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px}
.v-A .cards .btn{justify-content:flex-start;min-height:44px;border-radius:var(--st-radius-lg)}

/* history & account */
.v-A .hcard{display:grid;gap:8px;padding:14px 16px;border-radius:var(--st-radius-lg);background:var(--st-surface);border:1px solid var(--st-border);box-shadow:var(--st-shadow-raised),var(--st-highlight-inset)}
.v-A .hcard h2{font-size:var(--st-text-md);font-weight:800;display:flex;gap:8px;align-items:center;flex-wrap:wrap;overflow-wrap:anywhere}
.v-A .hcard .meta{font-size:var(--st-text-xs);color:var(--st-text-muted);font-family:var(--st-font-mono)}
.v-A .hcounts{display:flex;flex-wrap:wrap;gap:6px}
.v-A .hact{display:grid;gap:8px;padding-top:8px;border-top:1px solid var(--st-border)}
.v-A .hact .row2{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.v-A .warnline{display:flex;gap:6px;align-items:flex-start;font-size:var(--st-text-xs);color:var(--st-feedback-warning);font-weight:600;line-height:1.35;flex:1 1 200px}
.v-A .badge{display:inline-flex;align-items:center;gap:4px;padding:1px 8px;border-radius:var(--st-radius-full);border:1px solid var(--st-border-strong);font-size:var(--st-text-2xs);font-weight:700;color:var(--st-text-secondary)}
.v-A .kv{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;font-size:var(--st-text-sm)}
.v-A .kv dt{color:var(--st-text-muted)} .v-A .kv dd{margin:0;overflow-wrap:anywhere}

/* overlays */
.v-A .scrim{position:fixed;inset:0;z-index:var(--st-z-overlay);display:grid;place-items:start center;padding:12vh 14px 14px;background:var(--st-scrim)}
.v-A[data-surface="panel"] .scrim,.v-A .a-app[data-surface="panel"] .scrim{position:absolute}
.v-A .dlg{width:100%;max-width:520px;max-height:calc(100vh - 24vh);overflow:auto;padding:20px;border-radius:var(--st-radius-xl);display:grid;gap:12px;background:var(--st-glass-base-overlay)}
.v-A .dlg h2{font-size:var(--st-text-lg);font-weight:800;letter-spacing:-.02em}
.v-A .dlg .sel{display:grid;gap:8px}
.v-A .dlg select{min-height:38px;padding:0 10px;border-radius:var(--st-radius-md);border:1px solid var(--st-border-strong);background:var(--st-surface);color:var(--st-text);font:inherit}
.v-A .dlg .df{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
.v-A .pal{width:100%;max-width:560px;border-radius:var(--st-radius-xl);overflow:hidden;background:var(--st-glass-base-overlay);display:grid}
.v-A .pal-in{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--st-border)}
.v-A .pal-in input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:var(--st-text);font:inherit;font-size:var(--st-text-md)}
.v-A .pal-in:focus-within{box-shadow:inset 0 -2px 0 var(--st-focus-ring)}
.v-A .pal-list{max-height:min(52vh,420px);overflow:auto;padding:6px}
.v-A .pal-list .gh{padding:8px 10px 2px;font-size:var(--st-text-2xs);font-weight:700;text-transform:uppercase;letter-spacing:var(--st-tracking-caps);color:var(--st-text-muted)}
.v-A .pal-list button{display:flex;align-items:center;gap:10px;width:100%;min-height:38px;padding:6px 10px;border:0;border-radius:var(--st-radius-md);background:transparent;color:var(--st-text);text-align:left;font-size:var(--st-text-sm)}
.v-A .pal-list button span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.v-A .pal-list button[aria-selected="true"]{background:var(--st-accent-tint);color:var(--st-accent-text)}
.v-A .pal-ft{padding:8px 16px;border-top:1px solid var(--st-border);font-size:var(--st-text-2xs);color:var(--st-text-muted);font-family:var(--st-font-mono)}
.v-A .toast-wrap{position:sticky;bottom:0;height:0;flex:none;z-index:var(--st-z-toast);overflow:visible}
.v-A .toast{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);width:max-content;max-width:calc(100% - 24px);padding:10px 16px;border-radius:var(--st-radius-lg);font-size:var(--st-text-sm);font-weight:600}

/* ===== compact (side panel / very narrow) ===== */
@container app (max-width: 560px) {
  .v-A{--pad:10px}
  .v-A .top{grid-template-columns:auto 1fr auto;gap:6px;padding:6px 8px;min-height:50px;margin-top:8px;top:8px}
  .v-A .bname,.v-A .acc,.v-A .kbtn .khint,.v-A .kbtn kbd{display:none}
  .v-A .kbtn{width:36px;padding:0;justify-content:center}
  .v-A .seg{justify-self:center;gap:0;padding:2px}
  .v-A .seg button{padding:0 9px;gap:4px;font-size:var(--st-text-xs);min-height:32px}
  .v-A .seg button .ico{display:inline-block;width:14px;height:14px}
  .v-A .canvas{padding:18px 14px 14px;border-radius:var(--st-radius-xl)}
  .v-A .ta{min-height:180px}
  .v-A .strip{grid-template-columns:minmax(0,1fr);padding:10px 12px}
  .v-A .strip .acts{justify-content:flex-start}
  .v-A .hero{padding:10px;gap:8px}
  .v-A .ringw{width:54px;height:54px}
  .v-A .hs{font-size:var(--st-text-base)}
  .v-A .tile{padding:7px 8px}
  .v-A .tile .n{font-size:var(--st-text-lg)}
  .v-A .tile .gly{width:18px;height:18px}
  .v-A .row{padding:10px 10px 10px 8px;grid-template-columns:22px minmax(0,1fr)}
  .v-A .sec{padding:12px}
  .v-A .dtitle{font-size:var(--st-text-md)}
  .v-A .scrim{padding-top:8vh}
  .v-A .dlg{padding:16px;max-height:84%}
}
@container app (max-width: 879px) {
  .v-A .a-main[data-detail="1"] .strip,.v-A .a-main[data-detail="1"] .hero{display:none}
}
@container app (min-width: 561px) {
  .v-A .seg button .ico{display:none}
}
@container app (min-width: 640px) {
  .v-A .tiles{grid-template-columns:repeat(6,minmax(0,1fr))}
  .v-A .cmp-h,.v-A .cmp-r{grid-template-columns:130px 1fr 1fr}
  .v-A .cmp-h span:first-child{display:block}
  .v-A .cf{grid-column:auto;display:grid;align-content:start;gap:2px}
}
@container app (min-width: 880px) {
  .v-A .a-app{height:100vh}
  .v-A .a-main{min-height:0;overflow:auto;width:100%;max-width:1680px;margin-inline:auto}
  .v-A .top{position:relative;top:auto;width:calc(100% - 2*var(--pad));max-width:1632px;margin-inline:auto}
  .v-A .notes{width:calc(100% - 2*var(--pad));max-width:1632px;margin-inline:auto}
  .v-A .split{flex:1 1 0;min-height:380px;display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:16px}
  .v-A .split[data-sel] .list,.v-A .split[data-sel] .dtl{display:block}
  .v-A .pane{overflow:auto;min-height:0;padding:2px 6px 8px 2px}
  .v-A .lh{position:sticky;top:0;z-index:var(--st-z-sticky);background:var(--st-bg);padding-top:2px}
  .v-A .hs{font-size:var(--st-text-lg)}
  .v-A .ringw{width:80px;height:80px}
  .v-A .strip{grid-template-columns:minmax(0,1fr) auto}
  .v-A .dnav .back-l{display:inline-flex}
}
@container app (min-width: 1180px) {
  .v-A .hero{grid-template-columns:minmax(300px,1fr) minmax(0,2.5fr);align-items:center}
  .v-A .hero .srow,.v-A .hero .hfoot{grid-column:1/-1}
}

@media (prefers-reduced-motion: reduce){.v-A *{animation:none!important;transition:none!important}}
:root[data-still] .v-A *{animation:none!important;transition:none!important}
@media (forced-colors: active){.v-A .tile[aria-pressed="true"],.v-A .row[aria-current="true"]{outline:2px solid Highlight}}
`;

  function mount(root, ctx) {
    const panel = ctx.surface === 'panel';
    const s = ST.state, t = ST.t, L = ST.L, esc = ST.esc;
    const appEl = document.getElementById('app');
    const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform || '');
    const ui = { q: '', idx: 0, fmt: 'csl', style: 'apa', guestOff: false, ovrOpen: false, candOpen: false, ret: null, prevOverlay: null, prevStage: s.stage, lastSel: s.selected, collapse: false, canvasIn: false, items: [] };
    const mem = {};
    let typing = false, toastTimer = null, sn = '', lastLive = '';

    root.innerHTML = '<div class="a-live sr-only" role="status" aria-live="polite" aria-atomic="true"></div><div class="a-app"></div>';
    const live = root.firstChild, host = root.lastChild;
    host.dataset.surface = ctx.surface;

    /* ---------- small helpers ---------- */
    const vName = (v) => t('verdict')[v];
    const vShort = (v) => t('verdictShort')[v];
    const isNarrow = () => appEl.clientWidth < WIDE;
    const ico = (n, c) => ST.ico(n, c);
    const btn = (o) => `<button type="button" class="btn ${o.cls || ''}" data-act="${o.act}"${o.v != null ? ` data-v="${esc(o.v)}"` : ''}${o.id != null ? ` data-id="${o.id}"` : ''}${o.dis ? ' disabled' : ''}${o.pressed != null ? ` aria-pressed="${o.pressed}"` : ''}${o.exp != null ? ` aria-expanded="${o.exp}"` : ''}${o.desc ? ` aria-describedby="${o.desc}"` : ''}>${o.icon ? ico(o.icon) : ''}<span>${esc(o.label)}</span></button>`;
    const vchip = (v, manual) => `<span class="chip" data-v="${v}">${ST.gly(v)}<span>${esc(vShort(v))}</span>${manual ? `<span class="man">${ico('i-pen')}${esc(t('manualTag'))}</span>` : ''}</span>`;
    const schip = (st, label) => `<span class="chip st" data-s="${st}">${ST.stat(st)}<span>${esc(label)}</span></span>`;
    const dispStatus = (r) => (r.status === 'rechecking' ? 'running' : r.status === 'idle' ? 'queued' : r.status);
    const statusLabel = (r) => (r.status === 'rechecking' ? t('recheckRunning') : r.status === 'idle' ? t('recognised') : t('status')[r.status]);
    const refText = (r) => `${r.au} (${r.yr}). ${r.title}. ${Array.isArray(r.meta) ? L(r.meta) : r.meta}.`;
    function stepText(r) {
      if (r.step <= 0) return t('status').running;
      const it = r.trail[Math.min(r.step, r.trail.length) - 1];
      return it[0] === 's' ? t('step').searching(L(it[1])) : L(it[1]);
    }
    const paraCount = () => (s.input || '').split(/\n\s*\n/).filter((x) => x.trim()).length;
    const storageLine = () => s.historyOn
      ? `${ico('i-history')}<span>${esc(t('storageHistory', ST.date(ST.HISTORY[0].deletes)))}</span>`
      : `${ico('i-info')}<span>${esc(t('storageTemp'))}</span>`;
    const storageAct = () => (!s.historyOn ? `<button type="button" class="btn ghost sm" data-act="nav" data-v="account">${esc(t('historyEnable'))}</button>` : '');

    /* ---------- top bar & banners ---------- */
    function topbar() {
      const nav = [['check', 'navCheck', 'i-check'], ['history', 'navHistory', 'i-history'], ['account', 'navAccount', 'i-user']];
      const acct = s.account === 'guest'
        ? `<button type="button" class="acc" data-act="nav" data-v="account"><span class="av">${ico('i-user')}</span><span>${esc(t('guest'))}</span></button>`
        : `<button type="button" class="acc" data-act="nav" data-v="account"><span class="av">LB</span><span>${esc(ST.ACCOUNT.free.name)}</span></button>`;
      return `<header class="top st-glass"><div class="brand">${ST.mark(28, 'mark')}<span class="bname">${esc(t('productName'))}</span></div>
        <nav class="seg" aria-label="${esc(t('navLabel'))}">${nav.map(([k, l, ic]) => `<button type="button" data-act="nav" data-v="${k}"${s.view === k ? ' aria-current="page"' : ''}>${ico(ic)}<span>${esc(t(l))}</span></button>`).join('')}</nav>
        <div class="tr"><button type="button" class="kbtn" data-act="cmd" aria-haspopup="dialog" aria-label="${esc(t('cmdHint'))} (${IS_MAC ? '⌘K' : 'Ctrl+K'})">${ico('i-cmd')}<span class="khint">${esc(t('cmdHint'))}</span><kbd>${IS_MAC ? '⌘K' : 'Ctrl K'}</kbd></button>${acct}</div></header>`;
    }
    function notices() {
      let h = '';
      if (s.connection !== 'online') h += `<div class="note warn" role="status">${ico('i-wifi-off')}<span>${esc(t('reconnecting'))}</span></div>`;
      if (s.account === 'guest' && !ui.guestOff) h += `<div class="note info">${ico('i-info')}<span>${esc(t('guestNotice'))}</span><button type="button" class="btn sm" data-act="nav" data-v="account">${esc(t('signIn'))}</button><button type="button" class="btn ghost sm icon" data-act="guestOff" aria-label="${esc(t('guestDismiss'))}">${ico('i-x')}</button></div>`;
      return h ? `<div class="notes">${h}</div>` : '';
    }

    /* ---------- intake canvas ---------- */
    function canvas() {
      const src = s.intakeSource;
      const tabs = [['paste', 'srcPaste', 'i-list'], ['file', 'srcFile', 'i-upload']];
      if (panel) tabs.push(['selection', 'srcSel', 'i-panel']);
      const can = ST.act.canStart();
      let bodyH = '';
      if (src === 'paste') {
        bodyH = `<textarea class="ta" data-in data-scroll="ta" aria-label="${esc(t('intakeTitle'))}" placeholder="${esc(t('intakePlaceholder'))}" spellcheck="false">${esc(s.input)}</textarea>`;
      } else if (src === 'file') {
        const D = ST.DOCUMENT;
        bodyH = `<div class="filebox"><div class="fname">${ico('i-doc')}<span class="wrap">${esc(D.name)}</span><span class="muted mono">${D.pages} ${esc(t('pagesWord'))} · ${esc(D.size)}</span></div>
          <h3 class="eb">${esc(t('regionsHeading'))}</h3><p class="small">${esc(t('regionsHint'))}</p>
          <div style="display:grid;gap:6px">${s.regions.map((r) => `<div class="region"><input type="checkbox" id="rg-${r.id}" data-act="region" data-id="${r.id}"${r.selected ? ' checked' : ''}><label for="rg-${r.id}"><span>${esc(L(r.label))}</span><small>${esc(ST.t('regionsCount', r.count))}</small></label></div>`).join('')}</div>
          <h3 class="eb">${esc(t('rejectedHeading'))}</h3>
          <div style="display:grid;gap:6px">${s.rejected.map((r) => `<div class="rej"><span class="rt wrap">${esc(L(r.text))}</span>${r.adopted ? `<span class="badge">${ico('i-check')}${esc(t('adopted'))}</span>` : `<button type="button" class="btn sm" data-act="adopt" data-id="${r.id}">${ico('i-plus')}<span>${esc(t('rejectedAdopt'))}</span></button>`}</div>`).join('')}</div>
          ${s.account === 'guest' ? `<p class="small">${ico('i-info')}<span>${esc(t('aiGuest'))}</span></p>` : ''}</div>`;
      } else {
        const paras = (s.input || '').split('\n\n').filter(Boolean);
        bodyH = `<div class="selbox"><div class="fname">${ico('i-panel')}<span>${esc(ST.t('selectionTaken', ST.SELECTION.count, ST.SELECTION.page))}</span></div>${paras.map((p) => `<p class="small wrap" style="display:block">${esc(p)}</p>`).join('')}</div>`;
      }
      return `<section class="canvas st-glass${ui.canvasIn ? ' canvas-in' : ''}" aria-labelledby="cv-h">
        <h1 id="cv-h">${esc(t('intakeTitle'))}</h1><p class="lead">${esc(t('intakeLead'))}</p>
        <div class="tabs" role="group" aria-label="${esc(t('tabsLabel'))}">${tabs.map(([k, l, ic]) => btn({ act: 'src', v: k, label: t(l) + (k === 'selection' ? ` (${ST.SELECTION.count})` : ''), icon: ic, cls: 'sm', pressed: src === k })).join('')}</div>
        ${bodyH}
        <p class="small">${ico('i-info')}<span>${esc(src === 'paste' ? t('intakeHint') : t('intakeFormats'))}</span></p>
        <div class="cv-bar">${src === 'paste' ? btn({ act: 'example', label: t('intakeExample'), icon: 'i-plus', cls: 'sm' }) : ''}<span class="sp"></span>
          <span class="cv-gate" id="cv-gate"${can ? ' hidden' : ''}>${esc(t('checkDisabledHint'))}</span>
          <button type="button" class="btn primary" data-act="start" aria-describedby="cv-gate"${can ? '' : ' disabled'}>${ico('i-search')}<span>${esc(t('checkAction'))}</span></button></div>
        <p class="small">${storageLine()}${storageAct()}</p>
        <p class="small">${ico('i-shield')}<span>${esc(t('disclaimer'))}</span></p>
      </section>`;
    }
    function patchTyping() {
      const b = host.querySelector('[data-act="start"]'), g = host.querySelector('#cv-gate');
      const can = ST.act.canStart();
      if (b) b.disabled = !can;
      if (g) g.hidden = can;
    }

    /* ---------- input strip ---------- */
    function srcLabel() {
      if (s.intakeSource === 'file') return { ic: 'i-doc', tx: ST.DOCUMENT.name };
      if (s.intakeSource === 'selection') return { ic: 'i-panel', tx: ST.SELECTION.page };
      return { ic: 'i-list', tx: (s.input || '').split('\n').find((x) => x.trim()) || '' };
    }
    function strip() {
      const n = ST.N(), st = s.stage, av = ST.available(), C = ST.counts(), src = srcLabel();
      let cnt = '', q = '', offer = '';
      if (st === 'structuring') cnt = `<span class="cnt">${ST.stat('running')} ${esc(t('step').structuring)}</span>`;
      else cnt = `<span class="cnt">${esc(ST.t('detected', n))}</span>`;
      if (st === 'counted') {
        if (av >= n) q = `<span>${ico('i-info')}${esc(ST.t('quotaPreview', n, av, av - n))}</span><span><b>${esc(t('autoStart'))}</b></span>`;
        else offer = `<div class="offer" role="group" aria-labelledby="of-h"><h2 id="of-h">${esc(t('quotaChoiceHeading'))}</h2><p>${esc(ST.t('quotaChoiceBody', n, av))}</p>
          <div class="oa">${btn({ act: 'run', v: av, label: ST.t('quotaChoiceFirst', av), icon: 'i-arrow', cls: 'primary' })}${panel ? btn({ act: 'openweb', label: t('quotaUpgradeWeb'), icon: 'i-ext', cls: 'sm' }) : btn({ act: 'nav', v: 'account', label: t('quotaUpgrade'), cls: 'sm' })}${btn({ act: 'reset', label: t('cancel'), cls: 'ghost sm' })}</div></div>`;
      } else if (st === 'running' || st === 'done') {
        const pct = Math.max(0, Math.min(100, (av / (s.quota.granted || 1)) * 100));
        q = `<span><span class="meter" aria-hidden="true"><i style="width:${pct}%"></i></span>${esc(ST.t('quotaMeter', av, s.quota.granted))}${s.quota.reserved > 0 ? ' · ' + esc(ST.t('quotaReserved', s.quota.reserved)) : ''}</span>`;
        if (st === 'done') q += `<span>${esc(ST.t('consumed', s.refs.filter((r) => r.status === 'done').length))}</span>`;
      }
      const acts = [];
      if (st === 'running') acts.push(btn({ act: 'stop', label: t('stop'), icon: 'i-stop', cls: 'sm danger' }));
      if (st !== 'structuring') acts.push(btn({ act: 'reset', label: t('reset'), icon: 'i-reset', cls: 'sm' }));
      const note = s.intakeSource === 'file' && s.account === 'guest' ? `<span>${ico('i-info')}${esc(t('aiGuest'))}</span>` : '';
      return `<section class="strip st-glass${ui.collapse ? ' collapse' : ''}" aria-label="${esc(t('intakeTitle'))}">
        <div class="src">${ico(src.ic)}<span class="tx" title="${esc(src.tx)}">${esc(src.tx)}</span>${cnt}</div><div class="acts">${acts.join('')}</div>
        ${offer}<div class="qline">${q}<span>${storageLine()}</span>${storageAct()}${note}</div></section>`;
    }

    /* ---------- hero ---------- */
    function ring(C, n) {
      const R = 15.9155; let acc = 0, segs = '';
      const tot = Math.max(n, 1);
      for (const v of VERDICTS) {
        const c = C.verdicts[v]; if (!c) continue;
        const len = (c / tot) * 100, d = Math.max(len - (len > 3 ? 0.8 : 0), 0.01);
        segs += `<circle class="seg" data-v="${v}" cx="21" cy="21" r="${R}" pathLength="100" stroke-dasharray="${d} ${100 - d}" stroke-dashoffset="${-acc}"/>`;
        acc += len;
      }
      return `<svg class="ring" viewBox="0 0 42 42" aria-hidden="true"><circle class="trk" cx="21" cy="21" r="${R}"/>${segs}</svg>`;
    }
    function heroText(C, n) {
      const st = s.stage;
      const vTot = VERDICTS.reduce((a, v) => a + C.verdicts[v], 0), ok = C.verdicts.correct, bad = vTot - ok;
      const noV = C.statuses.failed + C.statuses.cancelled + C.statuses['not-checked'];
      if (st === 'structuring') return { h: t('step').structuring, sub: '', mid: '…' };
      if (st === 'counted') return { h: ST.t('detected', n), sub: ST.available() >= n ? t('startsNow') : t('quotaChoiceHeading'), mid: `0/${n}` };
      if (st === 'running') {
        const r = s.refs.find((x) => x.status === 'running' || x.status === 'rechecking');
        return { h: ST.t('progress', C.done, n), sub: r ? ST.t('liveStep', s.refs.indexOf(r) + 1, stepText(r)) : t('orderNote'), mid: `${C.done}/${n}` };
      }
      let h = vTot === 0 ? t('heroNoVerdict') : bad === 0 ? ST.t('heroAllOk', n) : ST.t('heroSentence', ok, n, bad);
      if (noV > 0) h += ' ' + ST.t('heroStatusTail', noV);
      return { h, sub: t('summaryRest'), mid: `${ok}/${n}` };
    }
    function hero() {
      const C = ST.counts(), n = ST.N(), H = heroText(C, n), hasSt = STATUSES.some((k) => C.statuses[k] > 0);
      const tiles = VERDICTS.map((v) => {
        const c = C.verdicts[v], on = s.filter === v;
        return `<button type="button" class="tile" data-v="${v}" data-act="filter" data-id="${v}" aria-pressed="${on}"${c === 0 && !on ? ' disabled' : ''}>${ST.gly(v)}<span class="n">${c}</span><span class="lb">${esc(vShort(v))}</span></button>`;
      }).join('');
      const srow = hasSt ? `<button type="button" class="srow" data-act="filter" data-id="status" aria-pressed="${s.filter === 'status'}"><span class="sh">${esc(t('statusesHeading'))}</span>${STATUSES.filter((k) => C.statuses[k] > 0).map((k) => schip(k, `${t('status')[k]} ${C.statuses[k]}`)).join('')}</button>` : '';
      return `<section class="hero" aria-label="${esc(t('done'))}"><div class="hl"><div class="ringw">${ring(C, n)}<span class="rl">${esc(H.mid)}</span></div><div><p class="hs">${esc(H.h)}</p>${H.sub ? `<p class="hsub">${esc(H.sub)}</p>` : ''}</div></div>
        ${s.stage === 'structuring' || s.stage === 'counted' ? '' : `<div class="tiles" role="group" aria-label="${esc(t('filterAll'))}">${tiles}</div>${srow}`}</section>`;
    }

    /* ---------- list ---------- */
    function row(r, i) {
      const sel = s.selected === r.id;
      let chip, sub = '', bar = '', prog = '';
      if (r.status === 'done') { chip = vchip(ST.effective(r), !!r.override); sub = L(r.reason); }
      else {
        chip = schip(dispStatus(r), statusLabel(r));
        if (r.status === 'running' || r.status === 'rechecking') {
          sub = stepText(r); prog = `<span class="prog">${esc(ST.t('stepOf', r.step, r.trail.length))}</span>`;
          bar = `<span class="rbar" aria-hidden="true"><i style="width:${Math.round((r.step / r.trail.length) * 100)}%"></i></span>`;
        } else if (r.status === 'failed') sub = t('notBilled');
        else if (r.status === 'not-checked') sub = t('orderNote');
      }
      const hist = r.status === 'rechecking' && r.hist ? `<span class="rsub">${esc(t('historicalResult'))}: ${esc(vShort(r.hist.verdict))}</span>` : '';
      return `<li><button type="button" class="row" data-act="select" data-id="${r.id}" data-fk="row:${r.id}"${sel ? ' aria-current="true"' : ''}>
        <span class="ix">${String(i + 1).padStart(2, '0')}</span><span class="rb"><span class="rtitle">${esc(r.title)}</span>
        <span class="rl2">${chip}${prog}<span class="rmeta">${esc(r.au)} (${esc(r.yr)})</span></span>${bar}${sub ? `<span class="rsub">${esc(sub)}</span>` : ''}${hist}</span></button></li>`;
    }
    function listPane() {
      const vis = ST.visible(), busy = ST.isBusy(), n = ST.N();
      const fl = s.filter ? (s.filter === 'status' ? t('statusesHeading') : vName(s.filter)) : '';
      const head = `<div class="lh"><h2 class="lh-t">${esc(t('refsList'))} <span class="mono muted">${esc(ST.t('showing', vis.length, n))}</span></h2>
        ${s.filter ? `<div class="fchip"><span>${esc(t('filterActive'))}: <b>${esc(fl)}</b></span>${btn({ act: 'filter', id: s.filter, label: t('filterClear'), icon: 'i-x', cls: 'sm' })}</div>` : ''}
        <div class="tb">${btn({ act: 'dlg', v: 'howto', label: t('howItWorks'), icon: 'i-help', cls: 'sm' })}${btn({ act: 'dlg', v: 'export', label: t('exportAction'), icon: 'i-download', cls: 'sm' })}${btn({ act: 'dlg', v: 'report', label: t('reportAction'), icon: 'i-pdf', cls: 'sm' })}
        <div class="gatewrap">${btn({ act: 'dlg', v: 'editlist', label: t('editList'), icon: 'i-edit-list', cls: 'sm', dis: busy, desc: busy ? 'gate-d' : null })}${busy ? `<span class="gate" id="gate-d">${esc(t('editListGated'))}</span>` : ''}</div></div></div>`;
      let body;
      if (s.stage === 'structuring') body = `<ul class="skel" aria-hidden="true">${'<li></li>'.repeat(5)}</ul>`;
      else if (!vis.length) body = `<p class="none">${esc(t('listEmpty'))}</p>`;
      else body = `<ul class="rows">${vis.map((r) => row(r, s.refs.indexOf(r))).join('')}</ul>`;
      return `<section class="pane list" data-scroll="list" aria-label="${esc(t('refsList'))}">${head}${body}</section>`;
    }

    /* ---------- detail ---------- */
    function trackHTML(track, mode) {
      return track.map((p) => {
        if (typeof p === 'string') return esc(p);
        if (Array.isArray(p)) return mode === 'tracked' ? `<del class="st-del">${esc(p[0])}</del><ins class="st-ins">${esc(p[1])}</ins>` : mode === 'final' ? `<ins class="st-ins">${esc(p[1])}</ins>` : esc(p[0]);
        return `<i>${esc(p.i)}</i>`;
      }).join('');
    }
    const plainTrack = (track, final) => track.map((p) => (typeof p === 'string' ? p : Array.isArray(p) ? (final ? p[1] : p[0]) : p.i)).join('');
    function emptyDetail() {
      return `<div class="empty"><h3 class="eb">${esc(t('howItWorks'))}</h3><h2>${esc(t('howItWorks'))}</h2>
        <ol class="how">${t('howSteps').map((x) => `<li><span>${esc(x)}</span></li>`).join('')}</ol>
        <p class="disc">${ico('i-shield')}<span>${esc(t('disclaimer'))}</span></p>
        <p class="muted" style="font-size:var(--st-text-sm)">${esc(t('pickRef'))}</p>
        <div class="cards">${btn({ act: 'dlg', v: 'export', label: t('exportAction'), icon: 'i-download' })}${btn({ act: 'dlg', v: 'report', label: t('reportAction'), icon: 'i-pdf' })}</div></div>`;
    }
    function compare(r) {
      const rows = ST.rows(r);
      if (!rows) return `<p class="note-s">${ico('i-info')}<span>${esc(t('noCandidate'))}</span></p>`;
      const dev = rows.filter((x) => x.deviates).length;
      return `${dev ? `<p class="note-s">${ST.gly('deviations')}<span>${esc(ST.t('deviating', dev))}</span></p>` : ''}<div class="cmp" role="table" aria-label="${esc(t('compare'))}">
        <div class="cmp-h" role="row"><span role="columnheader">${esc(t('field'))}</span><span role="columnheader">${esc(t('yours'))}</span><span role="columnheader">${esc(t('bestMatch'))}</span></div>
        ${rows.map((x) => `<div class="cmp-r${x.deviates ? ' dev' : ''}" role="row"><span class="cf" role="rowheader"><span>${esc(x.label)}</span>${x.deviates ? `<span class="devtag">${ST.gly('deviations')}${esc(t('deviates'))}</span>` : `<span class="oktag">${ico('i-check')}${esc(t('matches'))}</span>`}</span>
          <span class="cy" role="cell"><span class="${x.deviates ? 'st-dev' : ''}">${esc(x.yours || t('unknown'))}</span></span>
          <span class="cb" role="cell">${esc(x.best || t('unknown'))}${x.by && x.by.length ? `<small class="mono">${esc(t('byWord'))}: ${esc(x.by.join(' · '))}</small>` : ''}</span></div>`).join('')}</div>`;
    }
    function editForm(r, locked) {
      const data = r.draft || r.fields || { title: r.title };
      return `<form class="editf" data-id="${r.id}" onsubmit="return false">${Object.keys(data).map((k) => `<label class="fld"><span>${esc(L(ST.FIELDS[k] || [k, k]))}</span><input class="inp${k === 'doi' || k === 'isbn' ? ' mono' : ''}" data-draft="${k}" data-id="${r.id}" value="${esc(data[k])}"${locked ? ' disabled' : ''}></label>`).join('')}</form>`;
    }
    function sourcesH(r) {
      const lab = { ok: t('srcOk'), none: t('srcNone'), warn: t('srcWarn') };
      return `<ul class="srcs">${r.srcs.map(([name, res, txt, ms]) => `<li class="src ${res}">${ico('e-' + res)}<span class="sn">${esc(name)}</span><span class="tag">${esc(lab[res] || res)}</span><span class="sx">${esc(L(txt))}</span><span class="sm">${ms ? ms + ' ms' : '—'}</span></li>`).join('')}</ul>`;
    }
    function trailH(r) {
      const run = r.status === 'running' || r.status === 'rechecking' || r.status === 'queued' || r.status === 'idle';
      return `<ol class="trail">${r.trail.map(([k, txt, res], i) => {
        const pend = run && i >= r.step;
        const text = k === 's' ? t('trailQuery', L(txt)) : L(txt);
        return `<li class="${res}${pend ? ' pending' : ''}"><span class="tic">${ico('e-' + (k === 'e' ? 'end' : res))}</span><span class="tx">${esc(text)}</span></li>`;
      }).join('')}</ol>`;
    }
    function correction(r) {
      const sg = r.suggestion; if (!sg) return '';
      const m = s.corrModel;
      let controls = '';
      const copy = btn({ act: 'copy', id: r.id, label: t('copy'), icon: 'i-copy', cls: 'sm' });
      if (m === 'export') {
        controls = `<div class="ca">${btn({ act: 'pick', id: r.id, label: r.exportPick ? t('usedForExport') : t('useForExport'), icon: r.exportPick ? 'i-check' : 'i-download', cls: 'primary sm', pressed: r.exportPick })}${copy}</div>
          <p class="note-s">${ico('i-shield')}<span><b>${esc(t('inputUnchanged'))}</b> ${esc(t('useForExportNote'))}</span></p>`;
      } else if (m === 'draft') {
        controls = `<div class="ca">${btn({ act: 'apply', id: r.id, label: t('applyToFields'), icon: 'i-pen', cls: 'primary sm', dis: r.status === 'rechecking' })}${copy}</div>
          <p class="note-s">${ico('i-info')}<span>${esc(t('applyToFieldsNote'))}</span></p>`;
      } else {
        controls = `<div class="ca">${btn({ act: 'accept', id: r.id, label: r.accepted ? t('undo') : t('acceptCorrection'), icon: r.accepted ? 'i-undo' : 'i-check', cls: 'primary sm' })}<span class="amend">${ico('i-lock')}${esc(t('needsAmendment'))}</span>${copy}</div>
          ${r.accepted ? `<p class="note-s">${ico('i-info')}<span>${esc(t('acceptedNote'))}</span></p>` : ''}`;
      }
      return `<div class="corr">${controls}<p class="note-s mono" style="font-family:var(--st-font-mono)">${esc(sg.style)} · ${esc(t('byWord'))}: ${esc(sg.by.join(' · '))}</p></div>`;
    }
    function ownText(r) {
      if (!r.suggestion) return `<section class="sec" aria-labelledby="s-own"><h3 id="s-own">${esc(t('original'))}</h3><p class="reftext">${esc(refText(r))}</p></section>`;
      const acc = s.corrModel === 'apply' && r.accepted;
      const body = acc ? trackHTML(r.suggestion.track, 'final') : trackHTML(r.suggestion.track, 'tracked');
      return `<section class="sec hl2" aria-labelledby="s-own"><h3 id="s-own">${esc(acc ? t('correctedText') : t('suggestionHeading'))}${acc ? ` · ${esc(t('corrected'))}` : ''}</h3>
        <p class="reftext">${body}</p>
        ${acc ? `<details><summary>${esc(t('keepOriginal'))}</summary><p class="reftext muted" style="font-size:var(--st-text-sm)">${esc(plainTrack(r.suggestion.track, false))}</p></details>`
          : `<div class="legend"><span><del class="st-del">${esc(t('legendYours'))}</del></span><span><ins class="st-ins">${esc(t('legendSuggest'))}</ins></span></div>`}
        ${correction(r)}</section>`;
    }
    function verdictBlock(r) {
      const st = r.status;
      let h = '';
      if (st === 'done') {
        const eff = ST.effective(r);
        h += `<div class="dverd">${vchip(eff, !!r.override)}</div>`;
        if (r.override) h += `<p class="dreason"><b>${esc(ST.t('manualVerdict', vName(eff)))}</b><br>${esc(ST.t('systemVerdict', vName(r.verdict)))}${r.overrideFixture && r.overrideFixture.note ? '<br>' + esc(L(r.overrideFixture.note)) : ''}</p>`;
        h += `<p class="dreason">${esc(L(r.reason))}</p>`;
        if (r.hist) h += `<p class="note-s">${ico('i-history')}<span>${esc(t('previousResult'))} (${esc(t('historicalResult'))}): ${r.hist.verdict ? esc(vName(r.hist.verdict)) : '—'}</span></p>`;
      } else if (st === 'rechecking') {
        h += `<div class="dverd">${schip('running', t('recheckRunning'))}</div><p class="dreason">${esc(stepText(r))}</p>
          <div class="hist old"><span class="hh">${ico('i-history')}${esc(t('historicalResult'))}</span>${r.hist && r.hist.verdict ? `<div class="dverd">${vchip(r.hist.verdict, !!(r.hist.override))}</div>` : ''}<p class="dreason">${esc(L(r.reason))}</p></div>
          <p class="note-s">${ico('i-info')}<span>${esc(t('recheckFree'))}</span></p>`;
      } else if (st === 'failed') {
        h += `<div class="dverd">${schip('failed', t('status').failed)}</div><p class="dreason">${esc(L(r.reason))}</p>
          <div class="actions">${btn({ act: 'retry', id: r.id, label: t('retry'), icon: 'i-undo', cls: 'primary sm' })}<span class="note-s">${esc(t('notBilled'))}</span></div>`;
      } else {
        h += `<div class="dverd">${schip(dispStatus(r), statusLabel(r))}</div>`;
        h += `<p class="dreason">${esc(st === 'running' ? stepText(r) : st === 'not-checked' ? t('orderNote') : st === 'cancelled' ? t('stopDone') : t('pending'))}</p>`;
      }
      return h;
    }
    function overrideSec(r) {
      if (r.status !== 'done') return '';
      const eff = ST.effective(r);
      const opts = ui.ovrOpen ? `<div class="opts">${VERDICTS.map((v) => `<button type="button" class="btn sm" data-act="ovr" data-id="${r.id}" data-v="${v}" aria-pressed="${!!r.override && r.override.verdict === v}">${ST.gly(v)}<span>${esc(vName(v))}</span></button>`).join('')}</div>` : '';
      return `<section class="sec" aria-labelledby="s-ovr"><h3 id="s-ovr">${esc(t('judgeManually'))}</h3><div class="ovr">
        <div class="actions">${btn({ act: 'ovr', id: r.id, v: r.verdict, label: t('confirmVerdict'), icon: 'i-check', cls: 'sm' })}${btn({ act: 'ovrToggle', label: t('judgeManually'), icon: 'i-pen', cls: 'sm', exp: ui.ovrOpen })}${r.override ? btn({ act: 'ovrClear', id: r.id, label: t('clearOvr'), icon: 'i-undo', cls: 'ghost sm' }) : ''}</div>${opts}
        <p class="note-s">${ico('i-info')}<span>${esc(t('overrideNote'))}</span></p></div></section>`;
    }
    function fieldsSec(r) {
      const locked = r.status === 'rechecking';
      if (r.draft) {
        return `<section class="sec" aria-labelledby="s-f"><h3 id="s-f">${esc(t('editFields'))}</h3><p class="note-s">${ico('i-info')}<span>${esc(t('editHint'))} ${esc(t('draftNote'))}</span></p>${editForm(r, false)}
          <div class="actions">${btn({ act: 'save', id: r.id, label: t('saveRecheck'), icon: 'i-undo', cls: 'primary' })}${btn({ act: 'discard', id: r.id, label: t('discardDraft'), icon: 'i-x' })}</div>
          <p class="note-s">${ico('i-check')}<span>${esc(r.status === 'done' ? t('recheckFree') : t('recheckNotBilled'))}</span></p></section>`;
      }
      if (locked) return `<section class="sec" aria-labelledby="s-f"><h3 id="s-f">${esc(t('savedFields'))}</h3><p class="note-s">${ico('i-lock')}<span>${esc(t('fieldsLocked'))}</span></p>${editForm(r, true)}</section>`;
      const canEdit = r.status === 'done' || r.status === 'failed';
      const edit = canEdit ? `<div class="actions">${btn({ act: 'edit', id: r.id, label: t('editFields'), icon: 'i-pen', cls: 'sm' })}</div>` : '';
      if (r.status === 'done') return `<section class="sec" aria-labelledby="s-f"><h3 id="s-f">${esc(t('compare'))}</h3>${compare(r)}${edit}</section>`;
      return edit ? `<section class="sec">${edit}</section>` : '';
    }
    function candidates(r) {
      if (!r.candidates || r.status !== 'done') return '';
      const list = r.candidates.slice().sort((a, b) => b.score - a.score);
      return `<section class="sec"><h3>${esc(t('candidatesHeading'))}</h3>${btn({ act: 'candToggle', label: `${t('candidatesHeading')} (${list.length})`, icon: 'i-chev', cls: 'sm', exp: ui.candOpen })}
        ${ui.candOpen ? `<ul class="cand">${list.map((c) => `<li><b>${esc(c.src)}</b><span class="sc">${esc(t('score'))} ${c.score.toFixed(2)}</span><span>${esc(c.title)} (${esc(c.yr)})</span></li>`).join('')}</ul>` : ''}</section>`;
    }
    function detail(r) {
      const vis = ST.visible(); let i = vis.findIndex((x) => x.id === r.id), tot = vis.length;
      if (i < 0) { i = s.refs.indexOf(r); tot = s.refs.length; }
      const hasRes = r.status === 'done' || r.status === 'rechecking' || r.status === 'failed';
      return `<article class="detail" aria-labelledby="d-h"><div class="dnav">${btn({ act: 'back', label: t('backToList'), icon: 'i-back', cls: 'sm' })}<span class="pos">${esc(ST.t('refPos', i + 1, tot))}</span>
        <button type="button" class="btn sm icon" data-act="step" data-v="-1" aria-label="${esc(t('prev'))} (←)" title="${esc(t('prev'))} (←)">${ico('i-back')}</button>
        <button type="button" class="btn sm icon" data-act="step" data-v="1" aria-label="${esc(t('next'))} (→)" title="${esc(t('next'))} (→)">${ico('i-chev')}</button></div>
        <header class="dhead"><h2 class="dtitle" id="d-h">${esc(r.title)}</h2><p class="dmeta">${esc(r.au)} (${esc(r.yr)}) · ${esc(Array.isArray(r.meta) ? L(r.meta) : r.meta)}</p>${verdictBlock(r)}</header>
        ${ownText(r)}
        ${fieldsSec(r)}
        ${overrideSec(r)}
        ${hasRes || r.status === 'running' ? `<section class="sec" aria-labelledby="s-src"><h3 id="s-src">${esc(t('sourcesHeading'))}</h3>${r.status === 'running' ? `<p class="note-s">${esc(t('pending'))}</p>` : sourcesH(r)}</section>` : ''}
        ${candidates(r)}
        ${r.status !== 'queued' && r.status !== 'idle' ? `<section class="sec" aria-labelledby="s-tr"><h3 id="s-tr">${esc(t('trailHeading'))}</h3>${trailH(r)}</section>` : ''}
        </article>`;
    }

    function checkView() {
      if (s.stage === 'intake') return `<main class="a-main center" data-scroll="main:check">${canvas()}</main>`;
      const sel = s.selected != null ? ST.ref(s.selected) : null;
      return `<main class="a-main work" data-scroll="main:check" data-detail="${sel ? 1 : 0}">${strip()}${hero()}
        <div class="split" data-sel="${sel ? 1 : 0}">${listPane()}<section class="pane dtl" data-scroll="detail" aria-label="${esc(t('original'))}">${sel ? detail(sel) : emptyDetail()}</section></div></main>`;
    }

    /* ---------- history & account ---------- */
    function historyView() {
      const off = !s.historyOn;
      return `<main class="a-main" data-scroll="main:history"><div class="page"><h1>${esc(t('historyHeading'))}</h1>
        <p class="note-s">${storageLine()}${storageAct()}</p>${off ? `<p class="note-s">${ico('i-info')}<span>${esc(t('historyOff'))}</span></p>` : ''}
        ${ST.HISTORY.map((h) => {
          const nm = L(h.name), cs = VERDICTS.filter((v) => h.counts[v]);
          return `<section class="hcard" aria-label="${esc(nm)}"><h2>${h.locked ? ico('i-lock') : ''}<span>${esc(nm)}</span>${h.current ? `<span class="badge">${esc(t('current'))}</span>` : ''}</h2>
            <p class="meta">${esc(ST.date(h.date))} · ${esc(ST.t('historyCount', h.refs))} · ${esc(ST.t('historyExpires', ST.date(h.deletes)))}</p>
            <div class="hcounts">${cs.map((v) => `<span class="chip" data-v="${v}">${ST.gly(v)}<span>${h.counts[v]} ${esc(vShort(v))}</span></span>`).join('')}</div>
            ${h.locked ? `<p class="note-s">${ico('i-lock')}<span>${esc(t('historyLocked'))}</span></p>` : ''}
            <div class="hact"><div class="row2">${btn({ act: 'hopen', id: h.id, label: t('historyOpen'), icon: 'i-arrow', cls: 'primary sm', dis: !!h.locked })}${btn({ act: 'hdel', id: h.id, label: t('historyDelete'), icon: 'i-trash', cls: 'ghost sm' })}</div>
            <div class="row2">${btn({ act: 'hnew', id: h.id, label: t('historyRestart'), icon: 'i-reset', cls: 'sm', dis: !!h.locked })}<span class="warnline">${ico('i-info')}<span>${esc(ST.t('historyBillable', h.refs))}</span></span></div></div></section>`;
        }).join('')}</div></main>`;
    }
    function accountView() {
      const guest = s.account === 'guest', A = ST.ACCOUNT, av = ST.available(), pct = Math.max(0, Math.min(100, (av / (s.quota.granted || 1)) * 100));
      return `<main class="a-main" data-scroll="main:account"><div class="page"><h1>${esc(t('navAccount'))}</h1><p class="muted" style="font-size:var(--st-text-sm)">${esc(t('accountStub'))}</p>
        <section class="hcard"><h2>${esc(guest ? t('guest') : A.free.name)}</h2>${guest ? `<p class="note-s">${ico('i-info')}<span>${esc(t('guestNotice'))}</span></p>${btn({ act: 'signin', label: t('signIn'), icon: 'i-user', cls: 'primary sm' })}`
          : `<dl class="kv"><dt>E-Mail</dt><dd>${esc(A.free.email)}</dd><dt>${esc(t('planLabel'))}</dt><dd><span class="badge">${esc(A.free.plan)}</span></dd></dl>`}</section>
        <section class="hcard"><h2>${esc(t('quotaLabel'))}</h2><p><span class="meter" aria-hidden="true"><i style="width:${pct}%"></i></span><b>${esc(ST.t('quotaMeter', av, s.quota.granted))}</b>${s.quota.reserved > 0 ? ' · ' + esc(ST.t('quotaReserved', s.quota.reserved)) : ''}</p>
          <p class="note-s">${ico('i-info')}<span>${esc(t('quotaBreakdown'))}</span></p>
          ${panel ? `<p class="note-s">${ico('i-ext')}<span>${esc(t('planWebOnly'))}</span></p>${btn({ act: 'openweb', label: t('openWeb'), icon: 'i-ext', cls: 'sm' })}` : btn({ act: 'changeplan', label: t('quotaUpgrade'), icon: 'i-arrow', cls: 'primary sm' })}</section>
        <section class="hcard"><h2>${esc(t('historyHeading'))}</h2><p class="note-s">${storageLine()}</p><p class="note-s">${ico('i-shield')}<span>${esc(t('historyConsent'))}</span></p>
          ${guest ? `<p class="note-s">${esc(t('historyNeedsAccount'))}</p>` : btn({ act: 'histToggle', label: s.historyOn ? t('historyDisable') : t('historyEnable'), icon: 'i-history', cls: 'sm', pressed: s.historyOn })}</section></div></main>`;
    }

    /* ---------- overlays ---------- */
    function dialogH() {
      const d = s.dialog, close = btn({ act: 'dlgClose', label: t('close'), cls: 'sm' });
      let inner = '';
      if (d === 'howto') inner = `<h2 id="dlg-h">${esc(t('howItWorks'))}</h2><ol class="how">${t('howSteps').map((x) => `<li><span>${esc(x)}</span></li>`).join('')}</ol><p class="disc">${ico('i-shield')}<span>${esc(t('disclaimer'))}</span></p><div class="df">${close}</div>`;
      else if (d === 'export') {
        const picks = s.refs.filter((r) => r.exportPick).length;
        inner = `<h2 id="dlg-h">${esc(t('exportHeading'))}</h2><p class="note-s">${ico('i-info')}<span>${esc(t('exportHint'))}</span></p>
          <label class="fld"><span>${esc(t('exportFormat'))}</span><select data-sel="fmt"><option value="csl"${ui.fmt === 'csl' ? ' selected' : ''}>CSL-JSON</option><option value="bib"${ui.fmt === 'bib' ? ' selected' : ''}>BibTeX</option></select></label>
          <label class="fld"><span>${esc(t('exportStyle'))}</span><select data-sel="style"><option value="apa"${ui.style === 'apa' ? ' selected' : ''}>APA 7</option><option value="ieee"${ui.style === 'ieee' ? ' selected' : ''}>IEEE</option><option value="harvard"${ui.style === 'harvard' ? ' selected' : ''}>Harvard</option></select></label>
          <p class="note-s">${ico('i-check')}<span>${esc(ST.t('exportSelected', picks))}</span></p><p class="note-s">${ico('i-trash')}<span>${esc(t('removedNote'))}</span></p>
          <div class="df">${close}${btn({ act: 'exportGo', label: t('exportDownload'), icon: 'i-download', cls: 'primary' })}</div>`;
      } else if (d === 'report') inner = `<h2 id="dlg-h">${esc(t('reportHeading'))}</h2><p class="note-s">${ico('i-pdf')}<span>${esc(t('reportHint'))}</span></p><div class="df">${close}${btn({ act: 'reportGo', label: t('reportCreate'), icon: 'i-pdf', cls: 'primary' })}</div>`;
      else if (d === 'reset') inner = `<h2 id="dlg-h">${esc(t('reset'))}</h2><p>${esc(t('resetConfirm'))}</p><div class="df">${btn({ act: 'dlgClose', label: t('cancel'), cls: '' })}${btn({ act: 'resetGo', label: t('reset'), icon: 'i-reset', cls: 'primary' })}</div>`;
      else if (d === 'editlist') {
        const busy = ST.isBusy();
        inner = `<h2 id="dlg-h">${esc(t('editList'))}</h2>${busy ? `<p class="note-s">${ico('i-lock')}<span>${esc(t('editListGated'))}</span></p>` : `<p class="note-s">${ico('i-info')}<span>${esc(t('editListPreview'))}</span></p>`}
          <h3 class="eb">${esc(t('rejectedHeading'))}</h3><div style="display:grid;gap:6px">${s.rejected.map((r) => `<div class="rej"><span class="rt wrap">${esc(L(r.text))}</span>${r.adopted ? `<span class="badge">${esc(t('adopted'))}</span>` : btn({ act: 'adopt', id: r.id, label: t('rejectedAdopt'), icon: 'i-plus', cls: 'sm', dis: busy })}</div>`).join('')}</div><div class="df">${close}</div>`;
      } else return '';
      return `<div class="scrim" data-act="scrim" ${scrimStyle()}><div class="dlg st-glass" role="dialog" aria-modal="true" aria-labelledby="dlg-h">${inner}</div></div>`;
    }
    function cmdItems() {
      const it = [], nav = (v, k, ic) => it.push({ g: 'cmdGroupNav', label: t(k), ic, run: () => ST.act.nav(v) });
      nav('check', 'navCheck', 'i-check'); nav('history', 'navHistory', 'i-history'); nav('account', 'navAccount', 'i-user');
      const A = (label, ic, run) => it.push({ g: 'cmdGroupAct', label, ic, run });
      if (s.stage === 'intake' && ST.act.canStart()) A(t('checkAction'), 'i-search', () => { ST.act.nav('check'); ST.act.start(); });
      if (s.stage === 'running') A(t('stop'), 'i-stop', () => ST.act.stop());
      if (s.stage !== 'intake' && s.stage !== 'structuring') A(t('reset'), 'i-reset', () => ST.act.dialog('reset'));
      A(t('exportAction'), 'i-download', () => { ST.act.nav('check'); ST.act.dialog('export'); });
      A(t('reportAction'), 'i-pdf', () => { ST.act.nav('check'); ST.act.dialog('report'); });
      A(t('howItWorks'), 'i-help', () => { ST.act.nav('check'); ST.act.dialog('howto'); });
      if (!ST.isBusy() && s.stage !== 'intake') A(t('editList'), 'i-edit-list', () => ST.act.dialog('editlist'));
      if (s.stage === 'running' || s.stage === 'done') {
        VERDICTS.forEach((v) => it.push({ g: 'cmdGroupFilter', label: `${t('filterActive')}: ${vName(v)}`, gly: v, run: () => { ST.act.nav('check'); if (s.filter !== v) ST.act.setFilter(v); } }));
        if (s.filter) it.push({ g: 'cmdGroupFilter', label: t('filterClear'), ic: 'i-x', run: () => ST.act.setFilter(s.filter) });
        s.refs.forEach((r, i) => it.push({ g: 'cmdGroupRef', label: `${i + 1}. ${r.title}`, ic: 'i-doc', run: () => { ST.act.nav('check'); ST.act.select(r.id); } }));
      }
      const q = ui.q.trim().toLowerCase();
      return q ? it.filter((x) => x.label.toLowerCase().includes(q)) : it;
    }
    function palList() {
      const items = (ui.items = cmdItems());
      if (ui.idx >= items.length) ui.idx = Math.max(0, items.length - 1);
      if (!items.length) return `<p class="none">${esc(t('cmdNone'))}</p>`;
      let last = '', h = '';
      items.forEach((x, i) => {
        if (x.g !== last) { h += `<div class="gh">${esc(t(x.g))}</div>`; last = x.g; }
        h += `<button type="button" role="option" tabindex="-1" data-act="palRun" data-i="${i}" aria-selected="${i === ui.idx}">${x.gly ? ST.gly(x.gly) : ico(x.ic || 'i-arrow')}<span>${esc(x.label)}</span></button>`;
      });
      return h;
    }
    function paletteH() {
      return `<div class="scrim" data-act="scrim" ${scrimStyle()}><div class="pal st-glass" role="dialog" aria-modal="true" aria-label="${esc(t('cmdHint'))}"><div class="pal-in">${ico('i-search')}<input type="text" data-pal data-autofocus autocomplete="off" role="combobox" aria-expanded="true" aria-controls="pal-l" placeholder="${esc(t('cmdPlaceholder'))}" value="${esc(ui.q)}" aria-label="${esc(t('cmdHint'))}"></div>
        <div class="pal-list" id="pal-l" role="listbox" aria-label="${esc(t('cmdEmptyHint'))}">${palList()}</div><div class="pal-ft">↑↓ · ↵ · esc</div></div></div>`;
    }
    function scrimStyle() {
      return panel ? `style="top:${appEl.scrollTop}px;height:${appEl.clientHeight}px;left:0;right:0"` : '';
    }

    /* ---------- render pipeline ---------- */
    function shell() {
      const body = s.view === 'history' ? historyView() : s.view === 'account' ? accountView() : checkView();
      const ov = s.cmdOpen ? paletteH() : s.dialog ? dialogH() : '';
      return `${topbar()}${notices()}${body}${ov}<div class="toast-wrap">${s.toast ? `<div class="toast st-glass" role="status">${esc(s.toast)}</div>` : ''}</div>`;
    }
    function readFocus() {
      const el = document.activeElement;
      if (!el || !root.contains(el)) return null;
      const c = el.closest('[data-fk]'); if (!c) return null;
      let a = null, b = null; try { a = c.selectionStart; b = c.selectionEnd; } catch (e) { /* non-text input */ }
      return { key: c.dataset.fk, a, b };
    }
    const scrollName = () => `${s.view}:${s.view === 'check' && s.selected != null ? 'd' : 'l'}`;
    function snapshot() {
      if (!host.firstChild) return;
      if (sn) mem[sn] = { a: appEl.scrollTop, w: window.scrollY };
      host.querySelectorAll('[data-scroll]').forEach((el) => { if (el.offsetParent !== null) mem[el.dataset.scroll] = el.scrollTop; });
    }
    function restoreScroll(newSel) {
      sn = scrollName();
      const m = mem[sn];
      appEl.scrollTop = m ? m.a : 0; window.scrollTo(0, m ? m.w : 0);
      host.querySelectorAll('[data-scroll]').forEach((el) => { el.scrollTop = mem[el.dataset.scroll] || 0; });
      if (newSel) { appEl.scrollTop = 0; window.scrollTo(0, 0); const d = host.querySelector('.dtl'); if (d) d.scrollTop = 0; }
    }
    function focusKey(k) {
      const el = k && host.querySelector(`[data-fk="${CSS.escape(k)}"]`);
      if (el && !el.disabled) { el.focus({ preventScroll: true }); return el; }
      return null;
    }
    function render(action) {
      const fk = readFocus();
      snapshot();
      ui.collapse = action === 'stage' && ui.prevStage === 'intake' && s.stage !== 'intake' && s.view === 'check';
      ui.canvasIn = action === 'stage' && ui.prevStage !== 'intake' && s.stage === 'intake';
      const overlay = s.cmdOpen ? 'cmd' : s.dialog ? 'dlg:' + s.dialog : null;
      if (overlay && overlay !== ui.prevOverlay && !ui.prevOverlay) ui.ret = fk ? fk.key : null;
      if (s.cmdOpen && ui.prevOverlay !== 'cmd') { ui.q = ''; ui.idx = 0; }
      host.innerHTML = shell();
      host.style.setProperty('--ph', (Date.now() % 1100) + 'ms');
      host.querySelectorAll('button,input,textarea,select,a[href]').forEach((el) => {
        if (!el.dataset.fk) el.dataset.fk = [el.tagName, el.dataset.act || el.dataset.draft || el.id || '', el.dataset.id || el.dataset.v || el.dataset.i || ''].join(':');
      });
      const newSel = action === 'select' && s.selected != null && s.selected !== ui.lastSel;
      restoreScroll(newSel);
      appEl.style.overflow = panel && overlay ? 'hidden' : '';
      /* focus */
      if (overlay && overlay !== ui.prevOverlay) {
        const a = host.querySelector('[data-autofocus]') || host.querySelector('.scrim button');
        a && a.focus({ preventScroll: true });
      } else if (!overlay && ui.prevOverlay) {
        focusKey(ui.ret) || null;
      } else if (action === 'select' && isNarrow() && s.selected != null && ui.lastSel == null) {
        focusKey('BUTTON:back:');
      } else if (action === 'select' && isNarrow() && s.selected == null && ui.lastSel != null) {
        focusKey('row:' + ui.lastSel);
      } else if (fk) {
        const el = focusKey(fk.key);
        if (el && fk.a != null && el.setSelectionRange) { try { el.setSelectionRange(fk.a, fk.b); } catch (e) { /* ignore */ } }
      }
      ui.prevStage = s.stage; ui.lastSel = s.selected; ui.prevOverlay = overlay;
      if (s.toast && !toastTimer) toastTimer = setTimeout(() => { toastTimer = null; if (s.toast) { s.toast = null; render('toast'); } }, 3600);
      announce();
    }
    function announce() {
      const C = ST.counts(), n = ST.N(); let x = '';
      if (s.stage === 'counted') x = ST.t('detected', n);
      else if (s.stage === 'running') x = ST.t('progress', C.done, n);
      else if (s.stage === 'done') x = `${t('done')}. ${heroText(C, n).h}`;
      if (x !== lastLive) { lastLive = x; live.textContent = x; }
    }

    /* ---------- events ---------- */
    function copyText(r) {
      const txt = r.suggestion ? plainTrack(r.suggestion.track, true) : refText(r);
      try { navigator.clipboard.writeText(txt).catch(() => {}); } catch (e) {
        try { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); } catch (e2) { /* ignore */ }
      }
      ST.act.toast(t('copied'));
    }
    const ACT = {
      nav: (b) => ST.act.nav(b.dataset.v),
      cmd: () => ST.act.cmd(true),
      guestOff: () => { ui.guestOff = true; render('local'); },
      src: (b) => { const v = b.dataset.v; if (v === 'paste') { s.intakeSource = 'paste'; render('local'); } else if (v === 'file') ST.act.useFile(); else ST.act.useSelection(); },
      example: () => ST.act.example(),
      start: () => ST.act.start(),
      region: (b) => ST.act.toggleRegion(b.dataset.id),
      adopt: (b) => ST.act.adoptRejected(b.dataset.id),
      run: (b) => ST.act.run(+b.dataset.v),
      openweb: () => ST.act.toast(t('planWebOnly')),
      changeplan: () => ST.act.toast(t('quotaUpgrade')),
      signin: () => ST.act.setAccount('free'),
      stop: () => ST.act.stop(),
      reset: () => ST.act.dialog('reset'),
      resetGo: () => { ST.act.dialog(null); ST.act.reset(); },
      filter: (b) => ST.act.setFilter(b.dataset.id),
      select: (b) => { s.scrollMemo = appEl.scrollTop; ST.act.select(+b.dataset.id); },
      back: () => ST.act.back(),
      step: (b) => ST.act.step(+b.dataset.v),
      edit: (b) => ST.act.editFields(+b.dataset.id),
      apply: (b) => ST.act.editFields(+b.dataset.id, 'suggestion'),
      discard: (b) => ST.act.discardDraft(+b.dataset.id),
      save: (b) => ST.act.saveRecheck(+b.dataset.id),
      retry: (b) => ST.act.retry(+b.dataset.id),
      ovr: (b) => ST.act.override(+b.dataset.id, b.dataset.v),
      ovrClear: (b) => ST.act.clearOverride(+b.dataset.id),
      ovrToggle: () => { ui.ovrOpen = !ui.ovrOpen; render('local'); },
      candToggle: () => { ui.candOpen = !ui.candOpen; render('local'); },
      pick: (b) => ST.act.pickExport(+b.dataset.id),
      accept: (b) => ST.act.accept(+b.dataset.id),
      copy: (b) => copyText(ST.ref(+b.dataset.id)),
      dlg: (b) => ST.act.dialog(b.dataset.v),
      dlgClose: () => ST.act.dialog(null),
      exportGo: () => { ST.act.dialog(null); ST.act.toast(t('exportStub')); },
      reportGo: () => { ST.act.dialog(null); ST.act.toast(t('reportStub')); },
      hopen: () => { ST.act.jump('done'); ST.act.nav('check'); },
      hnew: () => { ST.act.reset(); ST.act.nav('check'); ST.act.example(); ST.act.start(); },
      hdel: () => ST.act.toast(t('historyDelStub')),
      histToggle: () => ST.act.setHistory(!s.historyOn),
      palRun: (b) => runPal(+b.dataset.i)
    };
    function runPal(i) { const x = ui.items[i]; if (!x) return; ST.act.cmd(false); x.run(); }
    function onClick(e) {
      const sc = e.target.closest('.scrim');
      if (sc && e.target === sc) { if (s.cmdOpen) ST.act.cmd(false); else ST.act.dialog(null); return; }
      const b = e.target.closest('[data-act]');
      if (!b || !root.contains(b) || b.disabled || b.dataset.act === 'scrim') return;
      const f = ACT[b.dataset.act]; if (f) f(b);
    }
    function onInput(e) {
      const el = e.target;
      if (el.matches('textarea[data-in]')) { typing = true; ST.act.setInput(el.value); typing = false; }
      else if (el.dataset.draft) ST.act.setDraft(+el.dataset.id, el.dataset.draft, el.value);
      else if (el.matches('input[data-pal]')) { ui.q = el.value; ui.idx = 0; const l = host.querySelector('#pal-l'); if (l) l.innerHTML = palList(); }
    }
    function onChange(e) {
      const el = e.target;
      if (el.dataset.sel) { ui[el.dataset.sel === 'fmt' ? 'fmt' : 'style'] = el.value; render('local'); }
    }
    function onKey(e) {
      const inField = e.target.closest && e.target.closest('input, textarea, select, [contenteditable]');
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'k') { e.preventDefault(); ST.act.cmd(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && e.target.matches && e.target.matches('textarea[data-in]')) { e.preventDefault(); ST.act.start(); return; }
      if (e.key === 'Escape') {
        if (s.cmdOpen) ST.act.cmd(false);
        else if (s.dialog) ST.act.dialog(null);
        else if (s.view === 'check' && s.selected != null && !inField) ST.act.back();
        else return;
        e.preventDefault(); return;
      }
      if (s.cmdOpen && e.target.matches && e.target.matches('input[data-pal]')) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault(); const n = ui.items.length; if (n) { ui.idx = (ui.idx + (e.key === 'ArrowDown' ? 1 : -1) + n) % n; const l = host.querySelector('#pal-l'); l.innerHTML = palList(); const a = l.querySelector('[aria-selected="true"]'); a && a.scrollIntoView({ block: 'nearest' }); }
        } else if (e.key === 'Enter') { e.preventDefault(); runPal(ui.idx); }
        return;
      }
      if (e.key === 'Tab' && (s.cmdOpen || s.dialog)) {
        const sc = host.querySelector('.scrim'); if (!sc) return;
        const f = [...sc.querySelectorAll('button:not([disabled]),input,select,textarea,a[href]')].filter((x) => x.getAttribute('tabindex') !== '-1');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        return;
      }
      if (e.shiftKey || inField || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && s.view === 'check' && s.selected != null && !s.cmdOpen && !s.dialog) {
        e.preventDefault(); ST.act.step(e.key === 'ArrowLeft' ? -1 : 1);
      }
    }

    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('change', onChange);
    document.addEventListener('keydown', onKey);
    const off = ST.on((action) => {
      if (action === 'draft-input') return;
      if (action === 'input' && typing) return patchTyping();
      render(action);
    });
    /* base gap: the dev bar's DE/EN toggle changes <html lang> without an ST event */
    const mo = new MutationObserver(() => { render('lang'); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    render('init');

    return function unmount() {
      off(); mo.disconnect();
      root.removeEventListener('click', onClick); root.removeEventListener('input', onInput); root.removeEventListener('change', onChange);
      document.removeEventListener('keydown', onKey);
      if (toastTimer) clearTimeout(toastTimer);
      appEl.style.overflow = '';
    };
  }

  ST.variant({ key: KEY, name: 'Canvas → Workspace', css, mount });
})();
