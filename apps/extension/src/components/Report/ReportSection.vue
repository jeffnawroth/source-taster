<script setup lang="ts">
import { useFuse } from '@vueuse/integrations/useFuse'
import { useReferencesStore } from '@/extension/stores/references'

const { references, isExtraction, currentPhase, currentlyMatchingIndex } = storeToRefs(useReferencesStore())

const search = ref('')

const { results } = useFuse(search, references, {
  fuseOptions: {
    keys: [
      'originalText',
      'metadata.title',
      'metadata.authors',
      'metadata.source.containerTitle',
      'metadata.date.year',
    ],
    threshold: 0.3,
  },
  matchAllWhenSearchEmpty: true,
})

// Calculate if progress feedback is showing (same logic as in ProgressFeedback component)
const showProgressFeedback = computed(() => {
  // Show during main extraction (extract + match all)
  const isMainExtraction = isExtraction.value && (currentPhase.value === 'extracting' || currentPhase.value === 'matching')

  // Show during individual re-matching (when currentlyMatchingIndex is set but not main extraction)
  const isReMatching = !isExtraction.value && currentlyMatchingIndex.value >= 0

  return isMainExtraction || isReMatching
})

const maxHeight = computed(() => {
  // Calculate max height based on presence of alert
  return showProgressFeedback.value ? 'calc(100vh - 665px)' : 'calc(100vh - 610px)'
})
</script>

<template>
  <v-card
    flat
    :title="`3. ${$t('verify')}`"
    :subtitle="$t('verify-references-by-searching-and-matching-them-to-entries-in-scholarly-databases')"
  >
    <!-- SUBTITLE -->
    <v-card-subtitle class="px-0">
      <ReportSubtitle />
    </v-card-subtitle>

    <v-card-text class="px-0">
      <!-- SEARCH -->
      <ReferencesSearchInput
        v-model="search"
        class="mb-2"
      />

      <!-- PROGRESS FEEDBACK -->
      <ProgressFeedback v-show="showProgressFeedback" />

      <!-- Calculate max height based on presence of progress feedback alert -->
      <!-- 670px with alert, 600px without alert -->

      <div
        class="references-container"
        :style="{ 'max-height': maxHeight }"
      >
        <!-- LIST - Show immediately after extraction, even during extraction -->
        <ReferencesList
          v-if="references.length > 0"
          :results
        />
      </div>

      <!-- STATES - Only show when no references available AND not extraction -->
      <IdleState v-if="references.length === 0 && !isExtraction" />
    </v-card-text>
  </v-card>
</template>

<style scoped>
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
</style>
