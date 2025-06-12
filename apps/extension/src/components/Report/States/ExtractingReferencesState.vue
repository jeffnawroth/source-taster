<script setup lang="ts">
import { mdiTextSearch } from '@mdi/js'
import { useAiStore } from '@/extension/stores/aiStore'

const { isExtractingReferences } = storeToRefs(useAiStore())
</script>

<template>
  <v-empty-state
    v-show="isExtractingReferences"
    :icon="mdiTextSearch"
    :headline="$t('extracting-references')"
    :title="$t('analyzing-text-content')"
    :text="$t('analyzing-text-content-description')"
  />
</template>
