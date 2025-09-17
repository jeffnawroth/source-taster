<script setup lang="ts">
import type { ApiMatchConfig } from '@source-taster/types'
import { mdiMagnify } from '@mdi/js'
import { FIELD_DEFINITIONS } from '@/extension/constants/fieldWeightConstants'

const matchConfig = defineModel<ApiMatchConfig>({ required: true })

// TRANSLATION
const { t } = useI18n()

// Search functionality
const searchQuery = ref('')

// Sort fields: enabled fields first (alphabetically), then disabled fields (alphabetically)
const sortedAndFilteredFields = computed(() => {
  let fields = [...FIELD_DEFINITIONS]

  // Sort by: 1) enabled fields first (alphabetically), 2) disabled fields alphabetically
  fields.sort((a, b) => {
    const configA = matchConfig.value.fieldConfigurations[a.key]
    const configB = matchConfig.value.fieldConfigurations[b.key]

    const enabledA = configA?.enabled || false
    const enabledB = configB?.enabled || false

    // Enabled fields first
    if (enabledA && !enabledB)
      return -1
    if (!enabledA && enabledB)
      return 1

    // Both enabled or both disabled: sort alphabetically by translated label
    return t(a.labelKey).localeCompare(t(b.labelKey))
  })

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    fields = fields.filter((field) => {
      const label = t(field.labelKey).toLowerCase()
      const description = t(field.descriptionKey).toLowerCase()
      return label.includes(query) || description.includes(query) || field.key.toLowerCase().includes(query)
    })
  }

  return fields
})

// Check how many fields are currently enabled
const enabledFieldsCount = computed(() => {
  return FIELD_DEFINITIONS.filter(field =>
    matchConfig.value.fieldConfigurations[field.key]?.enabled,
  ).length
})

// Function to handle field toggling with validation
function handleFieldToggle(fieldKey: string, enabled: boolean) {
  const fieldConfig = matchConfig.value.fieldConfigurations[fieldKey]

  if (!enabled && enabledFieldsCount.value <= 1) {
    // Don't allow disabling the last field
    return
  }

  if (enabled) {
    // When enabling a field, use default weight or current weight
    const defaultField = FIELD_DEFINITIONS.find(f => f.key === fieldKey)
    matchConfig.value.fieldConfigurations[fieldKey] = {
      enabled: true,
      weight: fieldConfig?.weight || defaultField?.defaultValue || 5,
    }
  }
  else {
    // When disabling a field
    matchConfig.value.fieldConfigurations[fieldKey] = {
      enabled: false,
      weight: fieldConfig?.weight || 0,
    }
  }

  // If only one field is enabled, ensure it has 100% weight
  if (enabledFieldsCount.value === 1) {
    const lastEnabledField = FIELD_DEFINITIONS.find(field =>
      matchConfig.value.fieldConfigurations[field.key]?.enabled,
    )
    if (lastEnabledField) {
      matchConfig.value.fieldConfigurations[lastEnabledField.key] = {
        enabled: true,
        weight: 100,
      }
    }
  }
}

// Check if a field can be disabled
function canDisableField(fieldKey: string): boolean {
  const isEnabled = matchConfig.value.fieldConfigurations[fieldKey]?.enabled
  return !isEnabled || enabledFieldsCount.value > 1
}
</script>

<template>
  <v-card flat>
    <v-card-text>
      <!-- Search Field -->
      <v-text-field
        v-model="searchQuery"
        :label="t('search-fields')"
        :prepend-inner-icon="mdiMagnify"
        clearable
        variant="outlined"
        density="compact"
        class="mb-4"
      />

      <!-- Virtual Scroll List -->
      <v-virtual-scroll
        :items="sortedAndFilteredFields"
        :item-height="120"
        height="400"
      >
        <template #default="{ item }">
          <FieldWeightControl
            v-model="matchConfig.fieldConfigurations[item.key]"
            :label="t(item.labelKey)"
            :default-value="item.defaultValue"
            :field-key="item.key"
            :can-disable="canDisableField(item.key)"
            @toggle-field="handleFieldToggle"
          />
        </template>
      </v-virtual-scroll>
    </v-card-text>
  </v-card>
</template>
