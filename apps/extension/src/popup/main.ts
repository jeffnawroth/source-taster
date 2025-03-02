import { setupApp } from '@/extension/logic/common-setup'

import { createApp } from 'vue'
import App from './Popup.vue'

const app = createApp(App)

setupApp(app)
app.mount('#app')
