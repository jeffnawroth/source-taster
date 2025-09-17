import { createApp } from 'vue'

import { setupApp } from '@/extension/logic/common-setup'

import { setupSidepanelVisibilityListener } from '@/extension/logic/sidepanelVisibilityListener'
import { bootstrapStorage } from '../logic/bootstrap'

import App from './Sidepanel.vue'

;

(async () => {
  await bootstrapStorage()
  setupSidepanelVisibilityListener()

  const app = createApp(App)
  setupApp(app)
  app.mount('#app')
})()
