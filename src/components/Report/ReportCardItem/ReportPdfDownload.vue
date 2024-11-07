<script setup lang="ts">
import { useDoiStore } from '~/stores/doi'
import { generatePDFReport } from '../../../utils/pdfUtils'

// Work Store

// DOI Store
const { dois, works, passed, failed, warning } = storeToRefs(useDoiStore())

// I18n
const { t } = useI18n()

async function downloadPDF() {
  const pdfBytes = await generatePDFReport(
    dois.value,
    passed.value,
    warning.value,
    failed.value,
    works.value,
  )

  const blob = new Blob([pdfBytes], { type: 'application/pdf' })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'report.pdf'
  link.click()

  URL.revokeObjectURL(link.href)
}
</script>

<template>
  <v-tooltip v-if="works.length > 0">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        icon="mdi-download"
        variant="plain"
        @click="downloadPDF"
      />
    </template>
    {{ t('download-report-pdf') }}
  </v-tooltip>
</template>
