<script setup lang="ts">
import { mdiCog } from '@mdi/js'

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <SettingsPanel
    :icon="mdiCog"
    :title="t('extractionSettings.mode.title')"
    :description="t('extractionSettings.mode.description')"
    :subtitle="t('extractionSettings.mode.description')"
  >
    <ExtractionModeSelector />
  </SettingsPanel>
</template>
