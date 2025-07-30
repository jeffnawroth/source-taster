<script setup lang="ts">
import type { AIModel, AIProvider } from '@source-taster/types'
import { mdiCloudOutline } from '@mdi/js'
import { AI_PROVIDERS, PROVIDER_MODELS } from '@source-taster/types'

// Modern v-model with defineModel
const settings = defineModel<{
  provider: AIProvider
  model: AIModel
}>({ required: true })

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
        settings.value = {
          ...settings.value,
          model: availableModels[0].value as AIModel,
        }
      }
    }
  },
  { immediate: true },
)
</script>

<template>
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
        {{ t('ai-settings-provider-hint') }}
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
    </v-card-text>
  </v-card>
</template>
