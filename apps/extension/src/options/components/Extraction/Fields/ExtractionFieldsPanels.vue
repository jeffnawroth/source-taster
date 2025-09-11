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
    // Deselect all
    settings.value.extract.extractionConfig.variables = []
  }
  else {
    // Select all
    settings.value.extract.extractionConfig.variables = [...CSLVariableWithoutIdSchema.options]
  }
}

function toggleSelectCommon() {
  if (commonSelected.value) {
    // Deselect common (remove them from current selection)
    settings.value.extract.extractionConfig.variables = settings.value.extract.extractionConfig.variables
      .filter(variable => !COMMON_CSL_VARIABLES.includes(variable as CommonCSLVariable))
  }
  else {
    // Select common (add missing common to current selection)
    const currentVariables = settings.value.extract.extractionConfig.variables
    const missingCommon = COMMON_CSL_VARIABLES.filter(common => !currentVariables.includes(common))
    settings.value.extract.extractionConfig.variables = [...currentVariables, ...missingCommon]
  }
}

function remove(item: CSLVariableWithoutId) {
  const index = settings.value.extract.extractionConfig.variables.indexOf(item)
  if (index > -1) {
    settings.value.extract.extractionConfig.variables.splice(index, 1)
  }
}
</script>

<template>
  <v-card flat>
    <v-card-text>
      <v-autocomplete
        v-model="settings.extract.extractionConfig.variables"
        :items="CSLVariableWithoutIdSchema.options"
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
          <v-chip
            v-if="index < 5"
            :text="item.title"
            closable
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
