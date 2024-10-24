<script setup lang="ts">
import { useDoiStore } from '~/stores/doi'

// App Store
const { works } = storeToRefs(useDoiStore())
</script>

<template>
  <v-list
    v-if="works.length > 0"
  >
    <ReportListItem
      v-for="(work, index) in works"
      :key="work.content?.message.DOI"
      :work
      :index
    />
  </v-list>
</template>
