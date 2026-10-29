# Synthetic comparison witnesses

`ten-cases.json` contains public development examples of ADR-0025 and
requirements §8.3. These are invented protocol fixtures, not recorded source
facts, a Development set, a Reference test set, calibration or quality approval.
The owned loopback Crossref/Handle fixtures serve them without live requests.
Created for #75 on 2026-10-28. This project-authored fixture data retains the
repository license, AGPL-3.0-or-later. No new license exception is introduced.

Stored values are millionths of a percentage point. The expectations were
worked independently from the approved formula, then written as literals.
Cases 1 and 4 use 6/7; case 2 uses 2/3. The title/DOI mean uses weights 30/10:
case 1's stored 85,714,286 gives 89,285,714.5, half up to 89,285,715.
Case 2's stored 66,666,667 gives 75,000,000.25, rounded to 75,000,000.
Case 7 covers two of four cited pages: 50,000,000, and its page/DOI mean with
weights 2/10 is 91,666,666 2/3, stored as 91,666,667.
Case 9 covers 199,999,999 / 200,000,000 pages: the Field score and overall
Score both round toward 100%, but both retain the deviation flag, storage cap
99,999,999 and display cap 99.99%. Cases 3, 5, 6, 8 and 10 agree fully.

The browser creates real Checks using the complete Reference text, reads real
SSE results and GET snapshots, checks the literal stored integers and two-decimal
displays, switches DE/EN, and reads the same immutable result again. Candidate
metadata supplies only the selected field and DOI; missing fields are explained
and excluded, so these are the same two-field weighted means as the HTTP cases.
