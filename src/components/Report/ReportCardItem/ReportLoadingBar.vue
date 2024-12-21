<script setup lang="ts">
import { mdiClose, mdiReload } from '@mdi/js'
import { useDoiStore } from '~/stores/doi'

// App Store
const doiStore = useDoiStore()
const { loading, loadAborted } = storeToRefs(doiStore)
const { getDOIsMetadata, abortFetching } = doiStore
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
        :icon="mdiClose"
        variant="plain"
        @click="abortFetching"
      />
      <v-btn
        v-else-if="loadAborted"
        :icon="mdiReload"
        variant="plain"
        @click="reload"
      />
    </v-col>
  </v-row>
</template>
