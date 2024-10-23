import { createApp } from 'vue'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { setupApp } from '~/logic/common-setup'
import i18n from '~/plugins/i18n'
import App from './Sidepanel.vue'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
  },
})
const app = createApp(App).use(vuetify).use(i18n)
setupApp(app)
app.mount('#app')
