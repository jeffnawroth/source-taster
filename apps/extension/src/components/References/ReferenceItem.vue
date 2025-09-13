<script setup lang="ts">
import type { ApiExtractReference } from '@source-taster/types'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'
import { useMatchingStore } from '@/extension/stores/matching'
import { getScoreColor } from '@/extension/utils/scoreUtils'
import ReferenceActions from './Actions/ReferenceActions.vue'

// PROPS
const { reference } = defineProps<{
  reference: DeepReadonly<UnwrapNestedRefs<ApiExtractReference>>
}>()

// TRANSLATION
const { t } = useI18n()

// STORES
const matchingStore = useMatchingStore()
const { getMatchingScoreByReference } = storeToRefs(matchingStore)

// TITLE
const title = computed(() => reference.metadata.title || t('no-title'))

// statt eigener Berechnung:
const bestScore = computed<number | null>(() => {
  const s = getMatchingScoreByReference.value(reference.id)
  return Number.isFinite(s) ? s : null
})

const scoreColor = computed<string>(() =>
  bestScore.value !== null ? getScoreColor(bestScore.value) : 'default')

const showDetails = ref(false)
</script>

<template>
  <v-card
    density="compact"
    variant="outlined"
    class="mb-2"
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
</style>
