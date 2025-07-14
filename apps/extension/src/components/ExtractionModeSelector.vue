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
    label: 'Typo Correction',
    description: 'Fix obvious spelling errors',
    example: '"Jouranl" → "Journal"',
  },
  {
    key: 'normalizeCapitalization' as keyof CustomExtractionSettings,
    label: 'Normalize Capitalization',
    description: 'Standardize letter casing',
    example: '"machine learning" → "Machine Learning"',
  },
  {
    key: 'standardizeAbbreviations' as keyof CustomExtractionSettings,
    label: 'Standardize Abbreviations',
    description: 'Expand common abbreviations',
    example: '"J." → "Journal", "Vol." → "Volume"',
  },
  {
    key: 'standardizePunctuation' as keyof CustomExtractionSettings,
    label: 'Standardize Punctuation',
    description: 'Clean up punctuation marks',
    example: 'Remove extra spaces, fix quote marks',
  },
])

const formattingSettings = computed(() => [
  {
    key: 'formatAuthorNames' as keyof CustomExtractionSettings,
    label: 'Format Author Names',
    description: 'Consistent author name formatting',
    example: '"smith j" → "Smith, J."',
  },
  {
    key: 'removeDuplicateAuthors' as keyof CustomExtractionSettings,
    label: 'Remove Duplicate Authors',
    description: 'Eliminate duplicate entries',
    example: 'Remove repeated author names',
  },
  {
    key: 'standardizeDateFormatting' as keyof CustomExtractionSettings,
    label: 'Standardize Date Formatting',
    description: 'Consistent date formats',
    example: '"2024-03-15" for all dates',
  },
  {
    key: 'standardizeIdentifiers' as keyof CustomExtractionSettings,
    label: 'Standardize Identifiers',
    description: 'Validate DOI/ISSN/ISBN formats',
    example: 'Format DOIs with proper prefix',
  },
])

const advancedSettings = computed(() => [
  {
    key: 'addDerivableFields' as keyof CustomExtractionSettings,
    label: 'Add Derivable Fields',
    description: 'Fill in clearly inferrable information',
    example: 'Add missing month from context',
  },
  {
    key: 'interpretIncompleteInfo' as keyof CustomExtractionSettings,
    label: 'Interpret Incomplete Info',
    description: 'Expand abbreviated information',
    example: '"et al." → full author list if available',
  },
  {
    key: 'recognizeSourceTypes' as keyof CustomExtractionSettings,
    label: 'Recognize Source Types',
    description: 'Automatically detect publication types',
    example: 'Detect "journal-article" vs "book"',
  },
  {
    key: 'convertToTitleCase' as keyof CustomExtractionSettings,
    label: 'Convert to Title Case',
    description: 'Standardize title capitalization',
    example: '"machine learning in healthcare" → "Machine Learning in Healthcare"',
  },
])

const technicalSettings = computed(() => [
  {
    key: 'fixUnicodeIssues' as keyof CustomExtractionSettings,
    label: 'Fix Unicode Issues',
    description: 'Normalize special characters',
    example: '"–" → "-", fix encoding problems',
  },
  {
    key: 'handleOcrErrors' as keyof CustomExtractionSettings,
    label: 'Handle OCR Errors',
    description: 'Fix scanning/copy-paste artifacts',
    example: 'Fix "rn" → "m", "li" → "h"',
  },
  {
    key: 'reconstructSeparatedInfo' as keyof CustomExtractionSettings,
    label: 'Reconstruct Separated Info',
    description: 'Merge line-broken content',
    example: 'Join titles split across lines',
  },
  {
    key: 'completeIncompleteData' as keyof CustomExtractionSettings,
    label: 'Complete Incomplete Data',
    description: 'Fill obvious gaps',
    example: 'Add missing page numbers from range',
  },
  {
    key: 'fixFormattingProblems' as keyof CustomExtractionSettings,
    label: 'Fix Formatting Problems',
    description: 'Correct spacing and structure',
    example: 'Fix missing spaces after punctuation',
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
          Custom Configuration
        </h4>
        <p class="text-caption text-medium-emphasis">
          Configure your personalized extraction rules and preferences
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
          title="📝 Text Processing"
          text="Basic text corrections and normalizations"
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
                          <strong>Example:</strong> {{ setting.example }}
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
          title="🎨 Formatting & Structure"
          text="Author names, dates, and identifier formatting"
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
                          <strong>Example:</strong> {{ setting.example }}
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
          title="🧠 Advanced Interpretation"
          text="Intelligent content completion and source recognition"
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
                          <strong>Example:</strong> {{ setting.example }}
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
          title="🔧 Technical Fixes"
          text="OCR errors, Unicode issues, and formatting problems"
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
                          <strong>Example:</strong> {{ setting.example }}
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
          🔒 Load Strict
        </v-btn>
        <v-btn
          variant="outlined"
          size="small"
          @click="loadBalancedPreset"
        >
          ⚖️ Load Balanced
        </v-btn>
        <v-btn
          variant="outlined"
          size="small"
          @click="loadTolerantPreset"
        >
          🤸 Load Tolerant
        </v-btn>
        <v-btn
          variant="outlined"
          size="small"
          @click="clearAll"
        >
          Clear All
        </v-btn>
        <v-btn
          variant="outlined"
          size="small"
          @click="selectAll"
        >
          Select All
        </v-btn>
      </div>
    </div>
  </v-expand-transition>
</template>
