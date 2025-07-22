<script setup lang="ts" generic="TSettings extends Record<string, any>">
import { mdiHelpCircleOutline } from '@mdi/js'

export interface SettingGroup<TSettings extends Record<string, any> = Record<string, any>> {
  key: string
  title: string
  description: string
  icon: string
  settings: Array<{
    key: keyof TSettings
    label: string
    description: string
    example: string
    dependsOn?: keyof TSettings
  }>
}

export interface PresetButton {
  label: string
  icon: string
  onClick: () => void
}

interface Props {
  settingGroups: SettingGroup<TSettings>[]
  presetButtons: PresetButton[]
  title: string
  description: string
}

defineProps<Props>()

const customSettings = defineModel<TSettings>()

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <v-divider />

  <v-card
    flat
    :subtitle="description"
  >
    <v-card-text>
      <v-expansion-panels
        multiple
        variant="accordion"
        class="mb-4"
        elevation="0"
      >
        <v-expansion-panel
          v-for="group in settingGroups"
          :key="group.key"
          :text="group.description"
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
            <div class="pa-4">
              <v-row>
                <v-col
                  v-for="setting in group.settings"
                  :key="String(setting.key)"
                  cols="12"
                  :md="setting.dependsOn && !customSettings?.[setting.dependsOn] ? 0 : 6"
                >
                  <div
                    v-if="!setting.dependsOn || customSettings?.[setting.dependsOn]"
                    class="d-flex align-center justify-space-between"
                  >
                    <!-- Checkbox Settings -->
                    <v-checkbox
                      v-if="customSettings"
                      v-model="customSettings[setting.key]"
                      :label="setting.label"
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
            </div>
          </template>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
    <!-- Preset Buttons -->
    <v-card-actions>
      <v-btn
        v-for="preset in presetButtons"
        :key="preset.label"
        variant="tonal"
        color="primary"
        size="small"
        @click="preset.onClick"
      >
        <v-icon
          :icon="preset.icon"
          size="small"
          start
        />
        {{ preset.label }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.v-card--variant-outlined {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}
</style>
