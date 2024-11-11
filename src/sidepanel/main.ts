import { createApp } from 'vue'

import { setupApp } from '~/logic/common-setup'
import { setupSidepanelVisibilityListener } from '~/logic/sidepanelVisibilityListener'
import i18n from '~/plugins/i18n'
import pinia from '~/plugins/pinia'
import vuetify from '~/plugins/vuetify'

import App from './Sidepanel.vue'

setupSidepanelVisibilityListener()

const app = createApp(App).use(vuetify).use(i18n).use(pinia)
setupApp(app)
app.mount('#app')
