<script setup lang="ts">
import type { ApiExtractReference } from '@source-taster/types'
import type { FuseResult } from 'fuse.js'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'

const { results } = defineProps<{
  results: FuseResult<DeepReadonly<UnwrapNestedRefs<ApiExtractReference>>>[]
}>()
</script>

<template>
  <v-list
    v-if="results.length > 0"
    class="pa-0"
    density="compact"
    slim
  >
    <v-slide-y-transition group>
      <ReferenceItem
        v-for="(extractedReference) in results"
        :key="extractedReference.item.id"
        :reference="extractedReference.item"
      />
    </v-slide-y-transition>
  </v-list>
</template>
