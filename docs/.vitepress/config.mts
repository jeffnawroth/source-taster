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
})
