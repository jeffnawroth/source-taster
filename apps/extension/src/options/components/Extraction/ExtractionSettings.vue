<script setup lang="ts">
// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <SettingsCard
    :title="t('extractionSettings.title')"
    :subtitle="t('extraction-settings-description')"
  >
    <!-- Extraction Mode Panel -->
    <!-- <ExtractionModePanel /> -->

    <!-- Field Selection Panel -->
    <ExtractionFieldsPanel />
  </SettingsCard>
</template>
