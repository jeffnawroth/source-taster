import { setupApp } from '@/extension/logic/common-setup'

import { setupSidepanelVisibilityListener } from '@/extension/logic/sidepanelVisibilityListener'
import { createApp } from 'vue'

import App from './Sidepanel.vue'

setupSidepanelVisibilityListener()

const app = createApp(App)
setupApp(app)
app.mount('#app')
