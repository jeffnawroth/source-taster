<script setup lang="ts">
import { useWorkStore } from '~/stores/work'

// App Store
const { works } = storeToRefs(useWorkStore())
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
