<script setup lang="ts">
import { mdiCog } from '@mdi/js'
import ExtractionModeSelector from './ExtractionModeSelector.vue'
import SettingsPanel from './SettingsPanel.vue'

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <SettingsPanel
    :icon="mdiCog"
    :title="t('extractionSettings.mode.title')"
    :description="t('extractionSettings.mode.description')"
  >
    <ExtractionModeSelector />
  </SettingsPanel>
</template>
