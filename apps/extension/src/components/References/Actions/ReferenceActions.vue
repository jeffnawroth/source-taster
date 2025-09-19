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

// ACTION BUTTONS CONFIGURATION
const otherActionButtons = [
  {
    component: OpenSrcBtn,
    props: { reference },
  },
]
</script>

<template>
  <v-row
    align-content="center"
    justify="space-between"
  >
    <!-- Details Toggle Button (left side) -->
    <v-col
      cols="auto"
      align-self="center"
    >
      <DetailsToggleBtn v-model="showDetails" />
    </v-col>

    <!-- Other action buttons (right side) -->
    <v-col
      v-for="(button, index) in otherActionButtons"
      :key="index"
      cols="auto"
      align-self="center"
    >
      <component
        :is="button.component"
        v-bind="button.props"
      />
    </v-col>
  </v-row>
</template>
