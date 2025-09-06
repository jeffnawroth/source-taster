<script setup lang="ts">
import { mdiAccount, mdiBookOpenVariant, mdiFormatTitle, mdiTagEdit } from '@mdi/js'
import { computed, ref, watch } from 'vue'
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
  'save': [tokens: Array<Array<[string, string]>>]
}>()

// Composables
const { t } = useI18n()

// State
const tokenSequences = ref<Array<Array<[string, string]>>>([])
const originalTokens = ref<Array<Array<[string, string]>>>([])
const selectedToken = ref<SelectedToken | null>(null)

// Available labels with colors and icons
const availableLabels: LabelOption[] = [
  { value: 'author', name: 'Author', color: 'blue', icon: mdiAccount },
  { value: 'title', name: 'Title', color: 'green', icon: mdiFormatTitle },
  { value: 'journal', name: 'Journal', color: 'purple', icon: mdiBookOpenVariant },
  { value: 'date', name: 'Date', color: 'orange', icon: 'mdi-calendar' },
  { value: 'volume', name: 'Volume', color: 'teal', icon: 'mdi-library' },
  { value: 'pages', name: 'Pages', color: 'indigo', icon: 'mdi-file-document' },
  { value: 'doi', name: 'DOI', color: 'red', icon: 'mdi-identifier' },
  { value: 'url', name: 'URL', color: 'cyan', icon: 'mdi-link' },
  { value: 'issue', name: 'Issue', color: 'lime', icon: 'mdi-numeric' },
  { value: 'publisher', name: 'Publisher', color: 'brown', icon: 'mdi-domain' },
  { value: 'location', name: 'Location', color: 'pink', icon: 'mdi-map-marker' },
  { value: 'citation-number', name: 'Citation Number', color: 'grey', icon: 'mdi-counter' },
  { value: 'editor', name: 'Editor', color: 'deep-orange', icon: 'mdi-account-edit' },
  { value: 'other', name: 'Other', color: 'amber', icon: 'mdi-help' },
]

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(tokenSequences.value) !== JSON.stringify(originalTokens.value)
})

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

function deleteToken() {
  if (!selectedToken.value)
    return

  const { sequenceIndex, tokenIndex } = selectedToken.value
  const sequence = tokenSequences.value[sequenceIndex]
  if (sequence) {
    sequence.splice(tokenIndex, 1)
    emit('update:tokens', tokenSequences.value)
  }
  selectedToken.value = null
}

function saveChanges() {
  emit('save', tokenSequences.value)
}

// Watch for prop changes
watch(() => props.tokens, (newTokens) => {
  tokenSequences.value = JSON.parse(JSON.stringify(newTokens))
  originalTokens.value = JSON.parse(JSON.stringify(newTokens))
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
      <v-spacer />
      <v-btn
        variant="outlined"
        color="success"
        size="small"
        :disabled="!hasChanges"
        @click="saveChanges"
      >
        <v-icon start>
          mdi-content-save
        </v-icon>
        {{ t('tokenRelabeling.save') }}
      </v-btn>
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
            @click="selectToken(sequenceIndex, tokenIndex)"
          >
            <span class="token-text">{{ token[1] }}</span>
            <v-tooltip
              activator="parent"
              location="top"
            >
              <div>
                <strong>{{ t('tokenRelabeling.currentLabel') }}:</strong> {{ getLabelDisplayName(token[0]) }}<br>
                <strong>{{ t('tokenRelabeling.token') }}:</strong> {{ token[1] }}
              </div>
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
              clearable
              @update:model-value="changeTokenLabel"
            >
              <template #selection="{ item }">
                <v-chip
                  :color="item.raw.color"
                  size="small"
                >
                  <v-icon
                    start
                    size="small"
                  >
                    {{ item.raw.icon }}
                  </v-icon>
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
                  <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                </v-list-item>
              </template>
            </v-autocomplete>

            <div class="d-flex gap-2">
              <v-btn
                color="error"
                variant="outlined"
                @click="deleteToken"
              >
                <v-icon start>
                  mdi-delete
                </v-icon>
                {{ t('tokenRelabeling.deleteToken') }}
              </v-btn>
            </div>
          </v-card-text>
        </v-expand-transition>
      </div>
    </v-card-text>
  </v-card>
</template>
