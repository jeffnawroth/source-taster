<script setup lang="ts">
import { useReferencesStore } from '@/extension/stores/references'

// App Store
const { isProcessing } = storeToRefs(useReferencesStore())
</script>

<template>
  <v-row
    v-show="isProcessing"
    dense
    no-gutters
  >
    <v-col>
      <v-progress-linear
        v-show="isProcessing"
        :is-loading="isProcessing"
        :indeterminate="isProcessing"
        rounded
      />
    </v-col>
  </v-row>
</template>
