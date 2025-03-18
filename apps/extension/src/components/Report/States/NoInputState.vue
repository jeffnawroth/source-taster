<script setup lang="ts">
import { useFileStore } from '@/extension/stores/file'
import { useTextStore } from '@/extension/stores/text'
import { mdiInformationOutline } from '@mdi/js'

// I18n
const { t } = useI18n()

// TEXT
const { text } = storeToRefs(useTextStore())

// file
const { file } = storeToRefs(useFileStore())
</script>

<template>
  <v-empty-state
    v-show="text.length === 0 && !file"
    :icon="mdiInformationOutline"
    :text="t('enter-dois')"
    :title="t('no-input-provided')"
  />
</template>
