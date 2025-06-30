<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'
import { mdiFileDocumentOutline } from '@mdi/js'
import { useFuse } from '@vueuse/integrations/useFuse'
import { useReferencesStore } from '@/extension/stores/references'

const { t } = useI18n()
const { references, currentPhase, processedCount, totalCount, isProcessing, currentlyVerifyingReference, currentlyVerifyingIndex } = storeToRefs(useReferencesStore())

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
const showProgressFeedback = computed(() =>
  isProcessing.value && (currentPhase.value === 'extracting' || currentPhase.value === 'verifying'),
)

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
</script>

<template>
  <v-card
    flat
    :title="$t('report')"
  >
    <template #prepend>
      <v-icon
        :icon="mdiFileDocumentOutline"
        size="large"
      />
    </template>

    <template #append>
      <!-- PDF DOWNLOAD -->
      <!-- <ReportPdfDownload /> -->
    </template>

    <!-- SUBTITLE -->
    <template
      #subtitle
    >
      <ReportSubtitle />
    </template>
    <v-card-text
      class="pa-0"
    >
      <!-- SEARCH -->
      <ReportListSearchInput
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
          <span class="text-caption">{{ progressText }}</span>
        </div>
      </v-alert>

      <div
        style="max-height: calc(100vh - 528px); overflow-y: auto;"
      >
        <!-- LIST - Show immediately after extraction, even during processing -->
        <ReportList
          v-if="references.length > 0"
          :results
        />
      </div>

      <!-- STATES - Only show when no references available -->
      <IdleState v-if="references.length === 0" />
    </v-card-text>
  </v-card>
</template>

<style scoped>
* {
  scrollbar-color: #404040b3 transparent; /*firefox*/
  scrollbar-width: thin;
}
</style>
