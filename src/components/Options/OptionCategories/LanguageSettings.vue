<script setup lang="ts">
import { localeOption } from '~/logic'

// I18n
const { t } = useI18n()

// Data
const languages = ref([
  { locale: 'de', name: 'German' },
  { locale: 'en', name: 'English' },
])
</script>

<template>
  <OptionCategory :subheader="t('language')">
    <OptionListItem
      :title="t('language')"
      :subtitle="t('language-option-description')"
      prepend-icon="mdi-translate"
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
