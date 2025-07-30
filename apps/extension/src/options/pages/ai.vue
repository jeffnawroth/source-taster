<script setup lang="ts">
import type { AIModel, AIProvider } from '@source-taster/types'
import { mdiCheckboxMarkedCircleOutline, mdiCloudOutline, mdiCogOutline, mdiEye, mdiEyeOff, mdiInformation, mdiKeyOutline } from '@mdi/js'
import { AI_PROVIDERS, PROVIDER_MODELS } from '@source-taster/types'
import { aiSettings } from '@/extension/logic/storage'
import { ReferencesService } from '@/extension/services/referencesService'

// AI settings using the global storage
const settings = aiSettings

// Show/hide API key
const showApiKey = ref(false)

// API Key testing state
const isTestingApiKey = ref(false)
const apiKeyTestResult = ref<{ success: boolean, message: string } | null>(null)

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
    // Convert dots to dashes for i18n key compatibility
    const i18nKey = key.replace(/\./g, '-')
    const translationKey = `ai-models.${i18nKey}`
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
    case 'deepseek':
      return 'https://platform.deepseek.com/api_keys'
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
    case 'deepseek':
      return key.startsWith('sk-') && key.length > 20
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

// Current provider and model display
const currentProviderDisplayName = computed(() => {
  return AI_PROVIDERS[settings.value.provider] || settings.value.provider
})

const currentModelDisplayName = computed(() => {
  // Convert dots to dashes for i18n key compatibility
  const i18nKey = settings.value.model.replace(/\./g, '-')
  const translationKey = `ai-models.${i18nKey}`
  // Check if translation exists, fallback to key if not
  const translatedTitle = t(translationKey)
  return translatedTitle !== translationKey ? translatedTitle : settings.value.model
})

// Test API key function
async function testApiKey() {
  if (!settings.value.apiKey || apiKeyError.value) {
    return
  }

  isTestingApiKey.value = true
  apiKeyTestResult.value = null

  try {
    // Use the ReferencesService to test the API key with a simple extraction
    const testText = 'Test citation: Smith, J. (2024). A test paper. Journal of Testing, 1(1), 1-5.'
    const references = await ReferencesService.extractReferences(testText)

    if (references && references.length > 0) {
      apiKeyTestResult.value = {
        success: true,
        message: t('api-key-test-success'),
      }
    }
    else {
      apiKeyTestResult.value = {
        success: false,
        message: t('api-key-test-failed'),
      }
    }
  }
  catch (error) {
    apiKeyTestResult.value = {
      success: false,
      message: error instanceof Error ? error.message : t('api-key-test-error'),
    }
  }
  finally {
    isTestingApiKey.value = false
  }
}
</script>

<template>
  <SettingsPageLayout
    :icon="mdiCogOutline"
    :title="t('ai-settings-title')"
    :description="t('ai-settings-subtitle')"
  >
    <!-- AI Provider Selection -->
    <v-card
      density="compact"
      variant="text"
    >
      <template #prepend>
        <v-icon :icon="mdiCloudOutline" />
      </template>
      <template #title>
        <p>
          {{ t('ai-settings-provider-label') }}
        </p>
      </template>

      <v-card-subtitle>
        <p>
          {{ t('ai-settings-api-key-hint') }}
        </p>
      </v-card-subtitle>
      <v-card-text>
        <p class="font-weight-bold mb-2">
          {{ t('provider') }}
        </p>
        <v-select
          v-model="settings.provider"
          :items="providerOptions"
          density="compact"
          variant="solo-filled"
          flat
          hide-details
        />

        <!-- Model Selection (only show if provider is selected) -->
        <div
          v-if="settings.provider && modelOptions.length > 0"
          class="mt-4"
        >
          <p class="font-weight-bold mb-2">
            {{ t('ai-settings-model-label') }}
          </p>
          <v-select
            v-model="settings.model"
            :items="modelOptions"
            density="compact"
            variant="solo-filled"
            flat
            hide-details
          />
        </div>

        <v-chip
          density="compact"
          :text="`${currentProviderDisplayName} • ${currentModelDisplayName}`"
          variant="tonal"
          class="mt-4"
        />
      </v-card-text>
    </v-card>

    <v-divider class="my-4" />

    <!-- API Key Configuration -->
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
        <v-text-field
          v-model="settings.apiKey"
          :placeholder="t('ai-settings-api-key-placeholder')"
          :type="showApiKey ? 'text' : 'password'"
          :error-messages="apiKeyError"
          density="compact"
          variant="solo-filled"
          flat
          clearable
          class="mb-3"
        >
          <template #append-inner>
            <v-btn
              :icon="showApiKey ? mdiEyeOff : mdiEye"
              variant="text"
              size="small"
              @click="showApiKey = !showApiKey"
            />
          </template>
        </v-text-field>

        <!-- API Key Test Section -->
        <v-btn
          :disabled="!settings.apiKey || !!apiKeyError"
          variant="outlined"
          rounded="lg"
          class="mb-3"
          @click="testApiKey"
        >
          <template #prepend>
            <v-progress-circular
              v-if="isTestingApiKey"
              size="20"
              width="2"
              indeterminate
            />
            <v-icon
              v-else
              :icon="mdiCheckboxMarkedCircleOutline"
            />
          </template>
          {{ t('test-api-key') }}
        </v-btn>

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

        <!-- API Key Help Information -->
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
      </v-card-text>
    </v-card>
  </SettingsPageLayout>
</template>
