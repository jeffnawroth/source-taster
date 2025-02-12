<script setup lang="ts">
import { useDoiStore } from '~/stores/doi'

// App Store
const doiStore = useDoiStore()
const { loading } = storeToRefs(doiStore)
</script>

<template>
  <v-row
    dense
    no-gutters
  >
    <v-col>
      <v-progress-linear
        v-show="loading"
        :loading
        :indeterminate="loading"
        rounded
      />
    </v-col>
  </v-row>
</template>
