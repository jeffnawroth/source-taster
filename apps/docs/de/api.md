---
title: API-Referenz
outline: deep
---

# API-Referenz

- **Basis-URL (Dev):** `http://localhost:8000`
- **Format:** JSON (`application/json`)
- **Header:**
  - `Content-Type: application/json`
  - `X-Client-Id: <uuid-v4>` – Pflicht für `/api/extract` und `/api/user/*`, optional für andere Endpoints.
- **Antwortschema:**

```json
{
  "success": true,
  "data": {},
  "error": "optional",
  "message": "optional"
}
```

## Fehlercodes

| Code                              | Bedeutung                                              |
| --------------------------------- | ------------------------------------------------------ |
| `validation_error`                | Zod-Validierung fehlgeschlagen.                        |
| `bad_request`                     | Ungültige Anfrageparameter.                            |
| `unauthorized`                    | `X-Client-Id` fehlt oder kein API-Key gespeichert.     |
| `forbidden`                       | CORS oder Berechtigungen verhindern Zugriff.           |
| `not_found`                       | Ressource/Database unbekannt.                          |
| `conflict`                        | Konflikt (z. B. doppelter Key).                        |
| `unprocessable`                   | Inhalt semantisch ungültig.                            |
| `rate_limited`                    | Upstream-Rate-Limit erreicht.                          |
| `upstream_error`                  | Fehler in externem Dienst (AnyStyle, KI, Datenbanken). |
| `server_error` / `internal_error` | Unerwarteter Serverfehler.                             |

`registerOnError` mappt Laufzeitfehler auf dieses Format.

## Endpoints

### GET `/`

Kurzer Health-/Info-Endpunkt.

```json
{
  "name": "Source Taster API",
  "endpoints": {
    "anystyle": "/api/anystyle",
    "extract": "/api/extract",
    "search": "/api/search",
    "match": "/api/match"
  }
}
```

---

### POST `/api/extract`

Extrahiert Referenzen aus freiem Text via KI.

- **Header:** `X-Client-Id`, `Content-Type: application/json`
- **Request Body:**

  ```json
  {
    "text": "Smith, J. (2024). Example Article. Journal of Testing, 12(3), 45-67.",
    "extractionSettings": {
      "extractionConfig": {
        "variables": ["title", "author", "issued", "DOI"]
      }
    },
    "aiSettings": {
      "provider": "openai",
      "model": "gpt-4.1"
    }
  }
  ```

  - `extractionSettings` optional; Defaults decken alle CSL-Felder außer `id` ab.
  - `aiSettings` muss zum gespeicherten Provider/Key passen. Fallback: `OPENAI_API_KEY` im DEV.

- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "references": [
        {
          "id": "8f9c4b2e-3b9c-4ef1-9fbf-9f1f0c93a111",
          "originalText": "Smith, J. (2024). Example Article. Journal of Testing, 12(3), 45-67.",
          "metadata": {
            "id": "a2d1fa76-79c8-4f2e-9d47-7c7bd2c36d11",
            "title": "Example Article",
            "author": [
              { "family": "Smith", "given": "John" }
            ],
            "issued": { "date-parts": [[2024, 3, 12]] },
            "DOI": "10.1234/example"
          }
        }
      ]
    }
  }
  ```
- **Fehlerfälle:**
  - `401 unauthorized`, wenn kein API-Key vorliegt und `OPENAI_API_KEY` fehlt.
  - `502 upstream_error` bei KI-Zeitüberschreitungen oder ungültigem JSON.

---

### POST `/api/search/:database`

Recherche in einer einzelnen Datenbank.

- **Pfad-Parameter:** `database ∈ {openalex, crossref, semanticscholar, europepmc, arxiv}`
- **Request Body:**
  ```json
  {
    "references": [
      {
        "id": "8f9c4b2e-3b9c-4ef1-9fbf-9f1f0c93a111",
        "metadata": {
          "id": "8f9c4b2e-3b9c-4ef1-9fbf-9f1f0c93a111",
          "title": "Example Article",
          "author": [
            { "family": "Smith", "given": "John" }
          ],
          "issued": { "date-parts": [[2024]] },
          "DOI": "10.1234/example"
        }
      }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "results": [
        {
          "referenceId": "8f9c4b2e-3b9c-4ef1-9fbf-9f1f0c93a111",
          "candidates": [
            {
              "id": "c40b55dd-3f5f-42d4-9b5b-6f4aab559201",
              "source": "openalex",
              "metadata": {
                "id": "https://openalex.org/W1234567890",
                "title": "Example Article",
                "author": [
                  { "family": "Smith", "given": "John" },
                  { "family": "Doe", "given": "Jane" }
                ],
                "issued": { "date-parts": [[2024, 1, 5]] },
                "DOI": "10.1234/example"
              },
              "url": "https://doi.org/10.1234/example"
            }
          ]
        }
      ]
    }
  }
  ```
- **Provider-Spezifika:**
  - DOI-Shortcuts (OpenAlex, Crossref, Semantic Scholar, Europe PMC).
  - Identifier: arXiv-ID, PMID, PMCID, ISSN etc.
  - Query-Heuristiken (Titel + Autor + Jahr).
- **Fehler:**
  - `404 not_found`, wenn `:database` unbekannt.
  - Provider-spezifische `upstream_error` (Rate-Limits, Ausfälle).

---

### POST `/api/match`

Vergleicht eine Referenz mit übergebenen Kandidaten.

- **Request Body:**
  ```json
  {
    "reference": {
      "id": "8f9c4b2e-3b9c-4ef1-9fbf-9f1f0c93a111",
      "metadata": {
        "id": "8f9c4b2e-3b9c-4ef1-9fbf-9f1f0c93a111",
        "title": "Example Article",
        "author": [
          { "family": "Smith", "given": "John" }
        ]
      }
    },
    "candidates": [
      {
        "id": "c40b55dd-3f5f-42d4-9b5b-6f4aab559201",
        "metadata": {
          "id": "candidate-1",
          "title": "Candidate Article"
        }
      }
    ],
    "matchingSettings": {
      "matchingStrategy": {
        "mode": "balanced",
        "normalizationRules": ["normalize-typography", "match-author-initials", "match-structured-dates"]
      },
      "matchingConfig": {
        "fieldConfigurations": {
          "title": { "enabled": true, "weight": 30 },
          "author": { "enabled": true, "weight": 25 },
          "issued": { "enabled": true, "weight": 15 },
          "container-title": { "enabled": true, "weight": 15 },
          "DOI": { "enabled": true, "weight": 10 },
          "volume": { "enabled": true, "weight": 3 },
          "page": { "enabled": true, "weight": 2 }
        }
      }
    }
  }
  ```
  Alle Felder optional – Defaults stammen aus `DEFAULT_MATCHING_SETTINGS` (siehe [Datenmodelle](data-models.md)).
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "evaluations": [
        {
          "candidateId": "c40b55dd-3f5f-42d4-9b5b-6f4aab559201",
          "matchDetails": {
            "overallScore": 93,
            "fieldDetails": [
              { "field": "title", "fieldScore": 100 },
              { "field": "author", "fieldScore": 92 },
              { "field": "issued", "fieldScore": 85 }
            ]
          }
        }
      ]
    }
  }
  ```
- **Heuristiken:** siehe [Matching & Scoring](matching-scoring.md).

---

### AnyStyle-Proxy

#### POST `/api/anystyle/parse`

- **Body:** `{ "input": ["Smith, J., Example Article, 2024"] }`
- **Antwort:** `{ "references": [{ "id": "fa8c3f40-6ed9-4c74-9cf4-08c46bdc7b4b", "originalText": "Smith, J., Example Article, 2024", "tokens": [["author", "Smith"], ["title", "Example Article"]] }] }`

#### POST `/api/anystyle/convert-to-csl`

- **Body:** `{ "references": [{ "id": "fa8c3f40-6ed9-4c74-9cf4-08c46bdc7b4b", "tokens": [["author", "Smith"], ["title", "Example Article"]] }] }`
- **Antwort:** `{ "csl": [{ "title": "Example Article", "author": [{ "family": "Smith", "given": "John" }] }] }`

Fehler werden 1:1 als `bad_request` oder `upstream_error` durchgereicht.

---

### Nutzer-Keys

#### POST `/api/user/ai-secrets`

- **Header:** `X-Client-Id`
- **Body:** `{ "provider": "openai", "apiKey": "sk-live-example-key" }`
- **Antwort:** `{ "success": true, "data": { "saved": true } }`

#### GET `/api/user/ai-secrets?provider=openai`

- **Antwort:** `{ "success": true, "data": { "hasApiKey": true, "provider": "openai" } }`

#### DELETE `/api/user/ai-secrets?provider=openai`

- **Antwort:** `{ "success": true, "data": { "deleted": true } }`

Der KeyStore verschlüsselt Werte (AES-256-GCM) und speichert sie in `KEYSTORE_DIR`.

---

## Beispiel-Flow (curl)

1. **Extraktion** – siehe oben.
2. **Suche**:
   ```bash
   curl -X POST http://localhost:8000/api/search/openalex \
     -H 'Content-Type: application/json' \
     -d '{"references":[{"id":"8f9c4b2e-3b9c-4ef1-9fbf-9f1f0c93a111","metadata":{"id":"8f9c4b2e-3b9c-4ef1-9fbf-9f1f0c93a111","title":"Example Article"}}]}'
   ```
3. **Matching**:
   ```bash
   curl -X POST http://localhost:8000/api/match \
     -H 'Content-Type: application/json' \
     -d '{"reference":{"id":"8f9c4b2e-3b9c-4ef1-9fbf-9f1f0c93a111","metadata":{"id":"8f9c4b2e-3b9c-4ef1-9fbf-9f1f0c93a111","title":"Example Article"}},"candidates":[{"id":"c40b55dd-3f5f-42d4-9b5b-6f4aab559201","metadata":{"id":"candidate-1","title":"Example Article"}}]}'
   ```

## TODOs

- **TODO:** Dokumentieren, wie `match-mode: custom` funktioniert, sobald verfügbar.
- **TODO:** Authentifizierungsstrategie definieren, falls ein öffentliches Hosting geplant ist.
