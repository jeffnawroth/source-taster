# Voice and tone (DRAFT)

> **DRAFT for [How does Source Taster speak in DE and EN?](https://github.com/jeffnawroth/source-taster/issues/192).** Nothing here is settled until that ticket closes. Sections marked **OPEN** are waiting on a decision. The prototype at `apps/web/prototype/voice/index.html` on branch `prototype/192-voice` shows the candidate voices on real strings.

## Scope

This guide covers every string a person reads from Source Taster, in German and English:

- the `packages/i18n` message catalogs (web app and extension)
- the private Account and billing catalogs
- the emails (ADR-0019)
- the Verification report PDF (ADR-0017)
- the website and the docs

German is drafted and reviewed first because it runs longer and the launch is German-speaking. English must say the same thing, not a looser paraphrase (FA-UEB-01).

## Principles

These follow from the positioning in [Who is Source Taster for and what should it feel like?](https://github.com/jeffnawroth/source-taster/issues/190).

1. **Calm, never alarmist.** No exclamation marks, no "Warning!", no red-alert vocabulary. A problem is described, not dramatised.
2. **Evidence first.** Say what was searched and what was found. Never say more than the evidence shows. A Verdict is never proof of deception, and the decision rests with a person (FA-ERG-05). Say this wherever Verdicts are summarised.
3. **Honest about limits.** "Not verifiable" and a missing record are reported as they are. Every limitation that could be misread as a negative finding carries its caveat ("… is no evidence that …").
4. **Plain, not academic, not hype.** Use everyday words. Do not say "AI-powered", "magic", "instantly" or "smart". Mention AI only where it changes what the person should do: AI extraction and its uncertainty.
5. **Crafted.** Strings are short, symmetrical across languages and typographically correct.

## Invariants (hold in every voice)

- **Labels never change.**
  - Verdicts: Correct / Korrekt, Exists, with deviations / Existiert, mit Abweichungen, Mixed citation / Gemischte Referenz, DOI conflict / DOI-Konflikt, Not found / Nicht gefunden, Not verifiable / Nicht verifizierbar.
  - Statuses: Running, Not checked, Cancelled, Technical error.
  - A Status is never phrased as a Verdict. The GLOSSARY.md _Avoid_ lists apply to UI copy too, for example no "Deviating", "Unverifiable", "credits", "rating" or "confidence".
- **Claims never change with tone.** Rewording may reorder and shorten a string, but it may not add or drop a fact. Voice C may additionally lead with a next step (advice such as „Prüfen Sie Titel und Autoren auf Tippfehler“), but never with a new factual claim. Legal texts such as retention and the DPA may change register, but not content.
- **Quota facts stay explicit wherever they matter:**
  - A technical Status uses no Quota.
  - A Re-check of the same Reference slot is free.
  - Partial starts say how many References were left out.
- **A chip is never only colour.** Verdict chips carry glyph and text, and copy never refers to "the red ones".

## Sentence style

The prototype shows three voices on about 50 strings, next to today's catalog:

| Voice | Rule | Example (`reason_insufficient_search`, DE) |
| --- | --- | --- |
| A · Explanatory | Full sentences: fact, reason, next step. Caveats spelled out. | „Die Suche konnte nicht abgeschlossen werden oder fand zu wenige Belege. Das ist kein Beleg dafür, dass die Quelle nicht existiert.“ |
| B · Brief | One core sentence plus at most one more. Detail lives behind „Erklärung und Quellenbelege“. | „Suche unvollständig oder zu wenige Belege. Die Quelle kann trotzdem existieren.“ |
| C · Next step first | If there is something to do, it comes first, then the fact. | „Prüfen Sie diese Referenz später erneut; das verbraucht kein Kontingent. Die Suche …“ |

**Decided: the voice depends on the surface.**

| Surface | Voice |
| --- | --- |
| Toasts, chips, labels, short limitation notes in the source evidence | B · Brief |
| Verdict explanations, the summary, dialogs (Quota, deletion), empty states | A · Explanatory |
| Errors and limits where the person has to act | C · Next step first |
| Buttons | Verb + object; the count only where Quota is spent („8 Referenzen prüfen“, „Die ersten 5 prüfen“) |
| Destructive buttons | Repeat the action, no first person („Konto endgültig löschen“, „Abbrechen“) |

Reason: a Verdict needs a traceable explanation and a spelled-out caveat more than brevity, where a short „kann trotzdem existieren“ reads as offhand. An error is about what to do next. Small surfaces have no room for full sentences. The first person in buttons does not fit the calm, factual tone.

## Rules per category

These are draft rules. The bracketed parts depend on the open decisions.

### Address form

German uses **Sie** everywhere, including sign-in, import, Quota and DPA texts that use du today. English always uses "you". Reason: a Verdict about someone's references, Account deletion and the institutional DPA are serious moments where du reads as chummy, and the catalog is already mostly Sie. Warmth comes from plain, friendly sentences, not from the address form.

### Verdicts and "Not verifiable"

- State what the search did, then what it found: „Die Suche wurde abgeschlossen und fand …“. Never use „Die Quelle existiert nicht“ unless a neutral authority confirms it, as doi.org does for a non-existent DOI.
- "Not found" means the search finished without a match. "Not verifiable" means the search could not finish or found too little evidence. Both carry a caveat. Neither implies wrongdoing.
- Name the data source when the finding depends on it: Crossref, OpenAlex, doi.org. Use the Glossary term „Data source“ / „Datenquelle“ rather than internal words such as „development indexes“, and keep qualifiers such as „enabled“ / „aktiviert“ that limit what was searched.
- The summary leads with counts ("3 of 8 …") and points to what deserves a look first. It never sounds like a grade.

### Errors and technical Status

- Say whose side the problem is on: „bei uns“ for our errors, the connection for the person's network, the document for unreadable files.
- Always give the next step and say whether Quota was used.
- Do not use "Oops", "Something went wrong" or apologies piled on apologies. One plain sentence is enough.

### Empty states

- Say what will appear here and when. If there is an action, offer it as a link or button: „Alle Referenzen zeigen“.
- When input is unrecognised, say what a recognisable Reference needs: author, title and year, or an identifier.

### Limits and Quota

- Show numbers, not adjectives: „80 % verbraucht“, „5 Prüfungen übrig für 12 Referenzen“.
- Upsell only at a point of need, and once. Offer the alternative too: a Check pack, or checking the first *n*.
- Say exactly which References were left out and that they were not checked.
- A rate limit gives the time it lifts: „Weiter ab 14:32 Uhr“.

### Sensitive moments

Use this for deletion, withdrawal and anything irreversible.

- The heading names the action and its finality: „Konto endgültig löschen“.
- List what is lost, with numbers, before the confirmation.
- The destructive button repeats the action. Never use a bare "OK" or "Yes". Do not use the first person: „Konto endgültig löschen“, not „Mein Konto endgültig löschen“.

### Buttons

- Use verb + object: „Referenzen prüfen“, „PDF-Bericht erstellen“. Add the count only where the action spends Quota: „8 Referenzen prüfen“, „Die ersten 5 prüfen“.
- German buttons use the infinitive. English buttons use the imperative [in sentence case, or with capitalised glossary terms; see open decision 8].
- Use the same verb for the same action everywhere: prüfen / check, erneut prüfen / re-check, abbrechen / cancel.

### Confirmations

Use a toast for a reversible success: „Kopiert.“ When a result changes something visible, say what stays: „Das ursprüngliche Urteil bleibt daneben sichtbar.“

## Open terminology decisions

These are held constant in the prototype and decided separately.

1. ~~**German address form**~~ Decided: **Sie** everywhere. Today `auth_*`, `library_*`, `quota_loading`, `quota_unavailable` and `dpa_*` use du and need rewriting.
2. ~~**German words for glossary terms**~~ Decided: the German UI uses German words throughout. English stays only for proper names and fixed abbreviations (DOI, PDF, Crossref, OpenAlex, Plan names). Check → **Prüfung** (fix `history_*` „Checks“). Quota → **Kontingent** (fix `history_billable` „Quota“). Plan → **Plan**, plural **Pläne** (fix `commerce_open` „Tarife“, `history_policy` „Plans“). Check pack → **Prüfpaket** (replaces „Prüfkontingent“, which collided with Kontingent: one buys a Prüfpaket and it raises the Kontingent). Plan names such as **Free** are proper names and are not translated („im Plan Free“).
3. (merged into 2)
4. (merged into 2)
5. (merged into 2)
6. ~~**Verdict (DE)**~~ Decided: **Befund** replaces „Urteil“ (20 uses in `de.json` today). It names what was found, not what follows from it, which fits evidence-first and „die Entscheidung trifft ein Mensch“; „Urteil“ sounds like a court ruling and nearly contradicts the FA-ERG-05 note. „Bewertung“ is ruled out as too close to „rating“ and grading. The six Verdict labels are unchanged. Examples: „Ein Befund ist kein Beweis für Täuschung.“, „Befund selbst festlegen“.
7. ~~**Gendered nouns (DE)**~~ Decided: rephrase neutrally first („Autorenangabe {number}“, „Weitere Person hinzufügen“, „Von Ihnen eingegeben“ instead of „von der nutzenden Person“, „wer prüft“). Where that is impossible, use the paired form in running text („Autorinnen und Autoren“). Never use inner-word characters (`:`, `*`, `_`) or the slash („Autor/in“ in `revision_*` today). Reasons: since 1 April 2024, Bavaria's administrative rules (AGO) bar inner-word gender characters in state authorities, schools and university administration (not research and teaching), and that administration signs the DPA and buys licences ([Forschung & Lehre](https://www.forschung-und-lehre.de/politik/bayern-verbietet-gendern-in-schulen-hochschulen-und-behoerden-6318), [scope](https://www.forschung-und-lehre.de/politik/verbot-zu-gendern-gilt-nur-fuer-verwaltung-6407)). Screen readers read „Autor:innen“ unevenly, and neutral wording is usually shorter and calmer. English needs nothing here.
8. **English capitalisation of glossary terms in running copy:** "your Quota" or "your quota". Today's catalog capitalises them.
9. **Typography:**
   - „80 %“ or „80%“
   - en dash „–“ or em dash „—“
   - spacing before „…“
   - German quotation marks „…“ in DE
10. **„Bitte“ / "please":** always, only when asking for patience, or never.

## Resolution

To be filled when the ticket closes: the chosen voice per surface, the decisions above, and any follow-up for rewriting the catalog.
