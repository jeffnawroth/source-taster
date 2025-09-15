<script setup lang="ts">
import { mdiChevronDown, mdiChevronUp, mdiInformationOutline } from '@mdi/js'
import { useFuse } from '@vueuse/integrations/useFuse'
import { settings } from '@/extension/logic'
import { useExtractionStore } from '@/extension/stores/extraction'
import { useMatchingStore } from '@/extension/stores/matching'

const extractionStore = useExtractionStore()
const matchingStore = useMatchingStore()
const { getMatchingScoreByReference } = storeToRefs(matchingStore)
const { extractedReferences } = storeToRefs(extractionStore)

const search = ref('')
const showReportCard = ref(true)

const activeFilters = ref<Array<'exactMatch' | 'strongMatch' | 'possibleMatch' | 'noMatch' | 'error'>>(['exactMatch', 'strongMatch', 'possibleMatch', 'noMatch', 'error'])

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

// Map reference to category for filtering
function categorize(reference: any): 'exactMatch' | 'strongMatch' | 'possibleMatch' | 'noMatch' | 'error' | 'notTested' {
  try {
    // Reuse same logic as ReportSubtitle via store
    const score = getMatchingScoreByReference.value(reference.id)
    if (score === null || score === undefined || !Number.isFinite(score))
      return 'notTested'
    if (score === 0)
      return 'noMatch'
    if (score === 100)
      return 'exactMatch'
    const strong = settings.value.matching.matchingConfig.displayThresholds.strongMatchThreshold
    const possible = settings.value.matching.matchingConfig.displayThresholds.possibleMatchThreshold
    if (score >= strong)
      return 'strongMatch'
    if (score >= possible)
      return 'possibleMatch'
    return 'noMatch'
  }
  catch {
    return 'error'
  }
}

const filteredResults = computed(() => {
  // If all filters selected, just return full results
  if (activeFilters.value.length === 5)
    return results.value
  return results.value.filter((r) => {
    const cat = categorize(r.item)
    if (cat === 'notTested')
      return true
    return activeFilters.value.includes(cat as 'exactMatch' | 'strongMatch' | 'possibleMatch' | 'noMatch' | 'error')
  })
})
</script>

<template>
  <v-card
    flat
    :title="`3. ${$t('verify')}`"
    :subtitle="$t('verify-extracted-references')"
  >
    <template #append>
      <!-- Info Icon with Tooltip -->
      <v-tooltip location="bottom">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            :icon="mdiInformationOutline"
            variant="text"
            size="small"
            v-bind="tooltipProps"
          />
        </template>
        <div
          class="text-caption"
          style="max-width: 400px;"
        >
          <strong>{{ $t('verification-help-title') }}</strong><br>
          {{ $t('verification-help-description') }}
        </div>
      </v-tooltip>

      <v-btn
        variant="text"
        :icon="showReportCard ? mdiChevronUp : mdiChevronDown"
        @click="showReportCard = !showReportCard"
      />
    </template>

    <v-expand-transition>
      <div v-if="showReportCard">
        <VerifyButton
          class="mb-3"
        />
        <v-divider
          v-if="extractedReferences.length > 0"
          class="mb-3"
        />
        <!-- SUBTITLE -->
        <v-card-subtitle
          class="px-0"
        >
          <ReportSubtitle
            v-model:active-filters="activeFilters"
            :references="extractedReferences"
          />
        </v-card-subtitle>

        <v-card-text
          v-if="extractedReferences.length > 0"
          class="px-0 pb-0"
        >
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
            :results="filteredResults"
          />
          <!-- </div> -->
        </v-card-text>
      </div>
    </v-expand-transition>
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
