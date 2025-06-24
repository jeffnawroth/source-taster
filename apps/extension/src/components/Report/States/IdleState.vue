<script setup lang="ts">
import { mdiFileDocumentMultipleOutline } from '@mdi/js'
import { useAppStore } from '@/extension/stores/app'
import { useReferencesStore } from '@/extension/stores/references'

// I18n
const { t } = useI18n()

// SHOW NO INPUT STATE IF THERE IS NO TEXT OR FILE INPUT
const { file } = storeToRefs(useAppStore())
const { inputText } = storeToRefs(useReferencesStore())

const show = computed(() => inputText.value.length === 0 && !file.value)
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
