<script setup lang="ts">
import { mdiAlertCircleOutline } from '@mdi/js'

// I18n
const { t } = useI18n()

// Doi Store
const { extractedDois } = storeToRefs(useDoiStore())

// file
const { file } = storeToRefs(useFileStore())

// TEXT
const { text } = storeToRefs(useTextStore())
</script>

<template>
  <v-empty-state
    v-if="extractedDois.length === 0 && (!!text.length || file)"
    :icon=" mdiAlertCircleOutline"
    :title="t('no-valid-dois-were-found')"
    :text="t('check-dois')"
  />
</template>
