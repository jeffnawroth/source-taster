<script setup lang="ts">
import { extractionSettings } from '../logic'
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
        <ExtractionModePanel v-model="extractionSettings.extractionMode" />

        <!-- Field Selection Panel -->
        <ExtractionFieldsPanel v-model="extractionSettings" />
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>
