# Source Taster: concept sketches, round 3 (shared brief)

You are building **one** throwaway concept sketch for Source Taster. Two other agents sketch sibling concepts in parallel. This is a design exploration: no production code, no tests, no GitHub issue or PR activity, no git commits. Do not read or reference the repository `jeffnawroth/source-taster-legacy`.

## Why this round exists
Two rounds of polished directions failed for one reason, in the owner's words: none feels *"as if the design were made for this application"*. They were generic 2026 SaaS dashboards (Bento tiles, rings, glow, glass). You could swap "references" for "deployments" and nothing would change. This round tests **concepts that come from the product's own world**: reference lists, editing, source work, the library. Do **not** build a dashboard. No Bento grid, no donut ring, no KPI tiles. Polish is secondary; the **idea** must be legible at a glance.

## The product
Source Taster checks whether bibliographic references exist and are cited correctly. The user pastes a reference list or uploads a document. Each reference is matched against data sources (Crossref, OpenAlex, DNB, Semantic Scholar, Internet Archive) and gets one of six **Verdicts**:

| Verdict (DE) | Colour family | Meaning |
|---|---|---|
| Korrekt | green | Exists and is cited correctly |
| Existiert, mit Abweichungen | amber | Exists, but fields deviate (year, title, pages …). A correction is offered |
| Gemischte Referenz | red | Combines parts of different works |
| DOI-Konflikt | red | The DOI does not exist or belongs to another work |
| Nicht gefunden | red | Completed searches found nothing; check manually |
| Nicht verifizierbar | grey | No statement possible (outside coverage). Honest, never a failure |

Hard rules: a verdict is **never colour alone** (distinct glyph shape + text label, distinguishable in greyscale; the three reds need three different shapes). A verdict is never presented as proof of deception. WCAG 2.2 AA contrast; targets at least 24×24 px.

Surfaces: a web app and a browser-extension **side panel about 360 px wide**. The concept must survive 360 px.

## Positioning (decided)
Professional tool for researchers, reviewers, lecturers and students. Promise: evidence-based verification, calm and with evidence. Attributes: precise, calm, trustworthy, transparent, crafted. Calm in work surfaces, bold in signature moments. No AI-hype look (no rainbow borders, sparkles, "magic" wording, fake typing).

## Style baseline (keep it, the owner liked it)
The owner liked the **intake** of a previous light direction: calm, near-white, the user's text at the centre. Open it and look at the intake and its typography and colour:
`/tmp/st-191-round2/glass-claude/index.html` (screenshot `/tmp/st-191-round2/glass-claude/shots/intake-web-light.png`).
Use the same baseline: light theme, **Atkinson Hyperlegible Next** (UI) + **IBM Plex Mono** (DOIs, sources) via Google Fonts, cobalt accent around `oklch(0.5 0.2 264)`. You may deviate where your concept truly needs it, and say why in NOTES.md. Dark mode is not required this round.

## What to build: ONE moment
The moment **right after the check has finished**: the user's 8 references with their verdicts, with the Mayer reference (the deviation case) opened or annotated in full so the evidence and the correction are visible. Show how a user understands "how did my list do" without a dashboard. Optionally add a second small frame showing how the intake turns into this view (a static before/after is fine).

Data (use exactly these 8):
1. Luhmann, N. (1984). Soziale Systeme: Grundriß einer allgemeinen Theorie. Suhrkamp. → Korrekt (DNB via ISBN)
2. Wilkinson, M. D. et al. (2016). The FAIR Guiding Principles for scientific data management and stewardship. Scientific Data, 3, 160018. doi:10.1038/sdata.2016.18 → Korrekt (Crossref, OpenAlex)
3. Mayer, T. (2019). Digitale Lehre in der Hochschulbildung. Zeitschrift für Hochschulentwicklung, 14(3), 45–62. doi:10.3217/zfhe-14-03/04 → Existiert, mit Abweichungen. Best match: year **2020**, title **"Digitale Hochschullehre: Formate und Wirkungen"**, pages **45–61** (Crossref, confirmed by OpenAlex). Correction: Mayer, T. (2020). Digitale Hochschullehre: Formate und Wirkungen. Zeitschrift für Hochschulentwicklung, 14(3), 45–61. https://doi.org/10.3217/zfhe-14-03/04
4. Schmidt, A., & Weber, K. (2017). Lernen mit Medien im Zeitalter der Digitalisierung. → Gemischte Referenz (title belongs to Becker & Lang 2015; Schmidt & Weber 2017 exists with another title)
5. Krüger, J. (2021). Datenschutz im digitalen Klassenzimmer. doi:10.1000/xyz123 → DOI-Konflikt (DOI belongs to "Open Data in der Verwaltung", 2020)
6. Hoffmann, L. (2022). Resilienz durch Kollaboration: Eine Studie an deutschen Universitäten. → Nicht gefunden (Crossref, OpenAlex, DNB, Semantic Scholar: no match)
7. Bundesministerium für Bildung und Forschung (2023). Digitalisierung in der Bildung: Bericht zur Lage. → Nicht verifizierbar (grey literature, outside coverage)
8. Döring, N., & Bortz, J. (2016). Forschungsmethoden und Evaluation in den Sozial- und Humanwissenschaften. Springer. → Korrekt

## Deliverables
Folder: `/tmp/st-191-round3/<your-slug>/`
- `index.html`: one self-contained file (inline CSS/JS; Google Fonts as above is the only external request). A small floating toggle for web (1280) / panel (360) width.
- `shots/`: Playwright (Chromium) screenshots; Playwright is in `/Users/jeffnawroth/Developer/Repositories/source-taster/node_modules` (run a script from a scratch folder that imports it from there). Required: `moment-web.png` (1280 wide, full page), `moment-360.png` (360 wide, full page), `moment-web-grey.png` (greyscale). Plus `intake-to-moment.png` if you built that frame. DPR 2.
- `NOTES.md`: the concept in 3 lines, what makes it *specific to Source Taster*, the weakest point of the concept, and any deviation from the style baseline.

Time-box: this is a sketch. Aim for the idea to land, not for every state to work. Final message: your slug, the absolute index.html path, and the NOTES.md content.
