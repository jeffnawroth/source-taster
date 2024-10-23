import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import de from '~/locales/de.json'
import en from '~/locales/en.json'

import '@mdi/font/css/materialdesignicons.css'
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
})

export default vuetify
