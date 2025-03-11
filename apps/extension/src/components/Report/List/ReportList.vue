<script setup lang="ts">
import { useWorkStore } from '@/extension/stores/work'

// App Store
const { works } = storeToRefs(useWorkStore())
</script>

<template>
  <v-fade-transition>
    <v-list
      v-if="works.length"
    >
      <v-slide-y-transition group>
        <ReportListItem
          v-for="(work) in works"
          :key="work.content?.message.DOI"
          :work
        />
      </v-slide-y-transition>
    </v-list>
  </v-fade-transition>
</template>
