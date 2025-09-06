<script setup lang="ts">
import type { AnystyleTokenSequence, Reference } from '@source-taster/types'
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { useReferencesStore } from '@/extension/stores/references'
import TokenRelabelingEditor from './TokenRelabelingEditor.vue'

// Types
interface ParsedData {
  references: Reference[]
  tokens: AnystyleTokenSequence[]
}

// Composables
const referencesStore = useReferencesStore()
const { parsedTokens, showTokenEditor } = storeToRefs(referencesStore)

// State
const parsedData = ref<ParsedData | null>(null)
const error = ref('')
const currentReferenceIndex = ref(0)

// Watch for changes in store data
watch([parsedTokens, showTokenEditor], ([tokens, show]) => {
  if (show && tokens.length > 0) {
    parsedData.value = {
      references: [], // Not provided by /parse endpoint
      tokens,
    }
    currentReferenceIndex.value = 0
  }
  else {
    parsedData.value = null
  }
}, { immediate: true })

// Update tokens from editor
function updateCurrentSequenceTokens(newTokens: AnystyleTokenSequence[]) {
  if (parsedData.value && newTokens[0]) {
    // Update the current sequence in local data
    parsedData.value.tokens[currentReferenceIndex.value] = newTokens[0]

    // Update the store data as well - modify array in place
    parsedTokens.value[currentReferenceIndex.value] = newTokens[0]
  }
}
</script>

<template>
  <v-card flat>
    <v-card-text>
      <!-- Action Buttons -->
      <div
        v-if="error"
        class="d-flex flex-column gap-4"
      >
        <!-- Error Display -->
        <v-alert
          type="error"
          variant="tonal"
          closable
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>
      </div>

      <!-- Token Editor with Navigation -->
      <v-expand-transition>
        <div v-if="showTokenEditor && parsedData">
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
        </div>
      </v-expand-transition>
    </v-card-text>
  </v-card>
</template>
