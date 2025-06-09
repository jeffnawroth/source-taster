<script setup lang="ts">
import { useMetadataStore } from '@/extension/stores/metadata'
import { useTextStore } from '@/extension/stores/text'

const { extractAndSearchMetadata } = useMetadataStore()
const { text } = storeToRefs(useTextStore())
</script>

<template>
  <v-btn
    variant="tonal"
    :text="$t('extract-and-verify')"
    block
    @click="extractAndSearchMetadata(text)"
  />
</template>
