<script setup lang="ts">
import type { ApiAnystyleTokenLabel, ApiAnystyleTokenSequence } from '@source-taster/types'
import { mdiAccount, mdiAccountEdit, mdiAccountStar, mdiArchive, mdiBarcode, mdiBookOpenVariant, mdiCalendar, mdiCounter, mdiDisc, mdiDomain, mdiFileDocument, mdiFolderMultiple, mdiFormatTitle, mdiHelp, mdiIdentifier, mdiLibrary, mdiLink, mdiMapMarker, mdiMovieOpen, mdiNoteText, mdiNumeric1Box, mdiSourceBranch, mdiTagMultiple, mdiTranslate } from '@mdi/js'
import { computed, ref, watch } from 'vue'

// Types
interface SelectedToken {
  sequenceIndex: number
  tokenIndex: number
  label: ApiAnystyleTokenLabel
  token: string
}

interface LabelOption {
  value: ApiAnystyleTokenLabel
  nameKey: string
  color: string
  icon: string
}

// Props
interface Props {
  tokens: ApiAnystyleTokenSequence[]
  originalTexts?: string[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:tokens': [tokens: ApiAnystyleTokenSequence[]]
}>()

// State
const tokenSequences = ref<ApiAnystyleTokenSequence[]>([])
const selectedToken = ref<SelectedToken | null>(null)
const hoveredToken = ref<{ sequenceIndex: number, tokenIndex: number } | null>(null)
const { t } = useI18n()

// Available labels with colors and icons (sorted alphabetically)
const availableLabels: LabelOption[] = [
  { value: 'author', nameKey: 'token-label-author', color: 'blue', icon: mdiAccount },
  { value: 'citation-number', nameKey: 'token-label-citation-number', color: 'grey', icon: mdiCounter },
  { value: 'collection-title', nameKey: 'token-label-collection-title', color: 'deep-purple', icon: mdiFolderMultiple },
  { value: 'container-title', nameKey: 'token-label-container-title', color: 'blue-grey', icon: mdiArchive },
  { value: 'date', nameKey: 'token-label-date', color: 'orange', icon: mdiCalendar },
  { value: 'director', nameKey: 'token-label-director', color: 'red-darken-1', icon: mdiMovieOpen },
  { value: 'doi', nameKey: 'token-label-doi', color: 'red', icon: mdiIdentifier },
  { value: 'edition', nameKey: 'token-label-edition', color: 'indigo-darken-2', icon: mdiNumeric1Box },
  { value: 'editor', nameKey: 'token-label-editor', color: 'deep-orange', icon: mdiAccountEdit },
  { value: 'genre', nameKey: 'token-label-genre', color: 'purple-accent-4', icon: mdiTagMultiple },
  { value: 'isbn', nameKey: 'token-label-isbn', color: 'brown-darken-2', icon: mdiBarcode },
  { value: 'journal', nameKey: 'token-label-journal', color: 'purple', icon: mdiBookOpenVariant },
  { value: 'location', nameKey: 'token-label-location', color: 'pink', icon: mdiMapMarker },
  { value: 'medium', nameKey: 'token-label-medium', color: 'teal-accent-3', icon: mdiDisc },
  { value: 'note', nameKey: 'token-label-note', color: 'yellow-darken-2', icon: mdiNoteText },
  { value: 'other', nameKey: 'token-label-other', color: 'amber', icon: mdiHelp },
  { value: 'pages', nameKey: 'token-label-pages', color: 'indigo', icon: mdiFileDocument },
  { value: 'producer', nameKey: 'token-label-producer', color: 'green-darken-2', icon: mdiAccountStar },
  { value: 'publisher', nameKey: 'token-label-publisher', color: 'brown', icon: mdiDomain },
  { value: 'source', nameKey: 'token-label-source', color: 'cyan-darken-2', icon: mdiSourceBranch },
  { value: 'title', nameKey: 'token-label-title', color: 'green', icon: mdiFormatTitle },
  { value: 'translator', nameKey: 'token-label-translator', color: 'light-blue-darken-1', icon: mdiTranslate },
  { value: 'url', nameKey: 'token-label-url', color: 'cyan', icon: mdiLink },
  { value: 'volume', nameKey: 'token-label-volume', color: 'teal', icon: mdiLibrary },
]

interface TranslatedLabelOption extends LabelOption {
  name: string
}

const translatedLabelOptions = computed<TranslatedLabelOption[]>(() =>
  availableLabels.map(option => ({
    ...option,
    name: t(option.nameKey),
  })),
)

// Computed - removed hasChanges since we don't need save functionality

// Methods
function getLabelColor(label: ApiAnystyleTokenLabel): string {
  const labelOption = availableLabels.find(l => l.value === label)
  return labelOption?.color || 'grey'
}

function getLabelDisplayName(label: ApiAnystyleTokenLabel): string {
  const labelOption = availableLabels.find(l => l.value === label)
  return labelOption ? t(labelOption.nameKey) : label
}

function selectToken(sequenceIndex: number, tokenIndex: number) {
  const sequence = tokenSequences.value[sequenceIndex]
  if (!sequence || !sequence[tokenIndex])
    return

  const [label, token] = sequence[tokenIndex]
  selectedToken.value = {
    sequenceIndex,
    tokenIndex,
    label,
    token,
  }
}

function isTokenSelected(sequenceIndex: number, tokenIndex: number): boolean {
  return selectedToken.value?.sequenceIndex === sequenceIndex
    && selectedToken.value?.tokenIndex === tokenIndex
}

function isTokenHovered(sequenceIndex: number, tokenIndex: number): boolean {
  return hoveredToken.value?.sequenceIndex === sequenceIndex
    && hoveredToken.value?.tokenIndex === tokenIndex
}

function setHoveredToken(sequenceIndex: number, tokenIndex: number) {
  hoveredToken.value = { sequenceIndex, tokenIndex }
}

function clearHoveredToken() {
  hoveredToken.value = null
}

function changeTokenLabel(newLabel: ApiAnystyleTokenLabel | null | undefined) {
  if (!selectedToken.value || !newLabel)
    return

  const { sequenceIndex, tokenIndex } = selectedToken.value
  const sequence = tokenSequences.value[sequenceIndex]
  if (sequence && sequence[tokenIndex]) {
    sequence[tokenIndex] = [newLabel, sequence[tokenIndex][1]]
    // Update the selected token's label to reflect the change
    selectedToken.value.label = newLabel
    emit('update:tokens', tokenSequences.value)
  }
  // Don't set selectedToken.value = null to keep the panel open
}

function deleteToken(sequenceIndex: number, tokenIndex: number) {
  const sequence = tokenSequences.value[sequenceIndex]
  if (sequence) {
    sequence.splice(tokenIndex, 1)
    emit('update:tokens', tokenSequences.value)
  }
  // Clear selection if we deleted the selected token
  if (selectedToken.value?.sequenceIndex === sequenceIndex && selectedToken.value?.tokenIndex === tokenIndex) {
    selectedToken.value = null
  }
}

// Watch for prop changes
watch(() => props.tokens, (newTokens) => {
  tokenSequences.value = JSON.parse(JSON.stringify(newTokens))
  selectedToken.value = null
}, { immediate: true, deep: true })
</script>

<template>
  <div
    v-for="(sequence, sequenceIndex) in tokenSequences"
    :key="sequenceIndex"
    class="token-sequence mb-4"
  >
    <div
      v-if="originalTexts?.[sequenceIndex]"
      class="original-text text-body-2 text-medium-emphasis mb-2"
    >
      {{ originalTexts[sequenceIndex] }}
    </div>

    <div class="d-flex flex-wrap">
      <v-chip
        v-for="(token, tokenIndex) in sequence"
        :key="`${sequenceIndex}-${tokenIndex}`"
        :color="getLabelColor(token[0])"
        :variant="isTokenSelected(sequenceIndex, tokenIndex) ? 'elevated' : 'outlined'"
        class="token-chip ma-1"
        :class="{ 'token-selected': isTokenSelected(sequenceIndex, tokenIndex) }"
        :closable="isTokenHovered(sequenceIndex, tokenIndex)"
        @click="selectToken(sequenceIndex, tokenIndex)"
        @click:close="deleteToken(sequenceIndex, tokenIndex)"
        @mouseenter="setHoveredToken(sequenceIndex, tokenIndex)"
        @mouseleave="clearHoveredToken"
      >
        <span>{{ token[1] }}</span>

        <v-tooltip
          activator="parent"
          location="top"
        >
          {{ getLabelDisplayName(token[0]) }}
        </v-tooltip>
      </v-chip>
    </div>
  </div>

  <v-expand-transition>
    <div
      v-if="selectedToken"
    >
      <!-- Autocomplete for label selection -->
      <v-autocomplete
        :items="translatedLabelOptions"
        item-title="name"
        item-value="value"
        :model-value="selectedToken.label"
        :label="t('token-editor-select-new-label')"
        :placeholder="t('token-editor-search-labels-placeholder')"
        variant="outlined"
        density="comfortable"
        auto-select-first
        class="mt-5"
        @update:model-value="changeTokenLabel"
      >
        <template #selection="{ item }">
          <v-chip
            :color="item.raw.color"
            :prepend-icon="item.raw.icon"
          >
            {{ item.raw.name }}
          </v-chip>
        </template>

        <template #item="{ props: itemProps, item }">
          <v-list-item v-bind="itemProps">
            <template #prepend>
              <v-icon :color="item.raw.color">
                {{ item.raw.icon }}
              </v-icon>
            </template>
          </v-list-item>
        </template>
      </v-autocomplete>
    </div>
  </v-expand-transition>
</template>

<style scoped>
.token-sequence {
  display: flex;
  flex-direction: column;
}

.original-text {
  word-break: break-word;
}

.token-chip {
  cursor: pointer;
}

.token-selected {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}
</style>
