<script setup lang="ts">
// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <SettingsCard
    :title="t('search-settings-title')"
    :subtitle="t('search-settings-description')"
  >
    <!-- Database Panel -->
    <DatabasePanel />
  </SettingsCard>
</template>
