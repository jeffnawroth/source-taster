<script setup lang="ts">
import { mdiTargetVariant } from '@mdi/js'
import MatchingModeSelector from './MatchingModeSelector.vue'
</script>

<template>
  <v-expansion-panel>
    <v-expansion-panel-title>
      <div class="d-flex align-center">
        <v-icon
          :icon="mdiTargetVariant"
          class="me-3"
        />
        <div>
          <div class="text-h6">
            {{ $t('matching-mode-title') }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ $t('matching-mode-description') }}
          </div>
        </div>
      </div>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <MatchingModeSelector />
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
