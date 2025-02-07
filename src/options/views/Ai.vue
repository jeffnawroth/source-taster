<script setup lang="ts">
import { mdiInformationOutline, mdiStarFourPointsOutline } from '@mdi/js'
import { useAiExtraction } from '~/logic'

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
          <v-icon
            :icon="mdiInformationOutline"
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

      <OptionSwitch
        v-model="useAiExtraction"
      />
    </OptionListItem>
  </v-container>
</template>
