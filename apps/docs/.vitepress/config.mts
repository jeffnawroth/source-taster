import type { DefaultTheme } from 'vitepress'
import { defineConfig } from 'vitepress'
import pkg from '../../extension/package.json'

const englishSidebar: DefaultTheme.Sidebar = {
  '/en/': [
    {
      text: 'Guide',
      items: [
        { text: 'Overview', link: '/en/intro' },
        { text: 'Development', link: '/en/development' },
        { text: 'Browser Extension', link: '/en/extension' },
      ],
    },
    {
      text: 'Reference',
      items: [
        { text: 'Architecture', link: '/en/architecture' },
        { text: 'API Reference', link: '/en/api' },
        { text: 'Data Models & Schemas', link: '/en/data-models' },
        { text: 'Matching & Scoring', link: '/en/matching-scoring' },
        { text: 'Migration', link: '/en/migration' },
        { text: 'Changelog', link: '/en/changelog' },
      ],
    },
  ],
}

const germanSidebar: DefaultTheme.Sidebar = {
  '/de/': [
    {
      text: 'Leitfaden',
      items: [
        { text: 'Überblick', link: '/de/intro' },
        { text: 'Entwicklung', link: '/de/development' },
        { text: 'Browser-Extension', link: '/de/extension' },
      ],
    },
    {
      text: 'Referenz',
      items: [
        { text: 'Architektur', link: '/de/architecture' },
        { text: 'API-Referenz', link: '/de/api' },
        { text: 'Datenmodelle & Schemas', link: '/de/data-models' },
        { text: 'Matching & Scoring', link: '/de/matching-scoring' },
        { text: 'Migration', link: '/de/migration' },
        { text: 'Changelog', link: '/de/changelog' },
      ],
    },
  ],
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'The Source Taster',
  description: 'Quickly check the validity of academic sources via DOIs',
  lang: 'en-US',
  appearance: 'dark',

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
  ],

  themeConfig: {
    nav: nav(),
    logo: '/favicon.svg',
    sidebar: englishSidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/jeffnawroth/source-taster' },
    ],
    footer: {
      copyright: 'Copyright © 2024-present Jeff Nawroth',
      message: 'Released under the MIT License.',
    },
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: nav(),
        sidebar: englishSidebar,
      },
    },
    de: {
      label: 'Deutsch',
      lang: 'de',
      link: '/de/',
      description: 'Überprüfe schnell die Gültigkeit akademischer Quellen über DOIs',
      themeConfig: {
        nav: navDe(),
        sidebar: germanSidebar,
        footer: {
          message: 'Veröffentlicht unter der MIT-Lizenz.',
          copyright: 'Urheberrecht © 2024-heute Jeff Nawroth',
        },
        darkModeSwitchTitle: 'Wechseln zum dunklen Thema',
        lightModeSwitchTitle: 'Wechsel zum hellen Thema',
      },
    },
  },
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Documentation',
      items: [
        { text: 'Overview', link: '/en/intro' },
        { text: 'API Reference', link: '/en/api' },
      ],
    },
    {
      text: `v${pkg.version}`,
      items: [
        {
          text: 'Releases',
          link: 'https://github.com/jeffnawroth/source-taster/releases',
        },
      ],
    },
  ]
}

function navDe(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Dokumentation',
      items: [
        { text: 'Überblick', link: '/de/intro' },
        { text: 'API-Referenz', link: '/de/api' },
      ],
    },
    {
      text: `v${pkg.version}`,
      items: [
        {
          text: 'Releases',
          link: 'https://github.com/jeffnawroth/source-taster/releases',
        },
      ],
    },
  ]
}
