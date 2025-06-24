<script setup lang="ts">
import { mdiAlertCircleOutline, mdiCheckCircleOutline, mdiCloseCircleOutline, mdiMagnify } from '@mdi/js'
import { useReferencesStore } from '@/extension/stores/references'

const { statusCounts } = storeToRefs(useReferencesStore())

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
            {{ `${t('found')}: ${statusCounts.total}` }}
          </v-chip>
        </template>
      </v-tooltip>
    </v-col>

    <v-divider vertical />

    <v-col
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
            {{ `${t('verified')}: ${statusCounts.verified}` }}
          </v-chip>
        </template>
      </v-tooltip>
    </v-col>

    <v-divider vertical />

    <v-col
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
            {{ `${t('unverified')}: ${statusCounts.notVerified}` }}
          </v-chip>
        </template>
      </v-tooltip>
    </v-col>

    <div v-if="statusCounts.error > 0">
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
            {{ `${t('error')}: ${statusCounts.error}` }}
          </v-chip>
        </template>
      </v-tooltip>
    </div>
  </v-row>
</template>
