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
const selectedTokens = ref<SelectedToken[]>([])
const lastSelectedToken = ref<SelectedToken | null>(null)
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

function getTokenAt(sequenceIndex: number, tokenIndex: number): SelectedToken | null {
  const sequence = tokenSequences.value[sequenceIndex]
  const token = sequence?.[tokenIndex]
  if (!sequence || !token)
    return null

  const [label, tokenValue] = token
  return {
    sequenceIndex,
    tokenIndex,
    label,
    token: tokenValue,
  }
}

function toggleTokenSelection(selection: SelectedToken) {
  const index = selectedTokens.value.findIndex(token =>
    token.sequenceIndex === selection.sequenceIndex && token.tokenIndex === selection.tokenIndex,
  )

  if (index >= 0)
    selectedTokens.value.splice(index, 1)
  else
    selectedTokens.value.push(selection)
}

function addRangeSelection(selection: SelectedToken) {
  if (!lastSelectedToken.value || lastSelectedToken.value.sequenceIndex !== selection.sequenceIndex) {
    selectedTokens.value = [selection]
    return
  }

  const start = Math.min(lastSelectedToken.value.tokenIndex, selection.tokenIndex)
  const end = Math.max(lastSelectedToken.value.tokenIndex, selection.tokenIndex)

  const additions: SelectedToken[] = []
  for (let tokenIndex = start; tokenIndex <= end; tokenIndex++) {
    const token = getTokenAt(selection.sequenceIndex, tokenIndex)
    if (!token)
      continue
    if (!selectedTokens.value.some(selected =>
      selected.sequenceIndex === token.sequenceIndex && selected.tokenIndex === token.tokenIndex,
    )) {
      additions.push(token)
    }
  }

  selectedTokens.value.push(...additions)
}

function selectToken(sequenceIndex: number, tokenIndex: number, event?: MouseEvent | KeyboardEvent) {
  const sequence = tokenSequences.value[sequenceIndex]
  if (!sequence || !sequence[tokenIndex])
    return

  const selection = getTokenAt(sequenceIndex, tokenIndex)
  if (!selection)
    return

  const isMultiSelect = event?.metaKey || event?.ctrlKey
  const isRangeSelection = event?.shiftKey && !isMultiSelect

  if (isRangeSelection)
    addRangeSelection(selection)
  else if (isMultiSelect)
    toggleTokenSelection(selection)
  else
    selectedTokens.value = [selection]

  lastSelectedToken.value = selection
}

function isTokenSelected(sequenceIndex: number, tokenIndex: number): boolean {
  return selectedTokens.value.some(token =>
    token.sequenceIndex === sequenceIndex && token.tokenIndex === tokenIndex,
  )
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

const primarySelectedToken = computed(() => selectedTokens.value[0] ?? null)

const selectedLabel = computed<ApiAnystyleTokenLabel | null>(() => {
  const token = primarySelectedToken.value
  if (!token)
    return null
  return tokenSequences.value[token.sequenceIndex]?.[token.tokenIndex]?.[0] ?? null
})

function changeTokenLabel(newLabel: ApiAnystyleTokenLabel | null | undefined) {
  if (!newLabel || selectedTokens.value.length === 0)
    return

  let changed = false

  for (const selection of selectedTokens.value) {
    const sequence = tokenSequences.value[selection.sequenceIndex]
    if (!sequence)
      continue
    const currentToken = sequence[selection.tokenIndex]
    if (!currentToken)
      continue
    sequence[selection.tokenIndex] = [newLabel, currentToken[1]]
    changed = true
  }

  if (changed)
    emit('update:tokens', tokenSequences.value)
}

function deleteToken(sequenceIndex: number, tokenIndex: number) {
  const sequence = tokenSequences.value[sequenceIndex]
  if (sequence) {
    sequence.splice(tokenIndex, 1)
    emit('update:tokens', tokenSequences.value)
  }
  const updated: SelectedToken[] = []
  for (const token of selectedTokens.value) {
    if (token.sequenceIndex !== sequenceIndex) {
      updated.push(token)
      continue
    }

    if (token.tokenIndex === tokenIndex)
      continue

    if (token.tokenIndex > tokenIndex)
      updated.push({ ...token, tokenIndex: token.tokenIndex - 1 })
    else
      updated.push(token)
  }

  selectedTokens.value = updated
  if (lastSelectedToken.value?.sequenceIndex === sequenceIndex) {
    if (lastSelectedToken.value.tokenIndex === tokenIndex) {
      lastSelectedToken.value = null
    }
    else if (lastSelectedToken.value.tokenIndex > tokenIndex) {
      lastSelectedToken.value = {
        ...lastSelectedToken.value,
        tokenIndex: lastSelectedToken.value.tokenIndex - 1,
      }
    }
  }
}

// Watch for prop changes
watch(() => props.tokens, (newTokens) => {
  tokenSequences.value = JSON.parse(JSON.stringify(newTokens))
  const refreshedSelections: SelectedToken[] = []
  for (const token of selectedTokens.value) {
    const refreshed = getTokenAt(token.sequenceIndex, token.tokenIndex)
    if (refreshed)
      refreshedSelections.push(refreshed)
  }
  selectedTokens.value = refreshedSelections

  if (selectedTokens.value.length === 0) {
    lastSelectedToken.value = null
  }
  else if (lastSelectedToken.value) {
    const refreshedLast = getTokenAt(lastSelectedToken.value.sequenceIndex, lastSelectedToken.value.tokenIndex)
    lastSelectedToken.value = refreshedLast
  }
}, { immediate: true, deep: true })
</script>

<template>
  <div
    v-for="(sequence, sequenceIndex) in tokenSequences"
    :key="sequenceIndex"
    class="token-sequence"
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
        @click="selectToken(sequenceIndex, tokenIndex, $event)"
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
      v-if="selectedTokens.length"
    >
      <!-- Autocomplete for label selection -->
      <v-autocomplete
        :items="translatedLabelOptions"
        item-title="name"
        item-value="value"
        :model-value="selectedLabel"
        :label="t('token-editor-select-new-label')"
        :placeholder="t('token-editor-search-labels-placeholder')"
        variant="outlined"
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
          <v-list-item
            v-bind="itemProps"
          >
            <template #prepend>
              <v-icon
                :color="item.raw.color"
              >
                {{ item.raw.icon }}
              </v-icon>
            </template>
          </v-list-item>
        </template>
      </v-autocomplete>
      <div
        v-if="selectedTokens.length > 1"
        class="text-caption text-medium-emphasis mt-1"
      >
        {{ t('token-editor-multi-selection-count', { count: selectedTokens.length }) }}
      </div>
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
