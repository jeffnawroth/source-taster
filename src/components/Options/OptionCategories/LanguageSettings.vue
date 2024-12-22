<script setup lang="ts">
import { mdiTranslate } from '@mdi/js'
import { sendMessage } from 'webext-bridge/options'
import { localeOption } from '~/logic'

// I18n
const { t } = useI18n()

// Data
const languages = ref([
  { locale: 'de', name: 'German' },
  { locale: 'en', name: 'English' },
])

watchEffect(() => sendMessage('updateContextMenuWithLanguage', { locale: localeOption.value }, { context: 'background', tabId: 0 }))
</script>

<template>
  <OptionCategory :subheader="t('language')">
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
        density="compact"
        variant="solo-filled"
        flat
      />
    </OptionListItem>
  </OptionCategory>
</template>
