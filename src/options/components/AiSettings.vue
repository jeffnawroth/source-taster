<script setup lang="ts">
import { mdiInformationOutline, mdiStarFourPointsOutline } from '@mdi/js'
import { aiExtractionOption, geminiApiKey, isGeminiApiKeyValid } from '~/logic'
import AIUsageList from './AIUsageList.vue'

// i18n
const { t } = useI18n()

const disabled = computed(() => !geminiApiKey.value || !isGeminiApiKeyValid.value)
</script>

<template>
  <OptionCategory
    :subheader="t('ai')"
  >
    <OptionListItem
      :title="t('ai-extraction')"
      :prepend-icon="mdiStarFourPointsOutline"
      @click="disabled || (aiExtractionOption = !aiExtractionOption)"
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
        v-model="aiExtractionOption"
        :disabled="!geminiApiKey"
      />
    </OptionListItem>
    <v-list-item>
      <AIApiKeyInput />
    </v-list-item>
    <v-divider />

    <AIUsageList :disabled />
  </OptionCategory>
</template>
