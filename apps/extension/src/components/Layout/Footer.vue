<script setup lang="ts">
import { settings } from '@/extension/logic'
import { useExtractionStore } from '@/extension/stores/extraction'

// DATE
const fullYear = computed(() => new Date().getFullYear())
const { t } = useI18n()

const { extractedReferences } = storeToRefs(useExtractionStore())

const hasReferences = computed(() => extractedReferences.value.length > 0)

// Show AI disclaimer only when AI is enabled AND we have references
const showAiDisclaimer = computed(() =>
  hasReferences.value && settings.value.extract.useAi,
)
</script>

<template>
  <v-footer
    tile
    class="text-center d-flex flex-column"
    :class="{ 'ga-2 py-4': showAiDisclaimer }"
    app
  >
    <div
      v-show="showAiDisclaimer"
      class="text-caption font-weight-regular opacity-60"
    >
      {{ t('ai-disclaimer-detailed') }}
    </div>

    <div>
      {{ fullYear }} — <strong>{{ t('app-title') }}</strong>
    </div>
  </v-footer>
</template>
