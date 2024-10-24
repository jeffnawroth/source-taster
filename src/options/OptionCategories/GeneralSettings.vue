<script setup lang="ts">
import { autoImportOption } from '~/logic'
import OptionCategory from './OptionCategory.vue'
import OptionListItem from './OptionListItem.vue'

// i18n
const { t } = useI18n()
</script>

<template>
  <OptionCategory :subheader="t('general')">
    <OptionListItem
      :title="t('auto-import-dois')"
      :subtitle="t('auto-import-dois-description')"
      @click="autoImportOption = !autoImportOption"
    >
      <v-checkbox-btn
        v-model="autoImportOption"
        color="primary"
      />
    </OptionListItem>
  </OptionCategory>
</template>
