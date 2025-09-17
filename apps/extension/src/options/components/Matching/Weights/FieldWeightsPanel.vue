<script setup lang="ts">
import { mdiStarFourPoints } from '@mdi/js'

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <SettingsPanel
    :icon="mdiStarFourPoints"
    :title="t('field-matching-configuration')"
    :description="t('field-matching-configuration-description')"
    :subtitle="t('field-matching-configuration-subtitle')"
  >
    <FieldWeightsSettings />
  </SettingsPanel>
</template>
