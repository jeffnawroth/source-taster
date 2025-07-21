<script setup lang="ts">
import { mdiTune } from '@mdi/js'
import ExtractionSettings from '@/extension/components/ExtractionSettings.vue'
import MatchingSettings from '@/extension/components/MatchingSettings.vue'
import SettingsPageLayout from '@/extension/components/SettingsPageLayout.vue'

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
