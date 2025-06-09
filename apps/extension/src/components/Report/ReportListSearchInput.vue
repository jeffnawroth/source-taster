<script setup lang="ts">
import { useMetadataStore } from '@/extension/stores/metadata'

const search = defineModel({ default: '' })

// SHOW SEARCH INPUT IF THERE ARE REFERENCES
const { verifiedReferences } = storeToRefs(useMetadataStore())

const show = computed(() => verifiedReferences.value.length)
</script>

<template>
  <v-text-field
    v-if="show"
    v-model.trim="search"
    density="compact"
    hide-details
    variant="solo-filled"
    :placeholder="`${$t('search')}...`"
    flat
    clearable
  />
</template>
