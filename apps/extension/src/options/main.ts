import { createApp } from 'vue'

import { setupApp } from '@/extension/logic/common-setup'

import { bootstrapStorage } from '../logic/bootstrap'
import router from '../plugins/router'
import App from './Options.vue'

;

(async () => {
  await bootstrapStorage()

  const app = createApp(App)
  app.use(router)
  setupApp(app)
  app.mount('#app')
})()
