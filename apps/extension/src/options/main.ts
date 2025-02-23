import { setupApp } from '@/extension/logic/common-setup'

import { createApp } from 'vue'

import router from '../plugins/router'
import App from './Options.vue'

const app = createApp(App)

app.use(router)
setupApp(app)
app.mount('#app')
