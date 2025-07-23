<script setup lang="ts">
import { mdiTargetVariant } from '@mdi/js'

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <SettingsPanel
    :icon="mdiTargetVariant"
    :title="t('matching-tolerance-mode-title')"
    :description="t('matching-tolerance-mode-description')"
    :subtitle="t('matching-tolerance-mode-subtitle')"
  >
    <MatchingModeSelector />
  </SettingsPanel>
</template>
