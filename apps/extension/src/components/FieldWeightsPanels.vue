<script setup lang="ts">
import type { FieldWeights } from '@source-taster/types'
import {
  mdiBookOpenVariant,
  mdiCardAccountDetailsOutline,
  mdiStarFourPoints,
  mdiWrench,
} from '@mdi/js'
import FieldWeightControl from './FieldWeightControl.vue'
import FieldWeightSection from './FieldWeightSection.vue'

interface Props {
  coreFieldsWeight: number
  identifierFieldsWeight: number
  sourceFieldsWeight: number
  additionalFieldsWeight: number
}

defineProps<Props>()

const fieldWeights = defineModel<FieldWeights>({ required: true })

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <v-expansion-panels
    elevation="0"
  >
    <!-- Core Fields -->
    <FieldWeightSection
      :title="t('core-fields')"
      :icon="mdiStarFourPoints"
      :weight="coreFieldsWeight"
    >
      <FieldWeightControl
        v-model="fieldWeights.title"
        :label="t('title')"
        :description="t('field-description-title')"
        :default-value="25"
      />

      <FieldWeightControl
        v-model="fieldWeights.authors"
        :label="t('authors')"
        :description="t('field-description-authors')"
        :default-value="20"
      />

      <FieldWeightControl
        v-model="fieldWeights.year"
        :label="t('year')"
        :description="t('field-description-year')"
        :default-value="5"
      />
    </FieldWeightSection>

    <!-- Identifier Fields -->
    <FieldWeightSection
      :title="t('identifier-fields')"
      :icon="mdiCardAccountDetailsOutline"
      :weight="identifierFieldsWeight"
    >
      <FieldWeightControl
        v-model="fieldWeights.doi"
        label="DOI"
        :description="t('field-description-doi')"
        :default-value="15"
      />

      <FieldWeightControl
        v-model="fieldWeights.arxivId"
        label="ArXiv ID"
        :description="t('field-description-arxivId')"
        :default-value="8"
      />

      <FieldWeightControl
        v-model="fieldWeights.pmid"
        label="PMID"
        :description="t('field-description-pmid')"
        :default-value="3"
      />

      <FieldWeightControl
        v-model="fieldWeights.pmcid"
        label="PMC ID"
        :description="t('field-description-pmcid')"
        :default-value="2"
      />

      <FieldWeightControl
        v-model="fieldWeights.isbn"
        label="ISBN"
        :description="t('field-description-isbn')"
        :default-value="1"
      />

      <FieldWeightControl
        v-model="fieldWeights.issn"
        label="ISSN"
        :description="t('field-description-issn')"
        :default-value="1"
      />
    </FieldWeightSection>

    <!-- Source Fields -->
    <FieldWeightSection
      :title="t('source-fields')"
      :icon="mdiBookOpenVariant"
      :weight="sourceFieldsWeight"
    >
      <FieldWeightControl
        v-model="fieldWeights.containerTitle"
        :label="t('container-title')"
        :description="t('field-description-containerTitle')"
        :default-value="10"
      />

      <FieldWeightControl
        v-model="fieldWeights.volume"
        :label="t('volume')"
        :description="t('field-description-volume')"
        :default-value="5"
      />

      <FieldWeightControl
        v-model="fieldWeights.issue"
        :label="t('issue')"
        :description="t('field-description-issue')"
        :default-value="3"
      />

      <FieldWeightControl
        v-model="fieldWeights.pages"
        :label="t('pages')"
        :description="t('field-description-pages')"
        :default-value="2"
      />

      <FieldWeightControl
        v-model="fieldWeights.publisher"
        :label="t('publisher')"
        :description="t('field-description-publisher')"
        :default-value="3"
      />

      <FieldWeightControl
        v-model="fieldWeights.url"
        label="URL"
        :description="t('field-description-url')"
        :default-value="2"
      />
    </FieldWeightSection>

    <!-- Advanced Fields -->
    <FieldWeightSection
      :title="t('advanced-fields')"
      :icon="mdiWrench"
      :weight="additionalFieldsWeight"
      :show-alert="true"
      :alert-text="t('advanced-fields-description')"
    >
      <FieldWeightControl
        v-model="fieldWeights.sourceType"
        :label="t('source-type')"
        :description="t('field-description-sourceType')"
        :default-value="2"
      />

      <FieldWeightControl
        v-model="fieldWeights.conference"
        :label="t('conference')"
        :description="t('field-description-conference')"
        :default-value="5"
      />

      <FieldWeightControl
        v-model="fieldWeights.subtitle"
        :label="t('subtitle')"
        :description="t('field-description-subtitle')"
        :default-value="3"
      />

      <!-- More Advanced Fields -->
      <v-expansion-panels
        variant="accordion"
        class="mt-4"
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
              v-model="fieldWeights.institution"
              :label="t('institution')"
              :description="t('field-description-institution')"
              :default-value="3"
            />

            <FieldWeightControl
              v-model="fieldWeights.edition"
              :label="t('edition')"
              :description="t('field-description-edition')"
              :default-value="2"
            />

            <FieldWeightControl
              v-model="fieldWeights.articleNumber"
              :label="t('article-number')"
              :description="t('field-description-articleNumber')"
              :default-value="1"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </FieldWeightSection>
  </v-expansion-panels>
</template>
