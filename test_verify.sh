# Test: Database Verification
curl -X POST http://localhost:3001/api/v1/verify \
  -H "Content-Type: application/json" \
  -d '{
    "references": [
      {
        "id": "ref1",
        "originalText": "Smith, J. (2023). Machine Learning in Practice. Nature, 600, 123-130.",
        "type": "academic",
        "metadata": {
          "title": "Machine Learning in Practice",
          "authors": ["Smith, J."],
          "journal": "Nature",
          "year": 2023,
          "pages": "123-130",
          "volume": "600"
        },
        "extractedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "databases": ["openalex", "crossref"],
    "verificationMethod": "fuzzy",
    "aiService": "openai"
  }'
