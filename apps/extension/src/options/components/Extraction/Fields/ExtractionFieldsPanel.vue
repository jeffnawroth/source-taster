<script setup lang="ts">
import { mdiCheckboxMultipleMarked } from '@mdi/js'
import { extractionSettings } from '@/extension/logic'

// TRANSLATION
const { t } = useI18n()

// FUNCTIONS
function deselectAll() {
  const fields = extractionSettings.value.enabledFields
  Object.keys(fields).forEach((key) => {
    fields[key as keyof typeof fields] = false
  })
}

function selectAll() {
  const fields = extractionSettings.value.enabledFields
  Object.keys(fields).forEach((key) => {
    fields[key as keyof typeof fields] = true
  })
}

function selectEssentials() {
  // First deselect all
  deselectAll()

  // Then select essential fields
  const fields = extractionSettings.value.enabledFields
  fields.title = true
  fields.authors = true
  fields.year = true
  fields.doi = true
  fields.containerTitle = true
  fields.pages = true
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
