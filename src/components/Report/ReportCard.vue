<script setup lang="ts">
// i18n
const { t } = useI18n()

// Watcher

// Watches the network error state
</script>

<template>
  <v-card
    flat
    :title="t('report')"
  >
    <template #prepend>
      <v-icon
        icon="mdi-file-document-outline"
        size="large"
      />
    </template>
    <template #append>
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

      <ReportList />

      <ReportState />
    </v-card-text>
  </v-card>
</template>
