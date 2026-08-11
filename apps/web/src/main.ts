import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from './App.vue'
import de from './locales/de.json'
import en from './locales/en.json'
import { router } from './router'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { de, en },
})

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          'primary': '#4e2e92',
          'primary-light': '#6b4db8',
          'primary-dark': '#3a1f6e',
          'secondary': '#1f6b7c',
          'secondary-light': '#45a3b5',
          'accent': '#c9952e',
          'accent-light': '#e0b352',
          'success': '#2d7a31',
          'success-light': '#70c875',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#6b4db8',
          secondary: '#45a3b5',
          accent: '#e0b352',
          success: '#70c875',
        },
      },
    },
  },
})

createApp(App).use(createPinia()).use(router).use(i18n).use(vuetify).mount('#app')
