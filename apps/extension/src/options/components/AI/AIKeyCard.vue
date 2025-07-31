<script setup lang="ts">
import type { AIProvider } from '@source-taster/types'
import { mdiKeyOutline } from '@mdi/js'

const props = defineProps<{
  provider: AIProvider
}>()

const { t } = useI18n()

// Modern v-model with defineModel
const apiKey = defineModel<string>({ required: true })

// API key validation - now required
const apiKeyError = computed(() => {
  if (!apiKey.value) {
    return t('ai-settings-api-key-required')
  }
  if (!isValidApiKeyFormat(apiKey.value, props.provider)) {
    return t('ai-settings-invalid-api-key-format')
  }
  return null
})

function isValidApiKeyFormat(key: string, provider: AIProvider): boolean {
  switch (provider) {
    case 'openai':
      return key.startsWith('sk-') && key.length > 20
    case 'anthropic':
      return key.startsWith('sk-ant-') && key.length > 20
    case 'google':
      return key.length > 20 // Google API keys have different format
    case 'deepseek':
      return key.startsWith('sk-') && key.length > 20
    default:
      return key.length > 10 // Generic validation
  }
}

// Local state
const apiKeyTestResult = ref<{ success: boolean, message: string } | null>(null)
</script>

<template>
  <v-card
    variant="text"
    rounded="xl"
    density="compact"
  >
    <template #prepend>
      <v-icon :icon="mdiKeyOutline" />
    </template>
    <template #title>
      <p>
        {{ t('ai-settings-api-key-label') }}
      </p>
    </template>

    <v-card-subtitle>
      <p>
        {{ t('ai-settings-api-key-hint') }}
      </p>
    </v-card-subtitle>
    <v-card-text>
      <!-- API Key Input -->
      <p class="font-weight-bold mb-2">
        {{ t('ai-settings-api-key-label') }}
      </p>
      <APIKeyInput
        v-model="apiKey"
        :provider
        :api-key-error
      />

      <APIKeyTestBtn
        v-model="
          apiKeyTestResult"
        :api-key
        :api-key-error
      />

      <!-- Test Result Alert -->
      <v-alert
        v-if="apiKeyTestResult"
        :type="apiKeyTestResult.success ? 'success' : 'error'"
        variant="tonal"
        density="compact"
        class="mb-3"
      >
        {{ apiKeyTestResult.message }}
      </v-alert>

      <APIKeyLink
        :provider="props.provider"
      />
    </v-card-text>
  </v-card>
</template>
