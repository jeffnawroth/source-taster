<script setup lang="ts">
import type { AIModel } from '../../types'
import { mdiRobotHappyOutline, mdiStarFourPointsOutline } from '@mdi/js'
import { selectedAiModel, useAiExtraction } from '@/extension/logic'
import OptionListItem from '../components/OptionListItem.vue'

// i18n
const { t } = useI18n()

const aiModels = ref<Array<AIModel>>([
  { title: 'Gemini 2.5 Pro', model: 'gemini-2.5-pro-exp-03-25', description: t('gemini-2.5-pro-description'), service: 'gemini' },
  { title: 'Gemini 2.0 Flash', model: 'gemini-2.0-flash', description: t('gemini-2.0-flash-description'), service: 'gemini' },
  { title: 'Gemini 2.0 Flash-Lite', model: 'gemini-2.0-flash-lite', description: t('gemini-2.0-flash-lite-description'), service: 'gemini' },
  { title: 'GPT-4o', model: 'gpt-4o', description: t('gpt-4o-description'), service: 'openai' },
  { title: 'o3-mini', model: 'o3-mini', description: t('o3-mini-description'), service: 'openai' },
  { title: 'GPT-4.1 nano', model: 'gpt-4.1-nano', description: t('gpt-4.1-nano-description'), service: 'openai' },
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

        <p
          v-for="(aiModel, index) in aiModels"
          :key="aiModel.model"
          class="text-medium-emphasis mt-1"
        >
          <span class="font-weight-bold">{{ aiModel.title }}</span>
          <span class="text-medium-emphasis"> - {{ aiModel.description }}</span>
          <span
            v-if="index === 0"
            class="font-weight-bold"
          >{{ ` (${t('recommended')})` }} </span>
        </p>
      </template>
      <v-select
        v-model="selectedAiModel"
        :items="aiModels"
        item-value="model"
        item-title="title"
        density="compact"
        hide-details
        variant="solo-filled"
        return-object
      />
    </OptionListItem>
  </v-container>
</template>
