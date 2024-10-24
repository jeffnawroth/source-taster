<script setup lang="ts">
import { localeOption } from '~/logic'
import OptionCategory from './OptionCategory.vue'
import OptionListItem from './OptionListItem.vue'

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
    >
      <v-select
        v-model="localeOption"
        :items="languages"
        :item-title="(option) => t(option.name.toLocaleLowerCase())"
        item-value="locale"
        hide-details
        density="compact"
        variant="solo"
        flat
      />
    </OptionListItem>
  </OptionCategory>
</template>
