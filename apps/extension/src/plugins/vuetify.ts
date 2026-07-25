import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'

import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

// Translations provided by Vuetify
import { de, en } from 'vuetify/locale'

// @ts-expect-error - vuetify styles import has TypeScript declaration issues
import 'vuetify/styles'

const brandLightColors = {
  'primary': '#4e2e92',
  'primary-darken-1': '#3a1f6e',
  'primary-lighten-1': '#6b4db8',
  'secondary': '#1f6b7c',
  'secondary-darken-1': '#15505e',
  'secondary-lighten-1': '#45a3b5',
  'accent': '#c9952e',
  'accent-darken-1': '#a87a1f',
  'accent-lighten-1': '#e0b352',
  'success': '#2d7a31',
  'success-lighten-1': '#70c875',
  'on-primary': '#FFFFFF',
  'on-secondary': '#FFFFFF',
  'on-accent': '#FFFFFF',
  'on-success': '#FFFFFF',
} as const

const brandDarkColors = {
  'primary': '#8B78BF',
  'primary-darken-1': '#6b4db8',
  'primary-lighten-1': '#a796c8',
  'secondary': '#45a3b5',
  'secondary-darken-1': '#1f6b7c',
  'secondary-lighten-1': '#5cc0d4',
  'accent': '#e0b352',
  'accent-darken-1': '#c9952e',
  'accent-lighten-1': '#edcc7a',
  'success': '#70c875',
  'success-darken-1': '#2d7a31',
  'on-primary': '#1B102F',
  'on-secondary': '#082127',
  'on-accent': '#1a1408',
  'on-success': '#0a1f0b',
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
      // density: 'compact',
      size: 'small',
      slim: true,
    },
    VSwitch: {
      density: 'compact',
      hideDetails: true,
      flat: true,
    },
    VTextarea: {
      density: 'compact',
      hideDetails: true,
      flat: true,
    },
    VCard: {
      density: 'compact',
      flat: true,
    },
    VCardItem: {
      density: 'compact',
    },
    VList: {
      density: 'compact',
      slim: true,
    },
    VListItem: {
      density: 'compact',
      slim: true,
    },
    VAppBar: {
      density: 'compact',
      flat: true,
    },
    VAutocomplete: {
      density: 'compact',
      flat: true,
      hideDetails: true,
    },
    VFileInput: {
      density: 'compact',
      hideDetails: true,
      flat: true,
    },
    VRadioGroup: {
      density: 'compact',
      hideDetails: true,
    },
    VSelect: {
      density: 'compact',
      flat: true,
      hideDetails: true,
    },
    VSlider: {
      density: 'compact',
      hideDetails: true,
    },
    VRow: {
      dense: true,
    },
    VChip: {
      // density: 'compact',
      size: 'small',
    },
    VIcon: {
      size: 'small',
    },
    VTextField: {
      density: 'compact',
      hideDetails: true,
      flat: true,
    },
    VCheckbox: {
      hideDetails: true,
      density: 'compact',
    },
    VAlert: {
      density: 'compact',
    },
    VExpansionPanels: {
      flat: true,
    },
    VStepper: {
      flat: true,
    },
  },
})

export default vuetify
