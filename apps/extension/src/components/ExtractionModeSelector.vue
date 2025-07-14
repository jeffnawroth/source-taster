<script setup lang="ts">
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
  <v-radio-group
    v-model="extractionMode"
    class="mb-0"
  >
    <v-radio
      :value="ExtractionMode.STRICT"
      class="mb-2"
    >
      <template #label>
        <div>
          <div class="font-weight-medium">
            {{ t('extraction-mode-strict') }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ t('extraction-mode-strict-description') }}
          </div>
        </div>
      </template>
    </v-radio>

    <v-radio
      :value="ExtractionMode.BALANCED"
      class="mb-2"
    >
      <template #label>
        <div>
          <div class="font-weight-medium">
            {{ t('extraction-mode-balanced') }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ t('extraction-mode-balanced-description') }}
          </div>
        </div>
      </template>
    </v-radio>

    <v-radio
      :value="ExtractionMode.TOLERANT"
    >
      <template #label>
        <div>
          <div class="font-weight-medium">
            {{ t('extraction-mode-tolerant') }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ t('extraction-mode-tolerant-description') }}
          </div>
        </div>
      </template>
    </v-radio>
  </v-radio-group>
</template>
