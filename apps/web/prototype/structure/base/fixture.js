/* PROTOTYPE (#194) — throwaway fixture. One Check with ten References that between them reach every
   ADR-0016 state: all six Verdicts, a Manual override, a Correction suggestion, a technical failure,
   a Re-check with a historical result, long German titles and a long DOI. Bilingual: [de, en] pairs. */
window.ST = window.ST || {};
(() => {
  const CR = 'Crossref', OA = 'OpenAlex', S2 = 'Semantic Scholar', DNB = 'DNB', IA = 'Internet Archive', DC = 'DataCite';

  /* trail: [kind, [de,en], result]   kind: s = Data source queried, f = finding, e = end
     rows:  [fieldKey, yours, bestMatch, deviates(0/1), backedBy[]]   (null = no Candidate)
     srcs:  [Data source, result, [de,en], ms]
     result: ok | none | diff | bad | warn */
  ST.REFS = [
    { id: 1, verdict: 'correct', au: 'Luhmann, N.', yr: '1984', title: 'Soziale Systeme: Grundriß einer allgemeinen Theorie', meta: 'Suhrkamp, Frankfurt a. M. · ISBN 978-3-518-28266-3',
      reason: ['Die Referenz existiert und ist korrekt zitiert.', 'The Reference exists and is cited correctly.'],
      trail: [['s', [DNB, DNB], 'ok'], ['f', ['Eintrag über ISBN gefunden', 'Record found via ISBN'], 'ok'], ['f', ['Titel, Jahr und Verlag stimmen', 'Title, year and publisher match'], 'ok']],
      rows: [['author', 'Luhmann, N.', 'Luhmann, N.', 0, [DNB, OA]], ['year', '1984', '1984', 0, [DNB, OA]], ['title', 'Soziale Systeme: Grundriß einer allgemeinen Theorie', 'Soziale Systeme: Grundriß einer allgemeinen Theorie', 0, [DNB, OA]], ['publisher', 'Suhrkamp', 'Suhrkamp', 0, [DNB, OA]], ['isbn', '978-3-518-28266-3', '978-3-518-28266-3', 0, [DNB]]],
      srcs: [[DNB, 'ok', ['Eintrag mit ISBN 978-3-518-28266-3', 'Record with ISBN 978-3-518-28266-3'], 240], [OA, 'ok', ['Werk bestätigt', 'Work confirmed'], 310], [CR, 'none', ['Kein Treffer (Monografie ohne DOI)', 'No hit (monograph without DOI)'], 190]] },

    { id: 2, verdict: 'correct', au: 'Wilkinson, M. D., Dumontier, M., Aalbersberg, I. J. et al.', yr: '2016', title: 'The FAIR Guiding Principles for scientific data management and stewardship', meta: 'Scientific Data, 3, 160018 · doi:10.1038/sdata.2016.18',
      reason: ['Die Referenz existiert und ist korrekt zitiert.', 'The Reference exists and is cited correctly.'],
      trail: [['s', [CR, CR], 'ok'], ['f', ['DOI aufgelöst', 'DOI resolved'], 'ok'], ['f', ['Titel und Autor:innen stimmen', 'Title and authors match'], 'ok'], ['s', [OA, OA], 'ok']],
      rows: [['author', 'Wilkinson, M. D. et al.', 'Wilkinson, M. D. et al.', 0, [CR, OA, S2]], ['year', '2016', '2016', 0, [CR, OA, S2]], ['title', 'The FAIR Guiding Principles for scientific data management and stewardship', 'The FAIR Guiding Principles for scientific data management and stewardship', 0, [CR, OA, S2]], ['journal', 'Scientific Data', 'Scientific Data', 0, [CR, OA]], ['volume', '3', '3', 0, [CR]], ['pages', '160018', '160018', 0, [CR]], ['doi', '10.1038/sdata.2016.18', '10.1038/sdata.2016.18', 0, [CR, OA]]],
      srcs: [[CR, 'ok', ['DOI aufgelöst, Metadaten stimmen', 'DOI resolved, metadata match'], 280], [OA, 'ok', ['Werk bestätigt', 'Work confirmed'], 350], [S2, 'ok', ['Treffer', 'Hit'], 420]] },

    { id: 3, verdict: 'deviations', au: 'Mayer, T.', yr: '2019', title: 'Digitale Lehre in der Hochschulbildung', meta: 'Zeitschrift für Hochschulentwicklung, 14(3), 45–62 · doi:10.3217/zfhe-14-03/04',
      reason: ['Die Referenz existiert. Jahr, Titel und Seiten weichen vom besten Treffer ab.', 'The Reference exists. Year, title and pages deviate from the Best match.'],
      trail: [['s', [CR, CR], 'ok'], ['f', ['DOI gefunden', 'DOI found'], 'ok'], ['f', ['Jahr weicht ab (2019 → 2020)', 'Year deviates (2019 → 2020)'], 'diff'], ['f', ['Titel weicht ab', 'Title deviates'], 'diff'], ['f', ['Seiten weichen ab (45–62 → 45–61)', 'Pages deviate (45–62 → 45–61)'], 'diff']],
      rows: [['author', 'Mayer, T.', 'Mayer, T.', 0, [CR, OA, S2]], ['year', '2019', '2020', 1, [CR, OA, S2]], ['title', 'Digitale Lehre in der Hochschulbildung', 'Digitale Hochschullehre: Formate und Wirkungen', 1, [CR, OA]], ['journal', 'Zeitschrift für Hochschulentwicklung', 'Zeitschrift für Hochschulentwicklung', 0, [CR, OA, S2]], ['volume', '14(3)', '14(3)', 0, [CR]], ['pages', '45–62', '45–61', 1, [CR, OA]], ['doi', '10.3217/zfhe-14-03/04', '10.3217/zfhe-14-03/04', 0, [CR, OA]]],
      /* Correction suggestion as a tracked change in the user's own text (APA 7): strings and [old, new] pairs */
      suggestion: { style: 'APA 7', track: ['Mayer, T. (', ['2019', '2020'], '). Digitale ', ['Lehre in der Hochschulbildung', 'Hochschullehre: Formate und Wirkungen'], '. ', { i: 'Zeitschrift für Hochschulentwicklung, 14' }, '(3), 45–', ['62', '61'], '. https://doi.org/10.3217/zfhe-14-03/04'], by: [CR, OA] },
      srcs: [[CR, 'ok', ['DOI gefunden, Metadaten abweichend', 'DOI found, metadata deviate'], 312], [OA, 'ok', ['Bestätigt Jahr 2020 und Seiten 45–61', 'Confirms year 2020 and pages 45–61'], 388], [S2, 'ok', ['Gleiche Metadaten wie Crossref', 'Same metadata as Crossref'], 451], [DNB, 'none', ['Kein Treffer (Zeitschriftenartikel)', 'No hit (journal article)'], 203]],
      candidates: [{ src: OA, score: 0.93, title: 'Digitale Hochschullehre: Formate und Wirkungen', yr: '2020' }, { src: S2, score: 0.71, title: 'Digitale Lehre an Hochschulen: Eine Bestandsaufnahme', yr: '2019' }] },

    { id: 4, verdict: 'mixed', au: 'Schmidt, K. & Weber, P.', yr: '2017', title: 'Lernen mit Medien im Zeitalter der Digitalisierung', meta: 'Beltz Juventa, Weinheim',
      reason: ['Die Angaben passen zu zwei verschiedenen Werken. Das kommt bei KI-erzeugten Listen häufig vor, ist aber kein Beweis.', 'The details fit two different works. This is common in AI-generated lists, but it is not proof.'],
      trail: [['s', [OA, OA], 'ok'], ['f', ['Titelanfang passt zu Weber (2015)', 'Title opening fits Weber (2015)'], 'bad'], ['f', ['Autor:innen aus einem anderen Werk', 'Authors from another work'], 'bad'], ['f', ['Jahr 2017 in keinem Treffer', 'Year 2017 in no hit'], 'bad']],
      rows: [['author', 'Schmidt, K. & Weber, P.', 'Weber, P.', 1, [OA]], ['year', '2017', '2015', 1, [OA]], ['title', 'Lernen mit Medien im Zeitalter der Digitalisierung', 'Lernen mit Medien in der Schule', 1, [OA]], ['publisher', 'Beltz Juventa', 'Beltz Juventa', 0, [OA]]],
      srcs: [[OA, 'ok', ['Teiltreffer: Weber (2015), gleicher Titelanfang', 'Partial hit: Weber (2015), same title opening'], 360], [CR, 'ok', ['Teiltreffer: Schmidt (2017), anderer Titel', 'Partial hit: Schmidt (2017), different title'], 290], [DNB, 'none', ['Kein Treffer für die Kombination', 'No hit for the combination'], 210]],
      candidates: [{ src: OA, score: 0.64, title: 'Lernen mit Medien in der Schule', yr: '2015' }, { src: CR, score: 0.58, title: 'Medienbildung in der Sekundarstufe', yr: '2017' }] },

    { id: 5, verdict: 'doi-conflict', au: 'Krüger, A.', yr: '2021', title: 'Datenschutz im digitalen Klassenzimmer', meta: 'Computers & Education, 168, 104312 · doi:10.1016/j.compedu.2021.104312',
      reason: ['Die DOI gehört zu einem anderen Werk. Bitte DOI und Titel gegeneinander prüfen.', 'The DOI belongs to another work. Please compare DOI and title.'],
      trail: [['s', [CR, CR], 'ok'], ['f', ['DOI aufgelöst', 'DOI resolved'], 'ok'], ['f', ['DOI gehört zu „Learning analytics dashboards …“', 'DOI belongs to “Learning analytics dashboards …”'], 'bad']],
      rows: [['author', 'Krüger, A.', 'Chen, L. & Park, S.', 1, [CR]], ['year', '2021', '2021', 0, [CR]], ['title', 'Datenschutz im digitalen Klassenzimmer', 'Learning analytics dashboards and student agency', 1, [CR]], ['doi', '10.1016/j.compedu.2021.104312', '10.1016/j.compedu.2021.104312', 0, [CR]]],
      srcs: [[CR, 'ok', ['DOI löst auf ein anderes Werk auf', 'DOI resolves to another work'], 301], [OA, 'none', ['Kein Werk mit diesem Titel von Krüger', 'No work with this title by Krüger'], 372]] },

    { id: 6, verdict: 'not-found', au: 'Hoffmann, L.', yr: '2022', title: 'Resilienz durch Kollaboration: Eine Studie an deutschen Universitäten', meta: ['ohne DOI', 'no DOI'],
      reason: ['Alle abgeschlossenen Suchen blieben ohne Treffer. Das ist ein Hinweis, kein Beweis: bitte manuell prüfen.', 'All completed searches found nothing. This is a hint, not proof: please check manually.'],
      trail: [['s', [CR, CR], 'none'], ['s', [OA, OA], 'none'], ['s', [DNB, DNB], 'none'], ['s', [S2, S2], 'none'], ['e', ['Alle Suchen abgeschlossen', 'All searches complete'], 'none']],
      rows: null,
      srcs: [[CR, 'none', ['Kein Treffer', 'No hit'], 260], [OA, 'none', ['Kein Treffer', 'No hit'], 340], [DNB, 'none', ['Kein Treffer', 'No hit'], 215], [S2, 'none', ['Kein Treffer', 'No hit'], 480]],
      /* after the user edits the title and re-checks (demonstrates Re-check + historical result) */
      recheck: { field: 'title', value: 'Resilienz durch Kollaboration: Eine Mixed-Methods-Studie an deutschen Hochschulen', verdict: 'correct',
        reason: ['Nach Ihrer Feldänderung gefunden: Der Titel stimmt jetzt mit dem besten Treffer überein.', 'Found after your field change: the title now matches the Best match.'] } },

    { id: 7, verdict: 'not-verifiable', au: 'Bundesministerium für Bildung und Forschung', yr: '2023', title: 'Digitalisierung in der Bildung: Bericht zur Lage', meta: ['Graue Literatur', 'Grey literature'],
      reason: ['Kein Urteil möglich: Die DNB antwortete nicht rechtzeitig, die anderen Datenquellen decken graue Literatur nicht ab.', 'No statement possible: DNB did not answer in time, and the other Data sources do not cover grey literature.'],
      trail: [['f', ['Graue Literatur', 'Grey literature'], 'warn'], ['s', [DNB, DNB], 'warn'], ['f', ['Zeitüberschreitung nach 8 s', 'Timed out after 8 s'], 'warn'], ['e', ['Kein Urteil möglich', 'No statement possible'], 'warn']],
      rows: null,
      srcs: [[CR, 'none', ['Nicht zuständig (keine Verlagspublikation)', 'Not responsible (no publisher record)'], 0], [DNB, 'warn', ['Zeitüberschreitung nach 8 s', 'Timed out after 8 s'], 8000], [OA, 'none', ['Außerhalb der Abdeckung', 'Outside coverage'], 330]],
      /* the user checked with the issuing body and judged it manually */
      override: { verdict: 'correct', note: ['Beim Ministerium als PDF bestätigt.', 'Confirmed as a PDF with the ministry.'] } },

    { id: 8, verdict: 'correct', au: 'Hattie, J.', yr: '2009', title: 'Visible Learning: A Synthesis of Over 800 Meta-Analyses Relating to Achievement', meta: 'Routledge, London',
      reason: ['Die Referenz existiert und ist korrekt zitiert.', 'The Reference exists and is cited correctly.'],
      trail: [['s', [OA, OA], 'ok'], ['f', ['Werk gefunden', 'Work found'], 'ok'], ['f', ['Titel und Jahr stimmen', 'Title and year match'], 'ok']],
      rows: [['author', 'Hattie, J.', 'Hattie, J.', 0, [OA, DNB]], ['year', '2009', '2009', 0, [OA, DNB]], ['title', 'Visible Learning: A Synthesis of Over 800 Meta-Analyses Relating to Achievement', 'Visible Learning: A Synthesis of Over 800 Meta-Analyses Relating to Achievement', 0, [OA, DNB]], ['publisher', 'Routledge', 'Routledge', 0, [OA, DNB]]],
      srcs: [[OA, 'ok', ['Werk bestätigt', 'Work confirmed'], 340], [DNB, 'ok', ['Eintrag gefunden', 'Record found'], 225]] },

    { id: 9, verdict: null, techFail: true, au: 'Zierer, K.', yr: '2018', title: 'Lernen 4.0: Pädagogik vor Technik', meta: 'Schneider Verlag Hohengehren · ISBN 978-3-8340-1829-7',
      reason: ['Technischer Fehler: Die Bewertung konnte nicht abgeschlossen werden. Diese Referenz wurde nicht abgerechnet. Sie können sie erneut prüfen.', 'Technical failure: scoring could not finish. This Reference was not billed. You can retry it.'],
      trail: [['s', [DNB, DNB], 'ok'], ['f', ['Bewertung abgebrochen', 'Scoring aborted'], 'bad']],
      rows: null, srcs: [[DNB, 'ok', ['Eintrag gefunden', 'Record found'], 230], [OA, 'warn', ['Nicht erreichbar', 'Unreachable'], 0]] },

    { id: 10, verdict: 'correct', au: 'Wissenschaftliche Kommission Hochschuldidaktik', yr: '2020', title: 'Kompetenzorientierte Prüfungsgestaltung in der Hochschullehre: Herausforderungen, Gestaltungsempfehlungen und Qualitätssicherung für Lehrende', meta: 'doi:10.25656/01:18472-hochschuldidaktik.2020.kompetenzorientierung.pruefungsgestaltung',
      reason: ['Die Referenz existiert und ist korrekt zitiert.', 'The Reference exists and is cited correctly.'],
      trail: [['s', [DC, DC], 'ok'], ['f', ['DOI aufgelöst', 'DOI resolved'], 'ok'], ['f', ['Titel und Herausgeberin stimmen', 'Title and issuing body match'], 'ok']],
      rows: [['author', 'Wissenschaftliche Kommission Hochschuldidaktik', 'Wissenschaftliche Kommission Hochschuldidaktik', 0, [DC]], ['year', '2020', '2020', 0, [DC]], ['title', 'Kompetenzorientierte Prüfungsgestaltung in der Hochschullehre: Herausforderungen, Gestaltungsempfehlungen und Qualitätssicherung für Lehrende', 'Kompetenzorientierte Prüfungsgestaltung in der Hochschullehre: Herausforderungen, Gestaltungsempfehlungen und Qualitätssicherung für Lehrende', 0, [DC]], ['doi', '10.25656/01:18472-hochschuldidaktik.2020.kompetenzorientierung.pruefungsgestaltung', '10.25656/01:18472-hochschuldidaktik.2020.kompetenzorientierung.pruefungsgestaltung', 0, [DC]]],
      srcs: [[DC, 'ok', ['DOI aufgelöst', 'DOI resolved'], 410], [CR, 'none', ['Nicht registriert (DataCite-DOI)', 'Not registered (DataCite DOI)'], 220]] }
  ];

  ST.FIELDS = { author: ['Autor:in', 'Author'], year: ['Jahr', 'Year'], title: ['Titel', 'Title'], journal: ['Zeitschrift', 'Journal'], publisher: ['Verlag', 'Publisher'], volume: ['Band/Heft', 'Volume/Issue'], pages: ['Seiten', 'Pages'], doi: ['DOI', 'DOI'], isbn: ['ISBN', 'ISBN'] };

  /* the pasted text: one Reference per paragraph (APA-ish) */
  ST.INPUT_TEXT = ST.REFS.map(r => `${r.au} (${r.yr}). ${r.title}. ${Array.isArray(r.meta) ? r.meta[0] : r.meta}.`).join('\n\n');

  /* PDF/DOCX intake: Bibliography detection (ADR-0011). All regions start selected. */
  ST.DOCUMENT = { name: 'Hausarbeit_Digitale-Lehre_final.pdf', pages: 24, size: '1,8 MB',
    regions: [{ id: 'r1', label: ['Literaturverzeichnis · S. 19–21', 'Bibliography · pp. 19–21'], count: 10 }, { id: 'r2', label: ['Anhang B: Quellen der Abbildungen · S. 24', 'Appendix B: figure sources · p. 24'], count: 2 }],
    rejected: [['Abbildung 3: Eigene Darstellung nach Mayer (2019).', 'Abbildung 3: Eigene Darstellung nach Mayer (2019).'], ['Vgl. ebd., S. 12 f.', 'Vgl. ebd., S. 12 f.']] };

  /* browser selection intake (extension context menu "Mit Source Taster prüfen") */
  ST.SELECTION = { page: 'ilias.uni-beispiel.de/kurs/4711', count: 4 };

  /* History entries (ADR-0016 History, consent and expiry) */
  ST.HISTORY = [
    { id: 'h1', name: ['Hausarbeit Digitale Lehre', 'Term paper digital teaching'], date: '2026-11-07', refs: 10, counts: { correct: 4, deviations: 1, mixed: 1, 'doi-conflict': 1, 'not-found': 1, 'not-verifiable': 1 }, deletes: '2027-02-05', current: true },
    { id: 'h2', name: ['Exposé Masterarbeit', 'Master thesis proposal'], date: '2026-10-29', refs: 23, counts: { correct: 19, deviations: 3, 'not-found': 1 }, deletes: '2027-01-27' },
    { id: 'h3', name: ['Seminar Medienpädagogik', 'Media education seminar'], date: '2026-10-12', refs: 8, counts: { correct: 8 }, deletes: '2027-01-10' },
    { id: 'h4', name: ['Literaturliste aus ChatGPT', 'Reference list from ChatGPT'], date: '2026-09-30', refs: 12, counts: { correct: 3, mixed: 4, 'not-found': 5 }, deletes: '2026-12-29', locked: true }
  ];

  ST.ACCOUNT = { guest: { name: null }, free: { name: 'Lena Brandt', email: 'lena.brandt@uni-beispiel.de', plan: 'Free' } };
})();
