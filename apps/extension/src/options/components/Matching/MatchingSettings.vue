<script setup lang="ts">
// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <SettingsCard
    :title="t('matching-settings-title')"
    :subtitle="t('matching-settings-description')"
  >
    <!-- Database Panel -->
    <DatabasePanel />

    <!-- Matching Mode Panel -->
    <MatchingModePanel />

    <!-- Field Weights Panel -->
    <FieldWeightsPanel />

    <!-- Match Quality Panel -->
    <MatchQualityPanel />

    <!-- Early Termination Panel -->
    <EarlyTerminationPanel />
  </SettingsCard>
</template>
