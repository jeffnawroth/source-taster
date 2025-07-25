<script setup lang="ts" generic="TSettings extends Record<string, any>, TActions">
import type { PresetButton } from './CustomSettingsActions.vue'
import { mdiHelpCircleOutline } from '@mdi/js'
import CustomSettingsActions from './CustomSettingsActions.vue'

export interface SettingGroup<TSettings extends Record<string, any> = Record<string, any>> {
  key: string
  title: string
  icon: string
  settings: Array<{
    key: keyof TSettings
    label: string
    description: string
    example: string
  }>
}

interface Props {
  settingGroups: SettingGroup<TSettings>[]
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
      <v-expansion-panels
        multiple
        variant="accordion"
        elevation="0"
      >
        <v-expansion-panel
          v-for="group in settingGroups"
          :key="group.key"
        >
          <template #title>
            <div class="d-flex align-center">
              <v-icon
                :icon="group.icon"
                size="small"
                class="me-2"
              />
              {{ group.title }}
            </div>
          </template>
          <template #text>
            <v-selection-control-group
              v-model="modelValue"
              multiple
            >
              <v-row>
                <v-col
                  v-for="setting in group.settings"
                  :key="String(setting.key)"
                  cols="6"
                >
                  <div
                    class="d-flex align-center justify-space-between"
                  >
                    <v-checkbox
                      :label="setting.label"
                      :value="setting.key"
                      class="flex-grow-1"
                      density="comfortable"
                      hide-details
                    >
                      <template #label>
                        <div>
                          <div class="font-weight-medium">
                            {{ setting.label }}
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            {{ setting.description }}
                          </div>
                        </div>
                      </template>
                    </v-checkbox>

                    <v-tooltip
                      location="left"
                      max-width="350"
                    >
                      <template #activator="{ props: tooltipProps }">
                        <v-icon
                          v-bind="tooltipProps"
                          :icon="mdiHelpCircleOutline"
                          size="small"
                          class="text-medium-emphasis ml-2"
                        />
                      </template>
                      <div class="pa-2">
                        <div class="font-weight-bold mb-1">
                          {{ setting.label }}
                        </div>
                        <div class="mb-2">
                          {{ setting.description }}
                        </div>
                        <div class="text-caption">
                          <strong>{{ t('example') }}:</strong> {{ setting.example }}
                        </div>
                      </div>
                    </v-tooltip>
                  </div>
                </v-col>
              </v-row>
            </v-selection-control-group>
          </template>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
    <!-- Preset Buttons -->
    <CustomSettingsActions
      :preset-buttons
    />
  </v-card>
</template>

<style scoped>
.v-card--variant-outlined {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}
</style>
