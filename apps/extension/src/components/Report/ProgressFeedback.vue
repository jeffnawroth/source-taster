<script setup lang="ts">
import type { ExtractedReference } from '@/extension/types/reference'
import { mdiClose, mdiRestart } from '@mdi/js'
import { useReferencesStore } from '@/extension/stores/references'

const { t } = useI18n()

const { currentPhase, extractedCount, totalCount, isExtraction, currentlyMatchingReference, currentlyMatchingIndex } = storeToRefs(useReferencesStore())
const { cancelExtraction, extractAndMatchReferences } = useReferencesStore()

const progressText = computed(() => {
  if (currentPhase.value === 'extracting') {
    return t('extracting-references')
  }

  if (currentPhase.value === 'matching' && totalCount.value > 0) {
    // Calculate current position: if currentlyMatchingIndex is set, use it + 1, otherwise use extractedCount
    const currentPosition = currentlyMatchingReference.value
      ? (currentlyMatchingIndex.value + 1)
      : extractedCount.value
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

  // Handle re-matching (when not in main extraction but currentlyMatchingIndex is set)
  if (!isExtraction.value && currentlyMatchingIndex.value >= 0 && currentlyMatchingReference.value) {
    const currentRefText = getCurrentReferenceDisplayText(currentlyMatchingReference.value)
    return t('re-verifying-reference', { reference: currentRefText })
  }

  return ''
})

// Helper function to get a short display text for the current reference
function getCurrentReferenceDisplayText(ref: ExtractedReference): string {
  // Try to get a meaningful short text from the reference
  if (ref.metadata?.title) {
    // Truncate title if too long
    const title = ref.metadata.title
    return title.length > 50 ? `${title.substring(0, 47)}...` : title
  }

  if (ref.metadata?.author && ref.metadata.author.length > 0) {
    const firstAuthor = ref.metadata.author[0]
    let authorName = ''

    if (typeof firstAuthor === 'string') {
      authorName = firstAuthor
    }
    else {
      // Build author name from Author object (CSL format)
      const nameParts = []
      if (firstAuthor.given)
        nameParts.push(firstAuthor.given)
      if (firstAuthor.family)
        nameParts.push(firstAuthor.family)
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
  cancelExtraction()
}

function handleRestart() {
  extractAndMatchReferences()
}

const progressPercentage = computed(() => {
  if (currentPhase.value === 'matching' && totalCount.value > 0) {
    return Math.round((extractedCount.value / totalCount.value) * 100)
  }
  return 0
})
</script>

<template>
  <v-alert
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
          v-else-if="!isExtraction && currentlyMatchingIndex >= 0"
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
