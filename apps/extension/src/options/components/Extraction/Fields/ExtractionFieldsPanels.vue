<script setup lang="ts">
import type { CommonCSLVariable, CSLVariableWithoutId } from '@source-taster/types'
import { COMMON_CSL_VARIABLES, CSLVariableWithoutIdSchema } from '@source-taster/types'
import { settings } from '@/extension/logic'

// TRANSLATION
const { t } = useI18n()

// Select All logic
const allVariablesSelected = computed(() =>
  settings.value.extract.extractionConfig.variables.length === CSLVariableWithoutIdSchema.options.length,
)

const someVariablesSelected = computed(() =>
  settings.value.extract.extractionConfig.variables.length > 0,
)

const commonSelected = computed(() => {
  const selected = settings.value.extract.extractionConfig.variables
  return COMMON_CSL_VARIABLES.every(common => selected.includes(common))
})

function toggleSelectAll() {
  if (allVariablesSelected.value) {
    settings.value.extract.extractionConfig.variables = [COMMON_CSL_VARIABLES[0]]
  }
  else {
    // Select all
    settings.value.extract.extractionConfig.variables = [...CSLVariableWithoutIdSchema.options]
  }
}

function toggleSelectCommon() {
  if (commonSelected.value) {
    // Deselect common (remove them from current selection)
    const remainingVariables = settings.value.extract.extractionConfig.variables
      .filter(variable => !COMMON_CSL_VARIABLES.includes(variable as CommonCSLVariable))

    // If no variables would remain, keep at least one common field
    settings.value.extract.extractionConfig.variables = remainingVariables.length > 0
      ? remainingVariables
      : [COMMON_CSL_VARIABLES[0]]
  }
  else {
    // Select common (add missing common to current selection)
    const currentVariables = settings.value.extract.extractionConfig.variables
    const missingCommon = COMMON_CSL_VARIABLES.filter(common => !currentVariables.includes(common))
    settings.value.extract.extractionConfig.variables = [...currentVariables, ...missingCommon]
  }
}

function remove(item: CSLVariableWithoutId) {
  // Don't allow removing the last field
  if (settings.value.extract.extractionConfig.variables.length <= 1) {
    return
  }

  const index = settings.value.extract.extractionConfig.variables.indexOf(item)
  if (index > -1) {
    settings.value.extract.extractionConfig.variables.splice(index, 1)
  }
}

// Check if field can be removed (for UI state)
function canRemoveField(): boolean {
  return settings.value.extract.extractionConfig.variables.length > 1
}

// Sort items to show selected ones at the top
const sortedItems = computed(() => {
  const selectedVars = settings.value.extract.extractionConfig.variables
  const allVars = [...CSLVariableWithoutIdSchema.options]

  // Separate selected and unselected
  const selected = allVars.filter(item => selectedVars.includes(item))
  const unselected = allVars.filter(item => !selectedVars.includes(item))

  // Return selected first, then unselected
  return [...selected, ...unselected]
})
</script>

<template>
  <v-card flat>
    <v-card-text>
      <v-autocomplete
        v-model="settings.extract.extractionConfig.variables"
        :items="sortedItems"
        :label="t('fields')"
        multiple
        :item-title="(item) => t(item)"
        :item-value="(item) => item"
        variant="outlined"
        density="comfortable"
      >
        <template #prepend-item>
          <v-list-item
            :title="allVariablesSelected ? t('deselect-all') : t('select-all')"
            @click="toggleSelectAll"
          >
            <template #prepend>
              <v-checkbox-btn
                :indeterminate="someVariablesSelected && !allVariablesSelected"
                :model-value="allVariablesSelected"
              />
            </template>
          </v-list-item>

          <v-list-item
            :title="commonSelected ? t('deselect-common') : t('select-common')"
            @click="toggleSelectCommon"
          >
            <template #prepend>
              <v-checkbox-btn
                :model-value="commonSelected"
              />
            </template>
          </v-list-item>

          <v-divider class="mt-2" />
        </template>

        <template #selection="{ item, index }">
          <v-tooltip
            v-if="index < 5 && !canRemoveField()"
            location="top"
          >
            <template #activator="{ props }">
              <v-chip
                v-bind="props"
                :text="item.title"
                :closable="canRemoveField()"
                size="small"
                @click:close="remove(item.value)"
              />
            </template>
            <span>{{ t('extraction-fields-last-field-tooltip') }}</span>
          </v-tooltip>

          <v-chip
            v-else-if="index < 5"
            :text="item.title"
            :closable="canRemoveField()"
            size="small"
            @click:close="remove(item.value)"
          />

          <span
            v-if="index === 5"
            class="text-grey text-caption align-self-center"
          >
            (+{{ settings.extract.extractionConfig.variables.length - 5 }} {{ t('more-fields') }})
          </span>
        </template>
      </v-autocomplete>
    </v-card-text>
  </v-card>
</template>
