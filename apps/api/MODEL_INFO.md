# AnyStyle Model Training

## Custom Model (`custom.mod`)

The `custom.mod` file is generated at runtime when you use the `/train-model` endpoint. It combines:

- **AnyStyle Core Dataset** (~1,700 references)
- **Your custom training data**

## Training your model

```bash
curl -X POST http://localhost:4567/train-model \
  -H "Content-Type: application/json" \
  -d '{
    "tokens": [
      [
        ["author", "Smith,"],
        ["author", "J."],
        ["date", "(2023)."],
        ["title", "Example"],
        ["title", "Article"],
        ["container-title", "Journal"],
        ["container-title", "Name"]
      ]
    ]
  }'
```

## Model Info

- **Location**: `/app/custom.mod` (inside Docker container)
- **Size**: ~400KB+ (depending on training data)
- **Format**: Wapiti/CRF model file
- **Persistence**: Survives container restarts, lost on container recreation

## Note

The `*.mod` files are gitignored as they are:

- Large binary files
- Generated at runtime
- Contain user-specific training data
