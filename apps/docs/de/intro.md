---
title: Überblick
outline: deep
---

# Überblick

**KI halluziniert gefälschte Referenzen.** ChatGPT und andere LLMs generieren bis zu 40 % erfundene Quellenangaben. The Source Taster erkennt sie — validiert in einer Masterarbeit an der Universität Siegen.

Das System hilft Studierenden und Forschenden, bibliografische Referenzen in Sekunden zu prüfen. Es extrahiert Referenzen aus Texten oder PDFs, durchsucht sie in 5 akademischen Datenbanken und bewertet jeden Treffer transparent — Feld für Feld.

## Kennzahlen

- **93 %** exakte APA-Trefferquote
- **100 %** Erkennung synthetisch erzeugter Halluzinationen
- **&lt;3 Sekunden** durchschnittliche Prüfzeit pro Referenz
- **97,2 %** F1-Score auf kuratierten Testsets (n=425 Umfrage + automatisierte Benchmarks)

## Wie es funktioniert

1. **Importieren** — Text einfügen, PDF hochladen oder per Rechtsklick eine Bibliographie auf beliebiger Seite auswählen.
2. **Extrahieren** — KI parst unstrukturierte Referenzen in strukturiertes CSL-JSON (Titel, Autoren, DOI, Jahr etc.).
3. **Suchen** — Jede Referenz wird gegen OpenAlex, Crossref, Semantic Scholar, Europe PMC und arXiv abgefragt.
4. **Abgleichen** — Deterministisches Scoring vergleicht extrahierte Daten mit Datenbankkandidaten. Ergebnisse zeigen eine farbcodierte Aufschlüsselung pro Feld.
5. **Prüfen** — Grün bedeutet verifiziert. Rot bedeutet verdächtig. Sie wissen sofort, welche Quellen vertrauenswürdig sind.

## Architektur

Das System besteht aus drei Kernbausteinen:

- **Browser-Extension (`apps/extension`)** — Eine Vue-3-Anwendung mit Vuetify, die Referenzen (Text, PDF, Kontextmenü) importiert, KI-gestützt extrahiert und verifizierte Treffer visualisiert.
- **API (`apps/api`)** — Ein Hono-Server auf Node.js 20, der KI-Extraktion, AnyStyle-Parsing, Datenbanksuchen (OpenAlex, Crossref, Semantic Scholar, Europe PMC, arXiv) sowie das deterministische Matching orchestriert.
- **Shared Types (`packages/types`)** — Zod-Schemas und TypeScript-Typen für CSL-JSON, API-Verträge, Matching-Konfigurationen und UI-Voreinstellungen. Extension und API nutzen sie gemeinsam.

## Hauptfunktionen der Extension

- Import über Kontextmenü („Bibliographie prüfen"), PDF-Upload oder manuelle Texteingabe.
- KI-Extraktion mit konfigurierbaren CSL-Feldern aus den Shared Defaults.
- AnyStyle-gestütztes Token-Labeling und manuelle Korrektur vor der CSL-Konvertierung.
- Recherche gegen priorisierte Datenbanken mit Early-Termination ab definiertem Score.
- Feldbasierte Match-Visualisierung mit farbcodierten Scores direkt in der UI.

## Hauptfunktionen der API

- `/api/extract`: KI-Extraktion mit `response_format=json_schema` und Fallback auf `json_object`.
- `/api/search/:database`: Provider-spezifische Suche mit DOI-/Identifier-Shortcuts und Query-Heuristiken.
- `/api/match`: Deterministisches Matching mit Normalisierungs- und Ähnlichkeitsheuristiken.
- `/api/anystyle/*`: Proxy zum AnyStyle-Ruby-Server für Tokenisierung und CSL-Konvertierung.
- `/api/user/ai-secrets`: Speichern, Auslesen und Löschen von Nutzer-Keys (per `X-Client-Id`).

Ein Ablauf von der Referenz bis zum Match ist in [Architektur](architecture.md) visualisiert.
