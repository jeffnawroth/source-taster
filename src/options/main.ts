import { createApp } from 'vue'

import { setupApp } from '~/logic/common-setup'

import router from '../plugins/router'
import App from './Options.vue'

const app = createApp(App)

app.use(router)
setupApp(app)
app.mount('#app')
