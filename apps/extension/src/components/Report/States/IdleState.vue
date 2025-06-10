<script setup lang="ts">
import { mdiInformationOutline } from '@mdi/js'
import { useFileStore } from '@/extension/stores/file'
import { useTextStore } from '@/extension/stores/text'

// I18n
const { t } = useI18n()

// SHOW NO INPUT STATE IF THERE IS NO TEXT OR FILE INPUT
const { text } = storeToRefs(useTextStore())
const { file } = storeToRefs(useFileStore())

const show = computed(() => text.value.length === 0 && !file.value)
</script>

<template>
  <v-empty-state
    v-show="show"
    :icon="mdiInformationOutline"
    :text="t('idle-state-text')"
    :title="t('idle-state-title')"
  />
</template>
