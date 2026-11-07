/* PROTOTYPE (#194) — throwaway. Shared DE/EN strings, mostly taken from packages/i18n/messages/*.json so the
   prototype speaks the product's real words. Variants may add their own with ST.strings({ de: {...}, en: {...} }).
   ST.t('key', ...args) — functions take arguments. ST.L([de, en]) picks from a pair. */
window.ST = window.ST || {};
(() => {
  const S = {
    de: {
      productName: 'Source Taster',
      navCheck: 'Prüfen', navHistory: 'Verlauf', navAccount: 'Konto', cmdHint: 'Suchen oder Befehl …', navLabel: 'Hauptnavigation',
      verdict: { correct: 'Korrekt', deviations: 'Existiert, mit Abweichungen', mixed: 'Gemischte Referenz', 'doi-conflict': 'DOI-Konflikt', 'not-found': 'Nicht gefunden', 'not-verifiable': 'Nicht verifizierbar' },
      verdictShort: { correct: 'Korrekt', deviations: 'Abweichungen', mixed: 'Gemischt', 'doi-conflict': 'DOI-Konflikt', 'not-found': 'Nicht gefunden', 'not-verifiable': 'Nicht verifizierbar' },
      status: { queued: 'Wartet', running: 'Läuft', cancelled: 'Abgebrochen', failed: 'Technischer Fehler', 'not-checked': 'Nicht geprüft' },
      step: { structuring: 'Referenzen werden erkannt …', searching: (src) => `Suche in ${src} …`, scoring: 'Wird bewertet …' },

      // intake
      intakeTitle: 'Literaturliste einfügen', intakeLead: 'Jede Referenz wird mit Crossref, OpenAlex, DNB und weiteren Datenquellen abgeglichen, mit nachvollziehbaren Belegen.',
      intakePlaceholder: 'Literaturliste hier einfügen …', intakeHint: 'Eine Referenz pro Absatz. Oder PDF, DOCX, BibTeX oder RIS ablegen.',
      intakeExample: 'Beispiel einfügen', intakeFile: 'Datei wählen', intakeDrop: 'Datei hier ablegen', intakeFormats: 'PDF, DOCX, BibTeX, RIS · bis 20 MB',
      checkAction: 'Prüfen', checkDisabledHint: 'Fügen Sie zuerst Referenzen ein.',
      detected: (n) => n === 1 ? '1 Referenz erkannt' : `${n} Referenzen erkannt`,
      quotaPreview: (req, rem, after) => `${req} Referenzen verbrauchen ${req} Ihrer ${rem} verbleibenden Prüfungen. Danach bleiben ${after}.`,
      autoStart: 'Die Prüfung startet automatisch.',
      quotaChoiceHeading: 'Kontingent reicht nicht für alle Referenzen',
      quotaChoiceBody: (req, av) => `Sie haben ${req} Referenzen eingegeben, aber nur noch ${av} Prüfungen übrig. Prüfen Sie nur die ersten ${av} in Eingabereihenfolge (die übrigen werden nicht geprüft) oder wechseln Sie den Plan.`,
      quotaChoiceFirst: (av) => `Die ersten ${av} prüfen`, quotaUpgrade: 'Plan wechseln', quotaUpgradeWeb: 'Plan im Web wechseln', cancel: 'Abbrechen',
      quotaMeter: (rem, gr) => `${rem} von ${gr} Prüfungen übrig`, quotaReserved: (n) => `${n} in Arbeit`, quotaLabel: 'Kontingent',
      regionsHeading: 'Gefundene Literaturverzeichnisse', regionsHint: 'Alle erkannten Bereiche sind ausgewählt. Abwählen, was nicht geprüft werden soll.',
      rejectedHeading: 'Nicht als Referenz erkannt', rejectedAdopt: 'Als Referenz übernehmen',
      aiGuest: 'KI-Extraktion ist für Gäste nicht verfügbar. Der Parser wurde verwendet. Ein kostenpflichtiger Plan bietet KI-Extraktion.',
      selectionTaken: (n, page) => `${n} Referenzen aus Ihrer Auswahl auf ${page} übernommen.`,

      // running / summary
      running: 'Prüfung läuft', done: 'Prüfung abgeschlossen', progress: (d, n) => `${d} von ${n} geprüft`,
      orderNote: 'Die Reihenfolge bleibt wie in Ihrer Liste.',
      stop: 'Prüfung stoppen', reset: 'Zurücksetzen', resetConfirm: 'Eingabe und Ergebnisse dieser Ansicht verwerfen? Ein gespeicherter Verlaufseintrag bleibt erhalten.',
      stopDone: 'Prüfung gestoppt. Abgeschlossene Urteile bleiben, offene Referenzen sind abgebrochen.',
      summarySentence: (ok, n) => `${ok} von ${n} Referenzen stimmen.`,
      summaryRest: 'Die übrigen verdienen einen zweiten Blick. Befunde, keine Beweise.',
      filterAll: 'Alle', filterActive: 'Filter aktiv', filterClear: 'Filter aufheben', statusesHeading: 'Technischer Status',
      howItWorks: 'So funktioniert die Prüfung', disclaimer: 'Ein Urteil ist ein Befund aus den abgefragten Datenquellen, kein Beweis für Täuschung. Die Entscheidung treffen Sie.',
      editList: 'Referenzliste bearbeiten', editListGated: 'Erst möglich, wenn keine Prüfung läuft.',
      exportAction: 'Exportieren', reportAction: 'PDF-Bericht', exportHeading: 'Referenzen exportieren',
      exportHint: 'Verwendet die aktuell gespeicherten Felder einschließlich Ihrer Änderungen. Ausgewählte Vorschläge gelten nur für diesen Download.',
      exportFormat: 'Format', exportStyle: 'Zitierstil', exportDownload: 'Referenzen herunterladen', exportSelected: (n) => `${n} Korrekturvorschläge ausgewählt`,
      reportHeading: 'Barrierefreier PDF-Bericht', reportHint: 'Ein getaggtes PDF mit den Urteilen, Erklärungen, Korrekturvorschlägen und manuellen Änderungen dieser Prüfung. Höchstens 15 Minuten abrufbar.', reportCreate: 'Bericht erstellen',
      consumed: (n) => `${n} Prüfungen verbraucht`,

      // detail
      back: 'Zurück', backToList: 'Zur Liste', refPos: (i, n) => `Referenz ${i} von ${n}`, prev: 'Vorherige Referenz', next: 'Nächste Referenz',
      original: 'Ihre ursprüngliche Eingabe', compare: 'Feld für Feld', yours: 'Ihre Referenz', bestMatch: 'Bester Treffer', field: 'Feld', backedBy: 'Belegt durch',
      deviates: 'weicht ab', matches: 'stimmt', unknown: 'unbekannt', noCandidate: 'Kein Kandidat gefunden. Es wird keine Quelle als belegt dargestellt.',
      sourcesHeading: 'Abgefragte Datenquellen', candidatesHeading: 'Weitere Kandidaten', score: 'Score', trailHeading: 'Nachweisspur',
      suggestionHeading: 'Korrekturvorschlag in Ihrer Referenz', copy: 'Kopieren', copied: 'Kopiert',
      useForExport: 'Für Export verwenden', usedForExport: 'Für Export ausgewählt',
      useForExportNote: 'Gilt nur für den nächsten Export. Felder und Urteil bleiben unverändert.',
      applyToFields: 'In Felder übernehmen', applyToFieldsNote: 'Öffnet die Bearbeitung mit den vorgeschlagenen Werten. Erst „Speichern und erneut prüfen“ übernimmt sie.',
      acceptCorrection: 'Korrektur übernehmen', acceptedNote: 'Übernommen wird nur der Text. Das Urteil bleibt unverändert.', corrected: 'Korrigiert',
      needsAmendment: 'Braucht Änderung von ADR-0016 (Kunde)',
      editFields: 'Felder bearbeiten', saveRecheck: 'Speichern und erneut prüfen', discardDraft: 'Änderungen verwerfen', draftNote: 'Entwurf. Noch nicht geprüft.',
      recheckRunning: 'Erneute Prüfung läuft', historicalResult: 'Früheres Ergebnis (historisch)', recheckFree: 'Bereits abgerechnet. Die erneute Prüfung ist kostenlos.',
      confirmVerdict: 'Urteil bestätigen', judgeManually: 'Manuell beurteilen', manualVerdict: (v) => `Manuelles Urteil: ${v}`, systemVerdict: (v) => `Ursprüngliches Systemurteil: ${v}`, manualTag: 'Manuell',
      overrideNote: 'Die manuelle Beurteilung ändert nur das wirksame Urteil dieses Ergebnisses. Felder, Scores, Nachweise und Korrekturvorschläge bleiben unverändert.',
      retry: 'Erneut versuchen', notBilled: 'Nicht abgerechnet.', nextStep: 'Nächster Schritt',

      // connection, storage, account
      reconnecting: 'Verbindung unterbrochen. Wird wiederhergestellt … Ihre Prüfung läuft auf dem Server weiter.', offline: 'Offline. Ergebnisse erscheinen, sobald die Verbindung zurück ist.', reconnected: 'Wieder verbunden.',
      storageTemp: 'Nicht im Verlauf gespeichert. Inhalte werden spätestens 24 Stunden nach Ende der Prüfung gelöscht.',
      storageHistory: (d) => `Im Verlauf gespeichert · Löschung am ${d}`,
      guestNotice: 'Gast-Prüfungen und Gast-Kontingent werden bei der Registrierung nicht übertragen.', signIn: 'Anmelden', guest: 'Gast', signedInAs: (n) => `Angemeldet als ${n}`,
      historyHeading: 'Verlauf', historyOpen: 'Check öffnen', historyRestart: 'Als neuen Check starten',
      historyBillable: (n) => `Dies erstellt einen neuen Check mit ${n} Referenzen und verbraucht erneut Kontingent. Das Öffnen ist kostenlos.`,
      historyExpires: (d) => `Löschung am ${d}`, historyLocked: 'Nach den Free-Regeln gesperrt. Löschen bleibt möglich.', historyDelete: 'Eintrag löschen', historyOff: 'Der Verlauf ist aus.', historyEnable: 'Verlauf aktivieren',
      historyCount: (n) => `${n} Referenzen`,
      accountStub: 'Konto, Plan und Einstellungen. Die Konto-Seiten gestaltet ein eigenes Ticket; hier nur der Einstieg.',
      planWebOnly: 'Kauf und Planwechsel finden in der Web-App statt.', preferences: 'Einstellungen', theme: 'Darstellung', language: 'Sprache',
      cmdPlaceholder: 'Befehl, Filter oder Referenz …'
    },
    en: {
      productName: 'Source Taster',
      navCheck: 'Check', navHistory: 'History', navAccount: 'Account', cmdHint: 'Search or command …', navLabel: 'Main navigation',
      verdict: { correct: 'Correct', deviations: 'Exists, with deviations', mixed: 'Mixed citation', 'doi-conflict': 'DOI conflict', 'not-found': 'Not found', 'not-verifiable': 'Not verifiable' },
      verdictShort: { correct: 'Correct', deviations: 'Deviations', mixed: 'Mixed', 'doi-conflict': 'DOI conflict', 'not-found': 'Not found', 'not-verifiable': 'Not verifiable' },
      status: { queued: 'Waiting', running: 'Running', cancelled: 'Cancelled', failed: 'Technical failure', 'not-checked': 'Not checked' },
      step: { structuring: 'Recognising References …', searching: (src) => `Searching ${src} …`, scoring: 'Scoring …' },

      intakeTitle: 'Paste your reference list', intakeLead: 'Every Reference is matched against Crossref, OpenAlex, DNB and more Data sources, with traceable evidence.',
      intakePlaceholder: 'Paste your reference list here …', intakeHint: 'One Reference per paragraph. Or drop a PDF, DOCX, BibTeX or RIS file.',
      intakeExample: 'Insert example', intakeFile: 'Choose file', intakeDrop: 'Drop a file here', intakeFormats: 'PDF, DOCX, BibTeX, RIS · up to 20 MB',
      checkAction: 'Check', checkDisabledHint: 'Paste References first.',
      detected: (n) => n === 1 ? '1 Reference recognised' : `${n} References recognised`,
      quotaPreview: (req, rem, after) => `${req} References use ${req} of your ${rem} remaining checks. ${after} remain afterwards.`,
      autoStart: 'The Check starts automatically.',
      quotaChoiceHeading: 'Not enough Quota for all References',
      quotaChoiceBody: (req, av) => `You entered ${req} References but have only ${av} checks left. Check only the first ${av} in input order (the rest are not checked) or change your Plan.`,
      quotaChoiceFirst: (av) => `Check the first ${av}`, quotaUpgrade: 'Change Plan', quotaUpgradeWeb: 'Change Plan on the web', cancel: 'Cancel',
      quotaMeter: (rem, gr) => `${rem} of ${gr} checks left`, quotaReserved: (n) => `${n} in progress`, quotaLabel: 'Quota',
      regionsHeading: 'Bibliographies found', regionsHint: 'Every detected region is selected. Deselect what should not be checked.',
      rejectedHeading: 'Not recognised as a Reference', rejectedAdopt: 'Adopt as a Reference',
      aiGuest: 'AI extraction is not available to Guests. The parser was used. A paid Plan offers AI extraction.',
      selectionTaken: (n, page) => `${n} References taken from your selection on ${page}.`,

      running: 'Check in progress', done: 'Check complete', progress: (d, n) => `${d} of ${n} checked`,
      orderNote: 'The order stays as in your list.',
      stop: 'Stop Check', reset: 'Reset', resetConfirm: 'Discard input and results in this view? A saved History entry is kept.',
      stopDone: 'Check stopped. Completed Verdicts stay; open References are cancelled.',
      summarySentence: (ok, n) => `${ok} of ${n} References check out.`,
      summaryRest: 'The others deserve a second look. Findings, not proof.',
      filterAll: 'All', filterActive: 'Filter on', filterClear: 'Clear filter', statusesHeading: 'Technical status',
      howItWorks: 'How the check works', disclaimer: 'A Verdict is a finding from the queried Data sources, not proof of deception. You make the decision.',
      editList: 'Edit Reference list', editListGated: 'Only possible while no Check is running.',
      exportAction: 'Export', reportAction: 'PDF report', exportHeading: 'Export References',
      exportHint: 'Uses the currently saved fields, including your changes. Selected suggestions apply to this download only.',
      exportFormat: 'Format', exportStyle: 'Citation style', exportDownload: 'Download References', exportSelected: (n) => `${n} Correction suggestions selected`,
      reportHeading: 'Accessible PDF report', reportHint: 'A tagged PDF with the Verdicts, explanations, Correction suggestions and manual changes of this Check. Available for at most 15 minutes.', reportCreate: 'Create report',
      consumed: (n) => `${n} checks used`,

      back: 'Back', backToList: 'To the list', refPos: (i, n) => `Reference ${i} of ${n}`, prev: 'Previous Reference', next: 'Next Reference',
      original: 'Your original input', compare: 'Field by field', yours: 'Your Reference', bestMatch: 'Best match', field: 'Field', backedBy: 'Backed by',
      deviates: 'deviates', matches: 'matches', unknown: 'unknown', noCandidate: 'No Candidate found. No Source is presented as proven.',
      sourcesHeading: 'Data sources queried', candidatesHeading: 'More Candidates', score: 'Score', trailHeading: 'Evidence trail',
      suggestionHeading: 'Correction suggestion in your Reference', copy: 'Copy', copied: 'Copied',
      useForExport: 'Use for export', usedForExport: 'Selected for export',
      useForExportNote: 'Applies to the next export only. Fields and Verdict stay unchanged.',
      applyToFields: 'Apply to fields', applyToFieldsNote: 'Opens editing with the suggested values. Only “Save and re-check” commits them.',
      acceptCorrection: 'Accept correction', acceptedNote: 'Only the text changes. The Verdict stays unchanged.', corrected: 'Corrected',
      needsAmendment: 'Needs an ADR-0016 amendment (client)',
      editFields: 'Edit fields', saveRecheck: 'Save and re-check', discardDraft: 'Discard changes', draftNote: 'Draft. Not checked yet.',
      recheckRunning: 'Re-check running', historicalResult: 'Earlier result (historical)', recheckFree: 'Already billed. The Re-check is free.',
      confirmVerdict: 'Confirm Verdict', judgeManually: 'Judge manually', manualVerdict: (v) => `Manual Verdict: ${v}`, systemVerdict: (v) => `Original system Verdict: ${v}`, manualTag: 'Manual',
      overrideNote: 'A manual judgment changes only the effective Verdict of this result. Fields, Scores, evidence and Correction suggestions stay unchanged.',
      retry: 'Retry', notBilled: 'Not billed.', nextStep: 'Next step',

      reconnecting: 'Connection lost. Reconnecting … Your Check continues on the server.', offline: 'Offline. Results appear once the connection is back.', reconnected: 'Reconnected.',
      storageTemp: 'Not saved to History. Content is deleted at most 24 hours after the Check ends.',
      storageHistory: (d) => `Saved to History · deleted on ${d}`,
      guestNotice: 'Guest Checks and Guest Quota are not transferred when you register.', signIn: 'Sign in', guest: 'Guest', signedInAs: (n) => `Signed in as ${n}`,
      historyHeading: 'History', historyOpen: 'Open result', historyRestart: 'Start as a new Check',
      historyBillable: (n) => `This creates a new Check with ${n} References and uses Quota again. Opening is free.`,
      historyExpires: (d) => `Deleted on ${d}`, historyLocked: 'Locked under the Free rules. Deleting stays possible.', historyDelete: 'Delete entry', historyOff: 'History is off.', historyEnable: 'Turn on History',
      historyCount: (n) => `${n} References`,
      accountStub: 'Account, Plan and Preferences. A separate ticket designs the account pages; this is only the entry point.',
      planWebOnly: 'Purchases and Plan changes happen in the web app.', preferences: 'Preferences', theme: 'Appearance', language: 'Language',
      cmdPlaceholder: 'Command, filter or Reference …'
    }
  };
  ST.lang = () => document.documentElement.lang === 'en' ? 'en' : 'de';
  ST.strings = (add) => { for (const l of ['de', 'en']) Object.assign(S[l], add[l] || {}); };
  ST.t = (key, ...args) => { const v = S[ST.lang()][key] ?? S.de[key] ?? key; return typeof v === 'function' ? v(...args) : v; };
  ST.L = (pair) => Array.isArray(pair) ? (ST.lang() === 'en' ? pair[1] : pair[0]) : pair;
  ST.esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  ST.date = (iso) => { const [y, m, d] = iso.split('-'); return ST.lang() === 'en' ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : `${+d}.${+m}.${y}`; };
})();
