<script setup lang="ts">
import { useDoiStore } from '~/stores/doi'

import { generatePDFReport } from '~/utils/pdfUtils'

// Work Store

// DOI Store
const { dois, works, passed, failed, warning } = storeToRefs(useDoiStore())

// I18n
const { t } = useI18n()
</script>

<template>
  <v-tooltip v-if="works.length > 0">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        icon="mdi-download"
        variant="plain"

        @click="generatePDFReport(dois, passed, warning, failed, works)"
      />
    </template>
    {{ t('download-report-pdf') }}
  </v-tooltip>
</template>
