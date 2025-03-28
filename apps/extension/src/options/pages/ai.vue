<script setup lang="ts">
import { selectedAiModel, useAiExtraction } from '@/extension/logic'
import { mdiRobotHappyOutline, mdiStarFourPointsOutline } from '@mdi/js'
import OptionListItem from '../components/OptionListItem.vue'

// i18n
const { t } = useI18n()

const aiModels = ref([
  { title: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro-exp-03-25', description: t('gemini-2.5-pro-description') },
  { title: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash', description: t('gemini-2.0-flash-description') },
  { title: 'Gemini 2.0 Flash-Lite', value: 'gemini-2.0-flash-lite', description: t('gemini-2.0-flash-lite-description') },
])
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
          {{ t('ai-extraction-description-info') }}
        </p>
        <p class="text-medium-emphasis mt-2">
          {{ t('ai-extraction-description-limit') }}
        </p>
      </template>

      <OptionSwitch
        v-model="useAiExtraction"
      />
    </OptionListItem>

    <v-divider class="my-4" />

    <OptionListItem
      :title="t('ai-model')"
      :prepend-icon="mdiRobotHappyOutline"
    >
      <template #subtitle>
        <p class="mb-1">
          {{ t('ai-model-description') }}
        </p>

        <p v-for="(model, index) in aiModels" :key="model.value" class="text-medium-emphasis mt-1">
          <span class="font-weight-bold">{{ model.title }}</span>
          <span class="text-medium-emphasis"> - {{ model.description }}</span>
          <span v-if="index === 0" class="font-weight-bold">{{ ` (${t('recommended')})` }} </span>
        </p>
      </template>
      <v-select
        v-model="selectedAiModel"
        :items="aiModels"
        item-value="value"
        item-title="title"
        density="compact"
        hide-details
        variant="solo-filled"
      />
    </OptionListItem>
  </v-container>
</template>
