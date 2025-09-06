<script setup lang="ts">
import type { Reference } from '@source-taster/types'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ReferencesService } from '@/extension/services/referencesService'
import TokenRelabelingEditor from './TokenRelabelingEditor.vue'

// Types
interface ParsedData {
  references: Reference[]
  tokens: Array<Array<[string, string]>>
}

interface TrainingDataItem {
  originalText: string
  tokens: Array<Array<[string, string]>>
  timestamp: string
}

// Composables
const { t } = useI18n()

// State
const referenceText = ref('')
const parsedData = ref<ParsedData | null>(null)
const loading = ref(false)
const error = ref('')
const showHistoryDialog = ref(false)
const trainingDataHistory = ref<TrainingDataItem[]>([])

// Methods
async function parseReference() {
  if (!referenceText.value.trim())
    return

  loading.value = true
  error.value = ''

  try {
    const result = await ReferencesService.extractReferencesWithTokens(referenceText.value.trim())
    parsedData.value = {
      references: result.references.map(ref => ({ ...ref, metadata: ref.metadata || {} })),
      tokens: result.tokens,
    }
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to parse reference'
    console.error('Parsing error:', err)
  }
  finally {
    loading.value = false
  }
}

function updateTokens(updatedTokens: Array<Array<[string, string]>>) {
  if (parsedData.value) {
    parsedData.value.tokens = updatedTokens
  }
}

function saveTrainingData(tokens: Array<Array<[string, string]>>) {
  const trainingItem: TrainingDataItem = {
    originalText: referenceText.value.trim(),
    tokens,
    timestamp: new Date().toLocaleString(),
  }

  trainingDataHistory.value.unshift(trainingItem)
  saveHistoryToStorage()

  // Success notification (could be enhanced with toast/snackbar)
}

function exportTrainingData() {
  if (!parsedData.value)
    return

  // Convert tokens to XML format for AnyStyle training
  const xmlData = convertTokensToXML(parsedData.value.tokens)

  // Create and download file
  const blob = new Blob([xmlData], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `training-data-${Date.now()}.xml`
  a.click()
  URL.revokeObjectURL(url)
}

function convertTokensToXML(tokens: Array<Array<[string, string]>>): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<dataset>\n'

  tokens.forEach((sequence, index) => {
    xml += `  <reference id="${index + 1}">\n`

    let currentLabel = ''
    let currentContent = ''

    sequence.forEach((token, tokenIndex) => {
      const [label, text] = token

      if (label !== currentLabel) {
        // Close previous tag if exists
        if (currentLabel && currentContent) {
          xml += `    <${currentLabel}>${currentContent.trim()}</${currentLabel}>\n`
        }
        // Start new tag
        currentLabel = label
        currentContent = text
      }
      else {
        // Continue current tag
        currentContent += ` ${text}`
      }

      // Close tag if this is the last token
      if (tokenIndex === sequence.length - 1 && currentLabel && currentContent) {
        xml += `    <${currentLabel}>${currentContent.trim()}</${currentLabel}>\n`
      }
    })

    xml += '  </reference>\n'
  })

  xml += '</dataset>'
  return xml
}

function getLabelColor(label: string): string {
  const colorMap: Record<string, string> = {
    'author': 'blue',
    'title': 'green',
    'journal': 'purple',
    'date': 'orange',
    'volume': 'teal',
    'pages': 'indigo',
    'doi': 'red',
    'url': 'cyan',
    'issue': 'lime',
    'publisher': 'brown',
    'location': 'pink',
    'citation-number': 'grey',
    'editor': 'deep-orange',
  }
  return colorMap[label] || 'amber'
}

function formatDate(dateValue: any): string {
  if (!dateValue)
    return ''
  if (typeof dateValue === 'string')
    return dateValue
  if (dateValue.raw)
    return dateValue.raw
  if (dateValue['date-parts'] && dateValue['date-parts'][0]) {
    return dateValue['date-parts'][0].join('-')
  }
  return ''
}

function clearHistory() {
  trainingDataHistory.value = []
  saveHistoryToStorage()
  showHistoryDialog.value = false
}

function saveHistoryToStorage() {
  localStorage.setItem('source-taster-training-history', JSON.stringify(trainingDataHistory.value))
}

function loadHistoryFromStorage() {
  const stored = localStorage.getItem('source-taster-training-history')
  if (stored) {
    try {
      trainingDataHistory.value = JSON.parse(stored)
    }
    catch (err) {
      console.warn('Failed to load training history:', err)
    }
  }
}

// Lifecycle
onMounted(() => {
  loadHistoryFromStorage()
})
</script>

<template>
  <v-container
    fluid
    class="training-data-manager"
  >
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon
              color="primary"
              class="me-2"
            >
              mdi-brain
            </v-icon>
            {{ t('trainingData.title') }}
            <v-spacer />
            <v-chip
              color="info"
              variant="outlined"
            >
              {{ t('trainingData.modelTraining') }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <v-alert
              type="info"
              variant="outlined"
              class="mb-4"
            >
              {{ t('trainingData.description') }}
            </v-alert>

            <!-- Reference Input -->
            <v-textarea
              v-model="referenceText"
              :label="t('trainingData.inputLabel')"
              :placeholder="t('trainingData.inputPlaceholder')"
              variant="outlined"
              rows="3"
              class="mb-4"
            />

            <div class="d-flex gap-2 mb-4">
              <v-btn
                color="primary"
                :loading
                :disabled="!referenceText.trim()"
                @click="parseReference"
              >
                <v-icon start>
                  mdi-cog
                </v-icon>
                {{ t('trainingData.parseButton') }}
              </v-btn>

              <v-btn
                v-if="parsedData"
                color="success"
                variant="outlined"
                @click="exportTrainingData"
              >
                <v-icon start>
                  mdi-download
                </v-icon>
                {{ t('trainingData.exportButton') }}
              </v-btn>

              <v-btn
                v-if="trainingDataHistory.length > 0"
                color="info"
                variant="outlined"
                @click="showHistoryDialog = true"
              >
                <v-icon start>
                  mdi-history
                </v-icon>
                {{ t('trainingData.historyButton') }} ({{ trainingDataHistory.length }})
              </v-btn>
            </div>

            <!-- Error Display -->
            <v-alert
              v-if="error"
              type="error"
              variant="outlined"
              class="mb-4"
            >
              {{ error }}
            </v-alert>

            <!-- Parsed CSL Reference Preview -->
            <v-card
              v-if="parsedData?.references && parsedData.references.length > 0"
              variant="outlined"
              class="mb-4"
            >
              <v-card-title class="text-h6">
                <v-icon start>
                  mdi-file-document-outline
                </v-icon>
                {{ t('trainingData.parsedReference') }}
              </v-card-title>
              <v-card-text>
                <div class="reference-preview">
                  <div
                    v-if="parsedData.references[0].metadata.author"
                    class="mb-2"
                  >
                    <strong>Authors:</strong>
                    <span
                      v-for="(author, index) in parsedData.references[0].metadata.author"
                      :key="index"
                    >
                      {{ typeof author === 'string' ? author : `${author.given || ''} ${author.family || ''}`.trim() }}
                      <span v-if="index < parsedData.references[0].metadata.author.length - 1">, </span>
                    </span>
                  </div>
                  <div
                    v-if="parsedData.references[0].metadata.title"
                    class="mb-2"
                  >
                    <strong>Title:</strong> {{ parsedData.references[0].metadata.title }}
                  </div>
                  <div
                    v-if="parsedData.references[0].metadata['container-title']"
                    class="mb-2"
                  >
                    <strong>Journal:</strong> {{ parsedData.references[0].metadata['container-title'] }}
                  </div>
                  <div
                    v-if="parsedData.references[0].metadata.issued"
                    class="mb-2"
                  >
                    <strong>Date:</strong> {{ formatDate(parsedData.references[0].metadata.issued) }}
                  </div>
                  <div
                    v-if="parsedData.references[0].metadata.volume"
                    class="mb-2"
                  >
                    <strong>Volume:</strong> {{ parsedData.references[0].metadata.volume }}
                  </div>
                  <div
                    v-if="parsedData.references[0].metadata.page"
                    class="mb-2"
                  >
                    <strong>Pages:</strong> {{ parsedData.references[0].metadata.page }}
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Token Relabeling Editor -->
            <TokenRelabelingEditor
              v-if="parsedData?.tokens && parsedData.tokens.length > 0"
              :tokens="parsedData.tokens"
              @update:tokens="updateTokens"
              @save="saveTrainingData"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Training Data History Dialog -->
    <v-dialog
      v-model="showHistoryDialog"
      max-width="800px"
      scrollable
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start>
            mdi-history
          </v-icon>
          {{ t('trainingData.historyTitle') }}
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showHistoryDialog = false"
          />
        </v-card-title>

        <v-card-text>
          <div
            v-for="(item, index) in trainingDataHistory"
            :key="index"
            class="training-history-item mb-4"
          >
            <v-card variant="outlined">
              <v-card-title class="text-subtitle-1">
                {{ item.timestamp }}
                <v-spacer />
                <v-chip
                  size="small"
                  color="info"
                >
                  {{ item.tokens.length }} {{ t('trainingData.sequences') }}
                </v-chip>
              </v-card-title>
              <v-card-text>
                <div class="text-body-2 mb-2">
                  <strong>{{ t('trainingData.originalText') }}:</strong>
                </div>
                <div class="text-caption mb-3 pa-2 bg-grey-lighten-4 rounded">
                  {{ item.originalText }}
                </div>

                <div class="token-preview">
                  <v-chip
                    v-for="(token, tokenIndex) in item.tokens[0]"
                    :key="tokenIndex"
                    :color="getLabelColor(token[0])"
                    size="small"
                    class="ma-1"
                  >
                    {{ token[1] }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <div
            v-if="trainingDataHistory.length === 0"
            class="text-center py-8"
          >
            <v-icon
              size="64"
              color="grey"
            >
              mdi-history
            </v-icon>
            <p class="text-h6 mt-4">
              {{ t('trainingData.noHistory') }}
            </p>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            v-if="trainingDataHistory.length > 0"
            color="warning"
            variant="outlined"
            @click="clearHistory"
          >
            <v-icon start>
              mdi-delete-sweep
            </v-icon>
            {{ t('trainingData.clearHistory') }}
          </v-btn>
          <v-btn @click="showHistoryDialog = false">
            {{ t('common.close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.training-data-manager {
  max-width: 1200px;
  margin: 0 auto;
}

.training-history-item {
  transition: all 0.2s ease;
}

.training-history-item:hover {
  transform: translateY(-2px);
}

.token-preview {
  max-height: 100px;
  overflow-y: auto;
}
</style>
