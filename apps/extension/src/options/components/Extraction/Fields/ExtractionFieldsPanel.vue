<script setup lang="ts">
import type {
  ReferenceMetadataFields,
} from '@source-taster/types'
import { mdiCheckboxMultipleMarked } from '@mdi/js'
import { ACADEMIC_FIELDS, CORE_FIELDS, DATE_FIELDS, ESSENTIAL_FIELDS, IDENTIFIER_FIELDS, PUBLICATION_FIELDS, TECHNICAL_FIELDS } from '@/extension/constants/fieldCategoryAssignments'
import { extractionSettings } from '@/extension/logic'

// TRANSLATION
const { t } = useI18n()

function deselectAll() {
  extractionSettings.value.extractionConfig.fields = []
}

function selectAll() {
  const allFields: ReferenceMetadataFields[] = [
    ...CORE_FIELDS,
    ...DATE_FIELDS,
    ...IDENTIFIER_FIELDS,
    ...PUBLICATION_FIELDS,
    ...ACADEMIC_FIELDS,
    ...TECHNICAL_FIELDS,
  ]

  // Remove duplicates using Set
  extractionSettings.value.extractionConfig.fields = [...new Set(allFields)]
}

function selectEssentials() {
  extractionSettings.value.extractionConfig.fields = [...ESSENTIAL_FIELDS]
}
</script>

<template>
  <SettingsPanel
    :icon="mdiCheckboxMultipleMarked"
    :title="t('extractionSettings.description')"
    :description="t('extractionSettings.fieldSelectionDescription')"
    :subtitle="t('extractionSettings.fieldSelectionDescription')"
  >
    <ExtractionFieldsPanels />

    <!-- Quick Actions -->
    <template #actions>
      <v-btn
        color="primary"
        class="mr-2"
        variant="tonal"
        @click="selectAll"
      >
        {{ t('select-all') }}
      </v-btn>
      <v-btn
        variant="tonal"
        class="mr-2"
        color="primary"
        @click="selectEssentials"
      >
        {{ t('select-essentials') }}
      </v-btn>
      <v-btn
        variant="tonal"
        color="primary"
        @click="deselectAll"
      >
        {{ t('deselect-all') }}
      </v-btn>
    </template>
  </SettingsPanel>
</template>
