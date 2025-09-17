---
layout: home
title: The Source Taster
titleTemplate: Browser-Erweiterung und API für automatisierte Quellenprüfung

hero:
  name: "The Source Taster"
  text: "Browser-Erweiterung und API für automatisierte Quellenprüfung"
  tagline: "Extrahiere, suche und verifiziere Quellen in wenigen Minuten"
  image:
    src: /web-app-manifest-192x192.png
    alt: The Source Taster
  actions:
    - theme: brand
      text: Installieren
      link: https://chromewebstore.google.com/detail/the-source-taster/leggmjghcbdfilhfkgnllhnhhbalpanp?hl=de
    - theme: alt
      text: Dokumentation
      link: /de/intro
    - theme: alt
      text: Demo
      link: /demo

features:
  - icon: 🤖
    title: KI-gestützte Extraktion
    details: Wandle Rohtext oder PDFs per Zod-validierter CSL-JSON-Struktur und konfigurierbaren Feld-Presets um.

  - icon: 🌐
    title: Multi-Source-Suche
    details: Durchsuche OpenAlex, Crossref, Semantic Scholar, Europe PMC und arXiv mit priorisierter Early-Termination für hohe Scores.

  - icon: 📊
    title: Deterministisches Matching
    details: Nutze gewichtete Felder, Normalisierungsregeln und detaillierte Score-Auswertungen direkt in der UI.

  - icon: 🧩
    title: AnyStyle-Integration
    details: Tokenisiere Referenzen, bearbeite Labels manuell und konvertiere sie vor Suche und Matching in CSL.

  - icon: 🧭
    title: Entwicklerfreundlicher Workflow
    details: Gemeinsame TypeScript-Typen, pnpm-Workspaces und Vite-Tooling beschleunigen Backend-, Extension- und Docs-Entwicklung.

  - icon: 🔐
    title: Sichere Schlüsselverwaltung
    details: Speichere Nutzer-API-Keys verschlüsselt im Backend-Keystore, während die Extension selbst keine sensiblen Daten hält.

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
