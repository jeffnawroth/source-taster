import type { App } from 'vue'
import i18n from '@/extension/plugins/i18n'
import pinia from '@/extension/plugins/pinia'

import vuetify from '@/extension/plugins/vuetify'

export function setupApp(app: App) {
  // Inject a globally available `$app` object in template
  app.config.globalProperties.$app = {
    context: '',
  }

  // Provide access to `app` in script setup with `const app = inject('app')`
  app.provide('app', app.config.globalProperties.$app)

  app.use(i18n).use(pinia).use(vuetify)
  // Here you can install additional plugins for all contexts: popup, options page and content-script.

  // example: app.use(i18n)
  // example excluding content-script context: if (context !== 'content-script') app.use(i18n)
}
