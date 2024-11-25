<script setup lang="ts">
import { autoImportOption } from '~/logic'

// i18n
const { t } = useI18n()
</script>

<template>
  <OptionCategory
    :subheader="t('general')"
  >
    <OptionListItem
      :title="t('auto-import-dois')"
      prepend-icon="mdi-auto-upload"

      @click="autoImportOption = !autoImportOption"
    >
      <template #subtitle>
        <p>{{ t('auto-import-dois-description') }}</p>
        <p class="text-medium-emphasis mt-1">
          <v-icon
            icon="mdi-information-outline"
            size="small"
          />
          {{ t('auto-import-dois-info') }}
        </p>
      </template>
      <v-checkbox-btn
        v-model="autoImportOption"
        color="primary"
      />
    </OptionListItem>
  </OptionCategory>
</template>
