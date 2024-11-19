---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "The Source Taster"
  text: "Der intuitive Quellen-Validator für akademische Arbeiten"
  tagline: "Schnell, zuverlässig und mühelos konzipiert."
  image:
    src: /web-app-manifest-192x192.png
    alt: The Source Taster
  actions:
    - theme: brand
      text: Herunterladen
      link: https://chromewebstore.google.com/detail/the-source-taster/leggmjghcbdfilhfkgnllhnhhbalpanp?hl=de

features:
  - icon: 🔍
    title: Intelligente Erkennung
    details: Identifiziert und extrahiert DOIs aus akademischen Arbeiten, PDFs und Websites mit intelligenter Mustererkennung

  - icon: ⚡
    title: Blitzschnell
    details: Erhalte sofortige Validierungsergebnisse durch effiziente API-Integration mit Crossref und DOI-Auflösungsdiensten

  - icon: 📊
    title: Übersichtliche Berichte
    details: Erstelle umfassende Validierungsberichte, die vorhandene, fehlende und ungültige Quellen auf einen Blick zeigen

  - icon: 🎯
    title: Hohe Genauigkeit
    details: Stellt eine genaue Quellenvalidierung mit mehreren Verifizierungsmethoden und Querverweisen sicher

  - icon: 🔄
    title: Nahtloser Import
    details: Importiere Quellen über das Kontextmenü, per Drag & Drop von PDFs oder direkte Texteingabe für maximale Flexibilität

  - icon: 🌐
    title: Browser-Integration
    details: Funktioniert direkt dort, wo du es brauchst, mit praktischem Browser-Erweiterungszugriff und intuitiver Bedienung

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
