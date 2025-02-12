<script setup lang="ts">
import { mdiAlertCircleOutline } from '@mdi/js'
import { useDoiStore } from '~/stores/doi'
import { useFileStore } from '~/stores/file'

// I18n
const { t } = useI18n()

// Doi Store
const { extractedDois, text } = storeToRefs(useDoiStore())

// file
const { file } = storeToRefs(useFileStore())
</script>

<template>
  <v-empty-state
    v-if="extractedDois.length === 0 && (!!text.length || file)"
    :icon=" mdiAlertCircleOutline"
    :title="t('no-valid-dois-were-found')"
    :text="t('check-dois')"
  />
</template>
