<script setup lang="ts">
import { DEFAULT_FIELDS_CONFIG } from '@source-taster/types'
import { matchingSettings } from '@/extension/logic'

// Reset to defaults
function resetToDefaults() {
  matchingSettings.value.matchingConfig.fieldConfigurations = { ...DEFAULT_FIELDS_CONFIG }
}

// Calculate total weight for validation - only enabled fields
const totalWeight = computed(() => {
  return Object.values(matchingSettings.value.matchingConfig.fieldConfigurations).reduce((sum: number, config) => {
    return sum + (config?.enabled ? (config.weight || 0) : 0)
  }, 0)
})

// Validation
const isValidConfiguration = computed(() => {
  return totalWeight.value === 100
})

// Core fields weight
const coreFieldsWeight = computed(() => {
  const titleConfig = matchingSettings.value.matchingConfig.fieldConfigurations.title
  const authorsConfig = matchingSettings.value.matchingConfig.fieldConfigurations.authors
  const yearConfig = matchingSettings.value.matchingConfig.fieldConfigurations.year

  return (titleConfig?.enabled ? (titleConfig.weight || 0) : 0)
    + (authorsConfig?.enabled ? (authorsConfig.weight || 0) : 0)
    + (yearConfig?.enabled ? (yearConfig.weight || 0) : 0)
})

// Identifier fields weight
const identifierFieldsWeight = computed(() => {
  const doiConfig = matchingSettings.value.matchingConfig.fieldConfigurations.doi
  const arxivConfig = matchingSettings.value.matchingConfig.fieldConfigurations.arxivId
  const pmidConfig = matchingSettings.value.matchingConfig.fieldConfigurations.pmid
  const pmcidConfig = matchingSettings.value.matchingConfig.fieldConfigurations.pmcid
  const isbnConfig = matchingSettings.value.matchingConfig.fieldConfigurations.isbn
  const issnConfig = matchingSettings.value.matchingConfig.fieldConfigurations.issn

  return (doiConfig?.enabled ? (doiConfig.weight || 0) : 0)
    + (arxivConfig?.enabled ? (arxivConfig.weight || 0) : 0)
    + (pmidConfig?.enabled ? (pmidConfig.weight || 0) : 0)
    + (pmcidConfig?.enabled ? (pmcidConfig.weight || 0) : 0)
    + (isbnConfig?.enabled ? (isbnConfig.weight || 0) : 0)
    + (issnConfig?.enabled ? (issnConfig.weight || 0) : 0)
})

// Source fields weight
const sourceFieldsWeight = computed(() => {
  const containerConfig = matchingSettings.value.matchingConfig.fieldConfigurations.containerTitle
  const volumeConfig = matchingSettings.value.matchingConfig.fieldConfigurations.volume
  const issueConfig = matchingSettings.value.matchingConfig.fieldConfigurations.issue
  const pagesConfig = matchingSettings.value.matchingConfig.fieldConfigurations.pages
  const publisherConfig = matchingSettings.value.matchingConfig.fieldConfigurations.publisher
  const urlConfig = matchingSettings.value.matchingConfig.fieldConfigurations.url

  return (containerConfig?.enabled ? (containerConfig.weight || 0) : 0)
    + (volumeConfig?.enabled ? (volumeConfig.weight || 0) : 0)
    + (issueConfig?.enabled ? (issueConfig.weight || 0) : 0)
    + (pagesConfig?.enabled ? (pagesConfig.weight || 0) : 0)
    + (publisherConfig?.enabled ? (publisherConfig.weight || 0) : 0)
    + (urlConfig?.enabled ? (urlConfig.weight || 0) : 0)
})

// Additional fields weight (specialized/advanced fields)
const additionalFieldsWeight = computed(() => {
  const sourceTypeConfig = matchingSettings.value.matchingConfig.fieldConfigurations.sourceType
  const conferenceConfig = matchingSettings.value.matchingConfig.fieldConfigurations.conference
  const institutionConfig = matchingSettings.value.matchingConfig.fieldConfigurations.institution
  const editionConfig = matchingSettings.value.matchingConfig.fieldConfigurations.edition
  const articleNumberConfig = matchingSettings.value.matchingConfig.fieldConfigurations.articleNumber
  const subtitleConfig = matchingSettings.value.matchingConfig.fieldConfigurations.subtitle

  return (sourceTypeConfig?.enabled ? (sourceTypeConfig.weight || 0) : 0)
    + (conferenceConfig?.enabled ? (conferenceConfig.weight || 0) : 0)
    + (institutionConfig?.enabled ? (institutionConfig.weight || 0) : 0)
    + (editionConfig?.enabled ? (editionConfig.weight || 0) : 0)
    + (articleNumberConfig?.enabled ? (articleNumberConfig.weight || 0) : 0)
    + (subtitleConfig?.enabled ? (subtitleConfig.weight || 0) : 0)
})
</script>

<template>
  <!-- <template #append>
      <FieldWeightsTooltip />
    </template> -->

  <FieldWeightsValidationAlert
    :total-weight
    :is-valid-configuration
  />

  <FieldWeightsPanels
    v-model="matchingSettings.matchingConfig.fieldConfigurations"
    :core-fields-weight
    :identifier-fields-weight
    :source-fields-weight
    :additional-fields-weight
  />

  <v-card-actions>
    <ResetButton @click="resetToDefaults" />
  </v-card-actions>
</template>
