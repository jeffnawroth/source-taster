<script setup lang="ts">
import { mdiFileDocumentOutline } from '@mdi/js'
import { useFuse } from '@vueuse/integrations/useFuse'
import { useReferencesStore } from '@/extension/stores/references'

const { references } = storeToRefs(useReferencesStore())

const search = ref('')

const { results } = useFuse(search, references, {
  fuseOptions: {
    keys: ['originalText', 'metadata.title', 'metadata.authors'],
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
      <!-- <ReportPdfDownload /> -->
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
