<script setup lang="ts">
import { mdiChevronDown, mdiChevronUp } from '@mdi/js'
import { settings } from '@/extension/logic'
import { useAnystyleStore } from '@/extension/stores/anystyle'
import { useExtractionStore } from '@/extension/stores/extraction'
import ExtractButton from './ExtractButton.vue'
import FileInput from './FileInput.vue'
import ParseButton from './ParseButton.vue'
import TextInput from './TextInput.vue'

const showInputCard = ref(true)

// Stores für die Error-Anzeige
const extractionStore = useExtractionStore()
const anystyleStore = useAnystyleStore()
</script>

<template>
  <v-card
    flat
    :title="`1. ${$t('parse')}`"
    :subtitle="$t('input-references-as-text-or-upload-a-file')"
  >
    <template #append>
      <AIToggleSwitch
        v-model="settings.extract.useAi"
        :show-alert="false"
        :show-description="false"
      />
      <v-btn
        variant="text"
        :icon="showInputCard ? mdiChevronUp : mdiChevronDown"
        @click="showInputCard = !showInputCard"
      />
    </template>
    <v-expand-transition>
      <div v-if="showInputCard">
        <v-card-text
          class="pa-0"
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

            <v-col cols="6">
              <ParseButton />
            </v-col>
            <!-- Extract Button -->
            <v-col cols="6">
              <ExtractButton />
            </v-col>

            <!-- Central Error Alerts -->
            <v-col cols="12">
              <!-- Extraction Error Alert -->
              <v-alert
                v-if="extractionStore.extractionError"
                type="error"
                variant="tonal"
                closable
                :text="$t(extractionStore.extractionError)"
                @click:close="extractionStore.clearExtractionError()"
              />

              <!-- Parse Error Alert -->
              <v-alert
                v-if="anystyleStore.parseError"
                type="error"
                variant="tonal"
                closable
                :text="$t(anystyleStore.parseError)"
                @click:close="anystyleStore.clearParseResults()"
              />
            </v-col>

            <!-- Parse Button -->
          </v-row>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>
