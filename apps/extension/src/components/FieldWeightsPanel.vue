<script setup lang="ts">
import { mdiStarFourPoints } from '@mdi/js'
import FieldWeightsSettings from './FieldWeightsSettings.vue'
import SettingsPanel from './SettingsPanel.vue'

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <SettingsPanel
    :icon="mdiStarFourPoints"
    :title="t('field-weights')"
    :description="t('field-weights-description')"
  >
    <FieldWeightsSettings />
  </SettingsPanel>
</template>
