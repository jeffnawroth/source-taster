<script setup lang="ts">
import { useAppStore } from '@/extension/stores/app'
import { useDoiStore } from '@/extension/stores/doi'
import { useFileStore } from '@/extension/stores/file'
import { useTextStore } from '@/extension/stores/text'
import { mdiAlertCircleOutline } from '@mdi/js'

// I18n
const { t } = useI18n()

// Doi Store
const { extractedDois } = storeToRefs(useDoiStore())

// file
const { file } = storeToRefs(useFileStore())

// TEXT
const { text } = storeToRefs(useTextStore())

// LOADING
const { isLoading } = storeToRefs(useAppStore())
</script>

<template>
  <v-empty-state
    v-if="extractedDois.length === 0 && (!!text.length || file) && !isLoading"
    :icon=" mdiAlertCircleOutline"
    :title="t('no-valid-dois-were-found')"
    :text="t('check-dois')"
  />
</template>
