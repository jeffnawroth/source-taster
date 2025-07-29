<script setup lang="ts">
import { mdiTune } from '@mdi/js'
import { aiSettings } from '@/extension/logic/storage'
import AISettings from '@/extension/options/components/AI/AISettings.vue'

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <SettingsPageLayout
    :icon="mdiTune"
    :title="t('expert-settings')"
    :description="t('expert-settings-description')"
  >
    <AISettings v-model="aiSettings" />

    <v-divider class="my-4" />

    <ExtractionSettings />

    <v-divider class="my-4" />

    <MatchingSettings />
  </SettingsPageLayout>
</template>
