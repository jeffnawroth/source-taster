<script setup lang="ts">
import type { AIModel, AIProvider, UserAISettings } from '@source-taster/types'
import { mdiCloud, mdiEye, mdiEyeOff, mdiInformation, mdiKey, mdiRobot } from '@mdi/js'
import { AI_PROVIDERS, PROVIDER_MODELS } from '@source-taster/types'

// Modern v-model with defineModel
const settings = defineModel<UserAISettings>({ required: true })

// Show/hide API key
const showApiKey = ref(false)

// TRANSLATION
const { t } = useI18n()

// Provider options for select
const providerOptions = computed(() =>
  Object.entries(AI_PROVIDERS).map(([key, label]) => ({
    value: key,
    title: label,
  })),
)

// Model options for select based on selected provider
const modelOptions = computed(() => {
  const provider = settings.value.provider as keyof typeof PROVIDER_MODELS
  if (!provider || !PROVIDER_MODELS[provider])
    return []

  return PROVIDER_MODELS[provider].map((key) => {
    const translationKey = `ai-models.${key}`
    // Check if translation exists, fallback to key if not
    const translatedTitle = t(translationKey)
    const title = translatedTitle !== translationKey ? translatedTitle : key

    return {
      value: key,
      title,
    }
  })
})

// Watch for provider changes and auto-select first available model
watch(
  () => settings.value.provider,
  (_newProvider) => {
    const availableModels = modelOptions.value
    if (availableModels.length > 0) {
      // Check if current model is still valid for new provider
      const currentModelValid = availableModels.some(model => model.value === settings.value.model)
      if (!currentModelValid) {
        // Auto-select first model for new provider
        settings.value.model = availableModels[0].value as AIModel
      }
    }
  },
  { immediate: true },
)

// Helper to get the correct API key link for each provider
const apiKeyLink = computed(() => {
  switch (settings.value.provider) {
    case 'openai':
      return 'https://platform.openai.com/api-keys'
    case 'anthropic':
      return 'https://console.anthropic.com/settings/keys'
    case 'google':
      return 'https://aistudio.google.com/app/apikey'
    default:
      return 'https://platform.openai.com/api-keys'
  }
})

// Helper to get the correct API key help text for each provider
const apiKeyHelpText = computed(() => {
  switch (settings.value.provider) {
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
function isValidApiKeyFormat(key: string, provider: AIProvider): boolean {
  switch (provider) {
    case 'openai':
      return key.startsWith('sk-') && key.length > 20
    case 'anthropic':
      return key.startsWith('sk-ant-') && key.length > 20
    case 'google':
      return key.length > 20 // Google API keys have different format
    default:
      return key.length > 10 // Generic validation
  }
}

// API key validation - now required
const apiKeyError = computed(() => {
  if (!settings.value.apiKey) {
    return t('ai-settings-api-key-required')
  }
  if (!isValidApiKeyFormat(settings.value.apiKey, settings.value.provider)) {
    return t('ai-settings-invalid-api-key-format')
  }
  return null
})
</script>

<template>
  <v-card
    flat
    :title="t('ai-settings-title')"
    :subtitle="t('ai-settings-subtitle')"
  >
    <v-card-text>
      <!-- AI Provider Selection -->
      <v-select
        v-model="settings.provider"
        :label="t('ai-settings-provider-label')"
        :items="providerOptions"
        :hint="t('ai-settings-provider-hint')"
        persistent-hint
        class="mb-4"
      >
        <template #prepend-inner>
          <v-icon :icon="mdiCloud" />
        </template>
      </v-select>

      <!-- API Key Input (always shown - required) -->
      <v-text-field
        v-model="settings.apiKey"
        :label="t('ai-settings-api-key-label')"
        :placeholder="t('ai-settings-api-key-placeholder')"
        :hint="t('ai-settings-api-key-hint')"
        :type="showApiKey ? 'text' : 'password'"
        :error-messages="apiKeyError"
        required
        persistent-hint
        class="mb-4"
      >
        <template #prepend-inner>
          <v-icon :icon="mdiKey" />
        </template>
        <template #append-inner>
          <v-btn
            :icon="showApiKey ? mdiEyeOff : mdiEye"
            variant="text"
            size="small"
            @click="showApiKey = !showApiKey"
          />
        </template>
      </v-text-field>

      <!-- API Key Help -->
      <v-alert
        type="info"
        variant="tonal"
        class="mb-4"
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

      <!-- Model Selection -->
      <v-select
        v-model="settings.model"
        :label="t('ai-settings-model-label')"
        :items="modelOptions"
        :hint="t('ai-settings-model-hint')"
        persistent-hint
        class="mb-4"
      >
        <template #prepend-inner>
          <v-icon :icon="mdiRobot" />
        </template>
      </v-select>

      <!-- Model Cost Information -->
      <v-alert
        type="warning"
        variant="tonal"
      >
        {{ t('ai-settings-cost-warning') }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>
