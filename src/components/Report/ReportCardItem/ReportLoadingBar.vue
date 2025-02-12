<script setup lang="ts">
import { useAppStore } from '~/stores/app'

// App Store
const { isLoading } = storeToRefs(useAppStore())
</script>

<template>
  <v-row
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
