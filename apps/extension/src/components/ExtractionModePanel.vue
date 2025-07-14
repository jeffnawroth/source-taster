<script setup lang="ts">
import { mdiCog } from '@mdi/js'
import ExtractionModeSelector from './ExtractionModeSelector.vue'
</script>

<template>
  <v-expansion-panel>
    <v-expansion-panel-title>
      <div class="d-flex align-center">
        <v-icon
          :icon="mdiCog"
          class="me-3"
        />
        <div>
          <div class="text-h6">
            {{ $t('extractionSettings.mode.title') }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ $t('extractionSettings.mode.description') }}
          </div>
        </div>
      </div>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <ExtractionModeSelector />
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
