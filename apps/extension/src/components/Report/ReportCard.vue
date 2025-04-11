<script setup lang="ts">
import { useDoiStore } from '@/extension/stores/doi'
import { useIssnStore } from '@/extension/stores/issn'
import { mdiFileDocumentOutline } from '@mdi/js'
import { useFuse } from '@vueuse/integrations/useFuse'

// SEARCH
const { dois } = storeToRefs(useDoiStore())
const { issns } = storeToRefs(useIssnStore())

const search = ref('')

const data = computed(() => {
  return [...dois.value, ...issns.value]
})

const { results } = useFuse(search, data, {
  fuseOptions: {
    keys: ['value'],
    threshold: 0.3,

  },
  matchAllWhenSearchEmpty: true,
})
</script>

<template>
  <v-card
    flat
    :title="$t('report')"
  >
    <template #prepend>
      <v-icon
        :icon="mdiFileDocumentOutline"
        size="large"
      />
    </template>

    <template #append>
      <!-- AI ICON -->
      <ReportIconAi />

      <!-- PDF DOWNLOAD -->
      <ReportPdfDownload />
    </template>

    <!-- SUBTITLE -->
    <template
      #subtitle
    >
      <ReportSubtitle />
    </template>
    <v-card-text
      class="pa-0"
    >
      <!-- SEARCH -->
      <ReportListSearchInput
        v-model="search"
        class="mb-2"
      />

      <!-- LOADING BAR -->
      <ReportLoadingBar class="mb-2" />

      <div
        style="max-height: calc(100vh - 528px); overflow-y: auto;"
      >
        <!-- LIST -->
        <ReportList :results />
      </div>

      <!-- STATES -->
      <ReportState />
    </v-card-text>
  </v-card>
</template>

<style scoped>
* {
  scrollbar-color: #404040b3 transparent; /*firefox*/
  /* scrollbar-width: thin; */
}
</style>
