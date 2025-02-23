<script setup lang="ts">
import { useAiExtraction } from '@/extension/logic'
import { mdiStarFourPointsOutline } from '@mdi/js'

// i18n
const { t } = useI18n()
</script>

<template>
  <v-container>
    <p class="text-h5 font-weight-bold mb-3">
      {{ t('ai') }}
    </p>

    <p class="text-body-2 text-medium-emphasis">
      {{ t('ai-description') }}
    </p>

    <v-divider class="my-4" />

    <OptionListItem
      :title="t('ai-extraction')"
      :prepend-icon="mdiStarFourPointsOutline"
      @click="useAiExtraction = !useAiExtraction"
    >
      <template #subtitle>
        <p>{{ t('ai-extraction-description') }}</p>
        <p class="text-medium-emphasis mt-2">
          {{ t('ai-extraction-description-info') }}
        </p>
        <p class="text-medium-emphasis mt-2">
          {{ t('ai-extraction-description-limit') }}
        </p>
      </template>

      <OptionSwitch
        v-model="useAiExtraction"
      />
    </OptionListItem>
  </v-container>
</template>
