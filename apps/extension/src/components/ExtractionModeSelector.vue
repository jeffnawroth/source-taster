<script setup lang="ts">
import { mdiHelpCircleOutline } from '@mdi/js'
import { ExtractionMode } from '@source-taster/types'

// PROPS
interface Props {
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  title: undefined,
  description: undefined,
})

// MODEL
const extractionMode = defineModel<ExtractionMode>({ required: true })

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <!-- Mode Selection -->
  <div class="mb-0">
    <div class="d-flex align-center justify-space-between mb-2">
      <v-radio
        v-model="extractionMode"
        :value="ExtractionMode.STRICT"
        class="flex-grow-1"
      >
        <template #label>
          <div>
            <div class="font-weight-medium">
              🔒 {{ t('extraction-mode-strict') }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ t('extraction-mode-strict-description') }}
            </div>
          </div>
        </template>
      </v-radio>
      <v-tooltip
        location="left"
        max-width="400"
      >
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            :icon="mdiHelpCircleOutline"
            size="small"
            class="text-medium-emphasis ml-2"
          />
        </template>
        <div class="pa-2">
          <div class="font-weight-bold mb-2">
            {{ t('extraction-mode-strict-tooltip.title') }}
          </div>
          <div class="mb-2">
            {{ t('extraction-mode-strict-tooltip.description') }}
          </div>

          <div class="font-weight-medium mb-1">
            {{ t('extraction-mode-strict-tooltip.what-happens') }}
          </div>
          <ul class="text-caption mb-2">
            <li>{{ t('extraction-mode-strict-tooltip.happens-1') }}</li>
            <li>{{ t('extraction-mode-strict-tooltip.happens-2') }}</li>
          </ul>

          <div class="font-weight-medium mb-1">
            {{ t('extraction-mode-strict-tooltip.what-not-happens') }}
          </div>
          <ul class="text-caption">
            <li>{{ t('extraction-mode-strict-tooltip.not-happens-1') }}</li>
            <li>{{ t('extraction-mode-strict-tooltip.not-happens-2') }}</li>
            <li>{{ t('extraction-mode-strict-tooltip.not-happens-3') }}</li>
            <li>{{ t('extraction-mode-strict-tooltip.not-happens-4') }}</li>
          </ul>
        </div>
      </v-tooltip>
    </div>

    <div class="d-flex align-center justify-space-between mb-2">
      <v-radio
        v-model="extractionMode"
        :value="ExtractionMode.BALANCED"
        class="flex-grow-1"
      >
        <template #label>
          <div>
            <div class="font-weight-medium">
              ⚖️ {{ t('extraction-mode-balanced') }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ t('extraction-mode-balanced-description') }}
            </div>
          </div>
        </template>
      </v-radio>
      <v-tooltip
        location="left"
        max-width="400"
      >
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            :icon="mdiHelpCircleOutline"
            size="small"
            class="text-medium-emphasis ml-2"
          />
        </template>
        <div class="pa-2">
          <div class="font-weight-bold mb-2">
            {{ t('extraction-mode-balanced-tooltip.title') }}
          </div>
          <div class="mb-2">
            {{ t('extraction-mode-balanced-tooltip.description') }}
          </div>

          <div class="font-weight-medium mb-1">
            {{ t('extraction-mode-balanced-tooltip.what-happens') }}
          </div>
          <ul class="text-caption mb-2">
            <li>{{ t('extraction-mode-balanced-tooltip.happens-1') }}</li>
            <li>{{ t('extraction-mode-balanced-tooltip.happens-2') }}</li>
            <li>{{ t('extraction-mode-balanced-tooltip.happens-3') }}</li>
            <li>{{ t('extraction-mode-balanced-tooltip.happens-4') }}</li>
          </ul>

          <div class="font-weight-medium mb-1">
            {{ t('extraction-mode-balanced-tooltip.what-not-happens') }}
          </div>
          <ul class="text-caption">
            <li>{{ t('extraction-mode-balanced-tooltip.not-happens-1') }}</li>
            <li>{{ t('extraction-mode-balanced-tooltip.not-happens-2') }}</li>
            <li>{{ t('extraction-mode-balanced-tooltip.not-happens-3') }}</li>
          </ul>
        </div>
      </v-tooltip>
    </div>

    <div class="d-flex align-center justify-space-between">
      <v-radio
        v-model="extractionMode"
        :value="ExtractionMode.TOLERANT"
        class="flex-grow-1"
      >
        <template #label>
          <div>
            <div class="font-weight-medium">
              🤸 {{ t('extraction-mode-tolerant') }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ t('extraction-mode-tolerant-description') }}
            </div>
          </div>
        </template>
      </v-radio>
      <v-tooltip
        location="left"
        max-width="400"
      >
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            :icon="mdiHelpCircleOutline"
            size="small"
            class="text-medium-emphasis ml-2"
          />
        </template>
        <div class="pa-2">
          <div class="font-weight-bold mb-2">
            {{ t('extraction-mode-tolerant-tooltip.title') }}
          </div>
          <div class="mb-2">
            {{ t('extraction-mode-tolerant-tooltip.description') }}
          </div>

          <div class="font-weight-medium mb-1">
            {{ t('extraction-mode-tolerant-tooltip.what-happens') }}
          </div>
          <ul class="text-caption mb-2">
            <li>{{ t('extraction-mode-tolerant-tooltip.happens-1') }}</li>
            <li>{{ t('extraction-mode-tolerant-tooltip.happens-2') }}</li>
            <li>{{ t('extraction-mode-tolerant-tooltip.happens-3') }}</li>
            <li>{{ t('extraction-mode-tolerant-tooltip.happens-4') }}</li>
            <li>{{ t('extraction-mode-tolerant-tooltip.happens-5') }}</li>
          </ul>

          <div class="font-weight-medium mb-1">
            {{ t('extraction-mode-tolerant-tooltip.what-not-happens') }}
          </div>
          <ul class="text-caption">
            <li>{{ t('extraction-mode-tolerant-tooltip.not-happens-1') }}</li>
            <li>{{ t('extraction-mode-tolerant-tooltip.not-happens-2') }}</li>
            <li>{{ t('extraction-mode-tolerant-tooltip.not-happens-3') }}</li>
          </ul>
        </div>
      </v-tooltip>
    </div>
  </div>
</template>
