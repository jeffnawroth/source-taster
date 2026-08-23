# Handoff — Penpot UI Redesign (Sidepanel + Web App)

Updated: 2026-08-22
Runtime: OpenCode (Arbeit via Penpot-MCP-Tools). Übergeben an: Claude Code.

## Objective

Iteratives UI-Redesign der Source-Taster-Oberflächen direkt in Penpot, gemeinsam
mit dem User reviewt und umgesetzt. **Jede Änderung gilt immer für beide
Surfaces (Sidepanel + Web App) und beide Themes (Light + Dark) = 4 Boards pro
Screen.**

## Zugang & Werkzeuge

- Penpot-MCP-Server: `penpot_high_level_overview` zuerst lesen, dann
  `penpot_execute_code` (Hauptwerkzeug) und `penpot_export_shape` für PNG/SVG.
- Datei enthält zwei relevante Seiten: `Sidepanel` und `Web App`.
- Vor jeder Modifikation Seite aktivieren: `await penpot.openPage(page.id)` +
  `await new Promise(r => setTimeout(r, 700))`.

## Board-Inventar

Seite `Sidepanel` — Boards 360×700, Light x=40, Dark x=1080:

| Board | y |
|---|---|
| Input | 40 |
| Token Editor | 820 |
| Verification | 1600 |
| Result | 2380 |
| Onboarding | 3160 |
| Empty | 3940 |
| Error | 4720 |
| Details | 5500 |
| Edit Overview | 6280 |

Seite `Web App` — Boards 1280×900, Light x=40, Dark x=1400:

| Board | y |
|---|---|
| Home | 40 |
| Results | 900 |
| About | 1920 |
| Results Details | 2680 |
| Edit Overview | 3680 |
| Edit Reference | 4680 |
| Verification | 5580 |
| Empty | 6480 |
| Error | 7380 |

Alle Web-Boards: AppBar 80px, Logo bei relativ (40,28), Text „SOURCE TASTER"
(72,33), Dark-AppBar-Fill `#1a1a1a`.

## Verbindliche Design-Entscheidungen

### Kategorie-System „C" (Hybrid)
Kategorie-Badge (Farbe + Label) + %-Score + Balken auf jedem Result-Screen.
VERIFIED-Chip nur noch in den Details-Screens. Kategorien sind deterministisch,
keine binäre „verifiziert"-Schwelle.

### Default-Schwellen
- Exact ≥ 95 · Strong 85–94 · Possible 50–84 · No match < 50
- Unknown = kein DB-Ergebnis (nicht schwellenbasiert)
- Später in den Options konfigurierbar (Future-Wunsch; betrifft `classifyScore`
  in `apps/web/src/utils/scores.ts` — heute 3-stufig: verified ≥85,
  partial ≥50, not-found).

### Balken-Farbregel
Balkenfarbe = Score-Stärke: grün `#10b981` (Strong), Amber (schwach),
Rot (kein Match). Indigo `#4f46e5` NUR für den globalen Fortschrittsbalken.
(Der OpenAlex-Balken war fälschlich indigo und wurde überall auf grün gesetzt.)

### Kategorie-Farben (Chip-BG / Chip-Text)
| Kategorie | Light | Dark |
|---|---|---|
| Exact/Strong | `#d1fae5` / `#047857` | `#064e3b` / `#6ee7b7` |
| Possible | `#fef3c7` / `#92400e` | `#713f12` / `#fcd34d` |
| No match | `#fee2e2` / `#991b1b` | `#7f1d1d` / `#fca5a5` |
| Unknown | `#f5f5f5` / `#737373` | `#333333` / `#d4d4d4` |
| Zähler (Text/BG) | `#171717` / `#fff` | `#fafafa` / `#2a2a2a` |

Dot-Farben in der Legende: Strong `#10b981`, Possible `#f59e0b`,
No match `#ef4444`, Unknown `#a3a3a3`.

### Typografie
- `gfont-jetbrains-mono`: Labels/Status (STRONG 7/600, Meta 9–10/400,
  Legende im Sidepanel 8).
- `gfont-inter-tight`: Titel/Fließtext.

### Radii
Chips 13 · Dots/Score-Tiles/Balken 999 · Zähler-Kästchen 8 · Karten 16 ·
Header-Pills 10 · bg/AppBar 0.

### Navigationsmodell (bewusst unterschiedlich)
Sidepanel = Wizard mit Step-Leiste; Web = seitenbasiert. Kein Angleichungsbedarf.

## Penpot-API-Stolperfallen (kritisch!)

1. **Board-Kinder speichern SEITEN-ABSOLUTE Koordinaten.** Beim Setzen immer
   `x = board.x + offset`, `y = board.y + offset`.
2. `penpot.createText(chars)` braucht das String-Argument direkt.
3. Rechtecke: `rect.resize(w, h)` statt width/height setzen (read-only).
4. `board.appendChild(child)` zum Einfügen; `sendToBack()` funktioniert.
5. Seite muss aktiv sein (openPage + Delay), sonst Modifikationen ins Leere.
6. Elementsuche nach relativen Koordinaten mit Toleranz
   (`Math.abs(c.x - b.x - target) < 0.6`) — es gibt .5-Offsets.
7. Textboxen können feste Breite haben (`growType: "auto-height"`) — Glyphen
   sind trotzdem linksbündig; Box ggf. per `resize(w, h)` verschmälern, damit
   sie nicht über die Board-Grenze ragt.
8. Standard-Verifikation nach jeder Änderung:
   ```js
   b.children.filter(c => {
     const rx = c.x - b.x, ry = c.y - b.y;
     return rx < 0 || ry < 0 || rx + c.width > b.width || ry + c.height > b.height;
   })
   ```
   plus Struktur-Dump (Typ, relative x/y/w, chars, fill) und Abgleich Light↔Dark.
9. In Schleifen über Boards: Board-Lookup wirklich pro Name ausführen
   (nicht versehentlich dasselbe Board zweimal ändern).

## Abgeschlossene Arbeiten

1. **Verification-Fixes**: „Searching in OpenAlex…" Sidepanel Light `#4338ca`,
   Dark `#a5b4fc`; leerer 16×16-Dot (y=400, Karte 2) entfernt (Light+Dark).
2. **Web `Results / Light+Dark` komplett umgebaut** (Quellen-Konzept →
   Referenzliste, je ~58 Kinder): AppBar 80, Titel „Results" y=170,
   Sub „2 references checked" y=214, Legende y=250 (5 Chips + Dots + Zähler),
   2 Referenzkarten y=290/430 (1040×120, r16, Score-Tile 44×44 r999,
   Crossref/OpenAlex-Balken h4, Chevron), Footer y=590. Header-Pills
   (← BACK / VERIFY ALL / EXPORT ▾) beibehalten.
3. **„NO MATCH" → „UNKNOWN"** ×4: Sidepanel `Details / Light+Dark`,
   Web `Results Details / Light+Dark` (Semantic-Scholar-Zeile).
4. **Radii-Korrekturen** Web Results L/D (je 24 Rects, siehe Radii-Tabelle;
   verifiziert).
5. **Web-Results-Konsistenz**: AppBar 64→80px (Dark `#1a1a1a`), Logo →(40,28),
   SOURCE TASTER →(72,33), Footer 830→590.
6. **OpenAlex-Balken grün** (`#10b981` statt `#4f46e5`): Web Results L/D +
   Sidepanel Result L/D.
7. **Sidepanel Result Legende kompakt** (L/D, identisch):
   Exact chip(20, w48, dot29, text39) · Strong(72, w68, dot81, text91,
   Counter 124..140) · Possible(144, w77, dot153, text163, Counter 205..221) ·
   No match(225, w60, dot234, text244) · Unknown(289, w56, dot298, text308,
   Textbox w48). Labels von 9→8px verkleinert (9px passte rechnerisch nicht in
   360px). Zähler sitzen wie im Original rechts IN den Chips. Kein Overflow.

## Offene Punkte

- **PNG-Exports**: `png-exports/` enthält alle geänderten Boards noch nicht.
- **Orphan-Shapes** auf Web-App-Seite (Top-Level, aufräumen? Angebot offen):
  text@(280,192), 2× Text@(0,0), rect@(210,156), Text@(493,4035),
  Rectangle@(40,900).
- **Web Edit Overview**: Logo (72,28) überlappt SOURCE TASTER (72,33) — nur
  informativ gemeldet, noch nicht geändert.
- **Web Token Editor**: ~200px Leerraum zwischen Chips (Ende ~416) und
  Trenner (620) — unentschieden.
- **Future (Code)**: Schwellen in den Options konfigurierbar machen
  (`apps/web/src/utils/scores.ts`, `ScoreBadge.vue`, `ResultsView.vue`).

## User-Direktiven für die Weiterarbeit

- Immer beide Surfaces (Sidepanel + Web App) und beide Themes prüfen/ändern.
- Empfehlungen produktbasiert begründen, NICHT codebasiert („den Code können
  wir ohne Probleme umbauen").
- Arbeitsweise: Funde/Vorschläge präsentieren → Freigabe abwarten → umsetzen →
  strukturell verifizieren → berichten.
- Kommunikation auf Deutsch.
