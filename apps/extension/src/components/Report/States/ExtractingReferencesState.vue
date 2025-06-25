<script setup lang="ts">
import { mdiTextSearch } from '@mdi/js'
import { useReferencesStore } from '@/extension/stores/references'

const { currentPhase } = storeToRefs(useReferencesStore())
const show = computed(() => currentPhase.value === 'extracting')
</script>

<template>
  <v-empty-state
    v-show="show"
    :icon="mdiTextSearch"
    :headline="$t('extracting-references')"
    :title="$t('analyzing-text-content')"
    :text="$t('analyzing-text-content-description')"
  />
</template>
