---
title: Architektur
outline: deep
---

# Architektur

## Komponenten

- **Browser-Extension** (Vue 3, Pinia, Vuetify): UI-Schicht, verwaltet WebExtension-Storage (`clientId`, Einstellungen) und kommuniziert per `fetch` mit der API.
- **Source Taster API** (Hono): Stellt `/api/extract`, `/api/search/:database`, `/api/match`, `/api/anystyle/*`, `/api/user/*` bereit.
- **AnyStyle-Server** (Ruby, Sinatra): Tokenisiert Referenzen und konvertiert sie in CSL.
- **Externe Datenquellen**: OpenAlex, Crossref, Semantic Scholar, Europe PMC, arXiv.
- **Shared Types** (`@source-taster/types`): CSL-JSON-Schemata, API-Verträge, Matching-Konfigurationen.

```mermaid
flowchart LR
  Extension[Browser-Extension
  Vue + Vuetify] -->|fetch + X-Client-Id| API[(Hono API)]
  API -->|parse/convert| AnyStyle[(AnyStyle Server
  Ruby 3.2)]
  API -->|HTTPS| OpenAlex[(OpenAlex)]
  API -->|HTTPS| Crossref[(Crossref)]
  API -->|HTTPS| Semantic[(Semantic Scholar)]
  API -->|HTTPS| Europe[(Europe PMC)]
  API -->|HTTPS| Arxiv[(arXiv)]
  API -->|LLM-Extraktion| AIProviders[(AI-Provider
  OpenAI / Anthropic / Google / DeepSeek)]
  TypesNode["@source-taster/types"]
  Extension -. imports .-> TypesNode
  API -. imports .-> TypesNode
```

## Sequenz: „Extrahieren & Verifizieren“

```mermaid
sequenceDiagram
  participant User
  participant Ext as Extension
  participant API as Hono API
  participant LLM as AI-Provider
  participant Any as AnyStyle
  participant OA as OpenAlex & Co.

  User->>Ext: Text / PDF bereitstellen
  Ext->>Ext: PDF-Text extrahieren (unpdf)
  Ext->>API: POST /api/extract (X-Client-Id)
  API->>LLM: KI-Provider anfragen (OpenAI / Anthropic / Google / DeepSeek)
  LLM-->>API: Strukturierte Referenzen
  API->>Any: POST /parse (optional AnyStyle-Workflow)
  API-->>Ext: Extrahierte CSL-Referenzen
  Ext->>Ext: Einstellungen anwenden (Felder, Matching)
  Ext->>API: POST /api/search/openalex
  API->>OA: DOI- / Query-Suche
  OA-->>API: Kandidaten
  API-->>Ext: Kandidatenliste
  Ext->>API: POST /api/match (Referenz + Kandidaten)
  API->>API: DeterministicEngine.matchReference
  API-->>Ext: Scores & Felddetails
  Ext-->>User: Visualisierung & Export
```

## Schichten & Verantwortlichkeiten

| Schicht        | Verantwortung                                                                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Extension UI   | UX, lokales Speichermanagement und Orchestrierung von Extraktion → Suche → Matching.                                                                      |
| API-Controller | Zod-Parsing, Header-Validierung (`X-Client-Id`), Fehlerbehandlung via `registerOnError`.                                                                  |
| Services       | Extraction (`ReferenceExtractionCoordinator`), Search (`SearchCoordinator` + Provider), Matching (`DeterministicEngine`), Secrets (`UserSecretsService`). |
| Provider       | Je Datenquelle eine Klasse mit DOI-/Identifier-Shortcuts und Query-Heuristiken.                                                                           |
| Utils          | Normalisierung, Ähnlichkeitsfunktionen, dynamische Zod-Schemata für LLM-Antworten.                                                                        |

## Datenflüsse & Speicherung

- Die **clientId** wird einmalig per `useWebExtensionStorage` erzeugt und bei `/api/extract` sowie `/api/user/*` gesendet.
- **Nutzer-API-Keys** werden AES-256-GCM-verschlüsselt in `.keystore/` abgelegt (konfigurierbar).
- **Matching-Ergebnisse** werden serverseitig nicht persistiert; der Browser hält den Zustand.
- **AnyStyle** läuft als separater Service (Docker-Compose-Service `anystyle`).

## Fehler- & Logging-Konzept

- `registerOnError` mappt `ZodError` auf `validation_error`, `HTTPException` auf passende Codes (z. B. `unauthorized`).
- Provider loggen Warnungen bei niedrigen Rate-Limits (`OpenAlexProvider.checkRateLimit`, `CrossrefProvider`, …).
- Im DEV-Modus erlaubt `corsMiddleware` alle Origins; in PROD sind `ALLOWED_EXTENSION_IDS` erforderlich.

Weitere Details findest du in der [API-Referenz](api.md) sowie bei den [Matching- und Scoring-Regeln](matching-scoring.md).
