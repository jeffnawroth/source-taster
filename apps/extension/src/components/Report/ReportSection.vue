<script setup lang="ts">
import { mdiChevronDown, mdiChevronUp, mdiInformationOutline, mdiRobot } from '@mdi/js'
import { useFuse } from '@vueuse/integrations/useFuse'
import { settings } from '@/extension/logic'
import { useAnystyleStore } from '@/extension/stores/anystyle'
import { useExtractionStore } from '@/extension/stores/extraction'
import { useMatchingStore } from '@/extension/stores/matching'

const extractionStore = useExtractionStore()
const matchingStore = useMatchingStore()
const { getMatchingScoreByReference } = storeToRefs(matchingStore)
const { extractedReferences } = storeToRefs(extractionStore)
const { hasParseResults } = storeToRefs(useAnystyleStore())

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
    class="d-flex flex-column flex-1 min-h-0"
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

    <!-- Keep the flex chain intact here -->
    <div class="d-flex flex-column flex-1 min-h-0">
      <v-expand-transition>
        <!-- Toggle THIS inner block, not the flex parent -->
        <div
          v-if="showReportCard"
          class="d-flex flex-column flex-1 min-h-0"
        >
          <VerifyButton class="mb-3" />
          <v-divider
            v-if="extractedReferences.length > 0"
            class="mb-3"
          />

          <v-card-subtitle class="px-0">
            <ReportSubtitle
              v-model:active-filters="activeFilters"
              :references="extractedReferences"
            />
          </v-card-subtitle>

          <!-- Content area gets rest height -->
          <v-card-text class="px-0 pb-0 d-flex flex-column flex-1 min-h-0">
            <!-- Empty state when AI mode is on and nothing has been extracted yet -->
            <template v-if="settings.extract.useAi && !hasParseResults && extractedReferences.length === 0">
              <v-empty-state
                :icon="mdiRobot"
                :title="$t('ai-auto-verification-title')"
                :text="$t('ai-auto-verification-text')"
              />
            </template>

            <!-- Empty state when AI mode is off and no references exist yet -->
            <template v-else-if="!settings.extract.useAi && !hasParseResults && extractedReferences.length === 0">
              <v-empty-state
                :icon="mdiInformationOutline"
                :title="$t('manual-verification-title')"
                :text="$t('manual-verification-text')"
              />
            </template>

            <!-- Search + results when we have references (or parsed tokens) -->
            <template v-else>
              <ReferencesSearchInput
                v-model="search"
                class="mb-2"
              />

              <!-- This is the ONLY scroll container -->
              <div class="flex-1 min-h-0 overflow-auto">
                <ReferencesList :results="filteredResults" />
              </div>
            </template>
          </v-card-text>
        </div>
      </v-expand-transition>
    </div>
  </v-card>
</template>
