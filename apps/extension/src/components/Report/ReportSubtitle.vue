<script setup lang="ts">
import type { ApiExtractReference } from '@source-taster/types'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'
import { mdiAlertCircleOutline, mdiBullseye, mdiCloseCircleOutline, mdiHelpCircleOutline, mdiMagnify, mdiTarget } from '@mdi/js'
import StatusChip from '@/extension/components/common/StatusChip.vue'
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
  <!-- Detailed Status Chips -->
  <v-row
    dense
  >
    <!-- Total Found -->
    <v-col
      v-if="statusCounts.total > 0"
      cols="auto"
    >
      <StatusChip
        :text="`${statusCounts.total} ${$t('found')}`"
        :tooltip="$t('found-references-tooltip')"
        :prepend-icon="mdiMagnify"
        color="blue"
      />
    </v-col>

    <!-- Processing Status -->
    <v-col
      v-if="overall.total > 0 && overall.done < overall.total"
      cols="auto"
    >
      <StatusChip
        :text="`${overall.done}/${overall.total} ${$t('processing')}`"
        :tooltip="$t('processing-references-tooltip')"
        color="secondary"
        :loading="true"
      />
    </v-col>

    <!-- Exact Match -->
    <v-col
      v-if="statusCounts.exactMatch > 0"
      cols="auto"
    >
      <StatusChip
        :text="`${statusCounts.exactMatch} ${$t('exact-match-chip')}`"
        :tooltip="$t('exact-match-tooltip', { count: statusCounts.exactMatch })"
        :prepend-icon="mdiBullseye"
        color="success"
      />
    </v-col>

    <!-- Strong Match -->
    <v-col
      v-if="statusCounts.strongMatch > 0"
      cols="auto"
    >
      <StatusChip
        :text="`${statusCounts.strongMatch} ${$t('strong-match-chip')}`"
        :tooltip="$t('strong-match-tooltip', {
          count: statusCounts.strongMatch,
          strongThreshold: settings.matching.matchingConfig.displayThresholds.strongMatchThreshold,
        })"
        :prepend-icon="mdiTarget"
        color="green"
      />
    </v-col>

    <!-- Possible Match -->
    <v-col
      v-if="statusCounts.possibleMatch > 0"
      cols="auto"
    >
      <StatusChip
        :text="`${statusCounts.possibleMatch} ${$t('possible-match-chip')}`"
        :tooltip="$t('possible-match-tooltip', {
          count: statusCounts.possibleMatch,
          possibleThreshold: settings.matching.matchingConfig.displayThresholds.possibleMatchThreshold,
          strongThreshold: settings.matching.matchingConfig.displayThresholds.strongMatchThreshold - 1,
        })"
        :prepend-icon="mdiHelpCircleOutline"
        color="orange"
      />
    </v-col>

    <!-- No Match -->
    <v-col
      v-if="statusCounts.noMatch > 0"
      cols="auto"
    >
      <StatusChip
        :text="`${statusCounts.noMatch} ${$t('no-match-chip')}`"
        :tooltip="$t('no-match-tooltip', {
          count: statusCounts.noMatch,
          possibleThreshold: settings.matching.matchingConfig.displayThresholds.possibleMatchThreshold,
        })"
        :prepend-icon="mdiAlertCircleOutline"
        color="error"
      />
    </v-col>

    <!-- Errors -->
    <v-col
      v-if="statusCounts.error > 0"
      cols="auto"
    >
      <StatusChip
        :text="`${statusCounts.error} ${$t('error')}`"
        :tooltip="$t('error-references-tooltip')"
        :prepend-icon="mdiCloseCircleOutline"
      />
    </v-col>
  </v-row>
</template>
