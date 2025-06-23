#!/bin/bash

echo "Testing verification endpoint..."

curl -X POST http://localhost:8000/api/verify \
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
      }
    ],
    "databases": ["openalex", "crossref"],
    "verificationMethod": "fuzzy",
    "aiService": "openai"
  }' | jq .
