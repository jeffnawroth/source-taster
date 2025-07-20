<script setup lang="ts">
import { mdiStarFourPoints } from '@mdi/js'
import FieldWeightsSettings from './FieldWeightsSettings.vue'

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <v-expansion-panel>
    <v-expansion-panel-title>
      <div class="d-flex align-center">
        <v-icon
          :icon="mdiStarFourPoints"
          class="me-3"
        />
        <div>
          <div class="text-h6">
            {{ t('field-weights') }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ t('field-weights-description') }}
          </div>
        </div>
      </div>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <FieldWeightsSettings />
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
