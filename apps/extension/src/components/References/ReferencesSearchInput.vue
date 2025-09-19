<script setup lang="ts">
import { mdiMagnify } from '@mdi/js'
import { useExtractionStore } from '@/extension/stores/extraction'

const search = defineModel({ default: '' })

// SHOW SEARCH INPUT IF THERE ARE REFERENCES
const { extractedReferences } = storeToRefs(useExtractionStore())
const show = computed(() => extractedReferences.value.length)
</script>

<template>
  <v-text-field
    v-if="show"
    v-model.trim="search"
    :prepend-inner-icon="mdiMagnify"
    variant="solo-filled"
    :placeholder="`${$t('search-references')}…`"
    clearable
    class="mb-4"
  />
</template>
