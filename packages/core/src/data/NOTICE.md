# NLM journal snapshot

Courtesy of the U.S. National Library of Medicine.

`nlm-journals.json` is a derived, pinned snapshot of the NLM J_Medline journal
list downloaded on **2026-10-29**. It may not reflect the most current/accurate
NLM data. NLM has not endorsed Source Taster.

Source: https://ftp.ncbi.nih.gov/pubmed/J_Medline.txt

Terms: https://www.nlm.nih.gov/databases/download/terms_and_conditions.html

The JSON records preserve NLM ID, journal title, Medline abbreviation, ISO
abbreviation, print ISSN and online ISSN. Empty upstream values remain empty.
The `sourceSha256` is the SHA-256 of the original downloaded bytes. The row order
is the upstream order; `columns` describes the tuple positions. No abbreviation
is generated or inferred.

The NLM terms require the attribution above and either current data or a clear
notice that the data may not be current. They disclaim warranties, including
accuracy and completeness, and prohibit implying endorsement. The exact
attribution and snapshot currency notice also appear in the product explanation
whenever NLM evidence is shown. These data are not project-authored AGPL code.

To refresh, download the source explicitly and run:

```sh
node scripts/nlm-snapshot.ts /path/to/J_Medline.txt YYYY-MM-DD
```

A refresh requires a new Scoring rules version, calibration evidence and a passed
Quality gate before release/activation (ADR-0018/0025/0006). Nothing downloads or
refreshes this file at runtime. The development configuration stays uncalibrated.
