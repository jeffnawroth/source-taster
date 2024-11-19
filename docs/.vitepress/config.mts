import { defineConfig } from 'vitepress'

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
    logo: '/favicon.svg',

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
    },
    de: {
      label: 'German',
      lang: 'de',
      description: 'Überprüfe schnell die Gültigkeit akademischer Quellen über DOIs',
      themeConfig: {
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
