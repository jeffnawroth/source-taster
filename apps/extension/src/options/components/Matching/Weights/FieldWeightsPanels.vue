<script setup lang="ts">
import type { FieldWeights } from '@source-taster/types'
import {
  mdiBookOpenVariant,
  mdiCardAccountDetailsOutline,
  mdiStarFourPoints,
  mdiWrench,
} from '@mdi/js'

interface FieldDefinition {
  key: keyof FieldWeights
  label?: string
  labelKey?: string
  descriptionKey: string
  defaultValue: number
}

interface SectionDefinition {
  titleKey: string
  icon: string
  weight: number
  showAlert?: boolean
  alertTextKey?: string
  fields: FieldDefinition[]
  advancedFields?: FieldDefinition[]
}

interface Props {
  coreFieldsWeight: number
  identifierFieldsWeight: number
  sourceFieldsWeight: number
  additionalFieldsWeight: number
}

const props = defineProps<Props>()

const fieldWeights = defineModel<FieldWeights>({ required: true })

// TRANSLATION
const { t } = useI18n()

// FIELD DEFINITIONS
const fieldSections = computed((): SectionDefinition[] => [
  {
    titleKey: 'core-fields',
    icon: mdiStarFourPoints,
    weight: props.coreFieldsWeight,
    fields: [
      {
        key: 'title' as keyof FieldWeights,
        labelKey: 'title',
        descriptionKey: 'field-description-title',
        defaultValue: 25,
      },
      {
        key: 'authors' as keyof FieldWeights,
        labelKey: 'authors',
        descriptionKey: 'field-description-authors',
        defaultValue: 20,
      },
      {
        key: 'year' as keyof FieldWeights,
        labelKey: 'year',
        descriptionKey: 'field-description-year',
        defaultValue: 5,
      },
    ],
  },
  {
    titleKey: 'identifier-fields',
    icon: mdiCardAccountDetailsOutline,
    weight: props.identifierFieldsWeight,
    fields: [
      {
        key: 'doi' as keyof FieldWeights,
        label: 'DOI',
        descriptionKey: 'field-description-doi',
        defaultValue: 15,
      },
      {
        key: 'arxivId' as keyof FieldWeights,
        label: 'ArXiv ID',
        descriptionKey: 'field-description-arxivId',
        defaultValue: 8,
      },
      {
        key: 'pmid' as keyof FieldWeights,
        label: 'PMID',
        descriptionKey: 'field-description-pmid',
        defaultValue: 3,
      },
      {
        key: 'pmcid' as keyof FieldWeights,
        label: 'PMC ID',
        descriptionKey: 'field-description-pmcid',
        defaultValue: 2,
      },
      {
        key: 'isbn' as keyof FieldWeights,
        label: 'ISBN',
        descriptionKey: 'field-description-isbn',
        defaultValue: 1,
      },
      {
        key: 'issn' as keyof FieldWeights,
        label: 'ISSN',
        descriptionKey: 'field-description-issn',
        defaultValue: 1,
      },
    ],
  },
  {
    titleKey: 'source-fields',
    icon: mdiBookOpenVariant,
    weight: props.sourceFieldsWeight,
    fields: [
      {
        key: 'containerTitle' as keyof FieldWeights,
        labelKey: 'container-title',
        descriptionKey: 'field-description-containerTitle',
        defaultValue: 10,
      },
      {
        key: 'volume' as keyof FieldWeights,
        labelKey: 'volume',
        descriptionKey: 'field-description-volume',
        defaultValue: 5,
      },
      {
        key: 'issue' as keyof FieldWeights,
        labelKey: 'issue',
        descriptionKey: 'field-description-issue',
        defaultValue: 3,
      },
      {
        key: 'pages' as keyof FieldWeights,
        labelKey: 'pages',
        descriptionKey: 'field-description-pages',
        defaultValue: 2,
      },
      {
        key: 'publisher' as keyof FieldWeights,
        labelKey: 'publisher',
        descriptionKey: 'field-description-publisher',
        defaultValue: 3,
      },
      {
        key: 'url' as keyof FieldWeights,
        label: 'URL',
        descriptionKey: 'field-description-url',
        defaultValue: 2,
      },
    ],
  },
  {
    titleKey: 'advanced-fields',
    icon: mdiWrench,
    weight: props.additionalFieldsWeight,
    showAlert: true,
    alertTextKey: 'advanced-fields-description',
    fields: [
      {
        key: 'sourceType' as keyof FieldWeights,
        labelKey: 'source-type',
        descriptionKey: 'field-description-sourceType',
        defaultValue: 2,
      },
      {
        key: 'conference' as keyof FieldWeights,
        labelKey: 'conference',
        descriptionKey: 'field-description-conference',
        defaultValue: 5,
      },
      {
        key: 'subtitle' as keyof FieldWeights,
        labelKey: 'subtitle',
        descriptionKey: 'field-description-subtitle',
        defaultValue: 3,
      },
    ],
    advancedFields: [
      {
        key: 'institution' as keyof FieldWeights,
        labelKey: 'institution',
        descriptionKey: 'field-description-institution',
        defaultValue: 3,
      },
      {
        key: 'edition' as keyof FieldWeights,
        labelKey: 'edition',
        descriptionKey: 'field-description-edition',
        defaultValue: 2,
      },
      {
        key: 'articleNumber' as keyof FieldWeights,
        labelKey: 'article-number',
        descriptionKey: 'field-description-articleNumber',
        defaultValue: 1,
      },
    ],
  },
])
</script>

<template>
  <v-expansion-panels
    elevation="0"
  >
    <FieldWeightSection
      v-for="section in fieldSections"
      :key="section.titleKey"
      :title="t(section.titleKey)"
      :icon="section.icon"
      :weight="section.weight"
      :show-alert="section.showAlert"
      :alert-text="section.alertTextKey ? t(section.alertTextKey) : undefined"
    >
      <FieldWeightControl
        v-for="field in section.fields"
        :key="field.key"
        v-model="fieldWeights[field.key]"
        :label="field.label || t(field.labelKey || '')"
        :description="t(field.descriptionKey)"
        :default-value="field.defaultValue"
      />

      <!-- More Advanced Fields (only for advanced section) -->
      <v-expansion-panels
        v-if="section.advancedFields"
        variant="accordion"
        class="mt-4"
        elevation="0"
      >
        <v-expansion-panel>
          <v-expansion-panel-title class="text-body-2">
            {{ t('more-advanced-fields') }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="text-caption text-medium-emphasis mb-4">
              {{ t('more-advanced-fields-description') }}
            </div>

            <FieldWeightControl
              v-for="field in section.advancedFields"
              :key="field.key"
              v-model="fieldWeights[field.key]"
              :label="field.label || t(field.labelKey || '')"
              :description="t(field.descriptionKey)"
              :default-value="field.defaultValue"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </FieldWeightSection>
  </v-expansion-panels>
</template>
