<script setup lang="ts">
import ExtractionFieldsPanel from './ExtractionFieldsPanel.vue'
import ExtractionModePanel from './ExtractionModePanel.vue'
</script>

<template>
  <v-card
    flat
    :title="$t('extractionSettings.title')"
    :subtitle="$t('extraction-settings-description')"
  >
    <v-card-text>
      <v-expansion-panels
        elevation="0"
        multiple
      >
        <!-- Extraction Mode Panel -->
        <ExtractionModePanel />

        <!-- Field Selection Panel -->
        <ExtractionFieldsPanel />
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>
