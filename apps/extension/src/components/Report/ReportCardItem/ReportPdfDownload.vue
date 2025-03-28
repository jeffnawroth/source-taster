<script setup lang="ts">
import { useAppStore } from '@/extension/stores/app'
import { useDoiStore } from '@/extension/stores/doi'
import { useWorkStore } from '@/extension/stores/work'
import { mdiDownload } from '@mdi/js'
import { generatePDFReport } from '../../../utils/pdfUtils'

// Loading
const { isLoading } = storeToRefs(useAppStore())

// DOI Store
const { extractedDois } = storeToRefs(useDoiStore())

// WORKS
const workStore = useWorkStore()
const { valid, invalid, works } = storeToRefs(workStore)

// I18n
const { t } = useI18n()

async function downloadPDF() {
  const pdfBytes = await generatePDFReport(
    extractedDois.value,
    valid.value,
    invalid.value,
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
  <v-tooltip v-if="works.length > 0 && !isLoading">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        :icon="mdiDownload"
        density="compact"
        variant="plain"
        @click="downloadPDF"
      />
    </template>
    {{ t('download-report-pdf') }}
  </v-tooltip>
</template>
