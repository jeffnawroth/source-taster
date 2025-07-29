<script setup lang="ts">
import type { UserAISettings } from '@source-taster/types'
import { mdiEye, mdiEyeOff, mdiInformation, mdiKey, mdiRobot } from '@mdi/js'
import { OPENAI_MODELS } from '@source-taster/types'

// Modern v-model with defineModel
const settings = defineModel<UserAISettings>({ required: true })

// Show/hide API key
const showApiKey = ref(false)

// TRANSLATION
const { t } = useI18n()

// Model options for select
const modelOptions = computed(() =>
  Object.entries(OPENAI_MODELS).map(([key, label]) => ({
    value: key,
    title: label,
  })),
)

// Helper to validate API key format (basic OpenAI format check)
function isValidApiKeyFormat(key: string): boolean {
  return key.startsWith('sk-') && key.length > 20
}

// API key validation - now required
const apiKeyError = computed(() => {
  if (!settings.value.apiKey) {
    return t('ai-settings-api-key-required')
  }
  if (!isValidApiKeyFormat(settings.value.apiKey)) {
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
          {{ t('ai-settings-api-key-help') }}
          <a
            href="https://platform.openai.com/api-keys"
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
