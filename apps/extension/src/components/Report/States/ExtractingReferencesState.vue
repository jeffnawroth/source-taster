<script setup lang="ts">
import { mdiContentCut } from '@mdi/js'
import { useAiStore } from '@/extension/stores/ai'

const { isExtractingReferences } = storeToRefs(useAiStore())
</script>

<template>
  <v-empty-state
    v-show="isExtractingReferences"
    :icon="mdiContentCut"
    :title="$t('extracting-references')"
    :text="$t('extracting-references-description')"
  />
</template>
