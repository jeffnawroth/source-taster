<script setup lang="ts">
import { mdiCloudOutline } from '@mdi/js'
import { type ApiAIModel, type ApiAIProvider, PROVIDER_LABELS, PROVIDER_MODELS, PROVIDERS } from '@source-taster/types'

const settings = defineModel<{
  provider: ApiAIProvider
  model: ApiAIModel
}>({ required: true })

const { t } = useI18n()

const providerOptions = computed<{ value: ApiAIProvider, title: string }[]>(() =>
  PROVIDERS.map(p => ({
    value: p,
    title: PROVIDER_LABELS[p],
  })),
)

const modelOptions = computed<{ value: ApiAIModel, title: string }[]>(() => {
  const provider = settings.value.provider as ApiAIProvider | undefined
  if (!provider)
    return []
  return PROVIDER_MODELS[provider].map(m => ({
    value: m,
    title: (t(`ai-models.${m.replace(/\./g, '-')}`) !== `ai-models.${m.replace(/\./g, '-')}` ? t(`ai-models.${m.replace(/\./g, '-')}`) : m),
  }))
})

watch(
  () => settings.value.provider,
  () => {
    const available = modelOptions.value
    if (available.length > 0) {
      const stillValid = available.some(m => m.value === settings.value.model)
      if (!stillValid) {
        settings.value = { ...settings.value, model: available[0].value as ApiAIModel }
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
      <p>{{ t('ai-settings-provider-label') }}</p>
    </template>
    <v-card-subtitle><p>{{ t('ai-settings-provider-hint') }}</p></v-card-subtitle>

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
