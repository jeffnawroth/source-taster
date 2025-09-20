<script setup lang="ts">
import { settings } from '@/extension/logic'
import { useExtractionStore } from '@/extension/stores/extraction'

// DATE
const { t } = useI18n()

const { extractedReferences } = storeToRefs(useExtractionStore())

const hasReferences = computed(() => extractedReferences.value.length > 0)

// Show AI disclaimer only when AI is enabled AND we have references
const showAiDisclaimer = computed(() =>
  hasReferences.value && settings.value.ai.canUseAI,
)
</script>

<template>
  <v-footer
    v-if="showAiDisclaimer"
    tile
    class="text-center"
    app
  >
    <div
      class="text-caption font-weight-regular opacity-60"
    >
      {{ t('ai-disclaimer-detailed') }}
    </div>
  </v-footer>
</template>
