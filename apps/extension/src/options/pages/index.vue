<script setup lang="ts">
import { mdiTune } from '@mdi/js'

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <SettingsPageLayout
    :icon="mdiTune"
    :title="t('expert-settings')"
    :description="t('expert-settings-description')"
  >
    <ExtractionSettings />

    <v-divider class="my-4" />

    <MatchingSettings />
  </SettingsPageLayout>
</template>
