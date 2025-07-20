<script setup lang="ts">
import ExtractionFieldsPanel from './ExtractionFieldsPanel.vue'
import ExtractionModePanel from './ExtractionModePanel.vue'
import SettingsCard from './SettingsCard.vue'

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <SettingsCard
    :title="t('extractionSettings.title')"
    :subtitle="t('extraction-settings-description')"
  >
    <!-- Extraction Mode Panel -->
    <ExtractionModePanel />

    <!-- Field Selection Panel -->
    <ExtractionFieldsPanel />
  </SettingsCard>
</template>
