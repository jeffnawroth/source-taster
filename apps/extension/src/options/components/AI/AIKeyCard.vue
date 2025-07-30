<script setup lang="ts">
import type { AIProvider } from '@source-taster/types'
import { mdiCheckboxMarkedCircleOutline, mdiEye, mdiEyeOff, mdiInformation, mdiKeyOutline } from '@mdi/js'
import { ReferencesService } from '@/extension/services/referencesService'

// Props
interface Props {
  provider: AIProvider
}

const props = defineProps<Props>()

// Modern v-model with defineModel
const apiKey = defineModel<string>({ required: true })

// Local state
const showApiKey = ref(false)
const isTestingApiKey = ref(false)
const apiKeyTestResult = ref<{ success: boolean, message: string } | null>(null)

// TRANSLATION
const { t } = useI18n()

// Helper to get the correct API key link for each provider
const apiKeyLink = computed(() => {
  switch (props.provider) {
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
  switch (props.provider) {
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
  if (!apiKey.value) {
    return t('ai-settings-api-key-required')
  }
  if (!isValidApiKeyFormat(apiKey.value, props.provider)) {
    return t('ai-settings-invalid-api-key-format')
  }
  return null
})

// Test API key function
async function testApiKey() {
  if (!apiKey.value || apiKeyError.value) {
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
        v-model="apiKey"
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
        :disabled="!apiKey || !!apiKeyError"
        variant="tonal"
        color="primary"
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
</template>
