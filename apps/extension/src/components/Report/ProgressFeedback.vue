<script setup lang="ts">
import type { ProcessedReference } from '@/extension/types/reference'
import { mdiClose, mdiRestart } from '@mdi/js'
import { useReferencesStore } from '@/extension/stores/references'

const { t } = useI18n()

const { currentPhase, processedCount, totalCount, isProcessing, currentlyMatchingReference, currentlyMatchingIndex } = storeToRefs(useReferencesStore())
const { cancelProcessing, extractAndMatchReferences } = useReferencesStore()
// Progress feedback for matching
const showProgressFeedback = computed(() => {
  // Show during main processing (extract + match all)
  const isMainProcessing = isProcessing.value && (currentPhase.value === 'extracting' || currentPhase.value === 'matching')

  // Show during individual re-matching (when currentlyMatchingIndex is set but not main processing)
  const isReMatching = !isProcessing.value && currentlyMatchingIndex.value >= 0

  return isMainProcessing || isReMatching
})

const progressText = computed(() => {
  if (currentPhase.value === 'extracting') {
    return t('extracting-references')
  }

  if (currentPhase.value === 'matching' && totalCount.value > 0) {
    // Calculate current position: if currentlyMatchingIndex is set, use it + 1, otherwise use processedCount
    const currentPosition = currentlyMatchingReference.value
      ? (currentlyMatchingIndex.value + 1)
      : processedCount.value
    const total = totalCount.value

    // Base progress: "Verifying references (2/5)"
    const baseProgress = t('verifying-references-progress', {
      current: currentPosition,
      total,
    })

    // Add current reference info if available
    if (currentlyMatchingReference.value) {
      const currentRefText = getCurrentReferenceDisplayText(currentlyMatchingReference.value)
      const currentRefInfo = t('verifying-reference-current', { reference: currentRefText })
      return `${baseProgress} - ${currentRefInfo}`
    }

    return baseProgress
  }

  // Handle re-matching (when not in main processing but currentlyMatchingIndex is set)
  if (!isProcessing.value && currentlyMatchingIndex.value >= 0 && currentlyMatchingReference.value) {
    const currentRefText = getCurrentReferenceDisplayText(currentlyMatchingReference.value)
    return t('re-verifying-reference', { reference: currentRefText })
  }

  return ''
})

// Helper function to get a short display text for the current reference
function getCurrentReferenceDisplayText(ref: ProcessedReference): string {
  // Try to get a meaningful short text from the reference
  if (ref.metadata?.title) {
    // Truncate title if too long
    const title = ref.metadata.title
    return title.length > 50 ? `${title.substring(0, 47)}...` : title
  }

  if (ref.metadata?.authors && ref.metadata.authors.length > 0) {
    const firstAuthor = ref.metadata.authors[0]
    let authorName = ''

    if (typeof firstAuthor === 'string') {
      authorName = firstAuthor
    }
    else {
      // Build author name from Author object
      const nameParts = []
      if (firstAuthor.firstName)
        nameParts.push(firstAuthor.firstName)
      if (firstAuthor.lastName)
        nameParts.push(firstAuthor.lastName)
      authorName = nameParts.join(' ')
    }

    return authorName.length > 30 ? `${authorName.substring(0, 27)}...` : authorName
  }

  // Fallback to original text (truncated)
  if (ref.originalText) {
    return ref.originalText.length > 60 ? `${ref.originalText.substring(0, 57)}...` : ref.originalText
  }

  return 'Reference'
}

// Action handlers
function handleCancel() {
  cancelProcessing()
}

function handleRestart() {
  extractAndMatchReferences()
}

const progressPercentage = computed(() => {
  if (currentPhase.value === 'matching' && totalCount.value > 0) {
    return Math.round((processedCount.value / totalCount.value) * 100)
  }
  return 0
})
</script>

<template>
  <v-alert
    v-if="showProgressFeedback"
    density="compact"
    variant="tonal"
    color="primary"
    class="mb-2"
  >
    <div class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-progress-circular
          v-if="currentPhase === 'extracting'"
          indeterminate
          size="16"
          width="2"
          class="me-2"
        />
        <v-progress-circular
          v-else-if="currentPhase === 'matching'"
          :model-value="progressPercentage"
          size="16"
          width="2"
          class="me-2"
        />
        <v-progress-circular
          v-else-if="!isProcessing && currentlyMatchingIndex >= 0"
          indeterminate
          size="16"
          width="2"
          class="me-2"
        />
        <span class="text-caption">{{ progressText }}</span>
      </div>

      <!-- Action buttons -->
      <div class="d-flex align-center ga-1">
        <v-tooltip location="top">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :icon="mdiRestart"
              size="x-small"
              variant="text"
              color="primary"
              @click="handleRestart"
            />
          </template>
          <span>{{ t('restart-verification') }}</span>
        </v-tooltip>

        <v-tooltip location="top">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :icon="mdiClose"
              size="x-small"
              variant="text"
              color="primary"
              @click="handleCancel"
            />
          </template>
          <span>{{ t('cancel-verification') }}</span>
        </v-tooltip>
      </div>
    </div>
  </v-alert>
</template>
