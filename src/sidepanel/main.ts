import { createApp } from 'vue'

import { setupApp } from '~/logic/common-setup'
import { setupSidepanelVisibilityListener } from '~/logic/sidepanelVisibilityListener'

import App from './Sidepanel.vue'

setupSidepanelVisibilityListener()

const app = createApp(App)
setupApp(app)
app.mount('#app')
