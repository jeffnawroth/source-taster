---
title: Überblick
outline: deep
---

# Überblick

Source Taster unterstützt Studierende und Forschende dabei, bibliografische Referenzen schnell zu prüfen. Das System besteht aus drei Kernbausteinen:

- **Browser-Extension (`apps/extension`)** – Eine Vue-3-Anwendung mit Vuetify, die Referenzen (Text, PDF, Kontextmenü) importiert, KI-gestützt extrahiert und verifizierte Treffer visualisiert.
- **API (`apps/api`)** – Ein Hono-Server auf Node.js 20, der KI-Extraktion, AnyStyle-Parsing, Datenbanksuchen (OpenAlex, Crossref, Semantic Scholar, Europe PMC, arXiv) sowie das deterministische Matching orchestriert.
- **Shared Types (`packages/types`)** – Zod-Schemas und TypeScript-Typen für CSL-JSON, API-Verträge, Matching-Konfigurationen und UI-Voreinstellungen. Extension und API nutzen sie gemeinsam.

Das VitePress-Projekt (`apps/docs`) liefert die Dokumentation in `apps/docs/en` und `apps/docs/de`.

## Ziele & Nutzen

- **Zuverlässigkeit** – Sämtliche Payloads werden per Zod validiert (z. B. `ApiExtractRequestSchema`, `ApiMatchRequestSchema`). Fehler werden über `registerOnError` in Hono einheitlich ausgegeben.
- **Nachvollziehbarkeit** – Matching-Resultate enthalten Feld-Scores, die in der UI farbcodiert dargestellt werden (siehe [Matching & Scoring](matching-scoring.md)).
- **Erweiterbarkeit** – KI-Provider sind abstrahiert (`ApiAIProviderSchema`, `AIProviderFactory`); zusätzliche Datenquellen lassen sich über Provider-Klassen anbinden.
- **Datenschutz** – Nutzer-API-Keys werden mit AES-256-GCM verschlüsselt in einem Key-File-Store abgelegt (`apps/api/src/secrets/keystore.ts`).

## Hauptfunktionen der Extension

- Import über Kontextmenü („Bibliographie prüfen“), PDF-Upload oder manuelle Texteingabe.
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
