<script setup lang="ts">
import { mdiMagnify } from '@mdi/js'
import { useMetadataStore } from '@/extension/stores/metadata'

const { isSearchingAndVerifying } = storeToRefs(useMetadataStore())

const { extractedReferencesMetadata, processedCount } = storeToRefs(useMetadataStore())

const progressText = computed(() => {
  const verified = processedCount.value || 0
  const total = extractedReferencesMetadata.value?.length || 0

  if (total > 0) {
    return `${verified}/${total}`
  }
  return '0/0'
})
</script>

<template>
  <v-empty-state
    v-show="isSearchingAndVerifying"
    :title="$t('search-and-verify')"
    :text="$t('search-and-verify-description')"
    :icon="mdiMagnify"
  >
    <template #actions>
      <v-chip
        variant="outlined"
      >
        {{ progressText }}
      </v-chip>
    </template>
  </v-empty-state>
</template>
