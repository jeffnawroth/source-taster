<script setup lang="ts">
import type { FieldConfigurations } from '@source-taster/types'
import {
  mdiBookOpenVariant,
  mdiCardAccountDetailsOutline,
  mdiStarFourPoints,
  mdiWrench,
} from '@mdi/js'
import { FIELD_DEFINITIONS, type FieldDefinition } from '@/extension/constants/fieldWeightConstants'

interface SectionDefinition {
  titleKey: string
  icon: string
  weight: number
  showAlert?: boolean
  alertTextKey?: string
  fields: readonly FieldDefinition[]
  advancedFields?: readonly FieldDefinition[]
}

interface Props {
  coreFieldsWeight: number
  identifierFieldsWeight: number
  sourceFieldsWeight: number
  additionalFieldsWeight: number
}

const props = defineProps<Props>()

const fieldConfigurations = defineModel<FieldConfigurations>({ required: true })

// TRANSLATION
const { t } = useI18n()

// FIELD DEFINITIONS
const fieldSections = computed((): SectionDefinition[] => [
  {
    titleKey: 'core-fields',
    icon: mdiStarFourPoints,
    weight: props.coreFieldsWeight,
    fields: FIELD_DEFINITIONS.core,
  },
  {
    titleKey: 'identifier-fields',
    icon: mdiCardAccountDetailsOutline,
    weight: props.identifierFieldsWeight,
    fields: FIELD_DEFINITIONS.identifier,
  },
  {
    titleKey: 'source-fields',
    icon: mdiBookOpenVariant,
    weight: props.sourceFieldsWeight,
    fields: FIELD_DEFINITIONS.source,
  },
  {
    titleKey: 'advanced-fields',
    icon: mdiWrench,
    weight: props.additionalFieldsWeight,
    showAlert: true,
    alertTextKey: 'advanced-fields-description',
    fields: FIELD_DEFINITIONS.additional.main,
    advancedFields: FIELD_DEFINITIONS.additional.advanced,
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
        v-model="fieldConfigurations[field.key as keyof FieldConfigurations]"
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
              v-model="fieldConfigurations[field.key as keyof FieldConfigurations]"
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
