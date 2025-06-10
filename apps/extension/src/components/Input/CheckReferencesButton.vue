<script setup lang="ts">
import { useAppStore } from '@/extension/stores/app'
import { useFileStore } from '@/extension/stores/file'
import { useMetadataStore } from '@/extension/stores/metadata'
import { useTextStore } from '@/extension/stores/text'

const { extractAndSearchMetadata } = useMetadataStore()

// DISABLE BUTTON IF NO TEXT AND FILE OR LOADING
const { text } = storeToRefs(useTextStore())
const { file } = storeToRefs(useFileStore())
const { isLoading } = storeToRefs(useAppStore())

const disabled = computed(() => (!file.value && !text.value.trim()) || isLoading.value)

// HANDLE CLICK
function handleClick() {
  if (!disabled.value) {
    extractAndSearchMetadata(text.value)
  }
}
</script>

<template>
  <v-btn
    variant="tonal"
    :text="$t('verify')"
    block
    :disabled
    @click="handleClick"
  />
</template>
