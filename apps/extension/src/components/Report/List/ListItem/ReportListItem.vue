<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'
import { mdiCheck, mdiChevronDown, mdiChevronUp, mdiContentCopy, mdiOpenInNew } from '@mdi/js'
// PROPS
const { reference, isCurrentlyVerifying = false } = defineProps<{
  reference: ProcessedReference
  isCurrentlyVerifying?: boolean
}>()

// TRANSLATION
const { t } = useI18n()

// CARD COLOR based on verification score
const color = computed(() => {
  // If currently verifying, show special color
  if (isCurrentlyVerifying) {
    return 'primary'
  }

  // If there's an error, show error color
  if (reference.status === 'error') {
    return 'error'
  }

  // If still pending, no color
  if (reference.status === 'pending') {
    return undefined
  }

  // Get the overall score from verification details
  const score = reference.verificationResult?.verificationDetails?.matchDetails?.overallScore

  if (score === undefined) {
    return 'warning' // No score available
  }

  // Score-based color mapping:
  // 80-100%: Green (success) - High confidence match
  // 60-79%:  Blue (info) - Medium-high confidence
  // 40-59%:  Orange (warning) - Medium confidence
  // 0-39%:   Red (error) - Low confidence
  if (score >= 80)
    return 'success'
  if (score >= 60)
    return 'warning'
  return 'error'
})

// TITLE
const title = computed(() => reference.metadata.title || t('no-title'))

// VERIFICATION SCORE
const verificationScore = computed(() =>
  reference.verificationResult?.verificationDetails?.matchDetails?.overallScore,
)

// SCORE DISPLAY TEXT
const scoreText = computed(() => {
  if (verificationScore.value === undefined)
    return null
  return `${Math.round(verificationScore.value)} %`
})

// SHOW DETAILS
const showDetails = ref(false)

// COPY STATE
const isCopied = ref(false)

// PRIMARY URL for opening source
const primaryUrl = computed(() => {
  // Priority: DOI > PMC > PMID > URL
  if (reference.metadata.identifiers?.doi) {
    return `https://doi.org/${reference.metadata.identifiers.doi}`
  }
  if (reference.metadata.identifiers?.pmcid) {
    const pmcid = reference.metadata.identifiers.pmcid.startsWith('PMC')
      ? reference.metadata.identifiers.pmcid
      : `PMC${reference.metadata.identifiers.pmcid}`
    return `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`
  }
  if (reference.metadata.identifiers?.pmid) {
    return `https://pubmed.ncbi.nlm.nih.gov/${reference.metadata.identifiers.pmid}`
  }
  if (reference.metadata.source.url) {
    return reference.metadata.source.url
  }
  return undefined
})

// COPY IDENTIFIER function
async function copyIdentifier() {
  let identifier = ''

  // Priority: DOI > PMCID > PMID > arXiv > ISBN > ISSN
  if (reference.metadata.identifiers?.doi) {
    identifier = reference.metadata.identifiers.doi
  }
  else if (reference.metadata.identifiers?.pmcid) {
    identifier = reference.metadata.identifiers.pmcid
  }
  else if (reference.metadata.identifiers?.pmid) {
    identifier = reference.metadata.identifiers.pmid
  }
  else if (reference.metadata.identifiers?.arxivId) {
    identifier = reference.metadata.identifiers.arxivId
  }
  else if (reference.metadata.identifiers?.isbn) {
    identifier = reference.metadata.identifiers.isbn
  }
  else if (reference.metadata.identifiers?.issn) {
    identifier = reference.metadata.identifiers.issn
  }

  if (identifier) {
    try {
      await navigator.clipboard.writeText(identifier)

      // Show success icon
      isCopied.value = true

      // Reset icon after 2 seconds
      setTimeout(() => {
        isCopied.value = false
      }, 2000)
    }
    catch (error) {
      console.error('Failed to copy identifier:', error)
    }
  }
}

// OPEN SOURCE function
function openSource() {
  if (primaryUrl.value) {
    window.open(primaryUrl.value, '_blank')
  }
}

// FLAG AS PROBLEMATIC function
// function flagProblematic() {
//   // TODO: Implement flagging functionality
//   // This could emit an event to parent component or update a store
// }

// RE-VERIFY function
// function reVerify() {
//   // TODO: Implement re-verification functionality
//   // This could emit an event to trigger re-verification
// }
</script>

<template>
  <v-card
    density="compact"
    variant="outlined"
    class="mb-2"
    :class="{ 'currently-verifying': isCurrentlyVerifying }"
    :title
    :color
  >
    <!-- STATUS ICON & SCORE -->
    <template #append>
      <ReportListItemStatusIcon
        :score-text
        :color
      />
    </template>

    <!-- SUBTITLE -->
    <ReferenceCardSubtitle :reference />

    <!-- ACTIONS -->
    <v-card-actions>
      <v-row
        dense
        align-content="center"
      >
        <v-col
          cols="auto"
          align-self="center"
        >
          <!-- Details Toggle -->
          <v-btn
            variant="text"
            size="small"
            :prepend-icon="showDetails ? mdiChevronUp : mdiChevronDown"
            @click="showDetails = !showDetails"
          >
            {{ showDetails ? $t('hide-details') : $t('show-details') }}
          </v-btn>
        </v-col>

        <v-spacer />

        <v-col
          cols="auto"
          align-self="center"
        >
          <!-- Copy DOI/Identifier -->
          <v-tooltip
            v-if="reference.metadata.identifiers?.doi || reference.metadata.identifiers?.pmid || reference.metadata.identifiers?.pmcid"
            location="top"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                size="small"
                :icon="isCopied ? mdiCheck : mdiContentCopy"
                :color="isCopied ? 'success' : undefined"
                @click="copyIdentifier"
              />
            </template>
            <span>{{ isCopied ? $t('copy-clicked') : $t('copy-identifier-tooltip') }}</span>
          </v-tooltip>
        </v-col>
        <v-col
          cols="auto"
          align-self="center"
        >
          <!-- Open Source -->
          <v-tooltip
            v-if="primaryUrl"
            location="top"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                size="small"
                :icon="mdiOpenInNew"
                @click="openSource"
              />
            </template>
            <span>{{ $t('open-source-tooltip') }}</span>
          </v-tooltip>
        </v-col>
        <!-- <v-col cols="auto"> -->
        <!-- Flag as Problematic -->
        <!-- <v-tooltip
        v-if="reference.status === 'verified' || reference.status === 'not-verified'"
        location="top"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            size="small"
            :icon="mdiFlagOutline"
            color="warning"
            @click="flagProblematic"
          />
        </template>
        <span>{{ $t('flag-problematic-tooltip') }}</span>
      </v-tooltip> -->
        <!-- </v-col> -->
        <!-- <v-col cols="auto">
           Re-verify
          <v-tooltip
            v-if="reference.status === 'error' || (verificationScore !== undefined && verificationScore < 60)"
            location="top"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                size="small"
                :icon="mdiRefresh"
                @click="reVerify"
              />
            </template>
            <span>{{ $t('re-verify-tooltip') }}</span>
          </v-tooltip>
        </v-col> -->
      </v-row>
    </v-card-actions>

    <ReferenceCardDetails
      v-show="showDetails"
      :reference
    />
  </v-card>
</template>

<style scoped>
.currently-verifying {
  position: relative;
  overflow: hidden;
}

.currently-verifying::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.1), transparent);
  animation: shimmer 2s infinite;
  z-index: 1;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>
