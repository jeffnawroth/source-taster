---
layout: home
title: The Source Taster
titleTemplate: Browser extension and API for automated source verification

hero:
  name: "The Source Taster"
  text: "Browser extension and API for automated source verification"
  tagline: "Extract, search, and validate academic references in minutes"
  image:
    src: /web-app-manifest-192x192.png
    alt: The Source Taster
  actions:
    - theme: brand
      text: Install
      link: https://chromewebstore.google.com/detail/the-source-taster/leggmjghcbdfilhfkgnllhnhhbalpanp
    - theme: alt
      text: Documentation
      link: /en/intro
    - theme: alt
      text: Demo
      link: /demo

features:
  - icon: 🤖
    title: AI-Assisted Extraction
    details: Convert raw text or PDFs into structured CSL-JSON using shared Zod schemas and configurable field presets.

  - icon: 🌐
    title: Multi-Source Lookup
    details: Query OpenAlex, Crossref, Semantic Scholar, Europe PMC, and arXiv with prioritised early termination for high scores.

  - icon: 📊
    title: Deterministic Matching
    details: Apply weighted field scoring, normalisation rules, and detailed match breakdowns surfaced directly in the UI.

  - icon: 🧩
    title: AnyStyle Integration
    details: Tokenise references, edit labels manually, and convert them into CSL before running searches and matching.

  - icon: 🧭
    title: Developer-Friendly Workflow
    details: Shared TypeScript types, pnpm workspaces, and Vite tooling streamline backend, extension, and docs development.

  - icon: 🔐
    title: Secure Key Handling
    details: Store user API keys encrypted in the backend keystore while keeping the extension stateless for sensitive data.

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
