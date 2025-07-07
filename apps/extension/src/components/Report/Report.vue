<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'
import { mdiClose, mdiFileDocumentOutline, mdiRestart } from '@mdi/js'
import { useFuse } from '@vueuse/integrations/useFuse'
import { useReferencesStore } from '@/extension/stores/references'

const { t } = useI18n()
const { references, currentPhase, processedCount, totalCount, isProcessing, currentlyVerifyingReference, currentlyVerifyingIndex } = storeToRefs(useReferencesStore())
const { cancelProcessing, extractAndVerifyReferences } = useReferencesStore()

const search = ref('')

const { results } = useFuse(search, references, {
  fuseOptions: {
    keys: [
      'originalText',
      'metadata.title',
      'metadata.authors',
      'metadata.source.containerTitle',
      'metadata.date.year',
    ],
    threshold: 0.3,
  },
  matchAllWhenSearchEmpty: true,
})

// Progress feedback for verification
const showProgressFeedback = computed(() => {
  // Show during main processing (extract + verify all)
  const isMainProcessing = isProcessing.value && (currentPhase.value === 'extracting' || currentPhase.value === 'verifying')

  // Show during individual re-verification (when currentlyVerifyingIndex is set but not main processing)
  const isReVerifying = !isProcessing.value && currentlyVerifyingIndex.value >= 0

  return isMainProcessing || isReVerifying
})

const progressText = computed(() => {
  if (currentPhase.value === 'extracting') {
    return t('extracting-references')
  }

  if (currentPhase.value === 'verifying' && totalCount.value > 0) {
    // Calculate current position: if currentlyVerifyingIndex is set, use it + 1, otherwise use processedCount
    const currentPosition = currentlyVerifyingReference.value
      ? (currentlyVerifyingIndex.value + 1)
      : processedCount.value
    const total = totalCount.value

    // Base progress: "Verifying references (2/5)"
    const baseProgress = t('verifying-references-progress', {
      current: currentPosition,
      total,
    })

    // Add current reference info if available
    if (currentlyVerifyingReference.value) {
      const currentRefText = getCurrentReferenceDisplayText(currentlyVerifyingReference.value)
      const currentRefInfo = t('verifying-reference-current', { reference: currentRefText })
      return `${baseProgress} - ${currentRefInfo}`
    }

    return baseProgress
  }

  // Handle re-verification (when not in main processing but currentlyVerifyingIndex is set)
  if (!isProcessing.value && currentlyVerifyingIndex.value >= 0 && currentlyVerifyingReference.value) {
    const currentRefText = getCurrentReferenceDisplayText(currentlyVerifyingReference.value)
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

const progressPercentage = computed(() => {
  if (currentPhase.value === 'verifying' && totalCount.value > 0) {
    return Math.round((processedCount.value / totalCount.value) * 100)
  }
  return 0
})

// Action handlers
function handleCancel() {
  cancelProcessing()
}

function handleRestart() {
  extractAndVerifyReferences()
}
</script>

<template>
  <v-card
    flat
  >
    <v-card-title class="px-0">
      <v-icon size="x-small">
        {{ mdiFileDocumentOutline }}
      </v-icon>
      {{ t('report') }}
    </v-card-title>

    <!-- SUBTITLE -->
    <v-card-subtitle class="px-0">
      <ReportSubtitle />
    </v-card-subtitle>
    <v-card-text class="px-0">
      <!-- SEARCH -->
      <ReferencesSearchInput
        v-model="search"
        class="mb-2"
      />

      <!-- PROGRESS FEEDBACK -->
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
              v-else-if="currentPhase === 'verifying'"
              :model-value="progressPercentage"
              size="16"
              width="2"
              class="me-2"
            />
            <v-progress-circular
              v-else-if="!isProcessing && currentlyVerifyingIndex >= 0"
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

      <div
        style="max-height: calc(100vh - 528px); overflow-y: auto;"
      >
        <!-- LIST - Show immediately after extraction, even during processing -->
        <ReferencesList
          v-if="references.length > 0"
          :results
        />
      </div>

      <!-- STATES - Only show when no references available AND not processing -->
      <IdleState v-if="references.length === 0 && !isProcessing" />
    </v-card-text>
  </v-card>
</template>

<style scoped>
* {
  scrollbar-color: #404040b3 transparent; /*firefox*/
  scrollbar-width: thin;
}
</style>
