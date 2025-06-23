#!/bin/bash

echo "Testing website verification endpoint..."

curl -X POST http://localhost:8000/api/verify/websites \
  -H "Content-Type: application/json" \
  -d '{
    "references": [
      {
        "id": "web1",
        "originalText": "OpenAI Research Paper on GPT Models - https://openai.com/research",
        "type": "website",
        "metadata": {
          "title": "OpenAI Research",
          "url": "https://openai.com/research",
          "authors": ["OpenAI Team"]
        },
        "extractedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "aiService": "openai"
  }' | jq .
