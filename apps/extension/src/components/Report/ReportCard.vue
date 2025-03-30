<script setup lang="ts">
import { useWorkStore } from '@/extension/stores/work'
import { mdiFileDocumentOutline } from '@mdi/js'
import { useFuse } from '@vueuse/integrations/useFuse'

// SEARCH
const { works } = storeToRefs(useWorkStore())

const search = ref('')

const { results } = useFuse(search, works, {
  fuseOptions: {
    keys: ['content.message.DOI'],
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
      <!-- LOADING BAR -->
      <ReportLoadingBar />

      <!-- SEARCH -->
      <ReportListSearchInput
        v-model="search"
      />

      <div
        style="max-height: calc(100vh - 470px); overflow-y: auto; display: flex; flex-direction: column;"
      >
        <!-- LIST -->
        <ReportList :results />
      </div>

      <!-- STATES -->
      <ReportState />
    </v-card-text>
  </v-card>
</template>
