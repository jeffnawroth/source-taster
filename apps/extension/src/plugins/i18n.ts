import messages from '@intlify/unplugin-vue-i18n/messages'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  legacy: false,
  messages,
})

export default i18n
