<script setup lang="ts">
import type { ApiExtractReference } from '@source-taster/types'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'
import DetailsToggleBtn from './DetailsToggleBtn.vue'
import OpenSrcBtn from './OpenSrcBtn.vue'

// PROPS
const { reference } = defineProps<{
  reference: DeepReadonly<UnwrapNestedRefs<ApiExtractReference>>
}>()

// SHOW DETAILS - using defineModel for parent communication
const showDetails = defineModel<boolean>('showDetails', { default: false })
</script>

<template>
  <v-row>
    <v-col
      cols="auto"
    >
      <OpenSrcBtn :reference />
    </v-col>
    <v-col cols="auto">
      <DetailsToggleBtn v-model="showDetails" />
    </v-col>
  </v-row>
</template>
