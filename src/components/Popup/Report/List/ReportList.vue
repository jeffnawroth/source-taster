<script setup lang="ts">
import { useAppStore } from '~/stores/app'

const { works } = storeToRefs(useAppStore())
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
