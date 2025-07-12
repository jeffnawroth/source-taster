<script setup lang="ts">
import { mdiTune } from '@mdi/js'
import FieldWeightsSettings from '@/extension/components/FieldWeightsSettings.vue'

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <v-icon
        :icon="mdiTune"
        class="mr-2"
      />
      <p class="text-h5 font-weight-bold mb-0">
        {{ t('expert-settings') }}
      </p>
    </div>

    <p class="text-body-2 text-medium-emphasis mb-4">
      {{ t('expert-settings-description') }}
    </p>

    <v-divider class="my-4" />

    <ExtractionSettings />

    <v-divider class="my-4" />

    <FieldWeightsSettings />
  </v-container>
</template>
