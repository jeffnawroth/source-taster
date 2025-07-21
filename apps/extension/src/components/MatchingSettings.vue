<script setup lang="ts">
import FieldWeightsPanel from './FieldWeightsPanel.vue'
import MatchingModePanel from './MatchingModePanel.vue'
import MatchQualityPanel from './MatchQualityPanel.vue'
import SettingsCard from './SettingsCard.vue'

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <SettingsCard
    :title="t('matching-settings-title')"
    :subtitle="t('matching-settings-description')"
  >
    <!-- Matching Mode Panel -->
    <MatchingModePanel />

    <!-- Field Weights Panel -->
    <FieldWeightsPanel />

    <!-- Match Quality Panel -->
    <MatchQualityPanel />
  </SettingsCard>
</template>
