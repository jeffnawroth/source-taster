<script setup lang="ts">
import { mdiAccount, mdiAccountEdit, mdiAccountStar, mdiArchive, mdiBarcode, mdiBookOpenVariant, mdiCalendar, mdiCounter, mdiDisc, mdiDomain, mdiFileDocument, mdiFolderMultiple, mdiFormatTitle, mdiHelp, mdiIdentifier, mdiLibrary, mdiLink, mdiMapMarker, mdiMovieOpen, mdiNoteText, mdiNumeric1Box, mdiSourceBranch, mdiTagEdit, mdiTagMultiple, mdiTranslate } from '@mdi/js'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// Types
interface SelectedToken {
  sequenceIndex: number
  tokenIndex: number
  label: string
  token: string
}

interface LabelOption {
  value: string
  name: string
  color: string
  icon: string
}

// Props
interface Props {
  tokens: Array<Array<[string, string]>>
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:tokens': [tokens: Array<Array<[string, string]>>]
}>()

// Composables
const { t } = useI18n()

// State
const tokenSequences = ref<Array<Array<[string, string]>>>([])
const selectedToken = ref<SelectedToken | null>(null)
const hoveredToken = ref<{ sequenceIndex: number, tokenIndex: number } | null>(null)

// Available labels with colors and icons (sorted alphabetically)
const availableLabels: LabelOption[] = [
  { value: 'author', name: 'Author', color: 'blue', icon: mdiAccount },
  { value: 'citation-number', name: 'Citation Number', color: 'grey', icon: mdiCounter },
  { value: 'collection-title', name: 'Collection Title', color: 'deep-purple', icon: mdiFolderMultiple },
  { value: 'container-title', name: 'Container Title', color: 'blue-grey', icon: mdiArchive },
  { value: 'date', name: 'Date', color: 'orange', icon: mdiCalendar },
  { value: 'director', name: 'Director', color: 'red-darken-1', icon: mdiMovieOpen },
  { value: 'doi', name: 'DOI', color: 'red', icon: mdiIdentifier },
  { value: 'edition', name: 'Edition', color: 'indigo-darken-2', icon: mdiNumeric1Box },
  { value: 'editor', name: 'Editor', color: 'deep-orange', icon: mdiAccountEdit },
  { value: 'genre', name: 'Genre', color: 'purple-accent-4', icon: mdiTagMultiple },
  { value: 'isbn', name: 'ISBN', color: 'brown-darken-2', icon: mdiBarcode },
  { value: 'journal', name: 'Journal', color: 'purple', icon: mdiBookOpenVariant },
  { value: 'location', name: 'Location', color: 'pink', icon: mdiMapMarker },
  { value: 'medium', name: 'Medium', color: 'teal-accent-3', icon: mdiDisc },
  { value: 'note', name: 'Note', color: 'yellow-darken-2', icon: mdiNoteText },
  { value: 'other', name: 'Other', color: 'amber', icon: mdiHelp },
  { value: 'pages', name: 'Pages', color: 'indigo', icon: mdiFileDocument },
  { value: 'producer', name: 'Producer', color: 'green-darken-2', icon: mdiAccountStar },
  { value: 'publisher', name: 'Publisher', color: 'brown', icon: mdiDomain },
  { value: 'source', name: 'Source', color: 'cyan-darken-2', icon: mdiSourceBranch },
  { value: 'title', name: 'Title', color: 'green', icon: mdiFormatTitle },
  { value: 'translator', name: 'Translator', color: 'light-blue-darken-1', icon: mdiTranslate },
  { value: 'url', name: 'URL', color: 'cyan', icon: mdiLink },
  { value: 'volume-issue', name: 'Volume / Issue', color: 'teal', icon: mdiLibrary },
]

// Computed - removed hasChanges since we don't need save functionality

// Methods
function getLabelColor(label: string): string {
  const labelOption = availableLabels.find(l => l.value === label)
  return labelOption?.color || 'grey'
}

function getLabelDisplayName(label: string): string {
  const labelOption = availableLabels.find(l => l.value === label)
  return labelOption?.name || label
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

function changeTokenLabel(newLabel: string | null | undefined) {
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
  <v-card
    flat
    elevation="0"
  >
    <v-card-title class="d-flex align-center">
      <v-icon
        color="primary"
        class="me-2"
      >
        {{ mdiTagEdit }}
      </v-icon>
      {{ t('tokenRelabeling.title') }}
    </v-card-title>

    <v-card-text>
      <div
        v-if="tokenSequences.length === 0"
        class="text-center py-8"
      >
        <v-icon
          size="64"
          color="grey"
        >
          mdi-tag-off
        </v-icon>
        <p class="text-h6 mt-4">
          {{ t('tokenRelabeling.noTokens') }}
        </p>
      </div>

      <div v-else>
        <div
          v-for="(sequence, sequenceIndex) in tokenSequences"
          :key="sequenceIndex"
          class="token-sequence mb-6"
        >
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
            <span class="token-text">{{ token[1] }}</span>

            <v-tooltip
              activator="parent"
              location="top"
            >
              {{ getLabelDisplayName(token[0]) }}
            </v-tooltip>
          </v-chip>
        </div>

        <v-expand-transition>
          <v-card-text

            v-if="selectedToken"
          >
            <!-- Autocomplete for label selection -->
            <v-autocomplete
              :items="availableLabels"
              item-title="name"
              item-value="value"
              :model-value="selectedToken.label"
              label="Select new label"
              placeholder="Type to search labels..."
              variant="outlined"
              density="comfortable"
              auto-select-first
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
          </v-card-text>
        </v-expand-transition>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.token-chip {
  cursor: pointer;
}

.token-selected {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}
</style>
