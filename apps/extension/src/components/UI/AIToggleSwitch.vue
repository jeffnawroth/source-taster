<script setup lang="ts">
import { mdiRobot, mdiRobotOff } from '@mdi/js'
import { settings } from '@/extension/logic'

interface Props {
  /** Show description text below the switch */
  showDescription?: boolean
  /** Show info alert when AI is disabled */
  showAlert?: boolean
  /** Custom label override (uses default translation if not provided) */
  customLabel?: string
  /** Compact mode - smaller switch and text */
  compact?: boolean
  /** Show label next to the switch (default true) */
  showLabel?: boolean
  /** Inset style for the switch */
  inset?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDescription: true,
  showAlert: true,
  customLabel: undefined,
  compact: false,
  inset: true,
})

const modelValue = defineModel<boolean>({ required: true })

const { t } = useI18n()

// Use custom label if provided, otherwise use default translation
const switchLabel = computed(() => props.customLabel || t('extraction-ai-enabled'))

// Tooltip text considering API key availability
const tooltipText = computed(() => {
  if (!settings.value.ai.canUseAI) {
    return t('tooltip-ai-no-api-key')
  }
  return modelValue.value ? t('tooltip-ai-turn-off') : t('tooltip-ai-turn-on')
})

// Description text considering API key availability
const descriptionText = computed(() => {
  if (!settings.value.ai.canUseAI) {
    return t('extraction-ai-no-api-key-description')
  }
  return modelValue.value ? t('extraction-ai-enabled-description') : t('extraction-ai-disabled-description')
})
</script>

<template>
  <div>
    <v-tooltip
      :text="tooltipText"
      location="top"
    >
      <template #activator="{ props: tooltipProps }">
        <v-switch
          v-model="modelValue"
          :label="showLabel ? switchLabel : ''"
          :true-icon="mdiRobot"
          :false-icon="mdiRobotOff"
          :disabled="!settings.ai.canUseAI"
          color="primary"
          :inset
          v-bind="tooltipProps"
        />
      </template>
    </v-tooltip>

    <p
      v-if="showDescription"
      :class="compact ? 'text-caption text-medium-emphasis mt-2' : 'text-body-2 text-medium-emphasis mt-3'"
    >
      {{ descriptionText }}
    </p>

    <v-alert
      v-if="showAlert && !modelValue"
      type="info"
      variant="tonal"
      :class="compact ? 'mt-2' : 'mt-4'"
    >
      <template #text>
        {{ t('extraction-ai-fallback-info') }}
      </template>
    </v-alert>
  </div>
</template>
