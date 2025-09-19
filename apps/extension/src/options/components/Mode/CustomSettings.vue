<script setup lang="ts" generic="TSettings extends Record<string, any>, TActions">
import type { PresetButton } from './CustomSettingsActions.vue'
import { mdiHelpCircleOutline } from '@mdi/js'
import CustomSettingsActions from './CustomSettingsActions.vue'

export interface Setting<TSettings extends Record<string, any> = Record<string, any>> {
  key: keyof TSettings
  label: string
  description: string
  detailedDescription: string
  example: string
}

interface Props {
  settings: Setting<TSettings>[]
  presetButtons: PresetButton[]
  description: string
}

defineProps<Props>()

const modelValue = defineModel<TActions>({ required: true })

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <v-card
    :subtitle="description"
    flat
  >
    <v-card-text>
      <v-selection-control-group
        v-model="modelValue"
        multiple
      >
        <v-list
          density="comfortable"
          class="settings-list"
        >
          <v-list-item
            v-for="setting in settings"
            :key="String(setting.key)"
          >
            <template #prepend>
              <v-checkbox
                :value="setting.key"
                density="comfortable"
                hide-details
              />
            </template>

            <v-list-item-title>{{ setting.label }}</v-list-item-title>
            <v-list-item-subtitle>{{ setting.description }}</v-list-item-subtitle>

            <template #append>
              <v-tooltip
                location="left"
                max-width="350"
              >
                <template #activator="{ props: tooltipProps }">
                  <v-icon
                    v-bind="tooltipProps"
                    :icon="mdiHelpCircleOutline"

                    class="text-medium-emphasis"
                  />
                </template>
                <div class="pa-2">
                  <div class="font-weight-bold mb-1">
                    {{ setting.label }}
                  </div>
                  <div class="mb-2">
                    {{ setting.detailedDescription }}
                  </div>
                  <div class="text-caption">
                    <strong>{{ t('example') }}:</strong> {{ setting.example }}
                  </div>
                </div>
              </v-tooltip>
            </template>
          </v-list-item>
        </v-list>
      </v-selection-control-group>
    </v-card-text>
    <!-- Preset Buttons -->
    <CustomSettingsActions
      :preset-buttons
    />
  </v-card>
</template>

<style scoped>
.settings-list {
  max-height: 400px;
  overflow-y: auto;
}
</style>
