<script setup lang="ts">
import { useMetadataStore } from '@/extension/stores/metadata'

const { foundReferencesCount, registeredReferencesCount, unregisteredReferencesCount } = storeToRefs(useMetadataStore())
// I18n
const { t } = useI18n()
</script>

<template>
  <v-row
    no-gutters
    density="compact"
  >
    <span class="mr-4">
      {{ `${t('found')}: ${foundReferencesCount}` }}
    </span>
    <v-divider vertical />

    <span class="mx-4">
      {{ `${t('registered')}: ${registeredReferencesCount}` }}
    </span>

    <v-divider vertical />

    <span class="mx-4">
      {{ `${t('unregistered')}: ${unregisteredReferencesCount}` }}
    </span>
  </v-row>
</template>
