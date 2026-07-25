export interface T {
  lang: string
  url: string
  altUrl: string
  pages: {
    de: string
    en: string
  }
  header: {
    logo: string
    features: string
    evaluation: string
    pricing: string
    faq: string
    install: string
  }
  hero: {
    title: string
    sub: string
    cta: string
    github: string
    stats: { num: string, label: string }[]
  }
  problem: {
    title: string
    desc: string
    items: { num: string, text: string }[]
    quote: string
    quoteAuthor: string
  }
  features: {
    title: string
    sub: string
    items: { icon: string, title: string, desc: string, color: string }[]
  }
  how: {
    title: string
    sub: string
    steps: { title: string, desc: string }[]
  }
  eval: {
    title: string
    sub: string
    cards: { num: string, label: string, desc: string, color: string }[]
    badges: string[]
  }
  tech: {
    title: string
    sub: string
    items: { title: string, entries: string[] }[]
  }
  faq: {
    title: string
    sub: string
    items: { q: string, a: string }[]
  }
  install: {
    title: string
    sub: string
    chrome: string
    firefox: string
    chromeLabel: string
    firefoxLabel: string
    note: string
  }
  pricing: {
    title: string
    sub: string
    mostPopular: string
    comingSoon: string
    tiers: {
      name: string
      price: string
      period: string
      desc: string
      popular?: boolean
      comingSoon?: boolean
      features: string[]
      cta: string
      ctaLink: string
      color: string
    }[]
  }
  social: {
    title: string
    sub: string
    cards: { num: string, label: string, desc: string, color: string }[]
    quote: string
    quoteAuthor: string
  }
  footer: {
    mit: string
    thesis: string
    github: string
    releases: string
    issues: string
  }
}
