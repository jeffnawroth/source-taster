<script setup lang="ts">
import { useReferencesStore } from '@/extension/stores/references'

// App Store
const { isProcessing, currentPhase, progress } = storeToRefs(useReferencesStore())
</script>

<template>
  <v-row
    v-show="isProcessing"
    dense
    no-gutters
  >
    <v-col>
      <v-progress-linear
        :model-value="progress"
        :indeterminate="currentPhase === 'extracting'"
        rounded
      />
    </v-col>
  </v-row>
</template>
