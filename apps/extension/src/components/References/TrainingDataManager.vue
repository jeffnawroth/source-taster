<script setup lang="ts">
import type { ApiAnystyleTokenLabel, ApiAnystyleTokenSequence } from '@source-taster/types'
import { mdiChevronDown, mdiChevronLeft, mdiChevronRight, mdiChevronUp, mdiInformationOutline } from '@mdi/js'
import { useAnystyleStore } from '@/extension/stores/anystyle'
import TokenRelabelingEditor from './TokenRelabelingEditor.vue'

// Composables
const anystyleStore = useAnystyleStore()
const { parsedTokens, showTokenEditor } = storeToRefs(anystyleStore)

// State - Simplified: only tokens needed for editing
const editableTokens = ref<ApiAnystyleTokenSequence[]>([])
const error = ref('')
const currentReferenceIndex = ref(0)

// Watch for changes in store data
watch([parsedTokens, showTokenEditor], ([tokens, show]) => {
  if (show && tokens.length > 0) {
    // Create deep mutable copy of tokens for editing
    editableTokens.value = tokens.map(tokenSequence =>
      tokenSequence.map(token => [token[0], token[1]] as [ApiAnystyleTokenLabel, string]),
    )
    currentReferenceIndex.value = 0
  }
  else {
    editableTokens.value = []
  }
}, { immediate: true })

// Update tokens from editor
function updateCurrentSequenceTokens(newTokens: ApiAnystyleTokenSequence[]) {
  if (editableTokens.value.length > 0 && newTokens[0]) {
    // Update the current sequence in local data
    editableTokens.value[currentReferenceIndex.value] = newTokens[0]

    // Update the store data as well
    anystyleStore.updateTokens(currentReferenceIndex.value, newTokens[0])
  }
}
</script>

<template>
  <v-card
    flat
    :title="`2. ${$t('edit')}`"
    :subtitle="$t('review-and-relabel-parsed-references-by-clicking-on-tokens')"
    :disabled="parsedTokens.length === 0"
    :append-icon="mdiChevronDown"
  >
    <template #append>
      <!-- Info Icon with Tooltip -->
      <v-tooltip location="bottom">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            :icon="mdiInformationOutline"
            variant="text"
            size="small"
            v-bind="tooltipProps"
          />
        </template>
        <div
          class="text-caption"
          style="max-width: 400px;"
        >
          <strong>{{ $t('token-editor-help-title') }}</strong><br>
          {{ $t('token-editor-help-description') }}
        </div>
      </v-tooltip>

      <v-btn
        variant="text"
        :icon="showTokenEditor ? mdiChevronUp : mdiChevronDown"
        @click="anystyleStore.setShowTokenEditor(!showTokenEditor)"
      />
    </template>
    <v-card-text class="pa-0">
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
        <div v-if="showTokenEditor && editableTokens.length > 0">
          <!-- Current Token Sequence Editor -->
          <TokenRelabelingEditor
            v-if="editableTokens[currentReferenceIndex]"
            :tokens="[editableTokens[currentReferenceIndex]]"
            @update:tokens="updateCurrentSequenceTokens"
          />

          <!-- Navigation Controls - moved below editor -->
          <div
            v-if="editableTokens.length > 1"
            class="d-flex align-center justify-space-between mt-3"
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
              {{ currentReferenceIndex + 1 }} / {{ editableTokens.length }}
            </v-chip>

            <v-btn
              :disabled="currentReferenceIndex >= editableTokens.length - 1"
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
