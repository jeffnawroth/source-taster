<!-- <script setup lang="ts">
import { useAppStore } from '@/extension/stores/app'
// import { useMetadataStore } from '@/extension/stores/metadata'
import { mdiDownload } from '@mdi/js'
// import { generatePDFReport } from '../../../utils/pdfUtils'

// Loading
const { isLoading } = storeToRefs(useAppStore())

// I18n
const { t } = useI18n()

// const { registeredReferencesCount, unregisteredReferencesCount, verifiedReferences } = storeToRefs(useMetadataStore())

async function downloadPDF() {

  // const pdfBytes = await generatePDFReport(
  //   verifiedReferences.value,
  //   registeredReferencesCount.value,
  //   unregisteredReferencesCount.value,
  // )

  // const blob = new Blob([pdfBytes], { type: 'application/pdf' })

  // const link = document.createElement('a')
  // link.href = URL.createObjectURL(blob)
  // link.download = 'report.pdf'
  // link.click()

  // URL.revokeObjectURL(link.href)
}
</script>

<template>
  <v-tooltip v-if="(verifiedReferences.length) && !isLoading">
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
</template> -->
