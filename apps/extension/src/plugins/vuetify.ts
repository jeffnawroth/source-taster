import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'

import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

// Translations provided by Vuetify
import { de, en } from 'vuetify/locale'

// @ts-expect-error - vuetify styles import has TypeScript declaration issues
import 'vuetify/styles'

const brandLightColors = {
  'primary': '#4F2D91',
  'primary-darken-1': '#43267B',
  'primary-lighten-1': '#7257A7',
  'secondary': '#4266AC',
  'secondary-darken-1': '#385792',
  'secondary-lighten-1': '#6885BD',
  'accent': '#45A2B5',
  'accent-darken-1': '#3B8A9A',
  'accent-lighten-1': '#6AB5C4',
  'on-primary': '#FFFFFF',
  'on-secondary': '#FFFFFF',
  'on-accent': '#FFFFFF',
} as const

const brandDarkColors = {
  'primary': '#8B78BF',
  'primary-darken-1': '#7257A7',
  'primary-lighten-1': '#A796C8',
  'secondary': '#5C80C3',
  'secondary-darken-1': '#4266AC',
  'secondary-lighten-1': '#6D90CD',
  'accent': '#45A2B5',
  'accent-darken-1': '#3B8A9A',
  'accent-lighten-1': '#60B5C5',
  'on-primary': '#1B102F',
  'on-secondary': '#0A172D',
  'on-accent': '#082127',
} as const

const vuetify = createVuetify({
  locale: {
    locale: 'en',
    fallback: 'en',
    messages: { de, en },
  },
  components,
  directives,
  theme: {
    defaultTheme: 'system',
    themes: {
      light: {
        colors: {
          ...brandLightColors,
        },
      },
      dark: {
        dark: true,
        colors: {
          ...brandDarkColors,
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  defaults: {
    VBtn: {
      color: 'primary',
    },
  },
})

export default vuetify
