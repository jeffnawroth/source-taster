<script setup lang="ts">
import { useAppStore } from '@/extension/stores/app'

// App Store
const { isLoading } = storeToRefs(useAppStore())
</script>

<template>
  <v-row
    v-show="isLoading"
    dense
    no-gutters
  >
    <v-col>
      <v-progress-linear
        v-show="isLoading"
        :is-loading
        :indeterminate="isLoading"
        rounded
      />
    </v-col>
  </v-row>
</template>
