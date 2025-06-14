<script setup lang="ts">
import { useAppStore } from '@/extension/stores/app'
import { useMetadataStore } from '@/extension/stores/metadata'

const { extractAndSearchMetadata } = useMetadataStore()

// DISABLE BUTTON IF NO TEXT AND FILE OR LOADING
const { text, file } = storeToRefs(useAppStore())
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
    :text="$t('verify-references')"
    block

    :disabled
    @click="handleClick"
  />
</template>
