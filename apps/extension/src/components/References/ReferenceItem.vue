<script setup lang="ts">
import type { ApiExtractReference } from '@source-taster/types'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'
import { useVerificationProgressStore } from '@/extension/composables/useVerificationProgress'
import { useMatchingStore } from '@/extension/stores/matching'
import { getScoreColor } from '@/extension/utils/scoreUtils'
import ReferenceActions from './Actions/ReferenceActions.vue'

// PROPS
const props = withDefaults(defineProps<{
  reference: DeepReadonly<UnwrapNestedRefs<ApiExtractReference>>
  isLast?: boolean
  showDetails?: boolean
}>(), {
  isLast: false,
  showDetails: false,
})

const emit = defineEmits<{
  (e: 'update:showDetails', value: boolean): void
}>()

const { reference, isLast } = toRefs(props)

// I18n
const { t } = useI18n()

// STORES
const matchingStore = useMatchingStore()
const progressStore = useVerificationProgressStore()

const { getMatchingScoreByReference } = storeToRefs(matchingStore)

// TITLE
const title = computed(() => reference.value.metadata.title || t('no-title'))

// Best score
const bestScore = computed<number | null>(() => {
  const s = getMatchingScoreByReference.value(reference.value.id)
  return Number.isFinite(s) ? s : null
})

const scoreColor = computed<string>(() =>
  bestScore.value !== null ? getScoreColor(bestScore.value) : 'default')

// Progress (pro Referenz) - nur für Shimmer-Effekt
const state = computed(() => progressStore.get(reference.value.id) || null)
const phase = computed(() => state.value?.phase ?? 'idle')
const isSearching = computed(() => phase.value === 'searching')
const isMatching = computed(() => phase.value === 'matching')

const showDetails = computed({
  get: () => props.showDetails,
  set: value => emit('update:showDetails', value),
})

function toggleDetails() {
  showDetails.value = !showDetails.value
}
</script>

<template>
  <div>
    <v-list-item
      :class="{ 'currently-verifying': isSearching || isMatching }"
      class="my-1"
      :base-color="scoreColor"
      :active="showDetails"
      @click="toggleDetails"
    >
      <v-list-item-title
        class="mb-1"
      >
        {{ title }}
      </v-list-item-title>
      <v-list-item-subtitle class="mb-1">
        <ReferenceSubtitle
          :reference
        />
      </v-list-item-subtitle>

      <template #append>
        <v-list-item-action class="flex-column align-end">
          <ReferenceScore
            v-if="bestScore !== null"
            :score="bestScore"
            class="mb-3"
          />

          <v-spacer />

          <ReferenceActions
            v-model:show-details="showDetails"
            :reference
          />
        </v-list-item-action>
      </template>
    </v-list-item>

    <ReferenceDetails
      v-show="showDetails"
      :reference
    />

    <v-divider v-if="!isLast" />
  </div>
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
