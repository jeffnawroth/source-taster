<script setup lang="ts">
import { mdiFileDocumentMultipleOutline } from '@mdi/js'
import { useReferencesStore } from '@/extension/stores/references'

// I18n
const { t } = useI18n()

// SHOW NO INPUT STATE IF THERE IS NO TEXT OR FILE INPUT
const { currentPhase, isProcessing, references } = storeToRefs(useReferencesStore())

const show = computed(() => currentPhase.value === 'idle' && !isProcessing.value && references.value.length === 0)
</script>

<template>
  <v-empty-state
    v-show="show"
    :icon="mdiFileDocumentMultipleOutline"
    :headline="t('input-required')"
    :text="t('import-pdf-or-add-references')"
    :title="t('no-references-to-check')"
  />
</template>
