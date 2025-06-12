<script setup lang="ts">
import { mdiAlertCircleOutline, mdiCheckCircleOutline, mdiCloseCircleOutline, mdiMagnify } from '@mdi/js'
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
    <v-col
      cols="auto"
    >
      <v-tooltip :text="$t('found-references-tooltip')">
        <template #activator="{ props }">
          <v-chip
            label
            :prepend-icon="mdiMagnify"
            v-bind="props"
            variant="text"
            density="compact"
          >
            {{ `${t('found')}: ${foundReferencesCount}` }}
          </v-chip>
        </template>
      </v-tooltip>
    </v-col>

    <v-divider vertical />

    <v-cols
      cols="auto"
    >
      <v-tooltip :text="$t('verified-references-tooltip')">
        <template #activator="{ props }">
          <v-chip
            label
            :prepend-icon="mdiCheckCircleOutline"
            v-bind="props"
            variant="text"
            density="compact"
          >
            {{ `${t('verified')}: ${registeredReferencesCount}` }}
          </v-chip>
        </template>
      </v-tooltip>
    </v-cols>

    <v-divider vertical />

    <v-cols
      cols="auto"
    >
      <v-tooltip :text="$t('unverified-references-tooltip')">
        <template #activator="{ props }">
          <v-chip
            label
            :prepend-icon="mdiAlertCircleOutline"
            v-bind="props"
            variant="text"
            density="compact"
          >
            {{ `${t('unverified')}: ${unregisteredReferencesCount}` }}
          </v-chip>
        </template>
      </v-tooltip>
    </v-cols>

    <v-divider vertical />

    <v-tooltip :text="$t('error-references-tooltip')">
      <template #activator="{ props }">
        <v-chip
          label
          :prepend-icon="mdiCloseCircleOutline"
          v-bind="props"
          variant="text"
          density="compact"
        >
          {{ `${t('error')}: 0` }}
        </v-chip>
      </template>
    </v-tooltip>
  </v-row>
</template>
