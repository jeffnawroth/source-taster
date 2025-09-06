<script setup lang="ts">
import type { Reference } from '@source-taster/types'
import { mdiBrain, mdiChevronLeft, mdiChevronRight, mdiDownload } from '@mdi/js'
import { useReferencesStore } from '@/extension/stores/references'
import TokenRelabelingEditor from './TokenRelabelingEditor.vue'

// Types
interface ParsedData {
  references: Reference[]
  tokens: Array<Array<[string, string]>>
}

// Composables
const { t } = useI18n()
const referencesStore = useReferencesStore()
const { inputText } = storeToRefs(referencesStore)

// State
const parsedData = ref<ParsedData | null>(null)
const loading = ref(false)
const error = ref('')
const showEditor = ref(false)
const currentReferenceIndex = ref(0)

// Functions
async function parseReference() {
  if (!inputText.value.trim())
    return

  loading.value = true
  error.value = ''

  try {
    const response = await fetch('http://localhost:4567/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        references: inputText.value,
        include_tokens: true,
      }),
    })

    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`)

    const result = await response.json()

    // Transform server response format { csl: [...], tokens: [...] }
    // to our expected format { references: [...], tokens: [...] }
    parsedData.value = {
      references: result.csl || [],
      tokens: result.tokens || [],
    }
    showEditor.value = true
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
    console.error('Parsing error:', err)
  }
  finally {
    loading.value = false
  }
}

// Update tokens from editor
function updateCurrentSequenceTokens(newTokens: Array<Array<[string, string]>>) {
  if (parsedData.value && newTokens[0]) {
    // Update the current sequence
    parsedData.value.tokens[currentReferenceIndex.value] = newTokens[0]
  }
}

// Export as XML
function exportAsXML() {
  if (!parsedData.value)
    return

  const xml = convertTokensToXML(parsedData.value.tokens)
  const blob = new Blob([xml], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `training-data-${Date.now()}.xml`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Helper function to convert tokens to XML
function convertTokensToXML(tokens: Array<Array<[string, string]>>): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<dataset>\n'

  for (let i = 0; i < tokens.length; i++) {
    xml += `  <sequence id="${i + 1}">\n`

    for (const [label, token] of tokens[i]) {
      const escapedToken = token
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')

      xml += `    <token label="${label}">${escapedToken}</token>\n`
    }

    xml += '  </sequence>\n'
  }

  xml += '</dataset>'
  return xml
}
</script>

<template>
  <v-card flat>
    <v-card-text>
      <!-- Action Buttons -->
      <div class="d-flex flex-column gap-4">
        <div class="d-flex gap-2">
          <v-btn
            :disabled="!inputText.trim() || loading"
            :loading
            color="primary"
            variant="elevated"
            @click="parseReference"
          >
            <v-icon
              start
              :icon="mdiBrain"
            />
            {{ t('trainingData.parseButton') }}
          </v-btn>

          <v-btn
            v-if="parsedData"
            :disabled="!parsedData"
            color="success"
            variant="outlined"
            @click="exportAsXML"
          >
            <v-icon
              start
              :icon="mdiDownload"
            />
            {{ t('trainingData.exportButton') }}
          </v-btn>
        </div>

        <!-- Error Display -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          closable
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>
      </div>
    </v-card-text>

    <!-- Token Editor with Navigation -->
    <v-expand-transition>
      <div v-if="showEditor && parsedData">
        <v-divider />
        <v-card-text>
          <!-- Current Token Sequence Editor -->
          <v-card flat>
            <v-card-text>
              <TokenRelabelingEditor
                v-if="parsedData.tokens[currentReferenceIndex]"
                :tokens="[parsedData.tokens[currentReferenceIndex]]"
                @update:tokens="updateCurrentSequenceTokens"
              />
            </v-card-text>
          </v-card>

          <!-- Navigation Controls - moved below editor -->
          <div
            v-if="parsedData.tokens.length > 1"
            class="d-flex align-center justify-space-between"
          >
            <v-btn
              :disabled="currentReferenceIndex <= 0"
              icon
              variant="outlined"
              size="small"
              @click="currentReferenceIndex--"
            >
              <v-icon :icon="mdiChevronLeft" />
            </v-btn>

            <v-chip
              color="primary"
              variant="outlined"
            >
              {{ currentReferenceIndex + 1 }} / {{ parsedData.tokens.length }}
            </v-chip>

            <v-btn
              :disabled="currentReferenceIndex >= parsedData.tokens.length - 1"
              icon
              variant="outlined"
              size="small"
              @click="currentReferenceIndex++"
            >
              <v-icon :icon="mdiChevronRight" />
            </v-btn>
          </div>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>
