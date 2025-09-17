<script setup lang="ts">
import { mdiInformation } from '@mdi/js'
import { settings } from '@/extension/logic'

const { t } = useI18n()

// Helper to get the correct API key help text for each provider
const apiKeyHelpText = computed(() => {
  switch (settings.value.ai.provider) {
    case 'openai':
      return t('ai-settings-api-key-help-openai')
    case 'anthropic':
      return t('ai-settings-api-key-help-anthropic')
    case 'google':
      return t('ai-settings-api-key-help-google')
    default:
      return t('ai-settings-api-key-help')
  }
})

// Helper to get the correct API key link for each provider
const apiKeyLink = computed(() => {
  switch (settings.value.ai.provider) {
    case 'openai':
      return 'https://platform.openai.com/api-keys'
    case 'anthropic':
      return 'https://console.anthropic.com/settings/keys'
    case 'google':
      return 'https://aistudio.google.com/app/apikey'
    case 'deepseek':
      return 'https://platform.deepseek.com/api_keys'
    default:
      return 'https://platform.openai.com/api-keys'
  }
})
</script>

<template>
  <v-alert
    type="info"
    variant="tonal"
    density="compact"
  >
    <template #prepend>
      <v-icon :icon="mdiInformation" />
    </template>
    <div class="text-body-2">
      {{ apiKeyHelpText }}
      <a
        :href="apiKeyLink"
        target="_blank"
        class="text-decoration-none"
      >
        {{ t('ai-settings-get-api-key') }}
      </a>
    </div>
  </v-alert>
</template>
