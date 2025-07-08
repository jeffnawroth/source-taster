<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'
import CopyIdentifierBtn from './CopyIdentifierBtn.vue'
import DetailsToggleBtn from './DetailsToggleBtn.vue'
import OpenSrcBtn from './OpenSrcBtn.vue'
import ReVerifyBtn from './ReVerifyBtn.vue'

// PROPS
const { reference } = defineProps<{
  reference: ProcessedReference
}>()

// SHOW DETAILS - using defineModel for parent communication
const showDetails = defineModel<boolean>('showDetails', { default: false })

// VERIFICATION SCORE
const verificationScore = computed(() =>
  reference.verificationResult?.verificationDetails?.matchDetails?.overallScore,
)

// ACTION BUTTONS CONFIGURATION
const otherActionButtons = [
  {
    component: CopyIdentifierBtn,
    props: { reference },
  },
  {
    component: OpenSrcBtn,
    props: { reference },
  },
  {
    component: ReVerifyBtn,
    props: { reference, verificationScore: verificationScore.value },
  },
]
</script>

<template>
  <v-row
    dense
    align-content="center"
  >
    <!-- Details Toggle Button (left side) -->
    <v-col
      cols="auto"
      align-self="center"
    >
      <DetailsToggleBtn v-model="showDetails" />
    </v-col>

    <!-- Spacer to push other buttons to the right -->
    <v-spacer />

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
