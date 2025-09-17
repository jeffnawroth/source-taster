<script setup lang="ts">
import { mdiTranslate } from '@mdi/js'
import { useLocale } from 'vuetify'
import { sendMessage } from 'webext-bridge/options'
import { localeOption } from '@/extension/logic/storage'

// LOCALE
const { t } = useI18n()
const { locale } = useI18n()
const { current } = useLocale()

const languages = ref([
  { locale: 'de', name: 'German' },
  { locale: 'en', name: 'English' },
])

watchEffect(() => {
  locale.value = localeOption.value
  current.value = localeOption.value
})

watchEffect(() => sendMessage('updateContextMenuWithLanguage', { locale: localeOption.value }, { context: 'background', tabId: 0 }))
</script>

<template>
  <SettingsPageLayout
    :icon="mdiTranslate"
    :title="t('language')"
    :description="t('language-description')"
  >
    <OptionListItem
      :title="t('language')"
      :subtitle="t('language-option-description')"
      :prepend-icon="mdiTranslate"
    >
      <v-select
        v-model="localeOption"
        :items="languages"
        :item-title="(option) => t(option.name.toLocaleLowerCase())"
        item-value="locale"
        hide-details
        width="150"
        density="compact"
        variant="solo-filled"
        flat
      />
    </OptionListItem>
  </SettingsPageLayout>
</template>
