<script setup lang="ts">
import { mdiTargetVariant } from '@mdi/js'
import MatchingModeSelector from './MatchingModeSelector.vue'
import SettingsPanel from './SettingsPanel.vue'

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <SettingsPanel
    :icon="mdiTargetVariant"
    :title="t('matching-mode-title')"
    :description="t('matching-mode-description')"
    :subtitle="t('matching-mode-description')"
  >
    <MatchingModeSelector />
  </SettingsPanel>
</template>
