# The Source Taster — Roadmap

## ✅ Phase 0: Branding & Identity (Completed)

- [x] Farbpalette definiert & WCAG-konform optimiert
  - Purple `#4e2e92` (Primary) → behalten
  - Teal `#1f6b7c` (Secondary) → Türkis abgedunkelt für WCAG AA
  - Dunkelgrün `#2d7a31` (Success) → Grün abgedunkelt für WCAG AA
  - Gold `#c9952e` (Accent) → neu als warmer Akzent
- [x] CSS Custom Properties in Landing + Docs aktualisiert
- [x] Extension Vuetify-Theme aktiviert (Light + Dark)
- [x] Logo erstellt (Purple Circle + White S) in 16/32/48/128px + SVG
- [x] Logo in Extension Assets eingespielt
- [x] Logo in Landing Page (favicon, Header, Footer, OG Image)
- [x] Logo in Docs (favicon, OG Image)
- [x] Gradient von Lila→Türkis→Grün auf Lila→Teal geändert
- [x] Pricing-Info in FAQ ergänzt (Free forever OSS + Cloud-Tier)
- [x] Builds verifiziert: Landing ✅ Docs ✅

---

## 🟡 Phase 1: Product Polish (Next)

### 1.1 Chrome Web Store Listing
- [ ] Neue Store-Screenshots (1280×800) mit Brand-Farben + Captions
- [ ] Neue Beschreibung mit Metriken (93 %, 100 %, <3s)
- [ ] Neues Icon hochladen (128px)
- [ ] Promotional Tile (440×280) mit Logo + Value Prop

### 1.2 Firefox Add-on Store
- [ ] Listing bei Firefox Add-ons beantragen (bisher nur GitHub Releases)
- [ ] Gleiche Assets + Beschreibung wie Chrome

### 1.3 Landing Page Erweiterungen
- [x] Web Workspace (`sourcetaster.com/app`) — Paste/PDF → Extract → Verify → Export
- [ ] Screen-Recording GIF (15s: Paste → Extract → Search → Match)
- [ ] Pricing-Tabelle (Free / Pro €9/mo / Team €29/mo / Enterprise)
- [ ] „Coming Soon"-Badges für Cloud-Tier
- [ ] Social Proof Section (Thesis-Ergebnisse prominenter)

### 1.4 Dokumentation
- [ ] „For Students"-Seite in Docs
- [ ] „For Reviewers"-Seite in Docs
- [ ] Screenshots in Docs einbauen

---

## 🟢 Phase 2: Launch (1 Woche Vorbereitung)

### 2.1 Product Hunt
- [ ] Post vorbereiten (Hook: 100 % Halluzinationserkennung)
- [ ] Erste Upvotes organisieren
- [ ] Maker-Kommentar mit Thesis-Daten

### 2.2 Hacker News
- [ ] „Show HN: Open-Source Tool erkennt KI-Halluzinierte Referenzen"
- [ ] Thread vorbereiten mit technischen Details + Metrics

### 2.3 Reddit
- [ ] r/academia — „We built a free tool that detects fake citations"
- [ ] r/PhD — „Stop manually checking references"
- [ ] r/OpenSource — neuen OSS-Release teilen
- [ ] r/MachineLearning — technischer Deep Dive

### 2.4 Social Media
- [ ] Twitter/X Thread: Vergleichstabelle Source Taster vs. 18 Konkurrenten
- [ ] LinkedIn: Academic-Community-Post

---

## 🔵 Phase 3: Growth & Content (Laufend)

### 3.1 Content Marketing
- [ ] Blog-Post 1: „How we achieved 100 % hallucination detection"
- [ ] Blog-Post 2: „Citation verification in 2026 — landscape overview"
- [ ] Blog-Post 3: „Open Source vs Commercial citation checkers"
- [ ] Konferenz-Paper aus der Thesis extrahieren (JCDL, ICADL)

### 3.2 Integrationen
- [ ] Overleaf-Plugin?
- [ ] Zotero-Plugin (Batch-Export → Verify → Re-Import)
- [ ] Word/Google Docs Add-in?

### 3.3 Community
- [ ] CONTRIBUTING.md schreiben
- [ ] GitHub Issues strukturieren (Good First Issue-Labels)
- [ ] Discord/Slack-Community aufbauen?

---

## 🟣 Phase 4: Monetarisierung (Nach 1.000+ Usern)

### 4.1 Cloud API
- [ ] Stripe-Integration
- [ ] User-Account-System (statt X-Client-Id)
- [ ] Rate-Limiting pro Tier
- [ ] AI Extraction Managed Service (kein BYOK nötig)

### 4.2 Pricing Tiers
- [ ] Free: ∞ Self-Host + 100 DOI-Checks/Tag Cloud
- [ ] Pro (€9/mo): Cloud-API + 1.000 AI-Extraktionen
- [ ] Team (€29/mo): 5.000 AI-Extraktionen + Workspace
- [ ] Enterprise (Custom): SSO, Audit, On-Premise

### 4.3 Alternatives
- [ ] GitHub Sponsors
- [ ] Konferenz-Sponsoring
- [ ] Consulting / Custom-Integrationen

---

## 📊 Meilensteine

| Meilenstein | Ziel | Status |
|---|---|---|
| 500 Chrome User | Q3 2026 | ❌ |
| 100 GitHub Stars | Q3 2026 | ❌ |
| 2.000 Landing Page Visits/Monat | Q3 2026 | ❌ |
| Product Hunt Launch | Q3 2026 | ❌ |
| 5.000 Chrome User | Q1 2027 | ❌ |
| 500 GitHub Stars | Q1 2027 | ❌ |
| Erster Paid User | Q4 2026 | ❌ |
| Break-Even Cloud API | Q2 2027 | ❌ |

---

## 🏷️ Marken-Assets (Referenz)

| Asset | Pfad |
|---|---|
| Logo SVG | `apps/landing/public/logo.svg` |
| Logo 16px | `apps/extension/extension/assets/icon16.png` |
| Logo 32px | `apps/extension/extension/assets/icon32.png` |
| Logo 48px | `apps/extension/extension/assets/icon48.png` |
| Logo 128px | `apps/extension/extension/assets/icon128.png` |
| Favicon Landing | `apps/landing/public/favicon.svg` + `.png` |
| Favicon Docs | `apps/docs/public/favicon.svg` + `.png` |
| OG Image Landing | `apps/landing/public/og.png` |
| OG Image Docs | `apps/docs/public/og.png` |

### Farben

| Rolle | Hex | Verwendung |
|---|---|---|
| Primary | `#4e2e92` | Überschriften, Buttons, Brand |
| Primary Light | `#6b4db8` | Hover, dekorativ |
| Primary Dark | `#3a1f6e` | Hintergründe |
| Secondary | `#1f6b7c` | Sekundärtexte, Borders |
| Secondary Light | `#45a3b5` | Dekorativ (kein Text) |
| Accent | `#c9952e` | CTAs, Badges, Highlights |
| Accent Light | `#e0b352` | Hover, dekorativ |
| Success | `#2d7a31` | Match-Scores, Status |
| Success Light | `#70c875` | Dekorativ, große Indikatoren |
| Gradient | Lila → Teal | Hero, Buttons, Header-Badge |
