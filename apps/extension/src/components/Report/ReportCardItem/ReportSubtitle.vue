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
    <v-tooltip :text="$t('found-references-tooltip')">
      <template #activator="{ props }">
        <span
          v-bind="props"
          class="mr-4"
        >
          {{ `${t('found')}: ${foundReferencesCount}` }}
        </span>
      </template>
    </v-tooltip>
    <v-divider vertical />

    <v-tooltip :text="$t('verified-references-tooltip')">
      <template #activator="{ props }">
        <span
          v-bind="props"
          class="mx-4"
        >
          {{ `${t('verified')}: ${registeredReferencesCount}` }}
        </span>
      </template>
    </v-tooltip>

    <v-divider vertical />

    <v-tooltip :text="$t('unverified-references-tooltip')">
      <template #activator="{ props }">
        <span
          v-bind="props"
          class="mx-4"
        >
          {{ `${t('unverified')}: ${unregisteredReferencesCount}` }}
        </span>
      </template>
    </v-tooltip>

    <v-divider vertical />

    <v-tooltip :text="$t('error-references-tooltip')">
      <template #activator="{ props }">
        <span
          v-bind="props"
          class="mx-4"
        >
          {{ `${t('error')}: 0` }}
        </span>
      </template>
    </v-tooltip>
  </v-row>
</template>
