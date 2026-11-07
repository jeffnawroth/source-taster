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
- **Claims never change with tone.** Rewording may reorder and shorten a string, but it may not add or drop a fact. Legal texts such as retention and the DPA may change register, but not content.
- **Quota facts stay explicit wherever they matter:**
  - A technical Status uses no Quota.
  - A Re-check of the same Reference slot is free.
  - Partial starts say how many References were left out.
- **A chip is never only colour.** Verdict chips carry glyph and text, and copy never refers to "the red ones".

## Sentence style — OPEN

The prototype shows three voices on about 50 strings, next to today's catalog:

| Voice | Rule | Example (`reason_insufficient_search`, DE) |
| --- | --- | --- |
| A · Explanatory | Full sentences: fact, reason, next step. Caveats spelled out. | „Die Suche konnte nicht abgeschlossen werden oder fand zu wenige Belege. Das ist kein Beleg dafür, dass die Quelle nicht existiert.“ |
| B · Brief | One core sentence plus at most one more. Detail lives behind „Erklärung und Quellenbelege“. | „Suche unvollständig oder zu wenige Belege. Die Quelle kann trotzdem existieren.“ |
| C · Next step first | If there is something to do, it comes first, then the fact. | „Prüfen Sie diese Referenz später erneut; das verbraucht kein Kontingent. Die Suche …“ |

A mix is possible, for example B for chips, toasts and banners and A for verdict explanations and dialogs. The decision should name the voice per surface.

## Rules per category

These are draft rules. The bracketed parts depend on the open decisions.

### Address form — OPEN

German: one form everywhere, either **Sie** or **du**. Today the catalog mixes both. English always uses "you".

### Verdicts and "Not verifiable"

- State what the search did, then what it found: „Die Suche wurde abgeschlossen und fand …“. Never use „Die Quelle existiert nicht“ unless a neutral authority confirms it, as doi.org does for a non-existent DOI.
- "Not found" means the search finished without a match. "Not verifiable" means the search could not finish or found too little evidence. Both carry a caveat. Neither implies wrongdoing.
- Name the data source when the finding depends on it: Crossref, OpenAlex, doi.org.
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
- The destructive button repeats the action. Never use a bare "OK" or "Yes". [In voice C the destructive button uses the first person: „Mein Konto endgültig löschen“ / „Mein Konto behalten“.]

### Buttons

- Use verb + object: „Referenzen prüfen“, „PDF-Bericht erstellen“. [Voice B allows the verb alone when the context names the object. Voice C adds the count: „8 Referenzen prüfen“.]
- German buttons use the infinitive. English buttons use the imperative in sentence case.
- Use the same verb for the same action everywhere: prüfen / check, erneut prüfen / re-check, abbrechen / cancel.

### Confirmations

Use a toast for a reversible success: „Kopiert.“ When a result changes something visible, say what stays: „Das ursprüngliche Urteil bleibt daneben sichtbar.“

## Open terminology decisions

These are held constant in the prototype and decided separately.

1. **German address form:** Sie or du. Today, `auth_*`, `library_*`, `quota_loading`, `quota_unavailable` and `dpa_*` use du, and the rest use Sie.
2. **Prüfung vs Check:** `history_*` says „Checks“, while the rest of the catalog says „Prüfung“.
3. **Kontingent vs Quota:** `history_billable` says „verbraucht erneut Quota“.
4. **Plan vs Tarif:** `commerce_open` says „Tarife“. Also open: the plural („bezahlte Plans“ in `history_policy` vs „Pläne“) and whether „Free“ is used as a German Plan name.
5. **Check pack:** „Prüfkontingent“ collides with „Kontingent“. The alternative is „Prüfpaket“.
6. **Verdict:** „Urteil“, or the less judicial „Befund“ or „Bewertung“. The Glossary already rules out „rating“.
7. **Gendered nouns:**
   - The options:
     - neutral rephrasing („Autorenangabe“)
     - a slash („Autor/in“, as in `revision_*` today)
     - a colon („Autor:innen“, as in the Glass draft)
   - Bavaria has barred gender special characters in authorities, schools and universities since April 2024.
8. **English capitalisation of glossary terms in running copy:** "your Quota" or "your quota". Today's catalog capitalises them.
9. **Typography:**
   - „80 %“ or „80%“
   - en dash „–“ or em dash „—“
   - spacing before „…“
   - German quotation marks „…“ in DE
10. **„Bitte“ / "please":** always, only when asking for patience, or never.

## Resolution

To be filled when the ticket closes: the chosen voice per surface, the decisions above, and any follow-up for rewriting the catalog.
