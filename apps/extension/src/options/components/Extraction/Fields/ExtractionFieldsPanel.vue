<script setup lang="ts">
import { mdiCheckboxMultipleMarked } from '@mdi/js'

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <SettingsPanel
    :icon="mdiCheckboxMultipleMarked"
    :title="t('extractionSettings.description')"
    :description="t('extractionSettings.fieldSelectionDescription')"
    :subtitle="t('extractionSettings.fieldSelectionDescription')"
  >
    <ExtractionFieldsPanels />
  </SettingsPanel>
</template>
