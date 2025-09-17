import { createApp } from 'vue'

import { setupApp } from '@/extension/logic/common-setup'
import { bootstrapStorage } from '../logic/bootstrap'
import App from './Popup.vue'

;

(async () => {
  await bootstrapStorage()

  const app = createApp(App)
  setupApp(app)
  app.mount('#app')
})()
