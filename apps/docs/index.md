---
layout: home
title: The Source Taster
titleTemplate: Browser extension and API for automated source verification

hero:
  name: "The Source Taster"
  text: "Automated academic reference verification"
  tagline: "Extract, search, and validate references across 5 databases — <3 seconds per source.<br><strong>Detects AI-hallucinated references with 100% accuracy.</strong>"
  image:
    src: /web-app-manifest-192x192.png
    alt: The Source Taster
  actions:
    - theme: brand
      text: Install Extension
      link: https://chromewebstore.google.com/detail/the-source-taster/leggmjghcbdfilhfkgnllhnhhbalpanp
    - theme: alt
      text: Documentation
      link: /intro

features:
  - icon: 🤖
    title: AI-Powered Extraction
    details: Parse references from text or PDF into structured CSL-JSON. Supports OpenAI, Anthropic, Google, and DeepSeek — with Zod validation on every output.

  - icon: 🌐
    title: 5-Database Search
    details: Simultaneously search OpenAlex, Crossref, Semantic Scholar, Europe PMC, and arXiv. Smart early termination finds matches faster.

  - icon: 📊
    title: Transparent Scoring
    details: Weighted field-level matching with Levenshtein-Damerau distance. See exactly why a reference matched — or why it didn't.

  - icon: 📄
    title: PDF Import
    details: Drag-and-drop PDFs. Full text is parsed, all embedded references are extracted automatically.

  - icon: ⚡
    title: Batch Verification
    details: Check entire reference lists at once. Average <3 seconds per reference — 93% APA exact match rate.

  - icon: 🔐
    title: Privacy-First
    details: Stateless extension. API keys encrypted with AES-256-GCM. No telemetry. Your data stays yours.

---

<style>
@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
