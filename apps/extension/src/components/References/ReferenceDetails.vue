<script setup lang="ts">
import type { ApiExtractReference } from '@source-taster/types'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'
import { useMatchingStore } from '@/extension/stores/matching'

const { reference } = defineProps<{
  reference: DeepReadonly<UnwrapNestedRefs<ApiExtractReference>>
}>()

const matchingStore = useMatchingStore()
const { getMatchingResultByReference } = storeToRefs(matchingStore)

const matchingResults = computed(() => getMatchingResultByReference.value(reference.id))

// const { t } = useI18n()
</script>

<template>
  <v-expand-transition>
    <div>
      <ReferenceMetadataList
        :reference
        :subheader="$t('reference-metadata')"
      />

      <v-divider class="my-2" />

      <!-- All Source Evaluations for Transparency -->
      <EvaluationList
        v-if="matchingResults?.evaluations"
        :reference-id="reference.id"
        :evaluations="matchingResults.evaluations"
      />
    </div>
  </v-expand-transition>
</template>
