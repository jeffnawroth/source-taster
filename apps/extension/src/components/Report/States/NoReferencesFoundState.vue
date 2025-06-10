<script setup lang="ts">
import { mdiAlertCircleOutline } from '@mdi/js'
import { useAppStore } from '@/extension/stores/app'
import { useFileStore } from '@/extension/stores/file'
import { useMetadataStore } from '@/extension/stores/metadata'
import { useTextStore } from '@/extension/stores/text'

// I18n
const { t } = useI18n()

//

const { extractedReferencesMetadata, verifiedReferences } = storeToRefs(useMetadataStore())

// file
const { file } = storeToRefs(useFileStore())

// TEXT
const { text } = storeToRefs(useTextStore())

// LOADING
const { isLoading } = storeToRefs(useAppStore())
</script>

<template>
  <v-empty-state
    v-show="extractedReferencesMetadata?.length === 0 && (text || file) && !isLoading && verifiedReferences?.length === 0"
    :icon=" mdiAlertCircleOutline"
    :title="t('no-references-found-title')"
    :text="t('no-references-found-text')"
  />
</template>
