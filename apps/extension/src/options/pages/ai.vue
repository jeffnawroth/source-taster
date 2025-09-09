<script setup lang="ts">
import { mdiCogOutline } from '@mdi/js'
import { aiSettings } from '@/extension/logic/storage'
import AIKeyCard from '@/extension/options/components/AI/AIKeyCard.vue'
import AIProviderCard from '@/extension/options/components/AI/AIProviderCard.vue'

const { t } = useI18n()
</script>

<template>
  <SettingsPageLayout
    :icon="mdiCogOutline"
    :title="t('ai-settings-title')"
    :description="t('ai-settings-subtitle')"
  >
    <!-- Provider & Model -->
    <AIProviderCard v-model="aiSettings" />

    <v-divider class="my-4" />

    <!-- API Key (nur temporär, nicht im Local Storage speichern) -->
    <AIKeyCard />
  </SettingsPageLayout>
</template>
