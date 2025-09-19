<script setup lang="ts">
import { mdiChevronDown, mdiChevronUp, mdiInformationOutline } from '@mdi/js'
import AutoDismissAlert from '@/extension/components/UI/AutoDismissAlert.vue'
import { settings } from '@/extension/logic'
import { useAnystyleStore } from '@/extension/stores/anystyle'
import { useExtractionStore } from '@/extension/stores/extraction'
import ExtractButton from './ExtractButton.vue'
import FileInput from './FileInput.vue'
import ParseButton from './ParseButton.vue'
import TextInput from './TextInput.vue'

// TRANSLATION
const { t } = useI18n()

const showInputCard = ref(true)

// Stores für die Error-Anzeige
const extractionStore = useExtractionStore()
const anystyleStore = useAnystyleStore()

const extractionErrorMessage = computed({
  get: () => extractionStore.extractionError,
  set: (value) => {
    if (!value)
      extractionStore.clearExtractionError()
  },
})

const parseErrorMessage = computed({
  get: () => anystyleStore.parseError,
  set: (value) => {
    if (!value)
      anystyleStore.clearParseResults()
  },
})

// Dynamic title based on AI setting
const cardTitle = computed(() => {
  const baseNumber = '1. '
  return settings.value.extract.useAi
    ? `${baseNumber}${t('extract')}`
    : `${baseNumber}${t('parse')}`
})

// Dynamic subtitle - now unified since both modes support text and files
const cardSubtitle = computed(() => {
  return t('input-references-or-files')
})
</script>

<template>
  <v-card
    flat
    :title="cardTitle"
    :subtitle="cardSubtitle"
  >
    <template #append>
      <AIToggleSwitch
        v-model="settings.extract.useAi"
        :show-alert="false"
        :show-description="false"
      />

      <!-- Info Icon with Tooltip -->
      <v-tooltip location="bottom">
        <template #activator="{ props: tooltipProps }">
          <v-icon
            :icon="mdiInformationOutline"
            variant="text"
            size="small"
            class="mx-2"
            v-bind="tooltipProps"
          />
        </template>
        <div
          class="text-caption"
          style="max-width: 300px;"
        >
          <div
            v-if="settings.extract.useAi"
            class="mb-2"
          >
            <strong>{{ $t('ai-extraction-mode-title') }}</strong><br>
            {{ $t('ai-extraction-mode-description') }}
          </div>
          <div v-else>
            <strong>{{ $t('parse-mode-title') }}</strong><br>
            {{ $t('parse-mode-description') }}
          </div>
        </div>
      </v-tooltip>

      <v-btn
        variant="plain"
        :icon="showInputCard ? mdiChevronUp : mdiChevronDown"
        @click="showInputCard = !showInputCard"
      />
    </template>
    <v-expand-transition>
      <div v-if="showInputCard">
        <v-card-text
          class="pa-0 pb-2"
        >
          <v-row dense>
            <!-- File Input -->
            <v-col cols="12">
              <FileInput />
            </v-col>

            <!-- Text Input -->
            <v-col cols="12">
              <TextInput />
            </v-col>

            <v-col
              sm="6"
            >
              <ParseButton />
            </v-col>
            <!-- Extract Button -->
            <v-col
              sm="6"
            >
              <ExtractButton />
            </v-col>

            <!-- Central Error Alerts -->
            <v-col
              v-if="extractionStore.extractionError || anystyleStore.parseError"
              cols="12"
            >
              <!-- Extraction Error Alert -->
              <AutoDismissAlert
                v-if="extractionErrorMessage"
                v-model="extractionErrorMessage"
                type="error"
                variant="tonal"
              >
                {{ extractionErrorMessage ? $t(extractionErrorMessage) : '' }}
              </AutoDismissAlert>

              <!-- Parse Error Alert -->
              <AutoDismissAlert
                v-if="parseErrorMessage"
                v-model="parseErrorMessage"
                type="error"
                variant="tonal"
              >
                {{ parseErrorMessage ? $t(parseErrorMessage) : '' }}
              </AutoDismissAlert>
            </v-col>
          </v-row>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>
