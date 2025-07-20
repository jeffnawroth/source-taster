<script setup lang="ts" generic="TMode extends string, TSettings extends Record<string, any>">
import { mdiHelpCircleOutline } from '@mdi/js'

interface ModeOption {
  value: TMode
  emoji: string
  label: string
  description: string
  tooltipTitle: string
  tooltipDescription: string
}

interface SettingGroup {
  key: string
  title: string
  description: string
  emoji: string
  settings: Array<{
    key: keyof TSettings
    label: string
    description: string
    example: string
    type?: 'checkbox' | 'slider'
    min?: number
    max?: number
    step?: number
    suffix?: string
    dependsOn?: keyof TSettings
  }>
}

interface PresetButton {
  label: string
  emoji: string
  onClick: () => void
}

interface Props {
  customValue: TMode
  modeOptions: ModeOption[]
  settingGroups: SettingGroup[]
  presetButtons: PresetButton[]
  customSettingsTitle: string
  customSettingsDescription: string
}

const props = defineProps<Props>()

const modelValue = defineModel<TMode>()
const customSettings = defineModel<TSettings>('customSettings')

// TRANSLATION
const { t } = useI18n()

// Check if custom mode is selected
const showCustomSettings = computed(() => modelValue.value === props.customValue)
</script>

<template>
  <!-- Mode Selection -->
  <v-radio-group
    v-model="modelValue"
    class="mb-0"
  >
    <div
      v-for="(option, index) in modeOptions"
      :key="option.value"
      class="d-flex align-center justify-space-between"
      :class="{ 'mb-2': index < modeOptions.length - 1 }"
    >
      <v-radio
        :value="option.value"
        class="flex-grow-1"
      >
        <template #label>
          <div>
            <div class="font-weight-medium">
              {{ option.emoji }} {{ option.label }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ option.description }}
            </div>
          </div>
        </template>
      </v-radio>
      <v-tooltip
        location="left"
        max-width="400"
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
          <div class="font-weight-bold mb-2">
            {{ option.tooltipTitle }}
          </div>
          <div class="mb-2">
            {{ option.tooltipDescription }}
          </div>
        </div>
      </v-tooltip>
    </div>
  </v-radio-group>

  <!-- Custom Settings (shown when Custom mode is selected) -->
  <v-expand-transition>
    <div
      v-if="showCustomSettings"
      class="mt-4 pt-4 border-t"
    >
      <div class="mb-3">
        <h4 class="text-subtitle-1 font-weight-medium mb-1">
          {{ customSettingsTitle }}
        </h4>
        <p class="text-caption text-medium-emphasis">
          {{ customSettingsDescription }}
        </p>
      </div>

      <!-- Settings organized in Expansion Panels -->
      <v-expansion-panels
        multiple
        variant="accordion"
        class="mb-4"
        elevation="0"
      >
        <v-expansion-panel
          v-for="group in settingGroups"
          :key="group.key"
          :title="`${group.emoji} ${group.title}`"
          :text="group.description"
        >
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
                      v-if="(!setting.type || setting.type === 'checkbox') && customSettings"
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

                    <!-- Slider Settings -->
                    <div
                      v-else-if="setting.type === 'slider' && customSettings"
                      class="flex-grow-1"
                    >
                      <div class="font-weight-medium mb-1">
                        {{ setting.label }}
                      </div>
                      <div class="text-caption text-medium-emphasis mb-2">
                        {{ setting.description }}
                      </div>
                      <v-slider
                        v-model="customSettings[setting.key]"
                        :min="setting.min"
                        :max="setting.max"
                        :step="setting.step"
                        thumb-label
                        density="comfortable"
                        hide-details
                      >
                        <template #append>
                          <span class="text-body-2 font-weight-bold">
                            {{
                              setting.suffix === '%'
                                ? `${customSettings?.[setting.key]}%`
                                : typeof customSettings?.[setting.key] === 'number'
                                  ? (customSettings?.[setting.key] as number).toFixed(2)
                                  : customSettings?.[setting.key]
                            }}
                          </span>
                        </template>
                      </v-slider>
                    </div>

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

      <!-- Preset Buttons -->
      <div class="d-flex gap-2 flex-wrap">
        <v-btn
          v-for="preset in presetButtons"
          :key="preset.label"
          variant="outlined"
          size="small"
          @click="preset.onClick"
        >
          {{ preset.emoji }} {{ preset.label }}
        </v-btn>
      </div>
    </div>
  </v-expand-transition>
</template>

<style scoped>
.v-radio :deep(.v-label) {
  opacity: 1;
}

.v-card--variant-outlined {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}
</style>
