<script setup lang="ts">
import { useExtractionStore } from '@/extension/stores/extraction'

// DATE
const fullYear = computed(() => new Date().getFullYear())
const { t } = useI18n()

const { extractedReferences } = storeToRefs(useExtractionStore())

const hasReferences = computed(() => extractedReferences.value.length > 0)
</script>

<template>
  <v-footer
    tile
    class="text-center d-flex flex-column"
    :class="{ 'ga-2 py-4': hasReferences }"
    app
  >
    <div
      v-show="hasReferences"
      class="text-caption font-weight-regular opacity-60"
    >
      {{ t('ai-disclaimer-detailed') }}
    </div>

    <div>
      {{ fullYear }} — <strong>{{ t('app-title') }}</strong>
    </div>
  </v-footer>
</template>
