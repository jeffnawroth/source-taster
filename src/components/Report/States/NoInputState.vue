<script setup lang="ts">
import { mdiInformationOutline } from '@mdi/js'
import { useFileStore } from '~/stores/file'
import { useTextStore } from '~/stores/text'

// I18n
const { t } = useI18n()

// TEXT
const { text } = storeToRefs(useTextStore())

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
