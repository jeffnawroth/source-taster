<script setup lang="ts">
import { mdiMagnifyScan } from '@mdi/js'
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
    :title="$t('analyzing-references')"
    :text="$t('analyzing-references-description')"
    :headline="$t('search-and-verification')"
    :icon="mdiMagnifyScan"
  >
    <template #actions>
      <v-chip
        variant="outlined"
        class="mt-4"
      >
        {{ `${progressText} ${$t('checked')}` }}
      </v-chip>
    </template>
  </v-empty-state>
</template>
