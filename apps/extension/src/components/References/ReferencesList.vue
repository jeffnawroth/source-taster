<script setup lang="ts">
import type { ApiExtractReference } from '@source-taster/types'
import type { FuseResult } from 'fuse.js'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'

const { results } = defineProps<{
  results: FuseResult<DeepReadonly<UnwrapNestedRefs<ApiExtractReference>>>[]
}>()

const openedReferenceId = ref<string | null>(null)

function updateReferenceDetails(referenceId: string, isOpen: boolean) {
  openedReferenceId.value = isOpen
    ? referenceId
    : openedReferenceId.value === referenceId
      ? null
      : openedReferenceId.value
}
</script>

<template>
  <v-list
    v-if="results.length > 0"
    class="pa-0"
  >
    <v-slide-y-transition group>
      <ReferenceItem
        v-for="(extractedReference, index) in results"
        :key="extractedReference.item.id"
        :reference="extractedReference.item"
        :is-last="index === results.length - 1"
        :show-details="openedReferenceId === extractedReference.item.id"
        @update:show-details="value => updateReferenceDetails(extractedReference.item.id, value)"
      />
    </v-slide-y-transition>
  </v-list>
</template>
