import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'

import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

// Translations provided by Vuetify
import { de, en } from 'vuetify/locale'

// @ts-expect-error - vuetify styles import has TypeScript declaration issues
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
