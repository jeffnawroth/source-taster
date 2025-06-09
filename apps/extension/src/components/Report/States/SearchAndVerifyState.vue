<script setup lang="ts">
import { mdiMagnify } from '@mdi/js'
import { useMetadataStore } from '@/extension/stores/metadata'

const { isSearchingAndVerifying } = storeToRefs(useMetadataStore())
</script>

<template>
  <v-empty-state
    v-show="isSearchingAndVerifying"
    :title="$t('search-and-verify')"
    :text="$t('search-and-verify-description')"
    :icon="mdiMagnify"
  />
</template>
