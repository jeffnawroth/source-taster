---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
title: The Source Taster
titleTemplate: Browser extension for quick, reliable, and effortless source validation

hero:
  name: "The Source Taster"
  text: "The intuitive source validator for academic papers"
  tagline: "Browser extension for quick, reliable, and effortless source validation"
  image:
    src: /web-app-manifest-192x192.png
    alt: The Source Taster
  actions:
    - theme: brand
      text: Install
      link: https://chromewebstore.google.com/detail/the-source-taster/leggmjghcbdfilhfkgnllhnhhbalpanp?hl=de
    - theme: alt
      text: Demo
      link: /demo

features:
  - icon: 🔍
    title: Smart Detection
    details: Automatically identifies and extracts DOIs from academic papers, PDFs, and websites with intelligent pattern recognition

  - icon: ⚡
    title: Lightning Fast
    details: Get instant validation results through efficient API integration with Crossref and DOI resolution services

  - icon: 📊
    title: Clear Reports
    details: Generate comprehensive validation reports showing existing, missing, and invalid sources at a glance

  - icon: 🎯
    title: High Precision
    details: Ensures accurate source validation with multiple verification methods and cross-referencing

  - icon: 🔄
    title: Seamless Import
    details: Import sources through context menu, drag & drop PDFs, or direct text input for maximum flexibility

  - icon: 🌐
    title: Browser Integration
    details: Works right where you need it with convenient browser extension access and intuitive controls

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
