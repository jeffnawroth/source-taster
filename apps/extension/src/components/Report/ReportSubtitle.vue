<script setup lang="ts">
import type { ApiExtractReference } from '@source-taster/types'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'
import { mdiAlertCircleOutline, mdiBullseye, mdiCloseCircleOutline, mdiHelpCircleOutline, mdiMagnify, mdiTarget } from '@mdi/js'
import { useVerificationProgressStore } from '@/extension/composables/useVerificationProgress'
import { settings } from '@/extension/logic'
import { useMatchingStore } from '@/extension/stores/matching'

const props = defineProps<{
  references?: DeepReadonly<ApiExtractReference[]>
}>()

const matchingStore = useMatchingStore()
const progressStore = useVerificationProgressStore()
const { getMatchingScoreByReference } = storeToRefs(matchingStore)
const { overall } = storeToRefs(progressStore)

// Helper function to categorize a single reference based on its match score
function categorizeReference(reference: DeepReadonly<UnwrapNestedRefs<ApiExtractReference>>): 'exactMatch' | 'strongMatch' | 'possibleMatch' | 'noMatch' | 'notTested' | 'error' {
  try {
    const score = getMatchingScoreByReference.value(reference.id)

    // Distinguish between not tested (null) and no match found (0)
    if (score === null || score === undefined || !Number.isFinite(score)) {
      return 'notTested'
    }

    if (score === 0) {
      return 'noMatch'
    }

    if (score === 100) {
      return 'exactMatch'
    }

    const { strongMatchThreshold, possibleMatchThreshold }
      = settings.value.matching.matchingConfig.displayThresholds

    if (score >= strongMatchThreshold) {
      return 'strongMatch'
    }

    if (score >= possibleMatchThreshold) {
      return 'possibleMatch'
    }

    return 'noMatch'
  }
  catch {
    return 'error'
  }
}

// Computed for individual match counts
const matchCounts = computed(() => {
  const references = props.references || []

  const counts = {
    exactMatch: 0,
    strongMatch: 0,
    possibleMatch: 0,
    noMatch: 0,
    notTested: 0,
    error: 0,
  }

  references.forEach((reference) => {
    const category = categorizeReference(reference)
    counts[category]++
  })

  return counts
})

// Computed for derived counts
const statusCounts = computed(() => {
  const total = props.references?.length || 0
  const { exactMatch, strongMatch, possibleMatch, noMatch, notTested, error } = matchCounts.value

  return {
    total,
    exactMatch,
    strongMatch,
    possibleMatch,
    noMatch,
    notTested,
    matched: exactMatch + strongMatch,
    notMatched: possibleMatch + noMatch, // notTested are not counted as notMatched
    error,
  }
})
</script>

<template>
  <div class="reference-summary">
    <!-- Detailed Status Chips -->
    <v-row
      no-gutters
      density="compact"
    >
      <!-- Total Found -->
      <v-col
        v-if="statusCounts.total > 0"
        cols="auto"
      >
        <v-tooltip :text="$t('found-references-tooltip')">
          <template #activator="{ props }">
            <v-chip
              label
              :prepend-icon="mdiMagnify"
              v-bind="props"
              variant="tonal"
              density="compact"
              color="blue"
              class="mx-1"
            >
              {{ statusCounts.total }} {{ $t('found') }}
            </v-chip>
          </template>
        </v-tooltip>
      </v-col>

      <!-- Processing Status -->
      <v-col
        v-if="overall.total > 0 && overall.done < overall.total"
        cols="auto"
      >
        <v-tooltip :text="$t('processing-references-tooltip')">
          <template #activator="{ props }">
            <v-chip
              label
              v-bind="props"
              variant="tonal"
              density="compact"
              color="secondary"
              class="mx-1"
            >
              <template #prepend>
                <v-progress-circular
                  indeterminate
                  size="16"
                  width="2"
                  class="mr-1"
                />
              </template>
              {{ overall.done }}/{{ overall.total }} {{ $t('processing') }}
            </v-chip>
          </template>
        </v-tooltip>
      </v-col>

      <!-- Exact Match -->
      <v-col
        v-if="statusCounts.exactMatch > 0"
        cols="auto"
      >
        <v-tooltip :text="$t('exact-match-tooltip', { count: statusCounts.exactMatch })">
          <template #activator="{ props }">
            <v-chip
              label
              :prepend-icon="mdiBullseye"
              v-bind="props"
              variant="tonal"
              density="compact"
              color="success"
              class="mx-1"
            >
              {{ statusCounts.exactMatch }} {{ $t('exact-match-chip') }}
            </v-chip>
          </template>
        </v-tooltip>
      </v-col>

      <!-- Strong Match -->
      <v-col
        v-if="statusCounts.strongMatch > 0"
        cols="auto"
      >
        <v-tooltip
          :text="$t('strong-match-tooltip', {
            count: statusCounts.strongMatch,
            strongThreshold: settings.matching.matchingConfig.displayThresholds.strongMatchThreshold,
          })"
        >
          <template #activator="{ props }">
            <v-chip
              label
              :prepend-icon="mdiTarget"
              v-bind="props"
              variant="tonal"
              density="compact"
              color="green"
              class="mx-1"
            >
              {{ statusCounts.strongMatch }} {{ $t('strong-match-chip') }}
            </v-chip>
          </template>
        </v-tooltip>
      </v-col>

      <!-- Possible Match -->
      <v-col
        v-if="statusCounts.possibleMatch > 0"
        cols="auto"
      >
        <v-tooltip
          :text="$t('possible-match-tooltip', {
            count: statusCounts.possibleMatch,
            possibleThreshold: settings.matching.matchingConfig.displayThresholds.possibleMatchThreshold,
            strongThreshold: settings.matching.matchingConfig.displayThresholds.strongMatchThreshold - 1,
          })"
        >
          <template #activator="{ props }">
            <v-chip
              label
              :prepend-icon="mdiHelpCircleOutline"
              v-bind="props"
              variant="tonal"
              density="compact"
              color="orange"
              class="mx-1"
            >
              {{ statusCounts.possibleMatch }} {{ $t('possible-match-chip') }}
            </v-chip>
          </template>
        </v-tooltip>
      </v-col>

      <!-- No Match -->
      <v-col
        v-if="statusCounts.noMatch > 0"
        cols="auto"
      >
        <v-tooltip
          :text="$t('no-match-tooltip', {
            count: statusCounts.noMatch,
            possibleThreshold: settings.matching.matchingConfig.displayThresholds.possibleMatchThreshold,
          })"
        >
          <template #activator="{ props }">
            <v-chip
              label
              :prepend-icon="mdiAlertCircleOutline"
              v-bind="props"
              variant="tonal"
              density="compact"
              color="error"
              class="mx-1"
            >
              {{ statusCounts.noMatch }} {{ $t('no-match-chip') }}
            </v-chip>
          </template>
        </v-tooltip>
      </v-col>

      <!-- Errors -->
      <v-col
        v-if="statusCounts.error > 0"
        cols="auto"
      >
        <v-tooltip :text="$t('error-references-tooltip')">
          <template #activator="{ props }">
            <v-chip
              label
              :prepend-icon="mdiCloseCircleOutline"
              v-bind="props"
              variant="tonal"
              density="compact"
              class="mx-1"
            >
              {{ statusCounts.error }} {{ $t('error') }}
            </v-chip>
          </template>
        </v-tooltip>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.reference-summary .v-progress-linear {
  transition: all 0.3s ease-in-out;
}

.reference-summary .v-chip {
  transition: all 0.2s ease-in-out;
  font-weight: 500;
}

.reference-summary .v-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
