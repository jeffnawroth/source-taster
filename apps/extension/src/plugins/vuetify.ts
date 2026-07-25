import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'

import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

// Translations provided by Vuetify
import { de, en } from 'vuetify/locale'

// @ts-expect-error - vuetify styles import has TypeScript declaration issues
import 'vuetify/styles'

const brandLightColors = {
  'primary': '#5B2D8E',
  'primary-darken-1': '#3D1A6B',
  'primary-lighten-1': '#7B4DB8',
  'secondary': '#1A7A7A',
  'secondary-darken-1': '#0F5A5A',
  'secondary-lighten-1': '#3FA8A8',
  'accent': '#D4A030',
  'accent-darken-1': '#B07A1F',
  'accent-lighten-1': '#E0B85C',
  'success': '#2d7a31',
  'success-lighten-1': '#70c875',
  'on-primary': '#FFFFFF',
  'on-secondary': '#FFFFFF',
  'on-accent': '#FFFFFF',
  'on-success': '#FFFFFF',
} as const

const brandDarkColors = {
  'primary': '#7B4DB8',
  'primary-darken-1': '#5B2D8E',
  'primary-lighten-1': '#9B6BC8',
  'secondary': '#5CC0C0',
  'secondary-darken-1': '#1A7A7A',
  'secondary-lighten-1': '#7DD8D8',
  'accent': '#E8C870',
  'accent-darken-1': '#D4A030',
  'accent-lighten-1': '#F0D080',
  'success': '#70c875',
  'success-darken-1': '#2d7a31',
  'on-primary': '#FFFFFF',
  'on-secondary': '#FFFFFF',
  'on-accent': '#1a1408',
  'on-success': '#FFFFFF',
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
