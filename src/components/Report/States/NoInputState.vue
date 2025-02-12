<script setup lang="ts">
import { mdiInformationOutline } from '@mdi/js'
import { useDoiStore } from '~/stores/doi'
import { useFileStore } from '~/stores/file'

// I18n
const { t } = useI18n()

// Doi Store
const { text } = storeToRefs(useDoiStore())

// file
const { file } = storeToRefs(useFileStore())
</script>

<template>
  <v-empty-state
    v-if="text.length === 0 && !file"
    :icon="mdiInformationOutline"
    :text="t('enter-dois')"
    :title="t('no-input-provided')"
  />
</template>
