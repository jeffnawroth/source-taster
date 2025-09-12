<script setup lang="ts">
import { useFuse } from '@vueuse/integrations/useFuse'
import { useExtractionStore } from '@/extension/stores/extraction'

const extractionStore = useExtractionStore()
const { extractedReferences } = storeToRefs(extractionStore)

const search = ref('')

const { results } = useFuse(search, () => [...extractedReferences.value], {
  fuseOptions: {
    keys: [
      'originalText',
      'metadata.title',
      'metadata.author.family',
      'metadata.author.given',
      'metadata.container-title',
    ],
    threshold: 0.3,
  },
  matchAllWhenSearchEmpty: true,
})
</script>

<template>
  <v-card
    flat
    :title="`3. ${$t('verify')}`"
    :subtitle="$t('verify-references-by-searching-and-matching-them-to-entries-in-scholarly-databases')"
  >
    <VerifyButton
      class="mb-3"
    />
    <v-divider class="mb-3" />
    <!-- SUBTITLE -->
    <v-card-subtitle class="px-0">
      <ReportSubtitle />
    </v-card-subtitle>

    <v-card-text class="px-0 pb-0">
      <!-- VERIFY BUTTON - Always show but disabled when no parsed tokens -->

      <!-- SEARCH -->
      <ReferencesSearchInput
        v-model="search"
        class="mb-2"
      />

      <!-- References Container with fixed height -->
      <!-- <div
        class="references-container"
        style="max-height: calc(100vh - 610px)"
      > -->
      <!-- LIST - Show when we have references -->
      <ReferencesList
        :results
      />
      <!-- </div> -->
    </v-card-text>
  </v-card>
</template>

<!-- <style scoped>
.references-container {
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 0.5rem;
  scrollbar-color: #404040b3 transparent; /*firefox*/
  scrollbar-width: thin;
}

/* Webkit browsers (Chrome, Safari, Edge) */
.references-container::-webkit-scrollbar {
  width: 6px;
}

.references-container::-webkit-scrollbar-track {
  background: transparent;
}

.references-container::-webkit-scrollbar-thumb {
  background: rgba(64, 64, 64, 0.7);
  border-radius: 3px;
}

.references-container::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 64, 64, 0.9);
}
</style> -->
