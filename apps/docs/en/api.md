---
title: API Reference
outline: deep
---

# API Reference

- **Base URL (dev):** `http://localhost:8000`
- **Format:** JSON (`application/json`)
- **Headers:**
  - `Content-Type: application/json`
  - `X-Client-Id: <uuid-v4>` – required for `/api/extract` and `/api/user/*`, optional elsewhere.
- **Response envelope:**

```json
{
  "success": true,
  "data": {},
  "error": "optional",
  "message": "optional"
}
```

## Error Codes

| Code                              | Meaning                                               |
| --------------------------------- | ----------------------------------------------------- |
| `validation_error`                | Zod validation failed.                                |
| `bad_request`                     | Invalid request parameters.                           |
| `unauthorized`                    | `X-Client-Id` missing or no API key stored.           |
| `forbidden`                       | CORS/restrictions deny access.                        |
| `not_found`                       | Resource or database does not exist.                  |
| `conflict`                        | Conflicting state (e.g. duplicate key).               |
| `unprocessable`                   | Semantically invalid content.                         |
| `rate_limited`                    | Upstream rate limit reached.                          |
| `upstream_error`                  | External service failed (AnyStyle, AI, data sources). |
| `server_error` / `internal_error` | Unexpected server error.                              |

`registerOnError` in `apps/api/src/errors` maps runtime errors to this structure.

## Endpoints

### GET `/`

Health/info endpoint.

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

Extract references from free text via AI.

- **Headers:** `X-Client-Id`, `Content-Type: application/json`
- **Request body:**

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

  - `extractionSettings` optional; defaults cover all CSL fields except `id`.
  - `aiSettings` must match the stored provider/key. In development the API falls back to `OPENAI_API_KEY` when no user key exists.

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
- **Failure modes:**
  - `401 unauthorized` when no key is stored and `OPENAI_API_KEY` is missing.
  - `502 upstream_error` on AI timeouts or invalid JSON output.

---

### POST `/api/search/:database`

Search in a single database.

- **Path parameter:** `database ∈ {openalex, crossref, semanticscholar, europepmc, arxiv}`
- **Request body:**
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
- **Provider specifics:**
  - DOI shortcuts (OpenAlex, Crossref, Semantic Scholar, Europe PMC).
  - Identifier lookups for arXiv IDs, PMID, PMCID, ISSN, etc.
  - Query heuristics combining title/author/year filters.
- **Errors:**
  - `404 not_found` if `:database` is unsupported.
  - Provider-specific `upstream_error` (rate limits, outages).

---

### POST `/api/match`

Match one reference against supplied candidates.

- **Request body:**
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
  All sections are optional; defaults come from `DEFAULT_MATCHING_SETTINGS` (see [Data Models](data-models.md)).
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
- **Heuristics:** described in [Matching & Scoring](matching-scoring.md).

---

### AnyStyle Proxy

#### POST `/api/anystyle/parse`

- **Body:** `{ "input": ["Smith, J., Example Article, 2024"] }`
- **Response:** `{ "references": [{ "id": "fa8c3f40-6ed9-4c74-9cf4-08c46bdc7b4b", "originalText": "Smith, J., Example Article, 2024", "tokens": [["author", "Smith"], ["title", "Example Article"]] }] }`

#### POST `/api/anystyle/convert-to-csl`

- **Body:** `{ "references": [{ "id": "fa8c3f40-6ed9-4c74-9cf4-08c46bdc7b4b", "tokens": [["author", "Smith"], ["title", "Example Article"]] }] }`
- **Response:** `{ "csl": [{ "title": "Example Article", "author": [{ "family": "Smith", "given": "John" }] }] }`

Client errors (`4xx`) and server errors (`5xx`) from AnyStyle are passed through as `bad_request` or `upstream_error`.

---

### User Secrets

#### POST `/api/user/ai-secrets`

- **Headers:** `X-Client-Id`
- **Body:** `{ "provider": "openai", "apiKey": "sk-live-example-key" }`
- **Response:** `{ "success": true, "data": { "saved": true } }`

#### GET `/api/user/ai-secrets?provider=openai`

- **Response:** `{ "success": true, "data": { "hasApiKey": true, "provider": "openai" } }`

#### DELETE `/api/user/ai-secrets?provider=openai`

- **Response:** `{ "success": true, "data": { "deleted": true } }`

The keystore encrypts values via AES-256-GCM and stores them in `KEYSTORE_DIR`.

---

## Example Flow (curl)

1. **Extract** (see above).
2. **Search**:
   ```bash
   curl -X POST http://localhost:8000/api/search/openalex \
     -H 'Content-Type: application/json' \
     -d '{"references":[{"id":"8f9c4b2e-3b9c-4ef1-9fbf-9f1f0c93a111","metadata":{"id":"8f9c4b2e-3b9c-4ef1-9fbf-9f1f0c93a111","title":"Example Article"}}]}'
   ```
3. **Match**:
   ```bash
   curl -X POST http://localhost:8000/api/match \
     -H 'Content-Type: application/json' \
     -d '{"reference":{"id":"8f9c4b2e-3b9c-4ef1-9fbf-9f1f0c93a111","metadata":{"id":"8f9c4b2e-3b9c-4ef1-9fbf-9f1f0c93a111","title":"Example Article"}},"candidates":[{"id":"c40b55dd-3f5f-42d4-9b5b-6f4aab559201","metadata":{"id":"candidate-1","title":"Candidate Article"}}]}'
   ```

## TODOs

- **TODO:** Document upcoming `match-mode: custom` behaviour once it is exposed.
- **TODO:** Clarify the authentication model if the API becomes publicly hosted.
