<script setup lang="ts">
import type { CustomExtractionSettings } from '@source-taster/types'
import { mdiHelpCircleOutline } from '@mdi/js'
import { ExtractionMode } from '@source-taster/types'
import { extractionSettings } from '../logic'

// TRANSLATION
const { t } = useI18n()

// Check if custom mode is selected
const showCustomSettings = computed(() => extractionSettings.value.extractionMode === ExtractionMode.CUSTOM)

// Safe access to custom settings with initialization
const customSettings = computed({
  get: () => {
    if (!extractionSettings.value.customSettings) {
      extractionSettings.value.customSettings = {} as CustomExtractionSettings
    }
    return extractionSettings.value.customSettings
  },
  set: (value) => {
    extractionSettings.value.customSettings = value
  },
})

// Group settings for better UX
const textProcessingSettings = computed(() => [
  {
    key: 'correctTypos' as keyof CustomExtractionSettings,
    label: t('setting-typo-correction'),
    description: t('setting-typo-correction-description'),
    example: t('setting-typo-correction-example'),
  },
  {
    key: 'normalizeCapitalization' as keyof CustomExtractionSettings,
    label: t('setting-normalize-capitalization'),
    description: t('setting-normalize-capitalization-description'),
    example: t('setting-normalize-capitalization-example'),
  },
  {
    key: 'standardizeAbbreviations' as keyof CustomExtractionSettings,
    label: t('setting-standardize-abbreviations'),
    description: t('setting-standardize-abbreviations-description'),
    example: t('setting-standardize-abbreviations-example'),
  },
  {
    key: 'standardizePunctuation' as keyof CustomExtractionSettings,
    label: t('setting-standardize-punctuation'),
    description: t('setting-standardize-punctuation-description'),
    example: t('setting-standardize-punctuation-example'),
  },
])

const formattingSettings = computed(() => [
  {
    key: 'formatAuthorNames' as keyof CustomExtractionSettings,
    label: t('setting-format-author-names'),
    description: t('setting-format-author-names-description'),
    example: t('setting-format-author-names-example'),
  },
  {
    key: 'removeDuplicateAuthors' as keyof CustomExtractionSettings,
    label: t('setting-remove-duplicate-authors'),
    description: t('setting-remove-duplicate-authors-description'),
    example: t('setting-remove-duplicate-authors-example'),
  },
  {
    key: 'standardizeDateFormatting' as keyof CustomExtractionSettings,
    label: t('setting-standardize-date-formatting'),
    description: t('setting-standardize-date-formatting-description'),
    example: t('setting-standardize-date-formatting-example'),
  },
  {
    key: 'standardizeIdentifiers' as keyof CustomExtractionSettings,
    label: t('setting-standardize-identifiers'),
    description: t('setting-standardize-identifiers-description'),
    example: t('setting-standardize-identifiers-example'),
  },
])

const advancedSettings = computed(() => [
  {
    key: 'addDerivableFields' as keyof CustomExtractionSettings,
    label: t('setting-add-derivable-fields'),
    description: t('setting-add-derivable-fields-description'),
    example: t('setting-add-derivable-fields-example'),
  },
  {
    key: 'interpretIncompleteInfo' as keyof CustomExtractionSettings,
    label: t('setting-interpret-incomplete-info'),
    description: t('setting-interpret-incomplete-info-description'),
    example: t('setting-interpret-incomplete-info-example'),
  },
  {
    key: 'recognizeSourceTypes' as keyof CustomExtractionSettings,
    label: t('setting-recognize-source-types'),
    description: t('setting-recognize-source-types-description'),
    example: t('setting-recognize-source-types-example'),
  },
  {
    key: 'convertToTitleCase' as keyof CustomExtractionSettings,
    label: t('setting-convert-to-title-case'),
    description: t('setting-convert-to-title-case-description'),
    example: t('setting-convert-to-title-case-example'),
  },
])

const technicalSettings = computed(() => [
  {
    key: 'fixUnicodeIssues' as keyof CustomExtractionSettings,
    label: t('setting-fix-unicode-issues'),
    description: t('setting-fix-unicode-issues-description'),
    example: t('setting-fix-unicode-issues-example'),
  },
  {
    key: 'handleOcrErrors' as keyof CustomExtractionSettings,
    label: t('setting-handle-ocr-errors'),
    description: t('setting-handle-ocr-errors-description'),
    example: t('setting-handle-ocr-errors-example'),
  },
  {
    key: 'reconstructSeparatedInfo' as keyof CustomExtractionSettings,
    label: t('setting-reconstruct-separated-info'),
    description: t('setting-reconstruct-separated-info-description'),
    example: t('setting-reconstruct-separated-info-example'),
  },
  {
    key: 'completeIncompleteData' as keyof CustomExtractionSettings,
    label: t('setting-complete-incomplete-data'),
    description: t('setting-complete-incomplete-data-description'),
    example: t('setting-complete-incomplete-data-example'),
  },
  {
    key: 'fixFormattingProblems' as keyof CustomExtractionSettings,
    label: t('setting-fix-formatting-problems'),
    description: t('setting-fix-formatting-problems-description'),
    example: t('setting-fix-formatting-problems-example'),
  },
])

// Preset functions
function loadStrictPreset() {
  // Ensure we're in CUSTOM mode
  if (extractionSettings.value.extractionMode !== ExtractionMode.CUSTOM) {
    extractionSettings.value.extractionMode = ExtractionMode.CUSTOM
  }

  // Initialize if needed
  if (!extractionSettings.value.customSettings) {
    extractionSettings.value.customSettings = {} as CustomExtractionSettings
  }

  const newSettings = { ...extractionSettings.value.customSettings }
  Object.keys(newSettings).forEach((key) => {
    newSettings[key as keyof CustomExtractionSettings] = false
  })
  extractionSettings.value.customSettings = newSettings
}

function loadBalancedPreset() {
  // Ensure we're in CUSTOM mode
  if (extractionSettings.value.extractionMode !== ExtractionMode.CUSTOM) {
    extractionSettings.value.extractionMode = ExtractionMode.CUSTOM
  }

  // Initialize if needed
  if (!extractionSettings.value.customSettings) {
    extractionSettings.value.customSettings = {} as CustomExtractionSettings
  }

  // Start with all false
  const newSettings = { ...extractionSettings.value.customSettings }
  Object.keys(newSettings).forEach((key) => {
    newSettings[key as keyof CustomExtractionSettings] = false
  })

  // Enable balanced settings
  newSettings.correctTypos = true
  newSettings.normalizeCapitalization = true
  newSettings.standardizeAbbreviations = true
  newSettings.standardizePunctuation = true
  newSettings.formatAuthorNames = true
  newSettings.removeDuplicateAuthors = true
  newSettings.standardizeDateFormatting = true
  newSettings.standardizeIdentifiers = true

  extractionSettings.value.customSettings = newSettings
}

function loadTolerantPreset() {
  // Ensure we're in CUSTOM mode
  if (extractionSettings.value.extractionMode !== ExtractionMode.CUSTOM) {
    extractionSettings.value.extractionMode = ExtractionMode.CUSTOM
  }

  // Initialize if needed
  if (!extractionSettings.value.customSettings) {
    extractionSettings.value.customSettings = {} as CustomExtractionSettings
  }

  // Start with balanced settings
  const newSettings = { ...extractionSettings.value.customSettings }
  Object.keys(newSettings).forEach((key) => {
    newSettings[key as keyof CustomExtractionSettings] = false
  })

  // Enable balanced settings first
  newSettings.correctTypos = true
  newSettings.normalizeCapitalization = true
  newSettings.standardizeAbbreviations = true
  newSettings.standardizePunctuation = true
  newSettings.formatAuthorNames = true
  newSettings.removeDuplicateAuthors = true
  newSettings.standardizeDateFormatting = true
  newSettings.standardizeIdentifiers = true

  // Then add tolerant settings
  newSettings.addDerivableFields = true
  newSettings.interpretIncompleteInfo = true
  newSettings.recognizeSourceTypes = true
  newSettings.convertToTitleCase = true
  newSettings.fixUnicodeIssues = true
  newSettings.handleOcrErrors = true
  newSettings.reconstructSeparatedInfo = true
  newSettings.completeIncompleteData = true
  newSettings.fixFormattingProblems = true

  extractionSettings.value.customSettings = newSettings
}

function clearAll() {
  // Ensure we're in CUSTOM mode
  if (extractionSettings.value.extractionMode !== ExtractionMode.CUSTOM) {
    extractionSettings.value.extractionMode = ExtractionMode.CUSTOM
  }

  // Initialize if needed
  if (!extractionSettings.value.customSettings) {
    extractionSettings.value.customSettings = {} as CustomExtractionSettings
  }

  const newSettings = { ...extractionSettings.value.customSettings }
  Object.keys(newSettings).forEach((key) => {
    newSettings[key as keyof CustomExtractionSettings] = false
  })
  extractionSettings.value.customSettings = newSettings
}

function selectAll() {
  // Ensure we're in CUSTOM mode
  if (extractionSettings.value.extractionMode !== ExtractionMode.CUSTOM) {
    extractionSettings.value.extractionMode = ExtractionMode.CUSTOM
  }

  // Initialize if needed
  if (!extractionSettings.value.customSettings) {
    extractionSettings.value.customSettings = {} as CustomExtractionSettings
  }

  const newSettings = { ...extractionSettings.value.customSettings }
  Object.keys(newSettings).forEach((key) => {
    newSettings[key as keyof CustomExtractionSettings] = true
  })
  extractionSettings.value.customSettings = newSettings
}
</script>

<template>
  <!-- Mode Selection -->
  <v-radio-group
    v-model="extractionSettings.extractionMode"
    class="mb-0"
  >
    <div class="d-flex align-center justify-space-between mb-2">
      <v-radio
        :value="ExtractionMode.STRICT"
        class="flex-grow-1"
      >
        <template #label>
          <div>
            <div class="font-weight-medium">
              🔒 {{ t('extraction-mode-strict') }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ t('extraction-mode-strict-description') }}
            </div>
          </div>
        </template>
      </v-radio>
      <v-tooltip
        location="left"
        max-width="400"
      >
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            :icon="mdiHelpCircleOutline"
            size="small"
            class="text-medium-emphasis ml-2"
          />
        </template>
        <div class="pa-2">
          <div class="font-weight-bold mb-2">
            {{ t('extraction-mode-strict-tooltip.title') }}
          </div>
          <div class="mb-2">
            {{ t('extraction-mode-strict-tooltip.description') }}
          </div>

          <div class="font-weight-medium mb-1">
            {{ t('extraction-mode-strict-tooltip.what-happens') }}
          </div>
          <ul class="text-caption mb-2">
            <li>{{ t('extraction-mode-strict-tooltip.happens-1') }}</li>
            <li>{{ t('extraction-mode-strict-tooltip.happens-2') }}</li>
          </ul>

          <div class="font-weight-medium mb-1">
            {{ t('extraction-mode-strict-tooltip.what-not-happens') }}
          </div>
          <ul class="text-caption">
            <li>{{ t('extraction-mode-strict-tooltip.not-happens-1') }}</li>
            <li>{{ t('extraction-mode-strict-tooltip.not-happens-2') }}</li>
            <li>{{ t('extraction-mode-strict-tooltip.not-happens-3') }}</li>
            <li>{{ t('extraction-mode-strict-tooltip.not-happens-4') }}</li>
          </ul>
        </div>
      </v-tooltip>
    </div>

    <div class="d-flex align-center justify-space-between mb-2">
      <v-radio
        :value="ExtractionMode.BALANCED"
        class="flex-grow-1"
      >
        <template #label>
          <div>
            <div class="font-weight-medium">
              ⚖️ {{ t('extraction-mode-balanced') }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ t('extraction-mode-balanced-description') }}
            </div>
          </div>
        </template>
      </v-radio>
      <v-tooltip
        location="left"
        max-width="400"
      >
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            :icon="mdiHelpCircleOutline"
            size="small"
            class="text-medium-emphasis ml-2"
          />
        </template>
        <div class="pa-2">
          <div class="font-weight-bold mb-2">
            {{ t('extraction-mode-balanced-tooltip.title') }}
          </div>
          <div class="mb-2">
            {{ t('extraction-mode-balanced-tooltip.description') }}
          </div>

          <div class="font-weight-medium mb-1">
            {{ t('extraction-mode-balanced-tooltip.what-happens') }}
          </div>
          <ul class="text-caption mb-2">
            <li>{{ t('extraction-mode-balanced-tooltip.happens-1') }}</li>
            <li>{{ t('extraction-mode-balanced-tooltip.happens-2') }}</li>
            <li>{{ t('extraction-mode-balanced-tooltip.happens-3') }}</li>
            <li>{{ t('extraction-mode-balanced-tooltip.happens-4') }}</li>
          </ul>

          <div class="font-weight-medium mb-1">
            {{ t('extraction-mode-balanced-tooltip.what-not-happens') }}
          </div>
          <ul class="text-caption">
            <li>{{ t('extraction-mode-balanced-tooltip.not-happens-1') }}</li>
            <li>{{ t('extraction-mode-balanced-tooltip.not-happens-2') }}</li>
            <li>{{ t('extraction-mode-balanced-tooltip.not-happens-3') }}</li>
          </ul>
        </div>
      </v-tooltip>
    </div>

    <div class="d-flex align-center justify-space-between mb-2">
      <v-radio
        :value="ExtractionMode.TOLERANT"
        class="flex-grow-1"
      >
        <template #label>
          <div>
            <div class="font-weight-medium">
              🤸 {{ t('extraction-mode-tolerant') }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ t('extraction-mode-tolerant-description') }}
            </div>
          </div>
        </template>
      </v-radio>
      <v-tooltip
        location="left"
        max-width="400"
      >
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            :icon="mdiHelpCircleOutline"
            size="small"
            class="text-medium-emphasis ml-2"
          />
        </template>
        <div class="pa-2">
          <div class="font-weight-bold mb-2">
            {{ t('extraction-mode-tolerant-tooltip.title') }}
          </div>
          <div class="mb-2">
            {{ t('extraction-mode-tolerant-tooltip.description') }}
          </div>

          <div class="font-weight-medium mb-1">
            {{ t('extraction-mode-tolerant-tooltip.what-happens') }}
          </div>
          <ul class="text-caption mb-2">
            <li>{{ t('extraction-mode-tolerant-tooltip.happens-1') }}</li>
            <li>{{ t('extraction-mode-tolerant-tooltip.happens-2') }}</li>
            <li>{{ t('extraction-mode-tolerant-tooltip.happens-3') }}</li>
            <li>{{ t('extraction-mode-tolerant-tooltip.happens-4') }}</li>
            <li>{{ t('extraction-mode-tolerant-tooltip.happens-5') }}</li>
          </ul>

          <div class="font-weight-medium mb-1">
            {{ t('extraction-mode-tolerant-tooltip.what-not-happens') }}
          </div>
          <ul class="text-caption">
            <li>{{ t('extraction-mode-tolerant-tooltip.not-happens-1') }}</li>
            <li>{{ t('extraction-mode-tolerant-tooltip.not-happens-2') }}</li>
            <li>{{ t('extraction-mode-tolerant-tooltip.not-happens-3') }}</li>
          </ul>
        </div>
      </v-tooltip>
    </div>

    <div class="d-flex align-center justify-space-between">
      <v-radio
        :value="ExtractionMode.CUSTOM"
        class="flex-grow-1"
      >
        <template #label>
          <div>
            <div class="font-weight-medium">
              🔧 {{ t('extraction-mode-custom') }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ t('extraction-mode-custom-description') }}
            </div>
          </div>
        </template>
      </v-radio>
      <v-tooltip
        location="left"
        max-width="400"
      >
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            :icon="mdiHelpCircleOutline"
            size="small"
            class="text-medium-emphasis ml-2"
          />
        </template>
        <div class="pa-2">
          <div class="font-weight-bold mb-2">
            {{ t('extraction-mode-custom-tooltip.title') }}
          </div>
          <div class="mb-2">
            {{ t('extraction-mode-custom-tooltip.description') }}
          </div>

          <div class="font-weight-medium mb-1">
            {{ t('extraction-mode-custom-tooltip.features') }}
          </div>
          <ul class="text-caption">
            <li>{{ t('extraction-mode-custom-tooltip.feature-1') }}</li>
            <li>{{ t('extraction-mode-custom-tooltip.feature-2') }}</li>
            <li>{{ t('extraction-mode-custom-tooltip.feature-3') }}</li>
            <li>{{ t('extraction-mode-custom-tooltip.feature-4') }}</li>
          </ul>
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
          {{ t('custom-configuration') }}
        </h4>
        <p class="text-caption text-medium-emphasis">
          {{ t('custom-configuration-description') }}
        </p>
      </div>

      <!-- Settings organized in Expansion Panels -->
      <v-expansion-panels
        multiple
        variant="accordion"
        class="mb-4"
        elevation="0"
      >
        <!-- Text Processing -->
        <v-expansion-panel
          :title="`📝 ${t('text-processing')}`"
          :text="t('text-processing-description')"
        >
          <template #text>
            <div class="pa-4">
              <v-row>
                <v-col
                  v-for="setting in textProcessingSettings"
                  :key="setting.key"
                  cols="12"
                  md="6"
                >
                  <div class="d-flex align-center justify-space-between">
                    <v-checkbox
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
                      <template #activator="{ props }">
                        <v-icon
                          v-bind="props"
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

        <!-- Formatting -->
        <v-expansion-panel
          :title="`🎨 ${t('formatting-structure')}`"
          :text="t('formatting-structure-description')"
        >
          <template #text>
            <div class="pa-4">
              <v-row>
                <v-col
                  v-for="setting in formattingSettings"
                  :key="setting.key"
                  cols="12"
                  md="6"
                >
                  <div class="d-flex align-center justify-space-between">
                    <v-checkbox
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
                      <template #activator="{ props }">
                        <v-icon
                          v-bind="props"
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

        <!-- Advanced -->
        <v-expansion-panel
          :title="`🧠 ${t('advanced-interpretation')}`"
          :text="t('advanced-interpretation-description')"
        >
          <template #text>
            <div class="pa-4">
              <v-row>
                <v-col
                  v-for="setting in advancedSettings"
                  :key="setting.key"
                  cols="12"
                  md="6"
                >
                  <div class="d-flex align-center justify-space-between">
                    <v-checkbox
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
                      <template #activator="{ props }">
                        <v-icon
                          v-bind="props"
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

        <!-- Technical -->
        <v-expansion-panel
          :title="`🔧 ${t('technical-fixes')}`"
          :text="t('technical-fixes-description')"
        >
          <template #text>
            <div class="pa-4">
              <v-row>
                <v-col
                  v-for="setting in technicalSettings"
                  :key="setting.key"
                  cols="12"
                  md="6"
                >
                  <div class="d-flex align-center justify-space-between">
                    <v-checkbox
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
                      <template #activator="{ props }">
                        <v-icon
                          v-bind="props"
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
          variant="outlined"
          size="small"
          @click="loadStrictPreset"
        >
          🔒 {{ t('load-strict') }}
        </v-btn>
        <v-btn
          variant="outlined"
          size="small"
          @click="loadBalancedPreset"
        >
          ⚖️ {{ t('load-balanced') }}
        </v-btn>
        <v-btn
          variant="outlined"
          size="small"
          @click="loadTolerantPreset"
        >
          🤸 {{ t('load-tolerant') }}
        </v-btn>
        <v-btn
          variant="outlined"
          size="small"
          @click="clearAll"
        >
          {{ t('clear-all') }}
        </v-btn>
        <v-btn
          variant="outlined"
          size="small"
          @click="selectAll"
        >
          {{ t('select-all') }}
        </v-btn>
      </div>
    </div>
  </v-expand-transition>
</template>
