<script setup lang="ts">
import { mdiBookOpen, mdiCalendar, mdiFileDocument, mdiIdentifier, mdiSchool, mdiWrench } from '@mdi/js'
import { computed } from 'vue'
import { extractionSettings } from '../logic'
import FieldCheckbox from './FieldCheckbox.vue'

// TRANSLATION
const { t } = useI18n()

// COMPUTED - Core Fields
const getCoreFieldsCount = computed(() => {
  const fields = extractionSettings.value.enabledFields
  return [fields.title, fields.authors, fields.year].filter(Boolean).length
})

const getCoreFieldsColor = computed(() => {
  const count = getCoreFieldsCount.value
  if (count === 3)
    return 'success'
  if (count >= 2)
    return 'warning'
  return 'error'
})

// COMPUTED - Date Fields
const getDateFieldsCount = computed(() => {
  const fields = extractionSettings.value.enabledFields
  return [
    fields.month,
    fields.day,
    fields.yearSuffix,
    fields.dateRange,
    fields.noDate,
    fields.inPress,
    fields.approximateDate,
    fields.season,
  ].filter(Boolean).length
})

const getDateFieldsColor = computed(() => {
  const count = getDateFieldsCount.value
  if (count >= 4)
    return 'success'
  if (count >= 2)
    return 'warning'
  return 'default'
})

// COMPUTED - Identifiers
const getIdentifiersCount = computed(() => {
  const fields = extractionSettings.value.enabledFields
  return [
    fields.doi,
    fields.isbn,
    fields.issn,
    fields.pmid,
    fields.pmcid,
    fields.arxivId,
  ].filter(Boolean).length
})

const getIdentifiersColor = computed(() => {
  const count = getIdentifiersCount.value
  if (count >= 3)
    return 'success'
  if (count >= 1)
    return 'warning'
  return 'default'
})

// COMPUTED - Publication Details
const getPublicationCount = computed(() => {
  const fields = extractionSettings.value.enabledFields
  return [
    fields.containerTitle,
    fields.subtitle,
    fields.volume,
    fields.issue,
    fields.pages,
    fields.publisher,
    fields.publicationPlace,
    fields.url,
    fields.sourceType,
    fields.location,
    fields.retrievalDate,
    fields.edition,
    fields.medium,
    fields.originalTitle,
    fields.originalLanguage,
    fields.chapterTitle,
  ].filter(Boolean).length
})

const getPublicationColor = computed(() => {
  const count = getPublicationCount.value
  if (count >= 8)
    return 'success'
  if (count >= 4)
    return 'warning'
  return 'default'
})

// COMPUTED - Academic Fields
const getAcademicCount = computed(() => {
  const fields = extractionSettings.value.enabledFields
  return [
    fields.conference,
    fields.institution,
    fields.series,
    fields.seriesNumber,
    fields.degree,
    fields.advisor,
    fields.department,
  ].filter(Boolean).length
})

const getAcademicColor = computed(() => {
  const count = getAcademicCount.value
  if (count >= 4)
    return 'success'
  if (count >= 2)
    return 'warning'
  return 'default'
})

// COMPUTED - Technical Fields
const getTechnicalCount = computed(() => {
  const fields = extractionSettings.value.enabledFields
  return [
    fields.pageType,
    fields.paragraphNumber,
    fields.volumePrefix,
    fields.issuePrefix,
    fields.supplementInfo,
    fields.articleNumber,
  ].filter(Boolean).length
})

const getTechnicalColor = computed(() => {
  const count = getTechnicalCount.value
  if (count >= 3)
    return 'success'
  if (count >= 1)
    return 'warning'
  return 'default'
})

// METHODS
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
  <v-card flat>
    <v-card-title>
      {{ t('extraction-settings') }}
    </v-card-title>
    <v-card-subtitle>
      {{ t('extraction-settings-description') }}
    </v-card-subtitle>
    <v-card-text>
      <!-- Quick Actions -->
      <div class="mb-4">
        <v-btn
          size="small"
          variant="outlined"
          class="mr-2"
          @click="selectAll"
        >
          {{ t('select-all') }}
        </v-btn>
        <v-btn
          size="small"
          variant="outlined"
          class="mr-2"
          @click="selectEssentials"
        >
          {{ t('select-essentials') }}
        </v-btn>
        <v-btn
          size="small"
          variant="outlined"
          @click="deselectAll"
        >
          {{ t('deselect-all') }}
        </v-btn>
      </div>

      <v-expansion-panels
        elevation="0"
      >
        <!-- Core Fields Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <v-icon
                :icon="mdiBookOpen"
                class="mr-2"
              />
              {{ t('core-metadata') }}
              <v-chip
                size="small"
                class="ml-2"
                :color="getCoreFieldsColor"
              >
                {{ getCoreFieldsCount }}/3
              </v-chip>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="extraction-fields">
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.title"
                field="title"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.authors"
                field="authors"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.year"
                field="year"
              />
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Date Information Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <v-icon
                :icon="mdiCalendar"
                class="mr-2"
              />
              {{ t('date-information') }}
              <v-chip
                size="small"
                class="ml-2"
                :color="getDateFieldsColor"
              >
                {{ getDateFieldsCount }}/8
              </v-chip>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="extraction-fields">
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.month"
                field="month"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.day"
                field="day"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.yearSuffix"
                field="yearSuffix"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.dateRange"
                field="dateRange"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.noDate"
                field="noDate"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.inPress"
                field="inPress"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.approximateDate"
                field="approximateDate"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.season"
                field="season"
              />
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Identifiers Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <v-icon
                :icon="mdiIdentifier"
                class="mr-2"
              />
              {{ t('identifiers') }}
              <v-chip
                size="small"
                class="ml-2"
                :color="getIdentifiersColor"
              >
                {{ getIdentifiersCount }}/6
              </v-chip>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="extraction-fields">
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.doi"
                field="doi"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.isbn"
                field="isbn"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.issn"
                field="issn"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.pmid"
                field="pmid"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.pmcid"
                field="pmcid"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.arxivId"
                field="arxivId"
              />
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Publication Details Section -->
        <v-expansion-panel value="publication">
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <v-icon
                :icon="mdiFileDocument"
                class="mr-2"
              />
              {{ t('publication-details') }}
              <v-chip
                size="small"
                class="ml-2"
                :color="getPublicationColor"
              >
                {{ getPublicationCount }}/16
              </v-chip>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="extraction-fields">
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.containerTitle"
                field="containerTitle"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.subtitle"
                field="subtitle"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.volume"
                field="volume"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.issue"
                field="issue"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.pages"
                field="pages"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.publisher"
                field="publisher"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.publicationPlace"
                field="publicationPlace"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.url"
                field="url"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.sourceType"
                field="sourceType"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.location"
                field="location"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.retrievalDate"
                field="retrievalDate"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.edition"
                field="edition"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.medium"
                field="medium"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.originalTitle"
                field="originalTitle"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.originalLanguage"
                field="originalLanguage"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.chapterTitle"
                field="chapterTitle"
              />
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Academic & Institutional Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <v-icon
                :icon="mdiSchool"
                class="mr-2"
              />
              {{ t('academic-institutional') }}
              <v-chip
                size="small"
                class="ml-2"
                :color="getAcademicColor"
              >
                {{ getAcademicCount }}/8
              </v-chip>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="extraction-fields">
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.conference"
                field="conference"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.institution"
                field="institution"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.series"
                field="series"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.seriesNumber"
                field="seriesNumber"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.degree"
                field="degree"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.advisor"
                field="advisor"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.department"
                field="department"
              />
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Technical Details Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <v-icon
                :icon="mdiWrench"
                class="mr-2"
              />
              {{ t('technical-details') }}
              <v-chip
                size="small"
                class="ml-2"
                :color="getTechnicalColor"
              >
                {{ getTechnicalCount }}/8
              </v-chip>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="extraction-fields">
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.pageType"
                field="pageType"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.paragraphNumber"
                field="paragraphNumber"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.volumePrefix"
                field="volumePrefix"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.issuePrefix"
                field="issuePrefix"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.supplementInfo"
                field="supplementInfo"
              />
              <FieldCheckbox
                v-model="extractionSettings.enabledFields.articleNumber"
                field="articleNumber"
              />
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.extraction-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.extraction-fields .v-checkbox {
  margin: 0;
}
</style>
