<script setup lang="ts">
import type { ApiExtractReference } from '@source-taster/types'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'
import { useVerificationProgressStore } from '@/extension/composables/useVerificationProgress'
import { useMatchingStore } from '@/extension/stores/matching'
import { getScoreColor } from '@/extension/utils/scoreUtils'
import ReferenceActions from './Actions/ReferenceActions.vue'

// PROPS
const { reference } = defineProps<{
  reference: DeepReadonly<UnwrapNestedRefs<ApiExtractReference>>
}>()

// I18n
const { t } = useI18n()

// STORES
const matchingStore = useMatchingStore()
const progressStore = useVerificationProgressStore()

const { getMatchingScoreByReference } = storeToRefs(matchingStore)

// TITLE
const title = computed(() => reference.metadata.title || t('no-title'))

// Best score
const bestScore = computed<number | null>(() => {
  const s = getMatchingScoreByReference.value(reference.id)
  return Number.isFinite(s) ? s : null
})

const scoreColor = computed<string>(() =>
  bestScore.value !== null ? getScoreColor(bestScore.value) : 'default')

// Progress (pro Referenz) - nur für Shimmer-Effekt
const state = computed(() => progressStore.get(reference.id) || null)
const phase = computed(() => state.value?.phase ?? 'idle')
const isSearching = computed(() => phase.value === 'searching')
const isMatching = computed(() => phase.value === 'matching')

const showDetails = ref(false)
</script>

<template>
  <v-card
    density="compact"
    variant="outlined"
    class="mb-2"
    :class="{ 'currently-verifying': isSearching || isMatching }"
    :color="scoreColor"
    :title
  >
    <!-- STATUS ICON & SCORE -->
    <template #append>
      <ReferenceScore
        v-if="bestScore !== null"
        :score="bestScore"
        :color="scoreColor"
      />
    </template>

    <!-- SUBTITLE -->
    <ReferenceSubtitle :reference />

    <!-- ACTIONS -->
    <v-card-actions>
      <ReferenceActions
        v-model:show-details="showDetails"
        :reference
      />
    </v-card-actions>

    <!-- DETAILS -->
    <ReferenceDetails
      v-show="showDetails"
      :reference
    />
  </v-card>
</template>

<style scoped>
.currently-verifying {
  position: relative;
  overflow: hidden;
}

.currently-verifying::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 2s infinite;
  z-index: 1;
  pointer-events: none;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>
