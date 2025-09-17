<script setup lang="ts">
import { mdiRobot, mdiRobotOff } from '@mdi/js'
import AIToggleSwitch from '@/extension/components/UI/AIToggleSwitch.vue'
import { settings } from '@/extension/logic'

const { t } = useI18n()
</script>

<template>
  <SettingsPanel
    :icon="settings.extract.useAi ? mdiRobot : mdiRobotOff"
    :title="t('extraction-ai-title')"
    :description="t('extraction-ai-description')"
  >
    <AIToggleSwitch v-model="settings.extract.useAi" />
  </SettingsPanel>
</template>
