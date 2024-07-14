import { createApp } from 'vue'
import '../styles'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './Options.vue'
import { setupApp } from '~/logic/common-setup'

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App).use(vuetify)

setupApp(app)
app.mount('#app')
