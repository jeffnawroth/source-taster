# Test: Referenzen extrahieren
curl -X POST http://localhost:3001/api/v1/extract \
  -H "Content-Type: application/json" \
  -d '{
    "text": "In recent studies, Smith et al. (2023) demonstrated significant results in machine learning applications. See also Johnson, M. (2022). Deep Learning Fundamentals. Journal of AI Research, 15(3), 123-145. DOI: 10.1000/182. Additionally, refer to https://example.com/research-paper for more details.",
    "aiService": "openai",
    "model": "gpt-3.5-turbo",
    "options": {
      "language": "en",
      "includeContext": true
    }
  }'
