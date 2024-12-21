<script setup lang="ts">
import { aiExtractionOption, autoImportOption } from '~/logic'

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
        <p class="text-medium-emphasis mt-2">
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
    <OptionListItem
      :title="t('ai-extraction')"
      prepend-icon="mdi-star-four-points-outline"

      @click="aiExtractionOption = !aiExtractionOption"
    >
      <template #subtitle>
        <p>{{ t('ai-extraction-description') }}</p>
        <p class="text-medium-emphasis mt-2">
          <v-icon
            icon="mdi-information-outline"
            size="small"
          />
          {{ t('ai-extraction-description-info') }}
          <a
            class="text-decoration-none"
            href="https://ai.google.dev/"
          >
            {{ t('learn-more') }}
          </a>
        </p>
      </template>
      <v-checkbox-btn
        v-model="aiExtractionOption"
        color="primary"
      />
    </OptionListItem>
  </OptionCategory>
</template>
