<script setup lang="ts">
import type { ApiExtractReference } from '@source-taster/types'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'
import { mdiAlertCircleOutline, mdiBullseye, mdiCloseCircleOutline, mdiHelpCircleOutline, mdiMagnify, mdiTarget } from '@mdi/js'
import { useI18n } from 'vue-i18n'
import StatusChip from '@/extension/components/common/StatusChip.vue'
import { useVerificationProgressStore } from '@/extension/composables/useVerificationProgress'
import { settings } from '@/extension/logic'
import { useMatchingStore } from '@/extension/stores/matching'

const props = defineProps<{
  references?: DeepReadonly<ApiExtractReference[]>
  activeFilters?: Array<'exactMatch' | 'strongMatch' | 'possibleMatch' | 'noMatch' | 'error'>
}>()
const emit = defineEmits<{
  (e: 'update:activeFilters', value: Array<'exactMatch' | 'strongMatch' | 'possibleMatch' | 'noMatch' | 'error'>): void
}>()

const matchingStore = useMatchingStore()
const progressStore = useVerificationProgressStore()
const { getMatchingScoreByReference } = storeToRefs(matchingStore)
const { overall } = storeToRefs(progressStore)
const { t } = useI18n()

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

type FilterCategory = 'exactMatch' | 'strongMatch' | 'possibleMatch' | 'noMatch' | 'error'
const ALL_FILTERS: FilterCategory[] = ['exactMatch', 'strongMatch', 'possibleMatch', 'noMatch', 'error']

interface ChipItem {
  key: string
  show: boolean
  text: string
  tooltip: string
  color?: string
  icon?: string
  loading?: boolean
  category?: FilterCategory
}

const activeFilters = computed<FilterCategory[]>({
  get: () => props.activeFilters ?? ALL_FILTERS,
  set: val => emit('update:activeFilters', val),
})

function isSelected(category?: FilterCategory) {
  if (!category)
    return true
  return activeFilters.value.includes(category)
}

function toggleCategory(category?: FilterCategory) {
  if (!category)
    return
  const set = new Set(activeFilters.value)
  if (set.has(category))
    set.delete(category)
  else set.add(category)
  activeFilters.value = Array.from(set)
}

const summaryChips = computed<ChipItem[]>(() => {
  const chips: ChipItem[] = []
  const counts = statusCounts.value
  const thresholds = settings.value.matching.matchingConfig.displayThresholds

  chips.push({
    key: 'total',
    show: counts.total > 0,
    text: `${counts.total} ${t('found')}`,
    tooltip: t('found-references-tooltip') as string,
    icon: mdiMagnify,
  })

  chips.push({
    key: 'processing',
    show: overall.value.total > 0 && overall.value.done < overall.value.total,
    text: `${overall.value.done}/${overall.value.total} ${t('processing')}`,
    tooltip: t('processing-references-tooltip') as string,
    color: 'info',
    loading: true,
  })

  chips.push({
    key: 'exact',
    show: counts.exactMatch > 0,
    text: `${counts.exactMatch} ${t('exact-match-chip')}`,
    tooltip: t('exact-match-tooltip', { count: counts.exactMatch }) as string,
    color: 'success',
    icon: mdiBullseye,
    category: 'exactMatch',
  })

  chips.push({
    key: 'strong',
    show: counts.strongMatch > 0,
    text: `${counts.strongMatch} ${t('strong-match-chip')}`,
    tooltip: t('strong-match-tooltip', { count: counts.strongMatch, strongThreshold: thresholds.strongMatchThreshold }) as string,
    color: 'success',
    icon: mdiTarget,
    category: 'strongMatch',
  })

  chips.push({
    key: 'possible',
    show: counts.possibleMatch > 0,
    text: `${counts.possibleMatch} ${t('possible-match-chip')}`,
    tooltip: t('possible-match-tooltip', { count: counts.possibleMatch, possibleThreshold: thresholds.possibleMatchThreshold, strongThreshold: thresholds.strongMatchThreshold - 1 }) as string,
    color: 'warning',
    icon: mdiHelpCircleOutline,
    category: 'possibleMatch',
  })

  chips.push({
    key: 'no',
    show: counts.noMatch > 0,
    text: `${counts.noMatch} ${t('no-match-chip')}`,
    tooltip: t('no-match-tooltip', { count: counts.noMatch, possibleThreshold: thresholds.possibleMatchThreshold }) as string,
    color: 'error',
    icon: mdiAlertCircleOutline,
    category: 'noMatch',
  })

  chips.push({
    key: 'error',
    show: counts.error > 0,
    text: `${counts.error} ${t('error')}`,
    tooltip: t('error-references-tooltip') as string,
    icon: mdiCloseCircleOutline,
    category: 'error',
  })

  return chips.filter(c => c.show)
})
</script>

<template>
  <v-row
    dense
  >
    <v-col
      v-for="chip in summaryChips"
      :key="chip.key"
      cols="auto"
    >
      <StatusChip
        :text="chip.text"
        :tooltip="chip.tooltip"
        :prepend-icon="chip.icon"
        :color="chip.category && isSelected(chip.category) ? chip.color : undefined"
        @click="toggleCategory(chip.category)"
      />
    </v-col>
  </v-row>
</template>
