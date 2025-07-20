<script setup lang="ts">
import FieldWeightsPanel from './FieldWeightsPanel.vue'
import MatchingModePanel from './MatchingModePanel.vue'
</script>

<template>
  <v-card
    flat
    :title="$t('matching-settings-title')"
    :subtitle="$t('matching-settings-description')"
  >
    <v-card-text>
      <v-expansion-panels
        elevation="0"
        multiple
      >
        <!-- Matching Mode Panel -->
        <MatchingModePanel />

        <!-- Field Weights Panel (only for CUSTOM matching mode) -->
        <FieldWeightsPanel />
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>
