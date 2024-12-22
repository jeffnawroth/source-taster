import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'

import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

import de from '~/locales/de.json'

import en from '~/locales/en.json'
import 'vuetify/styles'

const vuetify = createVuetify({
  locale: {
    locale: 'en',
    fallback: 'en',
    messages: { de, en },
  },
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})

export default vuetify
