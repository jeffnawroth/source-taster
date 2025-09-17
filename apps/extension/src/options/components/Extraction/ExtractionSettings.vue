<script setup lang="ts">
// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <SettingsCard
    :title="t('extractionSettings.title')"
    :subtitle="t('extraction-settings-description')"
  >
    <!-- AI Toggle Panel -->
    <AITogglePanel />

    <!-- Extraction Mode Panel -->
    <!-- <ExtractionModePanel /> -->

    <!-- Field Selection Panel -->
    <ExtractionFieldsPanel />
  </SettingsCard>
</template>
