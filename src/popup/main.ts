import { createApp } from 'vue'

import { setupApp } from '~/logic/common-setup'
import i18n from '~/plugins/i18n'
import vuetify from '~/plugins/vuetify'

import App from './Popup.vue'
// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const app = createApp(App).use(vuetify).use(i18n)

setupApp(app)
app.mount('#app')
