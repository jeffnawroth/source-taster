/* PROTOTYPE (#194) — variant D "Feed + sticky strip". THROWAWAY.
   Keyboard-first, launcher-like. Minimal top bar (History button + mark · big ⌘K field · account chip).
   Check is home: one command-bar input that grows into a paste area, source chips below.
   Running: a vertical feed of short cards, each with a live horizontal step track (one node per trail entry).
   Summary: a sticky glass strip under the top bar (six Verdict filters, separate Status group, Stop/⋯ menu).
   Detail: web = push drawer from the right (feed stays visible, narrowed); 360 px = full view with Back.
   History = drawer from the left. Account = popover from the chip. All overlays are driven by ST.state. */
(() => {
  ST.strings({
    de: {
      dClose: 'Schließen', dMore: 'Weitere Aktionen', dCmdOpen: 'Befehlsleiste öffnen',
      dStepOf: (i, n) => `Schritt ${i} von ${n}`, dStepsDone: (n) => `${n} Schritte`,
      dSrcText: 'Text', dSrcFile: 'Datei', dSrcSel: 'Auswahl', dSource: 'Quelle der Eingabe',
      dInputUnchanged: 'Ihre Eingabe wird nicht verändert.',
      dNoMatch: 'Keine Referenzen in diesem Filter.',
      dStub: 'Nur eine Attrappe im Prototyp.', dOpenWeb: 'Im Web öffnen',
      dRemove: 'Datei entfernen', dJudge: 'Wirksames Urteil wählen', dClearOv: 'Manuelles Urteil zurücknehmen',
      dManualHead: 'Manuelle Beurteilung', dConsent: 'Speichert Prüfungen bis zur Löschfrist im Verlauf. Die Einwilligung ist jederzeit widerrufbar.',
      dGroupNav: 'Navigation', dGroupAct: 'Aktionen', dGroupFilter: 'Filter', dGroupRefs: 'Referenzen', dNoResults: 'Keine Treffer',
      dCounts: 'Zähler', dLabelsShow: 'Alle Labels zeigen', dLabelsHide: 'Labels ausblenden', dRunLede: (d, n) => `Prüfung läuft · ${d} von ${n} fertig`, dVerdicts: 'Urteile', dStopWhy: 'Nur während einer laufenden Prüfung.', dEditLocked: 'Gesperrt, solange die erneute Prüfung läuft.',
      dHow1: 'Das Erkennen der Referenzen ist kostenlos. Danach sehen Sie die Anzahl und den Kontingentverbrauch, bevor gesucht wird.',
      dHow2: 'Jede Referenz wird mit mehreren Datenquellen abgeglichen. Jeder Schritt steht in der Nachweisspur.',
      dHow3: 'Unbekanntes bleibt unbekannt. Ein Urteil ist ein Befund, kein Beweis; die Entscheidung trifft ein Mensch.',
      dEditListBody: 'Hier würden hinzugefügte und entfernte Einträge samt zusätzlichem Kontingentverbrauch angezeigt, bevor etwas geändert wird. Bereits verbrauchtes Kontingent wird nicht erstattet. (Attrappe)',
      dDownloaded: 'Download gestartet (Attrappe).', dReportMade: 'Bericht erstellt (Attrappe).', dOpened: 'Ergebnis geöffnet (Beispieldaten).', dDeleted: 'Eintrag gelöscht (Attrappe).',
      dCurrent: 'Aktueller Check', dPlan: 'Plan', dRevision: (n) => `Revision ${n}`, dEarlier: 'Früheres Ergebnis',
      dRes: { ok: 'bestätigt', none: 'kein Treffer', diff: 'weicht ab', bad: 'widerspricht', warn: 'unklar' },
      dFilterOn: (l) => `Filter aktiv: ${l}`, dKbdSubmit: 'zum Prüfen', dJump: 'Zur Liste springen',
      dQuotaNow: 'Kontingent', dEditHead: 'Felder', dCandShow: (n) => `Weitere Kandidaten (${n})`, dBestOf: 'Beleg'
    },
    en: {
      dClose: 'Close', dMore: 'More actions', dCmdOpen: 'Open command bar',
      dStepOf: (i, n) => `Step ${i} of ${n}`, dStepsDone: (n) => `${n} steps`,
      dSrcText: 'Text', dSrcFile: 'File', dSrcSel: 'Selection', dSource: 'Input source',
      dInputUnchanged: 'Your input is not changed.',
      dNoMatch: 'No References match this filter.',
      dStub: 'A stub in this prototype.', dOpenWeb: 'Open on the web',
      dRemove: 'Remove file', dJudge: 'Choose the effective Verdict', dClearOv: 'Remove manual Verdict',
      dManualHead: 'Manual judgment', dConsent: 'Saves Checks to History until the deletion date. You can withdraw consent at any time.',
      dGroupNav: 'Navigation', dGroupAct: 'Actions', dGroupFilter: 'Filter', dGroupRefs: 'References', dNoResults: 'No results',
      dCounts: 'Counts', dLabelsShow: 'Show all labels', dLabelsHide: 'Hide labels', dRunLede: (d, n) => `Check running · ${d} of ${n} done`, dVerdicts: 'Verdicts', dStopWhy: 'Only while a Check is running.', dEditLocked: 'Locked while the re-check runs.',
      dHow1: 'Recognising the References is free. You see the count and the expected Quota use before any search starts.',
      dHow2: 'Every Reference is matched against several Data sources. Each step is listed in the evidence trail.',
      dHow3: 'Unknown stays unknown. A Verdict is a finding, not proof; a human makes the decision.',
      dEditListBody: 'This is where added and dropped entries and the extra Quota use would be previewed before anything changes. Quota already used is not refunded. (stub)',
      dDownloaded: 'Download started (stub).', dReportMade: 'Report created (stub).', dOpened: 'Result opened (sample data).', dDeleted: 'Entry deleted (stub).',
      dCurrent: 'Current Check', dPlan: 'Plan', dRevision: (n) => `Revision ${n}`, dEarlier: 'Earlier result',
      dRes: { ok: 'confirmed', none: 'no hit', diff: 'deviates', bad: 'contradicts', warn: 'unclear' },
      dFilterOn: (l) => `Filter on: ${l}`, dKbdSubmit: 'to check', dJump: 'Jump to list',
      dQuotaNow: 'Quota', dEditHead: 'Fields', dCandShow: (n) => `More Candidates (${n})`, dBestOf: 'Backed by'
    }
  });

  const CSS = `
.v-D { --pad: 24px; position: relative; height: 100vh; height: 100dvh; display: flex; flex-direction: column; overflow: hidden; color: var(--st-text);
  background: radial-gradient(70% 38% at 50% -12%, var(--st-bg-glow), transparent 72%), var(--st-bg); }
.v-D.panel { position: absolute; inset: 0; height: auto; }
@container app (width < 700px) { .v-D { --pad: 12px; } }
.v-D h1, .v-D h2, .v-D h3, .v-D p, .v-D ul, .v-D ol, .v-D fieldset { margin: 0; padding: 0; }
.v-D ul, .v-D ol { list-style: none; }
.v-D fieldset { border: 0; min-width: 0; }
.v-D button { cursor: pointer; background: none; border: 0; padding: 0; text-align: inherit; color: inherit; }
.v-D button:disabled, .v-D [aria-disabled="true"] { cursor: not-allowed; }
.v-D .d-ui { flex: 1; min-height: 0; position: relative; display: flex; flex-direction: column; }
.v-D .base { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.v-D kbd { font: 500 var(--st-text-2xs)/1 var(--st-font-mono); padding: 3px 6px; border-radius: var(--st-radius-sm); border: 1px solid var(--st-border-strong); background: var(--st-surface-sunken); color: var(--st-text-secondary); white-space: nowrap; }
.v-D .mono { color: inherit; }
.v-D .muted { color: var(--st-text-muted); }

/* buttons */
.v-D .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 40px; padding: 0 16px; border-radius: var(--st-radius-full); border: 1px solid var(--st-border-strong); background: var(--st-surface); color: var(--st-text); font-weight: 700; font-size: var(--st-text-sm); line-height: 1.2; box-shadow: var(--st-shadow-raised), var(--st-highlight-inset); text-align: center; transition: transform var(--st-duration-spring) var(--st-ease-spring), border-color var(--st-duration-fast), background var(--st-duration-fast); }
.v-D .btn:hover:not(:disabled) { border-color: var(--st-border-emphasis); }
.v-D .btn:active:not(:disabled) { transform: scale(.97); transition-duration: var(--st-duration-instant); }
.v-D .btn.sm { min-height: 34px; padding: 0 12px; }
.v-D .btn.icon { width: 34px; padding: 0; }
.v-D .btn.wrap { white-space: normal; }
.v-D .btn.primary { border-color: transparent; color: var(--st-on-accent); background: linear-gradient(180deg, var(--st-button-primary-from), var(--st-button-primary-to)); }
.v-D .btn.ghost { background: transparent; box-shadow: none; border-color: transparent; color: var(--st-text-secondary); }
.v-D .btn.ghost:hover:not(:disabled) { background: var(--st-accent-tint); color: var(--st-text); border-color: transparent; }
.v-D .btn.danger { color: var(--st-feedback-danger); border-color: var(--st-feedback-danger); }
.v-D .btn[aria-pressed="true"]:not(.primary) { background: var(--st-accent-tint); border-color: var(--st-accent); color: var(--st-accent-text); }
.v-D .btn:disabled { opacity: .5; box-shadow: none; }
.v-D .lnk { color: var(--st-accent-text); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; display: inline-flex; align-items: center; gap: 4px; }

/* chips */
.v-D .vchip { display: inline-flex; align-items: center; gap: 6px; min-height: 26px; padding: 2px 10px 2px 5px; border-radius: var(--st-radius-full); font-weight: 700; font-size: var(--st-text-sm); line-height: 1.2; background: var(--vt); border: 1px solid var(--vb); color: var(--st-text); max-width: 100%; }
.v-D .vchip .gly { width: 18px; height: 18px; }
.v-D .vchip.lg { font-size: var(--st-text-md); min-height: 34px; padding: 3px 14px 3px 7px; }
.v-D .vchip.lg .gly { width: 24px; height: 24px; }
.v-D .vchip.dim { background: transparent; border-style: dashed; color: var(--st-text-secondary); }
.v-D .schip { display: inline-flex; align-items: center; gap: 6px; min-height: 26px; padding: 2px 10px 2px 7px; border-radius: var(--st-radius-full); font-weight: 700; font-size: var(--st-text-sm); line-height: 1.2; border: 1px dashed var(--st-border-emphasis); color: var(--st-text-secondary); }
.v-D .schip .ico { width: 16px; height: 16px; }
.v-D .schip[data-s="running"] { color: var(--st-accent-text); border-color: var(--st-accent); background: var(--st-accent-tint); border-style: solid; }
.v-D .schip[data-s="failed"] { color: var(--st-feedback-danger); border-color: var(--st-feedback-danger); background: var(--st-feedback-danger-tint); border-style: solid; }
.v-D .mtag { display: inline-flex; align-items: center; gap: 4px; min-height: 22px; padding: 1px 8px; border-radius: var(--st-radius-full); font-size: var(--st-text-xs); font-weight: 700; color: var(--st-accent-text); background: var(--st-accent-tint); border: 1px solid var(--st-accent); }
.v-D .mtag .ico { width: 13px; height: 13px; }
.v-D .spin { animation: d-rot .9s linear infinite; transform-origin: 50% 50%; }
@keyframes d-rot { to { transform: rotate(360deg); } }

/* top bar */
.v-D .top { flex: none; display: flex; align-items: center; gap: 10px; height: 60px; padding: 0 var(--pad); border-width: 0 0 1px 0; border-radius: 0; box-shadow: var(--st-highlight-inset); position: relative; z-index: var(--st-z-topbar); }
.v-D .top .lft { display: flex; align-items: center; gap: 4px; flex: none; }
.v-D .brand { display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 6px; border-radius: var(--st-radius-md); font-weight: 800; letter-spacing: -.02em; font-size: var(--st-text-md); }
.v-D .brand svg { flex: none; filter: drop-shadow(0 3px 6px var(--st-accent-glow)); }
.v-D .cmdf { flex: 1; min-width: 0; max-width: 620px; margin: 0 auto; height: 42px; display: flex; align-items: center; gap: 10px; padding: 0 8px 0 14px; border-radius: var(--st-radius-full); border: 1px solid var(--st-border-strong); background: var(--st-surface); color: var(--st-text-muted); box-shadow: var(--st-shadow-raised), var(--st-highlight-inset); font-size: var(--st-text-base); text-align: left; }
.v-D .cmdf:hover { border-color: var(--st-border-emphasis); }
.v-D .cmdf > span:first-of-type { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.v-D .acct { flex: none; display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 3px 12px 3px 3px; border-radius: var(--st-radius-full); border: 1px solid var(--st-border-strong); background: var(--st-surface); font-weight: 700; font-size: var(--st-text-sm); max-width: 190px; }
.v-D .acct[aria-expanded="true"] { border-color: var(--st-accent); background: var(--st-accent-tint); }
.v-D .acct > span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.v-D .av { width: 32px; height: 32px; border-radius: 50%; flex: none; display: grid; place-items: center; font: 600 var(--st-text-xs) var(--st-font-mono); color: var(--st-on-accent); background: linear-gradient(145deg, var(--st-button-primary-from), var(--st-button-primary-to)); }
.v-D .av .ico { width: 17px; height: 17px; }
@container app (width < 700px) {
  .v-D .top { height: 54px; gap: 6px; }
  .v-D .brand span, .v-D .hbtn span, .v-D .cmdf kbd, .v-D .acct > span:last-child { display: none; }
  .v-D .acct { padding: 3px; max-width: none; }
  .v-D .hbtn { width: 40px; padding: 0 !important; justify-content: center; }
  .v-D .cmdf { height: 40px; padding: 0 12px; }
}

/* columns */
.v-D .cols { flex: 1; min-height: 0; display: flex; position: relative; }
.v-D .feedcol { flex: 1; min-width: 0; display: flex; flex-direction: column; container: feed / inline-size; position: relative; isolation: isolate; }
.v-D .scroll { flex: 1; min-height: 0; overflow: auto; scrollbar-width: thin; scrollbar-color: var(--st-border-strong) transparent; }
.v-D .banner { flex: none; display: flex; align-items: center; gap: 10px; padding: 8px var(--pad); font-size: var(--st-text-sm); font-weight: 600; background: var(--st-feedback-warning-tint); color: var(--st-text); border-bottom: 1px solid var(--st-feedback-warning); }
.v-D .banner .ico { color: var(--st-feedback-warning); width: 18px; height: 18px; }

/* intake */
.v-D .intake { max-width: 720px; margin: 0 auto; padding: clamp(20px, 9vh, 88px) var(--pad) 120px; display: grid; gap: 14px; }
.v-D .ihead { font-size: var(--st-text-2xl); font-weight: 800; letter-spacing: -.025em; line-height: 1.12; }
.v-D .ilead { color: var(--st-text-secondary); max-width: 56ch; }
@container app (width < 700px) { .v-D .ihead { font-size: var(--st-text-xl); } .v-D .intake { padding-top: 18px; } }
.v-D .cmdbar { border-radius: var(--st-radius-2xl); padding: 12px 12px 10px 16px; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 8px 10px; align-items: start; transition: border-color var(--st-duration-fast), box-shadow var(--st-duration-fast); }
.v-D .cmdbar:focus-within { border-color: var(--st-accent); box-shadow: var(--st-shadow-glass), 0 0 0 3px var(--st-accent-glow); }
.v-D .cmdbar > .ico { margin-top: 6px; width: 20px; height: 20px; color: var(--st-text-muted); }
.v-D .cmdbar textarea { grid-column: 2; width: 100%; border: 0; outline: 0; background: transparent; resize: none; font: inherit; font-size: var(--st-text-md); line-height: 1.5; color: var(--st-text); min-height: 34px; max-height: 44vh; padding: 4px 0; overflow: auto; }
.v-D .cmdbar:focus-within textarea { min-height: 96px; }
.v-D .cmdbar textarea::placeholder { color: var(--st-text-muted); }
.v-D .cmdbar .cact { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.v-D .cmdbar .cdis { font-size: var(--st-text-xs); color: var(--st-text-on-glass-secondary); }
.v-D .filerow { grid-column: 2; display: flex; align-items: center; gap: 12px; min-height: 40px; }
.v-D .filerow .nm { font-weight: 700; overflow-wrap: anywhere; }
.v-D .filerow small { display: block; color: var(--st-text-muted); font-size: var(--st-text-xs); }
.v-D .srcrow { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.v-D .seg { display: inline-flex; gap: 2px; padding: 3px; border-radius: var(--st-radius-full); background: var(--st-surface-sunken); border: 1px solid var(--st-border); }
.v-D .seg button { min-height: 34px; padding: 0 14px; border-radius: var(--st-radius-full); font-weight: 700; font-size: var(--st-text-sm); color: var(--st-text-secondary); display: inline-flex; align-items: center; gap: 6px; }
.v-D .seg button .ico { width: 16px; height: 16px; }
.v-D .seg button[aria-pressed="true"] { background: var(--st-surface); color: var(--st-text); box-shadow: var(--st-shadow-raised), var(--st-highlight-inset); border: 1px solid var(--st-border-strong); }
.v-D .hint { font-size: var(--st-text-sm); color: var(--st-text-muted); }
.v-D .note { font-size: var(--st-text-sm); color: var(--st-text-secondary); }
.v-D .nrow { display: flex; gap: 8px; align-items: flex-start; font-size: var(--st-text-sm); color: var(--st-text-secondary); }
.v-D .nrow .ico { margin-top: 2px; width: 16px; height: 16px; color: var(--st-feedback-info); }
.v-D .box { border-radius: var(--st-radius-lg); background: var(--st-surface); border: 1px solid var(--st-border); box-shadow: var(--st-shadow-raised); padding: 12px 14px; display: grid; gap: 8px; }
.v-D .box h2 { font-size: var(--st-text-md); font-weight: 800; }
.v-D .reg { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; align-items: center; min-height: 40px; cursor: pointer; }
.v-D .reg input { width: 18px; height: 18px; accent-color: var(--st-accent); }
.v-D .rej { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 6px 0; border-top: 1px solid var(--st-border); }
.v-D .rej q { quotes: none; overflow-wrap: anywhere; font-size: var(--st-text-sm); flex: 1 1 180px; }
.v-D .structuring { max-width: 720px; margin: 0 auto; padding: clamp(24px, 14vh, 120px) var(--pad); display: grid; gap: 14px; justify-items: start; }
.v-D .structuring .row { display: flex; gap: 10px; align-items: center; font-weight: 700; font-size: var(--st-text-md); }
.v-D .sk { height: 12px; border-radius: var(--st-radius-full); background: var(--st-surface-sunken); width: 100%; }
.v-D .sk:nth-child(3) { width: 70%; } .v-D .sk:nth-child(4) { width: 85%; }

/* sticky strip */
.v-D .stripw { position: sticky; top: 0; z-index: var(--st-z-sticky); padding: 8px var(--pad) 0; }
.v-D .strip { max-width: 880px; margin: 0 auto; border-radius: var(--st-radius-xl); padding: 10px 12px; display: grid; gap: 8px; position: relative; }
.v-D .sh { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; min-height: 34px; }
.v-D .sh .t { flex: 1 1 220px; min-width: 0; display: grid; gap: 2px; font-size: var(--st-text-sm); color: var(--st-text-on-glass-secondary); }
.v-D .sh .t strong { color: var(--st-text); font-size: var(--st-text-base); }
.v-D .sh .a { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.v-D .sh .ph { display: inline-flex; align-items: center; gap: 8px; font-weight: 800; }
.v-D .sh .ph .ico { width: 18px; height: 18px; }
.v-D .sh .spc { flex: 1; }
.v-D .bar { flex: 1 1 80px; min-width: 60px; height: 6px; border-radius: var(--st-radius-full); background: var(--st-chart-track); overflow: hidden; border: 1px solid var(--st-border); }
.v-D .bar i { display: block; height: 100%; width: var(--p, 0%); background: var(--st-accent); transition: width var(--st-duration-base) var(--st-ease-standard); }
.v-D .r2 { display: grid; gap: 8px; }
.v-D .cnts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
@container feed (width >= 640px) { .v-D .cnts { grid-template-columns: repeat(6, minmax(0, 1fr)); } }.v-D .cnt { display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: 6px; row-gap: 1px; padding: 6px 8px; min-height: 46px; border-radius: var(--st-radius-md); border: 1px solid var(--vb); background: var(--vt); text-align: left; position: relative; }
.v-D .cnt .gly { width: 18px; height: 18px; }
.v-D .cnt .n { font-weight: 800; font-size: var(--st-text-lg); line-height: 1; font-variant-numeric: tabular-nums; }
.v-D .cnt .l { grid-column: 1 / -1; font-size: var(--st-text-2xs); color: var(--st-text-secondary); line-height: 1.2; overflow-wrap: break-word; hyphens: auto; }
.v-D .cnt[aria-pressed="true"] { outline: 2px solid var(--st-accent); outline-offset: 1px; background: var(--st-surface); }
.v-D .cnt[aria-pressed="true"]::after { content: ''; position: absolute; right: 6px; top: 6px; width: 8px; height: 8px; border-radius: 50%; background: var(--st-accent); }
.v-D .cnt:disabled { opacity: .55; }
.v-D .stg { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 6px 10px; border-radius: var(--st-radius-md); border: 1px dashed var(--st-border-emphasis); background: var(--st-glass-base); text-align: left; min-height: 46px; }
.v-D .stg[aria-pressed="true"] { outline: 2px solid var(--st-accent); outline-offset: 1px; border-style: solid; }
.v-D .stg .eyebrow { flex: 1 0 100%; color: var(--st-text-on-glass-secondary); }
.v-D .stg .sc { display: inline-flex; align-items: center; gap: 5px; font-size: var(--st-text-xs); font-weight: 700; }
.v-D .stg .sc .ico { width: 15px; height: 15px; }
.v-D .stg .sc b { font-variant-numeric: tabular-nums; }
.v-D .frow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: var(--st-text-sm); font-weight: 700; }
@container app (width < 700px) {
  .v-D .stripw { padding-top: 6px; }
  .v-D .strip { padding: 8px; gap: 6px; border-radius: var(--st-radius-lg); }
  .v-D .sh { gap: 6px 8px; min-height: 0; }
  .v-D .cnts { gap: 4px; }
  .v-D .cnt { min-height: 40px; padding: 4px 6px; }
  .v-D .cnt .n { font-size: var(--st-text-md); }
  .v-D .stg { min-height: 0; padding: 4px 8px; gap: 2px 8px; }
  .v-D .stg .eyebrow { flex: 0 0 auto; }
}
.v-D .menu { position: absolute; right: 8px; top: calc(100% - 4px); min-width: min(300px, 92%); padding: 6px; border-radius: var(--st-radius-lg); background: var(--st-surface); border: 1px solid var(--st-border-strong); box-shadow: var(--st-shadow-lifted); z-index: 3; display: grid; gap: 2px; }
.v-D .mi { display: grid; grid-template-columns: auto 1fr; column-gap: 10px; align-items: center; min-height: 40px; padding: 4px 10px; border-radius: var(--st-radius-md); font-weight: 600; font-size: var(--st-text-sm); }
.v-D .mi:hover:not(:disabled) { background: var(--st-accent-tint); }
.v-D .mi:disabled { opacity: .6; }
.v-D .mi small { grid-column: 2; color: var(--st-text-muted); font-weight: 400; font-size: var(--st-text-xs); }
.v-D .mi .ico { width: 18px; height: 18px; }


/* ---------- #195: compact 360 px strip variants (?strip=a|b) ---------- */
.v-D .strip.cx { padding: 6px; gap: 6px; }
.v-D .crow { display: flex; align-items: center; gap: 4px; min-width: 0; }
.v-D .c1 { display: flex; gap: 2px; flex: 1 1 auto; min-width: 0; }
.v-D .cc { display: inline-flex; align-items: center; justify-content: center; gap: 3px; flex: 1 1 0; min-width: 34px; min-height: 32px; padding: 0 4px; border-radius: var(--st-radius-sm); border: 1px solid transparent; background: transparent; position: relative; white-space: nowrap; }
.v-D .cc .gly { width: 16px; height: 16px; flex: none; }
.v-D .cc .n { font-weight: 800; font-size: var(--st-text-sm); font-variant-numeric: tabular-nums; }
.v-D .cc .l { font-size: var(--st-text-xs); color: var(--st-text-on-glass-secondary); font-weight: 600; }
.v-D .cc:hover:not(:disabled) { border-color: var(--st-border-strong); }
.v-D .cc:disabled { opacity: .45; }
.v-D .cc[aria-pressed="true"] { border-color: var(--st-accent); background: var(--st-surface); box-shadow: inset 0 0 0 1px var(--st-accent); }
.v-D .cc.st { flex: 0 0 auto; border: 1px dashed var(--st-border-emphasis); }
.v-D .cc.st[aria-pressed="true"] { border-style: solid; }
.v-D .cc .ico { width: 15px; height: 15px; }
.v-D .crow .btn.sm.icon { min-height: 32px; width: 32px; flex: none; }
.v-D .strip.cx .pbar { position: absolute; left: 14px; right: 14px; bottom: 0; height: 2px; border-radius: 2px; background: var(--st-border); overflow: hidden; }
.v-D .strip.cx .pbar i { display: block; height: 100%; width: var(--p, 0%); background: var(--st-accent); transition: width var(--st-duration-base) var(--st-ease-standard); }
.v-D .fchip { display: inline-flex; align-items: center; gap: 6px; align-self: start; justify-self: start; min-height: 28px; padding: 0 4px 0 10px; border-radius: var(--st-radius-full); border: 1px solid var(--st-border-strong); background: var(--st-surface); font-size: var(--st-text-sm); font-weight: 700; }
.v-D .fchip .gly, .v-D .fchip .ico { width: 15px; height: 15px; }
.v-D .fchip button { display: inline-grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; }
.v-D .fchip button:hover { background: var(--st-accent-tint); }
.v-D .fchip button .ico { width: 14px; height: 14px; }
/* b: one scrolling row of labelled counters */
.v-D .c1.sx { overflow-x: auto; scrollbar-width: none; scroll-snap-type: x proximity; -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 28px), transparent); mask-image: linear-gradient(90deg, #000 calc(100% - 28px), transparent); padding-right: 24px; gap: 4px; }
.v-D .c1.sx::-webkit-scrollbar { display: none; }
.v-D .c1.sx .cc { flex: none; padding: 0 8px; scroll-snap-align: start; }
.v-D .lede { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: var(--st-text-md); font-weight: 700; }
.v-D .lede .ph { display: inline-flex; align-items: center; gap: 6px; }
.v-D .lede .ico { width: 18px; height: 18px; }

/* feed */
.v-D .feed { max-width: 880px; margin: 0 auto; padding: 12px var(--pad) 110px; display: grid; gap: 12px; }
.v-D .echo { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: var(--st-text-sm); color: var(--st-text-secondary); }
.v-D .echo .ico { width: 16px; height: 16px; }
.v-D .echo b { overflow-wrap: anywhere; }
.v-D .cards { display: grid; gap: 10px; }
.v-D .card { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 6px 12px; padding: 12px 14px; border-radius: var(--st-radius-lg); background: var(--st-surface); border: 1px solid var(--st-border); box-shadow: var(--st-shadow-raised); align-items: start; transition: border-color var(--st-duration-fast), box-shadow var(--st-duration-fast); }
.v-D .card[data-v] { border-color: var(--vb); }
.v-D .card:hover { box-shadow: var(--st-shadow-lifted); }
.v-D .card.is-sel { outline: 2px solid var(--st-accent); outline-offset: 0; }
.v-D .card:has(.open:focus-visible) { outline: 2px solid var(--st-focus-ring); outline-offset: 2px; }
.v-D .num { font: 600 var(--st-text-xs) var(--st-font-mono); color: var(--st-text-muted); min-width: 22px; padding-top: 3px; font-variant-numeric: tabular-nums; }
.v-D .ctitle { font-size: var(--st-text-base); font-weight: 700; line-height: 1.3; }
.v-D .open { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; overflow-wrap: anywhere; outline: none; }
.v-D .open::after { content: ''; position: absolute; inset: 0; border-radius: inherit; }
.v-D .cmeta { font-size: var(--st-text-xs); color: var(--st-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.v-D .cres { display: flex; flex-wrap: wrap; gap: 4px; justify-content: flex-end; max-width: 220px; }
.v-D .ctrack { grid-column: 2 / -1; display: flex; align-items: center; flex-wrap: wrap; gap: 6px 12px; min-height: 26px; }
.v-D .steptxt { font: 500 var(--st-text-xs) var(--st-font-mono); color: var(--st-text-secondary); overflow-wrap: anywhere; min-width: 0; flex: 1 1 120px; }
.v-D .creason { grid-column: 2 / -1; font-size: var(--st-text-sm); color: var(--st-text-secondary); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.v-D .cold { grid-column: 2 / -1; font-size: var(--st-text-xs); color: var(--st-text-muted); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.v-D .card .retry { position: relative; z-index: 1; }
@container feed (width < 540px) { .v-D .card { grid-template-columns: auto minmax(0, 1fr); } .v-D .cres { grid-column: 2; justify-content: flex-start; max-width: none; } }
.v-D .empty { padding: 20px; text-align: center; color: var(--st-text-secondary); display: grid; gap: 8px; justify-items: center; }
.v-D .track { display: flex; align-items: center; }
.v-D .tn { position: relative; display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--st-border-strong); background: var(--st-surface); color: var(--st-text-muted); flex: none; }
.v-D .tn + .tn { margin-left: 14px; }
.v-D .tn + .tn::before { content: ''; position: absolute; right: 100%; top: 50%; width: 14px; height: 2px; background: var(--st-border-strong); transform: translateY(-50%); }
.v-D .tn .ico { width: 14px; height: 14px; stroke-width: 2.4; }
.v-D .tn.is-ok { color: var(--st-verdict-correct-mark); background: var(--st-verdict-correct-tint); border-color: var(--st-verdict-correct-border); }
.v-D .tn.is-diff { color: var(--st-verdict-deviations-mark); background: var(--st-verdict-deviations-tint); border-color: var(--st-verdict-deviations-border); }
.v-D .tn.is-bad { color: var(--st-verdict-not-found-mark); background: var(--st-verdict-not-found-tint); border-color: var(--st-verdict-not-found-border); }
.v-D .tn.is-warn { color: var(--st-feedback-warning); background: var(--st-feedback-warning-tint); border-color: var(--st-feedback-warning); }
.v-D .tn.is-none { color: var(--st-text-muted); background: var(--st-surface-sunken); }
.v-D .tn.is-pend { border-style: dashed; background: transparent; }
.v-D .tn.is-cur { color: var(--st-accent-text); border-color: var(--st-accent); background: var(--st-accent-tint); }
.v-D .tn.is-cur .ico { width: 16px; height: 16px; }
.v-D .foot { display: grid; gap: 8px; padding-top: 8px; font-size: var(--st-text-sm); color: var(--st-text-secondary); }
.v-D .foot .nrow .ico { color: var(--st-text-muted); }

/* detail */
.v-D .detail { --dw: clamp(380px, 38cqw, 520px); flex: none; width: var(--dw); position: relative; overflow: hidden; background: var(--st-surface); border-left: 1px solid var(--st-border-strong); box-shadow: var(--st-shadow-raised); }
.v-D .detail.enter { animation: d-push var(--st-duration-base) var(--st-ease-standard); }
@keyframes d-push { from { width: 0; } }
.v-D .dscroll { width: var(--dw); height: 100%; overflow: auto; container: dt / inline-size; scrollbar-width: thin; scrollbar-color: var(--st-border-strong) transparent; }
@container app (width < 700px) {
  .v-D .detail { position: absolute; inset: 0; width: auto; z-index: 5; border-left: 0; }
  .v-D .dscroll { width: 100%; }
  .v-D .detail.enter { animation: d-slide var(--st-duration-base) var(--st-ease-standard); }
}
@keyframes d-slide { from { opacity: 0; transform: translateX(20px); } }
.v-D .dhead { position: sticky; top: 0; z-index: 4; display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-width: 0 0 1px 0; border-radius: 0; }
.v-D .dhead .pos { flex: 1; text-align: center; font-size: var(--st-text-xs); color: var(--st-text-on-glass-secondary); font-variant-numeric: tabular-nums; }
.v-D .dhead .pg { display: flex; gap: 4px; }
.v-D .dbody { padding: 16px 16px 120px; display: grid; gap: 18px; }
.v-D .dtitle { font-size: var(--st-text-lg); font-weight: 800; line-height: 1.25; letter-spacing: -.015em; overflow-wrap: anywhere; outline: none; }
.v-D .dau { font-size: var(--st-text-sm); color: var(--st-text-muted); overflow-wrap: anywhere; margin-top: 2px; }
.v-D .dsec { display: grid; gap: 8px; }
.v-D .dsec > h3 { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.v-D .vblock { display: grid; gap: 8px; padding: 12px; border-radius: var(--st-radius-lg); background: var(--vt, var(--st-surface-sunken)); border: 1px solid var(--vb, var(--st-border-strong)); }
.v-D .vblock .vrow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.v-D .vblock .reason { font-size: var(--st-text-base); line-height: 1.45; }
.v-D .sysv { font-size: var(--st-text-sm); color: var(--st-text-secondary); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.v-D .ohist { font-size: var(--st-text-xs); color: var(--st-text-muted); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.v-D .histres { display: grid; gap: 6px; padding: 10px; border-radius: var(--st-radius-md); border: 1px dashed var(--st-border-emphasis); background: var(--st-surface-sunken); color: var(--st-text-secondary); }
.v-D .histres .vchip { filter: saturate(.6); opacity: .85; }
.v-D .orig { font: 400 var(--st-text-sm)/1.5 var(--st-font-mono); padding: 10px 12px; border-radius: var(--st-radius-md); background: var(--st-surface-sunken); border: 1px solid var(--st-border); overflow-wrap: anywhere; }
.v-D .cmp { display: grid; gap: 0; border: 1px solid var(--st-border); border-radius: var(--st-radius-md); overflow: hidden; }
.v-D .cmp-h, .v-D .cmp-r { display: grid; grid-template-columns: 84px minmax(0, 1fr) minmax(0, 1fr); gap: 4px 10px; padding: 8px 10px; align-items: start; }
.v-D .cmp-h { background: var(--st-surface-sunken); font-size: var(--st-text-2xs); text-transform: uppercase; letter-spacing: var(--st-tracking-caps); font-weight: 600; color: var(--st-text-muted); }
.v-D .cmp-r { border-top: 1px solid var(--st-border); font-size: var(--st-text-sm); }
.v-D .cmp-r.is-dev { background: var(--st-verdict-deviations-tint); }
.v-D .cf { font-weight: 700; color: var(--st-text-secondary); }
.v-D .cy, .v-D .cb { overflow-wrap: anywhere; min-width: 0; }
.v-D .cb small { display: block; color: var(--st-text-muted); font: 400 var(--st-text-2xs) var(--st-font-mono); margin-top: 2px; }
.v-D .lab { display: none; font-size: var(--st-text-2xs); text-transform: uppercase; letter-spacing: var(--st-tracking-caps); color: var(--st-text-muted); font-weight: 600; margin-bottom: 1px; }
.v-D .devtag { display: inline-flex; align-items: center; gap: 3px; font-size: var(--st-text-xs); font-weight: 700; color: var(--st-text); margin-top: 2px; }
.v-D .devtag .ico { width: 13px; height: 13px; color: var(--st-verdict-deviations-mark); }
.v-D .okmark { display: inline-flex; vertical-align: middle; color: var(--st-verdict-correct-mark); }
.v-D .okmark .ico { width: 14px; height: 14px; }
.v-D .unk { color: var(--st-text-muted); font-style: italic; }
@container dt (width < 470px) {
  .v-D .cmp-h { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); padding: 0; }
  .v-D .cmp-r { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .v-D .cf { grid-column: 1 / -1; }
  .v-D .lab { display: block; }
}
.v-D .fld { display: grid; gap: 3px; font-size: var(--st-text-sm); font-weight: 700; color: var(--st-text-secondary); }
.v-D .fld input, .v-D .sel { width: 100%; min-height: 38px; padding: 6px 10px; border-radius: var(--st-radius-md); border: 1px solid var(--st-border-emphasis); background: var(--st-surface); color: var(--st-text); font: inherit; font-weight: 400; font-size: var(--st-text-sm); }
.v-D .fld input:disabled { opacity: .6; }
.v-D .cmp .fld input { min-height: 34px; }
.v-D .row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.v-D .tc { padding: 10px 12px; border-radius: var(--st-radius-md); border: 1px solid var(--st-border); background: var(--st-surface-sunken); line-height: 1.7; overflow-wrap: anywhere; font-size: var(--st-text-sm); }
.v-D .amend { display: inline-flex; align-items: center; gap: 4px; font-size: var(--st-text-xs); font-weight: 700; padding: 3px 8px; border-radius: var(--st-radius-sm); color: var(--st-feedback-warning); background: var(--st-feedback-warning-tint); border: 1px dashed var(--st-feedback-warning); }
.v-D .amend .ico { width: 14px; height: 14px; }
.v-D .jg { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.v-D .jb { display: flex; align-items: center; gap: 6px; min-height: 40px; padding: 4px 8px; border-radius: var(--st-radius-md); border: 1px solid var(--vb); background: var(--vt); font-size: var(--st-text-sm); font-weight: 700; }
.v-D .jb[aria-pressed="true"] { outline: 2px solid var(--st-accent); outline-offset: 1px; }
.v-D .srcs, .v-D .trail { display: grid; gap: 0; border: 1px solid var(--st-border); border-radius: var(--st-radius-md); overflow: hidden; }
.v-D .src, .v-D .te { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 2px 10px; padding: 8px 10px; border-top: 1px solid var(--st-border); font-size: var(--st-text-sm); align-items: start; }
.v-D .src:first-child, .v-D .te:first-child { border-top: 0; }
.v-D .src .sn { font-weight: 600; }
.v-D .src .stx { grid-column: 2; color: var(--st-text-secondary); overflow-wrap: anywhere; }
.v-D .src .ms { color: var(--st-text-muted); font-size: var(--st-text-xs); grid-column: 3; grid-row: 1; }
.v-D .te { grid-template-columns: auto minmax(0, 1fr); }
.v-D .te.is-pend { color: var(--st-text-muted); }
.v-D .rs, .v-D .te > .ico { display: inline-flex; width: 20px; height: 20px; align-items: center; justify-content: center; }
.v-D .rs.is-ok { color: var(--st-verdict-correct-mark); } .v-D .rs.is-diff { color: var(--st-verdict-deviations-mark); } .v-D .rs.is-bad { color: var(--st-verdict-not-found-mark); } .v-D .rs.is-warn { color: var(--st-feedback-warning); } .v-D .rs.is-none { color: var(--st-text-muted); }
.v-D .te.is-ok > .ico { color: var(--st-verdict-correct-mark); } .v-D .te.is-diff > .ico { color: var(--st-verdict-deviations-mark); } .v-D .te.is-bad > .ico { color: var(--st-verdict-not-found-mark); } .v-D .te.is-warn > .ico { color: var(--st-feedback-warning); } .v-D .te.is-none > .ico { color: var(--st-text-muted); }
.v-D .cand { display: grid; gap: 4px; padding: 8px 10px; border-top: 1px solid var(--st-border); font-size: var(--st-text-sm); }
.v-D .cand:first-child { border-top: 0; }

/* overlays */
.v-D .scrim { position: absolute; inset: 0; z-index: var(--st-z-overlay); background: var(--st-scrim); backdrop-filter: blur(4px) saturate(1.1); }
.v-D .scrim.clear { background: transparent; backdrop-filter: none; z-index: calc(var(--st-z-overlay) - 1); }
.v-D .hist { position: absolute; top: 0; bottom: 0; left: 0; width: min(420px, 100%); z-index: calc(var(--st-z-overlay) + 1); display: flex; flex-direction: column; border-radius: 0 var(--st-radius-xl) var(--st-radius-xl) 0; }
.v-D .hist.enter { animation: d-left var(--st-duration-base) var(--st-ease-standard); }
@keyframes d-left { from { transform: translateX(-24px); opacity: 0; } }
.v-D .ovh { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 14px; border-bottom: 1px solid var(--st-border); }
.v-D .ovh h2 { font-size: var(--st-text-lg); font-weight: 800; }
.v-D .ovb { flex: 1; min-height: 0; overflow: auto; padding: 12px 14px 24px; display: grid; gap: 10px; align-content: start; scrollbar-width: thin; }
.v-D .he { display: grid; gap: 6px; padding: 12px; border-radius: var(--st-radius-lg); background: var(--st-surface); border: 1px solid var(--st-border); }
.v-D .he.locked { background: var(--st-surface-sunken); }
.v-D .he .hh { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-weight: 800; flex-wrap: wrap; }
.v-D .he .hm { font-size: var(--st-text-xs); color: var(--st-text-muted); display: flex; gap: 4px 10px; flex-wrap: wrap; align-items: center; }
.v-D .he .hm .ico { width: 14px; height: 14px; }
.v-D .hcs { display: flex; flex-wrap: wrap; gap: 4px 8px; }
.v-D .hc { display: inline-flex; align-items: center; gap: 4px; font-size: var(--st-text-xs); }
.v-D .hc .gly { width: 14px; height: 14px; }
.v-D .bill { display: flex; gap: 6px; align-items: flex-start; font-size: var(--st-text-xs); color: var(--st-text); padding: 6px 8px; border-radius: var(--st-radius-md); background: var(--st-feedback-warning-tint); border: 1px solid var(--st-feedback-warning); }
.v-D .bill .ico { width: 15px; height: 15px; color: var(--st-feedback-warning); margin-top: 1px; }
.v-D .curtag { font-size: var(--st-text-2xs); font-weight: 700; text-transform: uppercase; letter-spacing: var(--st-tracking-caps); padding: 2px 8px; border-radius: var(--st-radius-full); background: var(--st-accent-tint); color: var(--st-accent-text); border: 1px solid var(--st-accent); }
.v-D .pop { position: absolute; top: 62px; right: var(--pad); width: min(340px, calc(100% - 2 * var(--pad))); z-index: calc(var(--st-z-overlay) + 1); padding: 14px; display: grid; gap: 10px; border-radius: var(--st-radius-xl); outline: none; }
.v-D .pop.enter, .v-D .palette.enter, .v-D .dlg.enter { animation: d-pop var(--st-duration-base) var(--st-ease-standard); }
@keyframes d-pop { from { transform: translateY(-8px); opacity: 0; } }
.v-D .pop h2 { font-size: var(--st-text-md); font-weight: 800; outline: none; }
.v-D .meter { height: 8px; border-radius: var(--st-radius-full); background: var(--st-chart-track); border: 1px solid var(--st-border); overflow: hidden; }
.v-D .meter i { display: block; height: 100%; width: var(--p, 0%); background: var(--st-accent); }
.v-D .palette { position: absolute; top: min(12vh, 90px); left: 0; right: 0; margin: 0 auto; width: min(640px, calc(100% - 24px)); max-height: min(72%, 560px); z-index: var(--st-z-command); display: flex; flex-direction: column; border-radius: var(--st-radius-2xl); overflow: hidden; background: var(--st-glass-base-overlay); }
.v-D .pq { flex: none; display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--st-border); }
.v-D .pq .ico { width: 20px; height: 20px; color: var(--st-text-muted); }
.v-D .pq input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font: inherit; font-size: var(--st-text-md); color: var(--st-text); }
.v-D .pl { flex: 1; min-height: 0; overflow: auto; padding: 6px; }
.v-D .pg-h { padding: 8px 10px 2px; }
.v-D .po { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; align-items: center; min-height: 42px; padding: 4px 10px; border-radius: var(--st-radius-md); cursor: pointer; font-size: var(--st-text-sm); font-weight: 600; }
.v-D .po .ico, .v-D .po .gly { width: 18px; height: 18px; }
.v-D .po > span { overflow-wrap: anywhere; }
.v-D .po small { color: var(--st-text-muted); font-weight: 400; font-size: var(--st-text-xs); }
.v-D .po[aria-selected="true"] { background: var(--st-accent-tint); outline: 1px solid var(--st-accent); }
.v-D .po[aria-disabled="true"] { opacity: .55; }
.v-D .dlg { position: absolute; top: min(14vh, 110px); left: 0; right: 0; margin: 0 auto; width: min(520px, calc(100% - 24px)); max-height: 80%; overflow: auto; z-index: calc(var(--st-z-command) - 5); padding: 18px; display: grid; gap: 12px; border-radius: var(--st-radius-2xl); outline: none; }
.v-D .dlg h2 { font-size: var(--st-text-lg); font-weight: 800; outline: none; }
.v-D .dlg .fs { display: grid; gap: 4px; }
.v-D .dlg legend { font-weight: 700; font-size: var(--st-text-sm); padding: 0; margin-bottom: 4px; }
.v-D .dlg label.opt { display: flex; align-items: center; gap: 8px; min-height: 36px; }
.v-D .dlg .acts { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.v-D .dlg ol { list-style: decimal; padding-left: 20px; display: grid; gap: 6px; }
.v-D .toast { position: absolute; left: 0; right: 0; margin: 0 auto; bottom: 70px; width: fit-content; max-width: calc(100% - 24px); z-index: var(--st-z-toast); padding: 10px 16px; border-radius: var(--st-radius-full); font-size: var(--st-text-sm); font-weight: 700; }
@media (prefers-reduced-motion: reduce) { .v-D *, .v-D *::before, .v-D *::after { animation: none !important; transition: none !important; } }
:root[data-still] .v-D *, :root[data-still] .v-D *::before, :root[data-still] .v-D *::after { animation: none !important; transition: none !important; }
`;

  ST.variant({
    key: 'D', name: 'Feed + sticky strip', css: CSS,
    mount(root, ctx) {
      const s = ST.state, t = ST.t, L = ST.L, esc = ST.esc;
      const panel = ctx.surface === 'panel';
      const app = root.parentElement;
      const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
      const KBD = isMac ? '⌘K' : 'Ctrl K';
      const VK = ['correct', 'deviations', 'mixed', 'doi-conflict', 'not-found', 'not-verifiable'];
      const ICO = { ok: 'e-ok', none: 'e-none', diff: 'e-diff', bad: 'e-bad', warn: 'e-warn' };
      const VL = (k) => t('verdict')[k], VS = (k) => t('verdictShort')[k], SL = (k) => t('status')[k], RT = (k) => t('dRes')[k];

      root.classList.add(panel ? 'panel' : 'web');
      root.innerHTML = '<div class="sr-only" role="status" aria-live="polite" data-live></div><div class="d-ui"></div>';
      const live = root.querySelector('[data-live]'), host = root.querySelector('.d-ui');

      const ui = { menu: false, q: '', sel: 0, judge: null, open: {}, exp: { fmt: 'csl', style: 'APA 7' }, typing: false, pf: null, ret: null,
        was: { sel: null, view: 'check', cmd: false, dlg: null }, pressing: false, dirty: false, narrow: false, items: [] };
      let ENT = {};
      let flushT = 0;
      const narrow = () => app.clientWidth < 700;

      /* ---------- small view helpers ---------- */
      const vchip = (v, cls = '') => `<span class="vchip ${cls}" data-v="${v}">${ST.gly(v)}<span>${esc(VL(v))}</span></span>`;
      const schip = (st, label) => `<span class="schip" data-s="${st}">${ST.stat(st, st === 'running' ? 'spin' : '')}<span>${esc(label)}</span></span>`;
      const mtag = () => `<span class="mtag">${ST.ico('i-pen')}${esc(t('manualTag'))}</span>`;
      const btn = (act, label, o = {}) => `<button type="button" class="btn ${o.cls || ''}" data-act="${act}" ${o.dis ? 'disabled' : ''} ${o.pressed != null ? `aria-pressed="${o.pressed}"` : ''} ${o.exp != null ? `aria-expanded="${o.exp}"` : ''} ${o.k ? `data-k="${o.k}"` : ''}>${o.icon ? ST.ico(o.icon) : ''}<span>${esc(label)}</span></button>`;
      const storageLine = () => { const cur = ST.HISTORY.find((h) => h.current); return s.historyOn ? t('storageHistory', ST.date(cur.deletes)) : t('storageTemp'); };
      const sourceLabel = () => s.intakeSource === 'file' ? ST.DOCUMENT.name : s.intakeSource === 'selection' ? ST.SELECTION.page : t('dSrcText');
      const secs = (ms) => !ms ? '—' : ms >= 1000 ? `${ms / 1000} s` : `${ms} ms`;
      const keyOf = (el) => el && el.dataset ? (el.dataset.k || (el.dataset.act ? 'act:' + el.dataset.act : null)) : null;
      const q = (k) => host.querySelector(k.startsWith('act:') ? `[data-act="${k.slice(4).replace(/"/g, '\\"')}"]` : `[data-k="${k.replace(/"/g, '\\"')}"]`);
      const feedEl = () => host.querySelector('[data-scroll="feed"]');
      const accName = () => s.account === 'guest' ? t('guest') : ST.ACCOUNT.free.name;
      const initials = () => ST.ACCOUNT.free.name.split(' ').map((w) => w[0]).join('');
      const remember = () => { const a = document.activeElement; ui.ret = (a && host.contains(a) && keyOf(a)) || 'cmdbtn'; };
      const planLink = (label) => panel
        ? `<a class="lnk" href="#web-plan" data-act="planweb">${esc(label)}${ST.ico('i-ext')}</a>`
        : `<button type="button" class="btn sm" data-act="planweb">${esc(label)}</button>`;

      /* ---------- top bar ---------- */
      function topbar() {
        const avatar = s.account === 'guest' ? `<span class="av">${ST.ico('i-user')}</span>` : `<span class="av" aria-hidden="true">${esc(initials())}</span>`;
        return `<header class="top st-glass quiet">
          <div class="lft">
            <button type="button" class="btn ghost hbtn" data-k="histbtn" data-act="hist" aria-haspopup="dialog" aria-expanded="${s.view === 'history'}" aria-label="${esc(t('navHistory'))}">${ST.ico('i-history')}<span>${esc(t('navHistory'))}</span></button>
            <button type="button" class="brand" data-act="home" data-k="brand" aria-label="${esc(t('productName'))} · ${esc(t('navCheck'))}">${ST.mark(28)}<span>${esc(t('productName'))}</span></button>
          </div>
          <button type="button" class="cmdf" data-k="cmdbtn" data-act="cmd" aria-haspopup="dialog" aria-label="${esc(t('dCmdOpen'))}">${ST.ico('i-search')}<span>${esc(t('cmdHint'))}</span><kbd>${KBD}</kbd></button>
          <button type="button" class="acct" data-k="acctbtn" data-act="acct" aria-haspopup="dialog" aria-expanded="${s.view === 'account'}" aria-label="${esc(t('navAccount'))}: ${esc(accName())}">${avatar}<span>${esc(accName())}</span></button>
        </header>`;
      }

      /* ---------- evidence step track ---------- */
      function track(r) {
        const n = r.trail.length, k = r.status === 'done' ? n : Math.min(r.step, n);
        const liveR = r.status === 'running' || r.status === 'rechecking';
        const items = r.trail.map(([kind, lab, res], i) => {
          const reached = i < k, cur = liveR && i === k;
          const cls = reached ? `is-${res}` : cur ? 'is-cur' : 'is-pend';
          const icon = reached ? ST.ico(kind === 'e' ? 'e-end' : ICO[res]) : cur ? ST.stat('running', 'spin') : '';
          return `<li class="tn ${cls}">${icon}<span class="sr-only">${esc(L(lab))}${reached ? ': ' + esc(RT(res)) : ''}</span></li>`;
        }).join('');
        return `<ol class="track" aria-label="${esc(t('trailHeading'))}: ${k}/${n}">${items}</ol>`;
      }
      function stepText(r) {
        const n = r.trail.length;
        if (r.status === 'running' || r.status === 'rechecking') {
          const k = Math.min(r.step, n), nx = r.trail[k];
          const lab = nx && nx[0] === 's' ? t('step').searching(L(nx[1])) : t('step').scoring;
          return `${t('dStepOf', Math.min(k + 1, n), n)} · ${lab}`;
        }
        if (r.status === 'done' || r.status === 'failed') return t('dStepsDone', n);
        return '';
      }
      function resChip(r) {
        switch (r.status) {
          case 'done': return vchip(ST.effective(r)) + (r.override ? mtag() : '');
          case 'rechecking': return schip('running', t('recheckRunning'));
          case 'idle': return '';
          default: return schip(r.status, SL(r.status));
        }
      }

      /* ---------- feed cards ---------- */
      function card(r, i) {
        const done = r.status === 'done', v = done ? ST.effective(r) : null;
        const txt = stepText(r);
        return `<li class="card ${s.selected === r.id ? 'is-sel' : ''}" ${v ? `data-v="${v}"` : ''} data-st="${r.status}">
          <span class="num tnum" aria-hidden="true">${r.id}</span>
          <div><h3 class="ctitle"><button type="button" class="open" data-k="card-${r.id}" data-act="open:${r.id}" ${s.selected === r.id ? 'aria-current="true"' : ''}>${esc(r.title)}</button></h3>
            <p class="cmeta">${esc(r.au)} · ${esc(r.yr)}</p></div>
          <div class="cres">${resChip(r)}</div>
          <div class="ctrack">${track(r)}${txt ? `<span class="steptxt">${esc(txt)}</span>` : ''}${r.status === 'failed' ? `<button type="button" class="btn sm retry" data-act="retry:${r.id}">${ST.ico('i-undo')}<span>${esc(t('retry'))}</span></button>` : ''}</div>
          ${done ? `<p class="creason">${esc(L(r.reason))}</p>` : ''}
          ${r.status === 'rechecking' && r.hist && r.hist.verdict ? `<p class="cold">${esc(t('historicalResult'))}: ${vchip(r.hist.verdict, 'dim')}</p>` : ''}
        </li>`;
      }
      function cards() {
        const vis = ST.visible();
        if (!vis.length) return `<li class="empty"><p>${esc(t('dNoMatch'))}</p>${btn('filter-clear', t('filterClear'), { cls: 'sm' })}</li>`;
        return vis.map(card).join('');
      }


      /* ---------- #195: compact 360 px strip, variants a (glyph + count) and b (scrolling labels) ---------- */
      const SV = () => (narrow() && ['running', 'done'].includes(s.stage) && !ui.lab) ? ST.cfg.strip : '';
      function stripCompact(kind) {
        const c = ST.counts(), N = ST.N();
        const cnts = VK.map((v) => { const n = c.verdicts[v], on = s.filter === v;
          return `<button type="button" class="cc" data-v="${v}" data-k="cc-${v}" data-act="filter:${v}" aria-pressed="${on}" aria-label="${esc(VL(v) + ': ' + n)}" title="${esc(VL(v))}" ${n === 0 && !on ? 'disabled' : ''}>${ST.gly(v)}<span class="n tnum" aria-hidden="true">${n}</span>${kind === 'b' ? `<span class="l" aria-hidden="true">${esc(VS(v))}</span>` : ''}</button>`; }).join('');
        const sts = ['running', 'queued', 'failed', 'cancelled', 'not-checked'].filter((k) => c.statuses[k] > 0);
        const tot = sts.reduce((a, k) => a + c.statuses[k], 0);
        const stName = t('statusesHeading') + ': ' + sts.map((k) => `${c.statuses[k]} ${SL(k)}`).join(', ');
        const stb = !sts.length ? '' : kind === 'b'
          ? sts.map((k) => `<button type="button" class="cc st" data-k="cc-st-${k}" data-act="filter:status" aria-pressed="${s.filter === 'status'}" aria-label="${esc(SL(k) + ': ' + c.statuses[k])}">${ST.stat(k, k === 'running' ? 'spin' : '')}<span class="n tnum" aria-hidden="true">${c.statuses[k]}</span><span class="l" aria-hidden="true">${esc(SL(k))}</span></button>`).join('')
          : `<button type="button" class="cc st" data-k="cc-st" data-act="filter:status" aria-pressed="${s.filter === 'status'}" aria-label="${esc(stName)}" title="${esc(stName)}">${ST.stat(sts[0], sts[0] === 'running' ? 'spin' : '')}<span class="n tnum" aria-hidden="true">${tot}</span></button>`;
        const row = kind === 'b'
          ? `<div class="crow"><div class="c1 sx" role="group" aria-label="${esc(t('dVerdicts'))}">${cnts}${stb}</div>${menuBtnC()}</div>`
          : `<div class="crow"><div class="c1" role="group" aria-label="${esc(t('dVerdicts'))}">${cnts}</div>${stb}${menuBtnC()}</div>`;
        const fv = s.filter;
        const chip = fv ? `<div class="fchip">${fv === 'status' ? ST.ico('i-info') : ST.gly(fv)}<span>${esc(fv === 'status' ? t('statusesHeading') : VL(fv))}</span><button type="button" data-k="fclear" data-act="filter-clear" aria-label="${esc(t('filterClear'))}">${ST.ico('i-x')}</button></div>` : '';
        const pbar = s.stage === 'running' ? `<span class="pbar" role="progressbar" aria-label="${esc(t('running'))}" aria-valuemin="0" aria-valuemax="${N}" aria-valuenow="${c.done}" style="--p:${Math.round(c.done / N * 100)}%"><i></i></span>` : '';
        return `<div class="stripw"><section class="strip cx st-glass" aria-label="${esc(s.stage === 'running' ? t('running') : t('done'))}">${row}${chip}${pbar}${ui.menu ? menu() : ''}</section></div>`;
      }
      const menuBtnC = () => `<button type="button" class="btn sm icon" data-k="menubtn" data-act="menu" aria-haspopup="menu" aria-expanded="${ui.menu}" aria-label="${esc(t('dMore'))}">${ST.ico('i-more')}</button>`;
      function lede() {
        if (!SV() && !(narrow() && ST.cfg.strip && ui.lab)) return '';
        const c = ST.counts(), N = ST.N();
        if (s.stage === 'running') return `<p class="lede"><span class="ph">${ST.stat('running', 'spin')}${esc(t('dRunLede', c.done, N))}</span>${btn('stop', t('stop'), { cls: 'sm', icon: 'i-stop' })}</p>`;
        if (s.stage === 'done') return `<p class="lede">${esc(t('summarySentence', c.verdicts.correct, N))}</p>`;
        return '';
      }
      /* ---------- sticky strip ---------- */
      function strip() {
        if (!['counted', 'running', 'done'].includes(s.stage)) return '';
        if (SV()) return stripCompact(SV());
        const c = ST.counts(), N = ST.N(), av = ST.available();
        let head;
        if (s.stage === 'counted') {
          const short = av < N;
          head = `<div class="sh"><div class="t"><strong>${esc(t('detected', N))}</strong>
            <span>${esc(short ? t('quotaChoiceBody', N, av) : t('quotaPreview', N, av, av - N) + ' ' + t('autoStart'))}</span></div>${menuBtn()}</div>
            ${short ? `<div class="sh"><div class="a">${btn('run:' + av, t('quotaChoiceFirst', av), { cls: 'primary wrap' })}${planLink(panel ? t('quotaUpgradeWeb') : t('quotaUpgrade'))}${btn('cancelcheck', t('cancel'), { cls: 'sm ghost' })}</div></div>` : ''}`;
        } else if (s.stage === 'running') {
          const pct = Math.round(c.done / N * 100);
          head = `<div class="sh"><span class="ph">${ST.stat('running', 'spin')}${esc(t('running'))}</span>
            <span class="mono tnum">${esc(t('progress', c.done, N))}</span>
            <span class="bar" role="progressbar" aria-label="${esc(t('running'))}" aria-valuemin="0" aria-valuemax="${N}" aria-valuenow="${c.done}" style="--p:${pct}%"><i></i></span>
            ${btn('stop', t('stop'), { cls: 'sm', icon: 'i-stop' })}${menuBtn()}</div>`;
        } else {
          head = `<div class="sh"><span class="ph">${ST.ico('i-check')}${esc(t('done'))}</span>
            <span class="note">${esc(t('summarySentence', c.verdicts.correct, N))}</span><span class="spc"></span>${menuBtn()}</div>`;
        }
        const cnts = VK.map((v) => { const n = c.verdicts[v], on = s.filter === v;
          return `<button type="button" class="cnt" data-v="${v}" data-act="filter:${v}" aria-pressed="${on}" ${n === 0 && !on ? 'disabled' : ''}>${ST.gly(v)}<span class="n tnum">${n}</span><span class="l">${esc(VS(v))}</span></button>`; }).join('');
        const sts = ['running', 'queued', 'failed', 'cancelled', 'not-checked'].filter((k) => c.statuses[k] > 0);
        const stg = sts.length ? `<button type="button" class="stg" data-act="filter:status" aria-pressed="${s.filter === 'status'}"><span class="eyebrow">${esc(t('statusesHeading'))}</span>${sts.map((k) => `<span class="sc">${ST.stat(k, k === 'running' ? 'spin' : '')}<b>${c.statuses[k]}</b>${esc(SL(k))}</span>`).join('')}</button>` : '';
        const frow = s.filter ? `<div class="frow"><span>${esc(t('dFilterOn', s.filter === 'status' ? t('statusesHeading') : VL(s.filter)))}</span>${btn('filter-clear', t('filterClear'), { cls: 'sm ghost', icon: 'i-x' })}</div>` : '';
        const coll = narrow() && ui.coll;
        return `<div class="stripw"><section class="strip st-glass" aria-label="${esc(s.stage === 'running' ? t('running') : s.stage === 'counted' ? t('detected', N) : t('done'))}">${head}${coll ? '' : `<div class="r2"><div class="cnts" role="group" aria-label="${esc(t('dVerdicts'))}">${cnts}</div>${stg}</div>`}${frow}${ui.menu ? menu() : ''}</section></div>`;
      }
      const menuBtn = () => (narrow() ? (ST.cfg.strip && ui.lab ? `<button type="button" class="btn sm icon" data-k="tgl" data-act="labels" aria-expanded="true" aria-label="${esc(t('dLabelsHide'))}">${ST.ico('i-filter')}</button>` : `<button type="button" class="btn sm icon" data-k="tgl" data-act="coll" aria-expanded="${!ui.coll}" aria-label="${esc(t('dCounts'))}">${ST.ico('i-filter')}</button>`) : '') + `<button type="button" class="btn sm icon" data-k="menubtn" data-act="menu" aria-haspopup="menu" aria-expanded="${ui.menu}" aria-label="${esc(t('dMore'))}">${ST.ico('i-more')}</button>`;
      function menu() {
        const running = s.stage === 'running', busy = ST.isBusy();
        const mi = (act, icon, label, dis, why) => `<button type="button" role="menuitem" class="mi" data-act="${act}" ${dis ? 'disabled' : ''}>${ST.ico(icon)}<span>${esc(label)}</span>${dis && why ? `<small>${esc(why)}</small>` : ''}</button>`;
        return `<div class="menu" role="menu" aria-label="${esc(t('dMore'))}">
          ${narrow() && ST.cfg.strip && ['running', 'done'].includes(s.stage) ? mi('labels', 'i-filter', ui.lab ? t('dLabelsHide') : t('dLabelsShow')) : ''}
          ${mi('stop', 'i-stop', t('stop'), !running, t('dStopWhy'))}
          ${mi('reset', 'i-reset', t('reset'))}
          ${mi('dlg:export', 'i-download', t('exportAction'))}
          ${mi('dlg:report', 'i-pdf', t('reportAction'))}
          ${mi('dlg:how', 'i-help', t('howItWorks'))}
          ${mi('dlg:editlist', 'i-edit-list', t('editList'), busy, t('editListGated'))}</div>`;
      }

      /* ---------- intake ---------- */
      function intake() {
        const can = ST.act.canStart(), file = s.intakeSource === 'file';
        const D = ST.DOCUMENT;
        const bar = file
          ? `${ST.ico('i-doc')}<div class="filerow"><div style="flex:1;min-width:0"><span class="nm">${esc(D.name)}</span><small>${D.pages} · ${esc(D.size)}</small></div>${btn('src:paste', t('dRemove'), { cls: 'sm ghost icon', icon: 'i-x' })}</div>`
          : `${ST.ico('i-search')}<textarea data-k="ta" rows="1" aria-label="${esc(t('intakeTitle'))}" aria-describedby="d-hint" placeholder="${esc(t('intakePlaceholder'))}" spellcheck="false">${esc(s.input)}</textarea>`;
        const regions = file ? `<section class="box" aria-labelledby="d-rg"><h2 id="d-rg">${esc(t('regionsHeading'))}</h2><p class="hint">${esc(t('regionsHint'))}</p>
          ${s.regions.map((r) => `<label class="reg"><input type="checkbox" data-act="region:${r.id}" ${r.selected ? 'checked' : ''}><span>${esc(L(r.label))}</span><span class="mono tnum muted">${esc(t('historyCount', r.count))}</span></label>`).join('')}</section>
          <section class="box" aria-labelledby="d-rj"><h2 id="d-rj">${esc(t('rejectedHeading'))}</h2>
          ${s.rejected.map((r) => `<div class="rej"><q>${esc(L(r.text))}</q>${r.adopted ? `<span class="mtag">${ST.ico('i-check')}${esc(t('rejectedAdopt'))}</span>` : btn('adopt:' + r.id, t('rejectedAdopt'), { cls: 'sm', icon: 'i-plus' })}</div>`).join('')}</section>` : '';
        return `<div class="intake">
          <div><h1 class="ihead">${esc(t('intakeTitle'))}</h1><p class="ilead">${esc(t('intakeLead'))}</p></div>
          <div class="cmdbar st-glass quiet">${bar}
            <div class="cact"><span class="cdis" id="d-dis" ${can ? 'hidden' : ''}>${esc(t('checkDisabledHint'))}</span><span class="cdis" ${can ? '' : 'hidden'}><kbd>${isMac ? '⌘↵' : 'Ctrl ↵'}</kbd> ${esc(t('dKbdSubmit'))}</span>
              <button type="button" class="btn primary" data-k="check" data-act="check" ${can ? '' : 'disabled aria-describedby="d-dis"'}>${ST.ico('i-check')}<span>${esc(t('checkAction'))}</span></button></div></div>
          <div class="srcrow"><div class="seg" role="group" aria-label="${esc(t('dSource'))}">
              <button type="button" data-act="src:paste" aria-pressed="${s.intakeSource === 'paste'}">${ST.ico('i-list')}${esc(t('dSrcText'))}</button>
              <button type="button" data-act="src:file" aria-pressed="${file}">${ST.ico('i-upload')}${esc(t('dSrcFile'))}</button>
              ${panel ? `<button type="button" data-act="src:selection" aria-pressed="${s.intakeSource === 'selection'}">${ST.ico('i-panel')}${esc(t('dSrcSel'))}</button>` : ''}</div>
            ${file ? '' : btn('example', t('intakeExample'), { cls: 'sm ghost', icon: 'i-plus' })}</div>
          <p class="hint" id="d-hint">${esc(file ? t('intakeFormats') : t('intakeHint'))}</p>
          ${s.intakeSource === 'selection' ? `<p class="nrow">${ST.ico('i-info')}<span>${esc(t('selectionTaken', ST.SELECTION.count, ST.SELECTION.page))}</span></p>` : ''}
          ${regions}
          ${notes(true)}
        </div>`;
      }
      function notes(withAi) {
        return `${s.account === 'guest' ? `<p class="nrow">${ST.ico('i-info')}<span>${esc(t('guestNotice'))} <button type="button" class="lnk" data-act="signin">${esc(t('signIn'))}</button></span></p>${withAi ? `<p class="nrow">${ST.ico('i-info')}<span>${esc(t('aiGuest'))}</span></p>` : ''}` : ''}
          <p class="nrow">${ST.ico('i-lock')}<span>${esc(storageLine())}</span></p>
          <p class="nrow">${ST.ico('i-gauge' in {} ? '' : 'i-shield')}<span>${esc(t('quotaLabel'))}: ${esc(t('quotaMeter', ST.available(), s.quota.granted))}</span></p>`;
      }
      function structuring() {
        return `<div class="structuring"><div class="row">${ST.stat('running', 'spin')}<span>${esc(t('step').structuring)}</span></div><div class="sk"></div><div class="sk"></div><div class="sk"></div></div>`;
      }

      /* ---------- feed view (counted / running / done) ---------- */
      function feedView() {
        const billed = s.refs.filter((r) => r.status === 'done').length;
        return `${strip()}<div class="feed">${lede()}
          <div class="echo">${ST.ico(s.intakeSource === 'file' ? 'i-doc' : s.intakeSource === 'selection' ? 'i-panel' : 'i-list')}<b>${esc(sourceLabel())}</b><span class="mono tnum muted">· ${esc(t('detected', ST.N()))}</span></div>${s.stage === 'running' ? `<p class="note">${esc(t('orderNote'))}</p>` : ''}
          ${s.account === 'guest' ? `<p class="nrow">${ST.ico('i-info')}<span>${esc(t('guestNotice'))} <button type="button" class="lnk" data-act="signin">${esc(t('signIn'))}</button></span></p>` : ''}
          <ol class="cards" aria-label="${esc(t('dGroupRefs'))}">${cards()}</ol>
          <footer class="foot">
            <p class="nrow">${ST.ico('i-lock')}<span>${esc(storageLine())}</span></p>
            <p class="nrow">${ST.ico('i-shield')}<span>${esc(t('disclaimer'))} <button type="button" class="lnk" data-act="dlg:how">${esc(t('howItWorks'))}</button></span></p>
            <p class="nrow">${ST.ico('i-list')}<span>${esc(t('consumed', billed))} · ${esc(t('quotaMeter', ST.available(), s.quota.granted))}${s.quota.reserved ? ' · ' + esc(t('quotaReserved', s.quota.reserved)) : ''}</span></p>
          </footer></div>`;
      }

      /* ---------- detail ---------- */
      const sec = (title, body, extra = '') => `<section class="dsec"><h3 class="eyebrow">${esc(title)}${extra}</h3>${body}</section>`;
      function detail() {
        const r = s.selected != null ? ST.ref(s.selected) : null;
        if (!r) return '';
        const vis = ST.visible(), i = vis.findIndex((x) => x.id === r.id);
        const pos = i >= 0 ? t('refPos', i + 1, vis.length) : t('refPos', s.refs.indexOf(r) + 1, ST.N());
        const busyRef = ['running', 'queued', 'rechecking'].includes(r.status);
        const done = r.status === 'done';
        return `<aside class="detail ${ENT.detail ? 'enter' : ''}" aria-label="${esc(pos)}"><div class="dscroll" data-scroll="detail">
          <div class="dhead st-glass quiet">
            <button type="button" class="btn sm ghost" data-k="dclose" data-act="close">${ST.ico(narrow() ? 'i-back' : 'i-x')}<span>${esc(narrow() ? t('back') : t('dClose'))}</span></button>
            <span class="pos">${esc(pos)}</span>
            <span class="pg"><button type="button" class="btn sm icon" data-k="pgprev" data-act="step:-1" aria-label="${esc(t('prev'))}">${ST.ico('i-back')}</button><button type="button" class="btn sm icon" data-k="pgnext" data-act="step:1" aria-label="${esc(t('next'))}">${ST.ico('i-chev')}</button></span>
          </div>
          <div class="dbody">
            <div><h2 class="dtitle" tabindex="-1" data-k="dhead">${esc(r.title)}</h2><p class="dau">${esc(r.au)} · ${esc(r.yr)}</p></div>
            ${verdictBlock(r)}
            ${sec(t('original'), `<p class="orig">${esc(r.au)} (${esc(r.yr)}). ${esc(r.title)}. ${esc(L(r.meta))}</p>`)}
            ${compareBlock(r, busyRef)}
            ${done ? suggestBlock(r) : ''}
            ${done ? judgeBlock(r) : ''}
            ${sec(t('sourcesHeading'), `<ul class="srcs">${r.srcs.map(([n, res, tx, ms]) => `<li class="src"><span class="rs is-${res}">${ST.ico(ICO[res])}<span class="sr-only">${esc(RT(res))}</span></span><span class="sn mono">${esc(n)}</span><span class="stx">${esc(L(tx))}</span><span class="ms mono tnum">${esc(secs(ms))}</span></li>`).join('')}</ul>`)}
            ${r.candidates ? candBlock(r) : ''}
            ${trailBlock(r)}
          </div></div></aside>`;
      }
      function verdictBlock(r) {
        let inner;
        const v = r.status === 'done' ? ST.effective(r) : null;
        if (r.status === 'done') {
          inner = `<div class="vrow">${vchip(v, 'lg')}${r.override ? mtag() : ''}</div>
            ${r.override ? `<p class="sysv">${ST.gly(r.sysVerdict)}<span>${esc(t('systemVerdict', VL(r.sysVerdict)))}</span></p>${r.override.note ? `<p class="note">${esc(L(r.override.note))}</p>` : ''}` : ''}
            <p class="reason">${esc(L(r.reason))}</p>
            ${r.hist && r.hist.verdict ? `<p class="ohist">${esc(t('dEarlier'))} (${esc(t('dRevision', r.hist.revision))}): ${vchip(r.hist.verdict, 'dim')}</p>` : ''}`;
        } else if (r.status === 'rechecking') {
          inner = `<div class="vrow">${schip('running', t('recheckRunning'))}</div><p class="steptxt">${esc(stepText(r))}</p>${track(r)}
            ${r.hist ? `<div class="histres"><span class="eyebrow">${esc(t('historicalResult'))} · ${esc(t('dRevision', r.hist.revision))}</span>${r.hist.verdict ? vchip(r.hist.verdict, 'dim') : ''}<p class="note">${esc(L(r.reason))}</p></div>` : ''}`;
        } else if (r.status === 'failed') {
          inner = `<div class="vrow">${schip('failed', SL('failed'))}</div><p class="reason">${esc(L(r.reason))}</p>
            <div class="row">${btn('retry:' + r.id, t('retry'), { cls: 'primary sm', icon: 'i-undo' })}</div>`;
        } else {
          inner = `<div class="vrow">${schip(r.status === 'idle' ? 'queued' : r.status, r.status === 'idle' ? SL('queued') : SL(r.status))}</div>
            ${r.status === 'running' ? `<p class="steptxt">${esc(stepText(r))}</p>${track(r)}` : ''}`;
        }
        return `<div class="vblock" ${v ? `data-v="${v}"` : ''}>${inner}</div>`;
      }
      function compareBlock(r, busyRef) {
        if (r.status === 'rechecking') return '';
        const rows = ST.rows(r), editing = !!r.draft;
        const canEdit = !busyRef;
        const head = !editing ? `<span class="muted">${canEdit ? btn('edit:' + r.id, t('editFields'), { cls: 'sm', icon: 'i-pen' }) : ''}</span>` : '';
        if (!rows && !editing) return r.status === 'done' ? sec(t('compare'), `<p class="note">${esc(t('noCandidate'))}</p>${canEdit ? `<div class="row">${btn('edit:' + r.id, t('editFields'), { cls: 'sm', icon: 'i-pen' })}</div>` : ''}`) : (canEdit && r.status !== 'idle' ? sec(t('dEditHead'), `<div class="row">${btn('edit:' + r.id, t('editFields'), { cls: 'sm', icon: 'i-pen' })}</div>`) : '');
        let body;
        if (rows) {
          body = `<div class="cmp" role="table" aria-label="${esc(t('compare'))}"><div class="cmp-h" role="row"><span role="columnheader">${esc(t('field'))}</span><span role="columnheader">${esc(t('yours'))}</span><span role="columnheader">${esc(t('bestMatch'))}</span></div>
            ${rows.map((w) => {
              const yours = editing ? `<span class="fld"><input data-k="fld-${w.key}" data-fld="${w.key}" value="${esc(r.draft[w.key] ?? '')}" aria-label="${esc(w.label)}"></span>` : `<span class="${w.deviates ? 'st-dev' : ''}">${w.yours ? esc(w.yours) : `<span class="unk">${esc(t('unknown'))}</span>`}</span>`;
              const best = w.best ? `${esc(w.best)}<small>${esc(t('dBestOf'))}: ${esc((w.by || []).join(', '))}</small>` : `<span class="unk">${esc(t('unknown'))}</span>`;
              return `<div class="cmp-r ${w.deviates ? 'is-dev' : ''}" role="row"><span class="cf" role="rowheader">${esc(w.label)}</span>
                <span class="cy" role="cell"><span class="lab" aria-hidden="true">${esc(t('yours'))}</span>${yours}${w.deviates ? `<br><span class="devtag">${ST.ico('e-diff')}${esc(t('deviates'))}</span>` : `<span class="okmark">${ST.ico('e-ok')}<span class="sr-only">${esc(t('matches'))}</span></span>`}</span>
                <span class="cb" role="cell"><span class="lab" aria-hidden="true">${esc(t('bestMatch'))}</span>${best}</span></div>`; }).join('')}</div>`;
        } else {
          body = Object.keys(r.draft).map((k) => `<label class="fld"><span>${esc(L(ST.FIELDS[k] || [k, k]))}</span><input data-k="fld-${k}" data-fld="${k}" value="${esc(r.draft[k] ?? '')}"></label>`).join('');
        }
        const acts = editing ? `<p class="note">${esc(t('draftNote'))}${r.status === 'done' ? ' ' + esc(t('recheckFree')) : ''}</p>
          <div class="row">${btn('save:' + r.id, t('saveRecheck'), { cls: 'primary sm', icon: 'i-undo' })}${btn('discard:' + r.id, t('discardDraft'), { cls: 'sm ghost' })}</div>` : '';
        return sec(t('compare'), body + acts, head);
      }
      function suggestBlock(r) {
        if (!r.suggestion) return '';
        const sg = r.suggestion;
        const html = sg.track.map((p) => typeof p === 'string' ? esc(p) : Array.isArray(p) ? `<del class="st-del">${esc(p[0])}</del><ins class="st-ins">${esc(p[1])}</ins>` : `<i>${esc(p.i)}</i>`).join('');
        const m = s.corrModel; let acts = '', note = '';
        if (m === 'export') {
          acts = btn('xpick:' + r.id, r.exportPick ? t('usedForExport') : t('useForExport'), { cls: r.exportPick ? 'sm' : 'primary sm', pressed: r.exportPick, icon: r.exportPick ? 'i-check' : 'i-download' });
          note = `<p class="note">${esc(t('useForExportNote'))} <b>${esc(t('dInputUnchanged'))}</b></p>`;
        } else if (m === 'draft') {
          acts = btn('sugedit:' + r.id, t('applyToFields'), { cls: 'primary sm', icon: 'i-pen', dis: !!r.draft });
          note = `<p class="note">${esc(t('applyToFieldsNote'))}</p>`;
        } else {
          acts = `${btn('accept:' + r.id, r.accepted ? t('corrected') : t('acceptCorrection'), { cls: r.accepted ? 'sm' : 'primary sm', pressed: r.accepted, icon: 'i-check' })}<span class="amend">${ST.ico('e-warn')}${esc(t('needsAmendment'))}</span>`;
          note = r.accepted ? `<p class="note">${esc(t('acceptedNote'))}</p>` : '';
        }
        return sec(t('suggestionHeading'), `<p class="tc">${html}</p><p class="mono muted" style="font-size:var(--st-text-xs)">${esc(sg.style)} · ${esc((sg.by || []).join(', '))}</p>
          <div class="row">${btn('copy:' + r.id, t('copy'), { cls: 'sm', icon: 'i-copy' })}${acts}</div>${note}`);
      }
      function judgeBlock(r) {
        const eff = ST.effective(r), open = ui.judge === r.id;
        return sec(t('dManualHead'), `<p class="note">${esc(t('overrideNote'))}</p>
          <div class="row">${!r.override ? btn('confirm:' + r.id, t('confirmVerdict'), { cls: 'sm', icon: 'i-check' }) : ''}${btn('judge:' + r.id, t('judgeManually'), { cls: 'sm', icon: 'i-pen', exp: open })}${r.override ? btn('clearov:' + r.id, t('dClearOv'), { cls: 'sm ghost', icon: 'i-undo' }) : ''}</div>
          ${open ? `<div class="jg" role="group" aria-label="${esc(t('dJudge'))}">${VK.map((v) => `<button type="button" class="jb" data-v="${v}" data-act="ovr:${r.id}:${v}" aria-pressed="${eff === v}">${ST.gly(v)}<span>${esc(VL(v))}</span></button>`).join('')}</div>` : ''}`);
      }
      function candBlock(r) {
        const open = !!ui.open['cand' + r.id];
        const list = [...r.candidates].sort((a, b) => b.score - a.score);
        return sec(t('candidatesHeading'), `<div class="row">${btn('exp:cand' + r.id, t('dCandShow', list.length), { cls: 'sm', exp: open, icon: open ? 'i-x' : 'i-plus' })}</div>
          ${open ? `<ul class="srcs">${list.map((c) => `<li class="cand"><span class="mono">${esc(c.src)} · ${esc(t('score'))} <span class="tnum">${c.score.toFixed(2)}</span></span><span>${esc(c.title)} (${esc(c.yr)})</span></li>`).join('')}</ul>` : ''}`);
      }
      function trailBlock(r) {
        const k = r.status === 'done' ? r.trail.length : Math.min(r.step, r.trail.length);
        return sec(t('trailHeading'), `<ol class="trail">${r.trail.map(([kind, lab, res], i) => i < k
          ? `<li class="te is-${res}">${ST.ico(kind === 'e' ? 'e-end' : ICO[res])}<span><span class="${kind === 's' ? 'mono' : ''}">${esc(L(lab))}</span> <span class="muted">· ${esc(RT(res))}</span></span></li>`
          : `<li class="te is-pend"><span class="ico"></span><span>…</span></li>`).join('')}</ol>`);
      }

      /* ---------- overlays ---------- */
      function histDrawer() {
        const items = ST.HISTORY.map((h) => {
          const counts = Object.entries(h.counts).map(([v, n]) => `<span class="hc" data-v="${v}">${ST.gly(v)}<b class="tnum">${n}</b> ${esc(VS(v))}</span>`).join('');
          const meta = `<div class="hm"><span class="tnum">${esc(ST.date(h.date))}</span><span>${esc(t('historyCount', h.refs))}</span><span>${ST.ico(h.locked ? 'i-lock' : 'i-trash')} ${esc(t('historyExpires', ST.date(h.deletes)))}</span></div>`;
          const acts = h.locked
            ? `<p class="nrow">${ST.ico('i-lock')}<span>${esc(t('historyLocked'))}</span></p><div class="row">${btn('hdel:' + h.id, t('historyDelete'), { cls: 'sm danger', icon: 'i-trash' })}</div>`
            : `<div class="row">${btn('hopen:' + h.id, t('historyOpen'), { cls: 'sm', icon: 'i-arrow' })}${btn('hnew:' + h.id, t('historyRestart'), { cls: 'sm', icon: 'i-reset' })}</div>
               <p class="bill">${ST.ico('e-warn')}<span>${esc(t('historyBillable', h.refs))}</span></p>`;
          return `<li class="he ${h.locked ? 'locked' : ''}"><div class="hh"><span>${esc(L(h.name))}</span>${h.current ? `<span class="curtag">${esc(t('dCurrent'))}</span>` : ''}</div>${meta}<div class="hcs">${counts}</div>${acts}</li>`;
        }).join('');
        return `<div class="scrim" data-act="vclose"></div><section class="hist st-glass quiet ${ENT.hist ? 'enter' : ''}" role="dialog" aria-modal="true" aria-labelledby="d-ht">
          <div class="ovh"><h2 id="d-ht" tabindex="-1" data-k="hhead">${esc(t('historyHeading'))}</h2>${btn('vclose', t('dClose'), { cls: 'sm ghost', icon: 'i-x' })}</div>
          <div class="ovb" data-scroll="hist">
            <p class="nrow">${ST.ico('i-lock')}<span>${esc(storageLine())}</span></p>
            ${s.historyOn ? '' : `<div class="box"><p>${esc(t('historyOff'))}</p><p class="note">${esc(t('dConsent'))}</p><div class="row">${btn('hon', t('historyEnable'), { cls: 'sm primary' })}</div></div>`}
            ${s.account === 'guest' ? `<p class="nrow">${ST.ico('i-info')}<span>${esc(t('guestNotice'))} <button type="button" class="lnk" data-act="signin">${esc(t('signIn'))}</button></span></p>` : ''}
            <ul style="display:grid;gap:10px">${items}</ul></div></section>`;
      }
      function acctPop() {
        const a = ST.ACCOUNT.free, g = s.account === 'guest', rem = ST.available(), gr = s.quota.granted;
        const body = g
          ? `<p class="note">${esc(t('guestNotice'))}</p><div class="row">${btn('signin', t('signIn'), { cls: 'primary sm', icon: 'i-user' })}</div>`
          : `<div class="row"><span class="av" aria-hidden="true">${esc(initials())}</span><div><b>${esc(a.name)}</b><div class="note">${esc(a.email)}</div></div></div>
             <div class="row"><span class="eyebrow">${esc(t('dPlan'))}</span><span class="mtag">${esc(a.plan)}</span></div>`;
        return `<div class="scrim clear" data-act="vclose"></div><section class="pop st-glass quiet ${ENT.pop ? 'enter' : ''}" role="dialog" aria-labelledby="d-at" tabindex="-1" data-k="apop">
          <h2 id="d-at">${esc(t('navAccount'))} · ${esc(g ? t('guest') : t('signedInAs', a.name))}</h2>
          <p class="note">${esc(t('accountStub'))}</p>${body}
          <div><span class="eyebrow">${esc(t('quotaLabel'))}</span><div class="meter" role="img" aria-label="${esc(t('quotaMeter', rem, gr))}" style="--p:${Math.round(rem / gr * 100)}%"><i></i></div><p class="note mono tnum">${esc(t('quotaMeter', rem, gr))}${s.quota.reserved ? ' · ' + esc(t('quotaReserved', s.quota.reserved)) : ''}</p></div>
          <p class="nrow">${ST.ico('i-lock')}<span>${esc(storageLine())}</span></p>
          <p class="note">${esc(panel ? t('planWebOnly') : t('quotaUpgrade'))}</p>
          <div class="row">${planLink(panel ? t('dOpenWeb') : t('quotaUpgrade'))}</div></section>`;
      }
      function cmdItems() {
        const out = [], add = (grp, label, icon, run, o = {}) => out.push({ grp, label, icon, run, ...o });
        const act = s.stage !== 'intake' && s.stage !== 'structuring';
        add('dGroupNav', t('navCheck'), 'i-search', () => ST.act.nav('check'));
        add('dGroupNav', t('navHistory'), 'i-history', () => { ui.pf = 'hhead'; ST.act.nav('history'); });
        add('dGroupNav', t('navAccount'), 'i-user', () => { ui.pf = 'apop'; ST.act.nav('account'); });
        if (s.stage === 'intake') add('dGroupAct', t('checkAction'), 'i-check', () => ST.act.start(), { dis: !ST.act.canStart(), hint: t('checkDisabledHint') });
        if (s.stage === 'running') add('dGroupAct', t('stop'), 'i-stop', () => ST.act.stop());
        if (act) add('dGroupAct', t('reset'), 'i-reset', () => { ui.pf = 'dlg'; ST.act.dialog('reset'); });
        if (act) add('dGroupAct', t('exportAction'), 'i-download', () => { ui.pf = 'dlg'; ST.act.dialog('export'); });
        if (act) add('dGroupAct', t('reportAction'), 'i-pdf', () => { ui.pf = 'dlg'; ST.act.dialog('report'); });
        add('dGroupAct', t('howItWorks'), 'i-help', () => { ui.pf = 'dlg'; ST.act.dialog('how'); });
        if (act) add('dGroupAct', t('editList'), 'i-edit-list', () => { ui.pf = 'dlg'; ST.act.dialog('editlist'); }, { dis: ST.isBusy(), hint: t('editListGated') });
        if (['counted', 'running', 'done'].includes(s.stage)) {
          const c = ST.counts();
          VK.forEach((v) => add('dGroupFilter', `${VL(v)} (${c.verdicts[v]})`, null, () => { if (s.filter !== v) ST.act.setFilter(v); }, { v }));
          add('dGroupFilter', t('statusesHeading'), 'i-filter', () => { if (s.filter !== 'status') ST.act.setFilter('status'); });
          if (s.filter) add('dGroupFilter', t('filterClear'), 'i-x', () => ST.act.setFilter(s.filter));
          s.refs.forEach((r) => add('dGroupRefs', `${r.id} · ${r.title}`, 'i-doc', () => openRef(r.id)));
        }
        const qq = ui.q.trim().toLowerCase();
        return qq ? out.filter((o) => o.label.toLowerCase().includes(qq)) : out;
      }
      function cmdList() {
        ui.items = cmdItems(); if (ui.sel >= ui.items.length) ui.sel = Math.max(0, ui.items.length - 1);
        if (!ui.items.length) return `<li class="note" style="padding:12px">${esc(t('dNoResults'))}</li>`;
        let last = '';
        return ui.items.map((o, i) => {
          const h = o.grp !== last ? `<li role="presentation" class="pg-h eyebrow">${esc(t(o.grp))}</li>` : ''; last = o.grp;
          return `${h}<li class="po" role="option" id="d-po-${i}" data-i="${i}" aria-selected="${i === ui.sel}" ${o.dis ? 'aria-disabled="true"' : ''}>${o.v ? ST.gly(o.v) : ST.ico(o.icon)}<span>${esc(o.label)}</span>${o.dis && o.hint ? `<small>${esc(o.hint)}</small>` : '<span></span>'}</li>`;
        }).join('');
      }
      function palette() {
        const list = cmdList();
        return `<div class="scrim" data-act="cmd-close"></div><div class="palette st-glass quiet ${ENT.cmd ? 'enter' : ''}" role="dialog" aria-modal="true" aria-label="${esc(t('cmdHint'))}">
          <div class="pq">${ST.ico('i-search')}<input data-k="cmdq" role="combobox" aria-expanded="true" aria-controls="d-cmdlist" aria-autocomplete="list" aria-activedescendant="d-po-${ui.sel}" placeholder="${esc(t('cmdPlaceholder'))}" value="${esc(ui.q)}" autocomplete="off" spellcheck="false"><kbd>esc</kbd></div>
          <ul class="pl" id="d-cmdlist" role="listbox" data-scroll="cmdlist">${list}</ul></div>`;
      }
      function dialog() {
        const n = s.dialog; let title = '', body = '', acts = '';
        const close = btn('dlg-close', t('cancel'), { cls: 'ghost' });
        if (n === 'how') { title = t('howItWorks'); body = `<ol><li>${esc(t('dHow1'))}</li><li>${esc(t('dHow2'))}</li><li>${esc(t('dHow3'))}</li></ol><p class="note"><b>${esc(t('disclaimer'))}</b></p>`; acts = btn('dlg-close', t('dClose'), { cls: 'primary' }); }
        if (n === 'reset') { title = t('reset'); body = `<p>${esc(t('resetConfirm'))}</p>`; acts = close + btn('reset-do', t('reset'), { cls: 'danger', icon: 'i-reset' }); }
        if (n === 'editlist') { title = t('editList'); body = `<p>${esc(t('dEditListBody'))}</p>`; acts = btn('dlg-close', t('dClose'), { cls: 'primary' }); }
        if (n === 'report') { title = t('reportHeading'); body = `<p>${esc(t('reportHint'))}</p><p class="note">${esc(t('disclaimer'))}</p>`; acts = close + btn('report-do', t('reportCreate'), { cls: 'primary', icon: 'i-pdf' }); }
        if (n === 'export') {
          const picks = s.refs.filter((r) => r.exportPick).length;
          title = t('exportHeading');
          body = `<fieldset class="fs"><legend>${esc(t('exportFormat'))}</legend>
              <label class="opt"><input type="radio" name="fmt" value="csl" data-k="fmt-csl" ${ui.exp.fmt === 'csl' ? 'checked' : ''}> CSL-JSON</label>
              <label class="opt"><input type="radio" name="fmt" value="bib" data-k="fmt-bib" ${ui.exp.fmt === 'bib' ? 'checked' : ''}> BibTeX</label></fieldset>
            <label class="fld"><span>${esc(t('exportStyle'))}</span><select class="sel" data-k="exp-style">${['APA 7', 'Chicago 17', 'DIN ISO 690', 'IEEE'].map((o) => `<option ${ui.exp.style === o ? 'selected' : ''}>${o}</option>`).join('')}</select></label>
            <p class="note">${esc(t('exportSelected', picks))}</p><p class="note">${esc(t('exportHint'))}</p>`;
          acts = close + btn('export-do', t('exportDownload'), { cls: 'primary', icon: 'i-download' });
        }
        return `<div class="scrim" data-act="dlg-close"></div><section class="dlg st-glass quiet ${ENT.dlg ? 'enter' : ''}" role="dialog" aria-modal="true" aria-labelledby="d-dt" tabindex="-1" data-k="dlg"><h2 id="d-dt">${esc(title)}</h2>${body}<div class="acts">${acts}</div></section>`;
      }

      /* ---------- full render with focus / scroll preservation ---------- */
      function view() {
        const detailOpen = s.selected != null && ST.ref(s.selected);
        const nar = narrow(); ui.narrow = nar;
        const modal = s.cmdOpen || !!s.dialog || s.view === 'history';
        const banner = s.connection === 'reconnecting' ? `<div class="banner" role="status">${ST.ico('i-wifi-off')}<span>${esc(t('reconnecting'))}</span></div>` : '';
        const main = s.stage === 'intake' ? intake() : s.stage === 'structuring' ? structuring() : feedView();
        return `<div class="base" ${modal ? 'inert' : ''}>${topbar()}<div class="cols">
            <div class="feedcol" ${detailOpen && nar ? 'inert aria-hidden="true"' : ''}>${banner}<div class="scroll" data-scroll="feed">${main}</div></div>
            ${detail()}</div></div>
          ${s.view === 'history' ? histDrawer() : ''}${s.view === 'account' ? acctPop() : ''}${s.cmdOpen ? palette() : ''}${s.dialog ? dialog() : ''}
          ${s.toast ? `<div class="toast st-glass quiet">${esc(s.toast)}</div>` : ''}`;
      }
      function autosize() {
        const ta = host.querySelector('textarea[data-k="ta"]'); if (!ta) return;
        ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, Math.round(app.clientHeight * .42)) + 'px';
      }
      function render() {
        ui.dirty = false;
        const a = document.activeElement, snap = { scroll: {}, focus: null };
        host.querySelectorAll('[data-scroll]').forEach((el) => { snap.scroll[el.dataset.scroll] = el.scrollTop; });
        if (a && host.contains(a) && keyOf(a)) { snap.focus = { k: keyOf(a) }; try { snap.focus.s = a.selectionStart; snap.focus.e = a.selectionEnd; } catch (_) { /* not a text control */ } }
        ENT = { detail: s.selected != null && ui.was.sel == null, hist: s.view === 'history' && ui.was.view !== 'history', pop: s.view === 'account' && ui.was.view !== 'account', cmd: s.cmdOpen && !ui.was.cmd, dlg: !!s.dialog && ui.was.dlg !== s.dialog };
        const selChanged = s.selected !== ui.was.sel;
        host.innerHTML = view();
        ui.was = { sel: s.selected, view: s.view, cmd: s.cmdOpen, dlg: s.dialog };
        host.querySelectorAll('[data-scroll]').forEach((el) => { const k = el.dataset.scroll; if (snap.scroll[k] != null && !(k === 'detail' && selChanged)) el.scrollTop = snap.scroll[k]; });
        const want = ui.pf || (snap.focus && snap.focus.k); ui.pf = null;
        const el = want && q(want);
        if (el) { try { el.focus({ preventScroll: true }); } catch (_) { /* gone */ } if (!ui.pf && snap.focus && snap.focus.k === want && snap.focus.s != null && el.setSelectionRange) { try { el.setSelectionRange(snap.focus.s, snap.focus.e); } catch (_) { /* not text */ } } }
        autosize();
      }
      const say = (msg) => { live.textContent = msg; };

      /* ---------- actions ---------- */
      function openRef(id) { const f = feedEl(); if (f) s.scrollMemo = f.scrollTop; ui.judge = null; ui.pf = 'dhead'; ST.act.select(id); }
      function closeDetail() { const id = s.selected; ui.judge = null; ui.pf = 'card-' + id; ST.act.back(); }
      function closeCmd() { ui.pf = ui.ret; ui.q = ''; ui.sel = 0; ST.act.cmd(false); }
      function toggleCmd() { if (s.cmdOpen) return closeCmd(); remember(); ui.q = ''; ui.sel = 0; ui.menu = false; ui.pf = 'cmdq'; ST.act.cmd(true); }
      function closeView() { ui.pf = ui.ret; ST.act.nav('check'); }
      function closeDlg() { ui.pf = ui.ret; ST.act.dialog(null); }
      function openDlg(n) { remember(); ui.menu = false; ui.pf = 'dlg'; ST.act.dialog(n); }
      function overlayOpen() { return s.cmdOpen || !!s.dialog || s.view !== 'check' || ui.menu; }
      function escape() {
        if (s.cmdOpen) { closeCmd(); return true; }
        if (s.dialog) { closeDlg(); return true; }
        if (ui.menu) { ui.menu = false; ui.pf = 'menubtn'; render(); return true; }
        if (s.view !== 'check') { closeView(); return true; }
        if (ui.judge != null) { ui.judge = null; render(); return true; }
        if (s.selected != null) { closeDetail(); return true; }
        return false;
      }
      function copyText(r) { return r.suggestion.track.map((p) => typeof p === 'string' ? p : Array.isArray(p) ? p[1] : p.i).join(''); }
      function act(a, p, el) {
        const id = p[0] != null && /^\d+$/.test(p[0]) ? +p[0] : p[0];
        switch (a) {
          case 'home': if (s.view !== 'check') closeView(); else if (s.selected != null) closeDetail(); else { const f = feedEl(); if (f) f.scrollTop = 0; } break;
          case 'hist': if (s.view === 'history') closeView(); else { remember(); ui.menu = false; ui.pf = 'hhead'; ST.act.nav('history'); } break;
          case 'acct': if (s.view === 'account') closeView(); else { remember(); ui.menu = false; ui.pf = 'apop'; ST.act.nav('account'); } break;
          case 'vclose': closeView(); break;
          case 'cmd': toggleCmd(); break;
          case 'cmd-close': closeCmd(); break;
          case 'src': if (id === 'file') ST.act.useFile(); else if (id === 'selection') ST.act.useSelection(); else { s.intakeSource = 'paste'; ui.pf = 'ta'; ST.act.setInput(s.input); } break;
          case 'example': ui.pf = 'ta'; ST.act.example(); break;
          case 'region': ST.act.toggleRegion(id); break;
          case 'adopt': ST.act.adoptRejected(id); break;
          case 'check': ST.act.start(); break;
          case 'run': ST.act.run(+id); break;
          case 'cancelcheck': openDlg('reset'); break;
          case 'planweb': ST.act.toast(panel ? t('planWebOnly') : t('dStub')); break;
          case 'signin': ST.act.toast(t('dStub')); break;
          case 'stop': ui.menu = false; ST.act.stop(); break;
          case 'reset': openDlg('reset'); break;
          case 'reset-do': ui.dlgOk = true; ui.pf = null; ST.act.dialog(null); ui.menu = false; ST.act.reset(); break;
          case 'coll': ui.coll = !ui.coll; ui.pf = 'tgl'; render(); break;
          case 'labels': ui.lab = !ui.lab; ui.menu = false; ui.coll = false; ui.pf = ui.lab ? 'tgl' : 'menubtn'; render(); break;
          case 'menu': ui.menu = !ui.menu; ui.pf = ui.menu ? 'act:stop' : 'menubtn'; if (ui.menu && s.stage !== 'running') ui.pf = 'act:reset'; render(); break;
          case 'dlg': openDlg(id); break;
          case 'dlg-close': closeDlg(); break;
          case 'export-do': ST.act.dialog(null); ST.act.toast(t('dDownloaded')); break;
          case 'report-do': ST.act.dialog(null); ST.act.toast(t('dReportMade')); break;
          case 'filter': ui.menu = false; ST.act.setFilter(id); break;
          case 'filter-clear': if (s.filter) ST.act.setFilter(s.filter); break;
          case 'open': openRef(id); break;
          case 'close': closeDetail(); break;
          case 'step': ST.act.step(+id); break;
          case 'edit': ui.pf = 'act:save:' + id; ST.act.editFields(id); break;
          case 'sugedit': ui.pf = 'act:save:' + id; ST.act.editFields(id, 'suggestion'); break;
          case 'save': ST.act.saveRecheck(id); break;
          case 'discard': ST.act.discardDraft(id); break;
          case 'xpick': ST.act.pickExport(id); break;
          case 'accept': ST.act.accept(id); break;
          case 'copy': { const txt = copyText(ST.ref(id)); try { navigator.clipboard.writeText(txt).catch(() => {}); } catch (_) { /* no clipboard on file:// */ } ST.act.toast(t('copied')); break; }
          case 'retry': ST.act.retry(id); break;
          case 'judge': ui.judge = ui.judge === id ? null : id; render(); break;
          case 'confirm': ST.act.override(id, ST.effective(ST.ref(id))); break;
          case 'ovr': ui.judge = null; ST.act.override(id, p[1]); break;
          case 'clearov': ST.act.clearOverride(id); break;
          case 'exp': ui.open[id] = !ui.open[id]; render(); break;
          case 'hopen': if (id === 'h1') { closeView(); } else { ui.pf = null; ST.act.jump('done'); ST.act.nav('check'); ST.act.toast(t('dOpened')); } break;
          case 'hnew': ui.pf = null; ST.act.reset(); ST.act.nav('check'); ST.act.example(); ST.act.start(); break;
          case 'hdel': ST.act.toast(t('dDeleted')); break;
          case 'hon': ST.act.setHistory(true); break;
          default: break;
        }
      }

      /* ---------- events ---------- */
      function onClick(e) {
        const po = e.target.closest('.po');
        if (po && root.contains(po)) { const it = ui.items[+po.dataset.i]; if (it && !it.dis) { ui.pf = ui.ret; ui.q = ''; ui.sel = 0; ST.act.cmd(false); it.run(); } return; }
        const el = e.target.closest('[data-act]');
        if (!el || !root.contains(el)) { if (ui.menu && !e.target.closest('.menu')) { ui.menu = false; render(); } return; }
        if (el.tagName === 'A') e.preventDefault();
        if (el.disabled || el.getAttribute('aria-disabled') === 'true') return;
        if (ui.menu && el.dataset.act !== 'menu' && !el.closest('.menu')) ui.menu = false;
        if (ui.menu && el.closest('.menu')) ui.menu = false;
        const [a, ...p] = el.dataset.act.split(':');
        act(a, p, el);
      }
      function onInput(e) {
        const k = e.target.dataset && e.target.dataset.k;
        if (k === 'ta') { ui.typing = true; ST.act.setInput(e.target.value); }
        else if (k === 'cmdq') { ui.q = e.target.value; ui.sel = 0; patchCmd(); }
        else if (e.target.dataset && e.target.dataset.fld) { ST.act.setDraft(s.selected, e.target.dataset.fld, e.target.value); }
      }
      function onChange(e) {
        const k = e.target.dataset && e.target.dataset.k;
        if (k === 'fmt-csl' || k === 'fmt-bib') ui.exp.fmt = k === 'fmt-csl' ? 'csl' : 'bib';
        if (k === 'exp-style') ui.exp.style = e.target.value;
      }
      function patchCmd() {
        const ul = host.querySelector('#d-cmdlist'); if (!ul) return;
        ul.innerHTML = cmdList();
        const inp = host.querySelector('[data-k="cmdq"]'); if (inp) inp.setAttribute('aria-activedescendant', 'd-po-' + ui.sel);
        const sel = ul.querySelector('[aria-selected="true"]'); if (sel) sel.scrollIntoView({ block: 'nearest' });
      }
      function patchIntake() {
        const can = ST.act.canStart(), b = host.querySelector('[data-k="check"]');
        if (b) { b.disabled = !can; if (can) b.removeAttribute('aria-describedby'); else b.setAttribute('aria-describedby', 'd-dis'); }
        const hs = host.querySelectorAll('.cact .cdis'); if (hs[0]) hs[0].hidden = can; if (hs[1]) hs[1].hidden = !can;
        autosize();
      }
      function onKey(e) {
        const tg = e.target, typing = tg.closest && tg.closest('input, textarea, select, [contenteditable]');
        if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'k') { e.preventDefault(); toggleCmd(); return; }
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && tg.dataset && tg.dataset.k === 'ta') { e.preventDefault(); ST.act.start(); return; }
        if (e.key === 'Escape') { if (escape()) { e.preventDefault(); } return; }
        if (s.cmdOpen && tg.dataset && tg.dataset.k === 'cmdq') {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const n = ui.items.length; if (n) { ui.sel = (ui.sel + (e.key === 'ArrowDown' ? 1 : -1) + n) % n; ul_sel(); } return; }
          if (e.key === 'Enter') { e.preventDefault(); const it = ui.items[ui.sel]; if (it && !it.dis) { ui.pf = ui.ret; ui.q = ''; ui.sel = 0; ST.act.cmd(false); it.run(); } return; }
        }
        if (ui.menu && tg.getAttribute && tg.getAttribute('role') === 'menuitem' && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
          e.preventDefault(); const its = [...host.querySelectorAll('.menu [role="menuitem"]:not(:disabled)')]; const i = its.indexOf(tg);
          if (its.length) its[(i + (e.key === 'ArrowDown' ? 1 : -1) + its.length) % its.length].focus(); return;
        }
        if (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey) return;
        if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && s.selected != null && !typing && !overlayOpen()) { e.preventDefault(); ST.act.step(e.key === 'ArrowLeft' ? -1 : 1); return; }
        if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && tg.classList && tg.classList.contains('open')) {
          const all = [...host.querySelectorAll('.open')], i = all.indexOf(tg), nx = all[i + (e.key === 'ArrowDown' ? 1 : -1)];
          if (nx) { e.preventDefault(); nx.focus(); }
        }
      }
      function ul_sel() {
        host.querySelectorAll('#d-cmdlist .po').forEach((li, i) => li.setAttribute('aria-selected', String(i === ui.sel)));
        const inp = host.querySelector('[data-k="cmdq"]'); if (inp) inp.setAttribute('aria-activedescendant', 'd-po-' + ui.sel);
        const sel = host.querySelector('#d-cmdlist .po[aria-selected="true"]'); if (sel) sel.scrollIntoView({ block: 'nearest' });
      }
      /* a re-render between mousedown and mouseup would swallow the click, so hold renders while a pointer is down */
      const onDown = () => { ui.pressing = true; };
      const onUp = () => { clearTimeout(flushT); flushT = setTimeout(() => { ui.pressing = false; if (ui.dirty) render(); }, 0); };

      const unsub = ST.on((action) => {
        if (action === 'draft-input') return;
        if (action === 'input' && ui.typing) { ui.typing = false; patchIntake(); return; }
        ui.typing = false;
        if (action === 'stage' && s.stage === 'intake') ui.pf = ui.pf || 'ta';
        if (action === 'verdict' || action === 'stage') {
          if (s.stage === 'counted') say(t('detected', ST.N())); else if (s.stage === 'running') say(t('running') + ' · ' + t('progress', ST.counts().done, ST.N())); else if (s.stage === 'done') say(t('done') + ' · ' + t('summarySentence', ST.counts().verdicts.correct, ST.N()));
        }
        if (action === 'toast' && s.toast) say(s.toast);
        if (action === 'select' && s.selected != null) { const r = ST.ref(s.selected), vis = ST.visible(); say(t('refPos', vis.findIndex((x) => x.id === r.id) + 1, vis.length) + ': ' + r.title); }
        if (action === 'stage' || action === 'nav') ui.menu = ui.menu && s.stage !== 'intake';
        if (ui.pressing) { ui.dirty = true; return; }
        render();
      });
      root.addEventListener('click', onClick);
      root.addEventListener('input', onInput);
      root.addEventListener('change', onChange);
      document.addEventListener('keydown', onKey);
      document.addEventListener('pointerdown', onDown, true);
      document.addEventListener('pointerup', onUp, true);
      document.addEventListener('pointercancel', onUp, true);
      const ro = new ResizeObserver(() => { if (narrow() !== ui.narrow) render(); });
      ro.observe(app);
      const mo = new MutationObserver(() => render());   /* base quirk: the dev bar's DE/EN switch never re-renders a variant */
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

      if (s.stage === 'intake' && s.view === 'check') ui.pf = 'ta';
      render();

      return function unmount() {
        unsub();
        root.removeEventListener('click', onClick);
        root.removeEventListener('input', onInput);
        root.removeEventListener('change', onChange);
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('pointerdown', onDown, true);
        document.removeEventListener('pointerup', onUp, true);
        document.removeEventListener('pointercancel', onUp, true);
        clearTimeout(flushT);
        ro.disconnect(); mo.disconnect();
      };
    }
  });
})();
