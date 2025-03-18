<script setup lang="ts">
import { mdiFileDocumentOutline } from '@mdi/js'
// i18n
const { t } = useI18n()
</script>

<template>
  <v-card
    flat
    :title="t('report')"
  >
    <template #prepend>
      <v-icon
        :icon="mdiFileDocumentOutline"
        size="large"
      />
    </template>
    <template #append>
      <ReportIconAi />
      <ReportPdfDownload />
    </template>
    <template
      #subtitle
    >
      <ReportSubtitle />
    </template>
    <v-card-text
      class="pa-0"
    >
      <ReportLoadingBar />
      <div style="max-height: 300px; overflow-y: auto; display: flex; flex-direction: column;">
        <ReportList />
      </div>
      <ReportState />
    </v-card-text>
  </v-card>
</template>
