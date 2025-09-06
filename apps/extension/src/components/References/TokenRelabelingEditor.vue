<script setup lang="ts">
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
  { value: 'author', name: 'Author', color: 'blue', icon: 'mdi-account' },
  { value: 'title', name: 'Title', color: 'green', icon: 'mdi-format-title' },
  { value: 'journal', name: 'Journal', color: 'purple', icon: 'mdi-book-open-variant' },
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
const totalTokens = computed(() => {
  return tokenSequences.value.reduce((total, sequence) => total + sequence.length, 0)
})

const hasChanges = computed(() => {
  return JSON.stringify(tokenSequences.value) !== JSON.stringify(originalTokens.value)
})

const changesCount = computed(() => {
  let count = 0
  for (let i = 0; i < tokenSequences.value.length; i++) {
    const current = tokenSequences.value[i]
    const original = originalTokens.value[i]
    if (!original)
      continue

    for (let j = 0; j < current.length; j++) {
      if (!original[j] || current[j][0] !== original[j][0] || current[j][1] !== original[j][1]) {
        count++
      }
    }
  }
  return count
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

function changeTokenLabel(newLabel: string) {
  if (!selectedToken.value)
    return

  const { sequenceIndex, tokenIndex } = selectedToken.value
  const sequence = tokenSequences.value[sequenceIndex]
  if (sequence && sequence[tokenIndex]) {
    sequence[tokenIndex] = [newLabel, sequence[tokenIndex][1]]
    emit('update:tokens', tokenSequences.value)
  }
  selectedToken.value = null
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

function resetChanges() {
  tokenSequences.value = JSON.parse(JSON.stringify(originalTokens.value))
  selectedToken.value = null
  emit('update:tokens', tokenSequences.value)
}

// Watch for prop changes
watch(() => props.tokens, (newTokens) => {
  tokenSequences.value = JSON.parse(JSON.stringify(newTokens))
  originalTokens.value = JSON.parse(JSON.stringify(newTokens))
  selectedToken.value = null
}, { immediate: true, deep: true })
</script>

<template>
  <v-card class="token-relabeling-editor">
    <v-card-title class="d-flex align-center">
      <v-icon
        color="primary"
        class="me-2"
      >
        mdi-tag-edit
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

        <!-- Label Selection Panel -->
        <v-expand-transition>
          <v-card
            v-if="selectedToken"
            variant="outlined"
            class="mt-4 label-selector"
          >
            <v-card-title class="text-h6">
              <v-icon start>
                mdi-tag
              </v-icon>
              {{ t('tokenRelabeling.changeLabelFor') }}: "{{ selectedToken.token }}"
            </v-card-title>
            <v-card-text>
              <div class="label-buttons">
                <v-btn
                  v-for="label in availableLabels"
                  :key="label.value"
                  :color="label.color"
                  :variant="selectedToken.label === label.value ? 'elevated' : 'outlined'"
                  class="ma-1"
                  @click="changeTokenLabel(label.value)"
                >
                  <v-icon start>
                    {{ label.icon }}
                  </v-icon>
                  {{ label.name }}
                </v-btn>
              </div>

              <v-divider class="my-4" />

              <div class="d-flex gap-2">
                <v-btn
                  variant="text"
                  @click="selectedToken = null"
                >
                  {{ t('common.cancel') }}
                </v-btn>
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
          </v-card>
        </v-expand-transition>

        <!-- Statistics -->
        <v-card
          variant="outlined"
          class="mt-4"
        >
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <v-chip
                  color="info"
                  variant="outlined"
                >
                  {{ t('tokenRelabeling.totalTokens') }}: {{ totalTokens }}
                </v-chip>
                <v-chip
                  color="warning"
                  variant="outlined"
                  class="ml-2"
                >
                  {{ t('tokenRelabeling.changesCount') }}: {{ changesCount }}
                </v-chip>
              </div>
              <v-btn
                v-if="hasChanges"
                color="orange"
                variant="outlined"
                @click="resetChanges"
              >
                <v-icon start>
                  mdi-undo
                </v-icon>
                {{ t('tokenRelabeling.reset') }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.token-chip {
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Courier New', monospace;
}

.token-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.token-selected {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.token-text {
  font-weight: 500;
}

.token-sequence {
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
  min-height: 60px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.label-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.label-selector {
  border: 2px solid var(--v-theme-primary);
}
</style>
