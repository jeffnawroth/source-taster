<script setup lang="ts">
import { useAppStore } from '~/stores/app'

// App Store
const appStore = useAppStore()
const { loading, loadAborted } = storeToRefs(appStore)
const { getDOIsMetadata, abortFetching } = useAppStore()
// Data

// Reloads the DOIs metadata
function reload() {
  loadAborted.value = false
  getDOIsMetadata()
}
</script>

<template>
  <v-row
    dense
    no-gutters
  >
    <v-col
      cols="11"
      class="d-flex align-center"
    >
      <v-progress-linear
        v-show="loading || loadAborted"
        :loading
        :indeterminate="loading"
        rounded
      />
    </v-col>
    <v-col cols="1">
      <v-btn
        v-if="loading"
        icon="mdi-close"
        variant="plain"
        @click="abortFetching"
      />
      <v-btn
        v-else-if="loadAborted"
        icon="mdi-reload"
        variant="plain"
        @click="reload"
      />
    </v-col>
  </v-row>
</template>
