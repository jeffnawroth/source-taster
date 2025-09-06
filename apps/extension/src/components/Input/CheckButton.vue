<script setup lang="ts">
import { mdiBrain, mdiMagnify } from '@mdi/js'
import { useReferencesStore } from '@/extension/stores/references'
import { AnystyleService } from '../../services/anystyleService'

const referencesStore = useReferencesStore()

// DISABLE BUTTON IF NO TEXT AND FILE OR LOADING
const { inputText, isExtraction, file, parsedTokens, showTokenEditor } = storeToRefs(referencesStore)
const disabled = computed(() => (!inputText.value.trim() && !file.value) || isExtraction.value)

// Parse button state
const parseLoading = ref(false)
const parseError = ref('')

// HANDLE CLICK
const { extractAndMatchReferences } = referencesStore
async function handleClick() {
  if (!disabled.value) {
    try {
      await extractAndMatchReferences()
    }
    catch (error) {
      console.error('Error extraction references:', error)
    }
  }
}

// Handle parse click
async function handleParseClick() {
  if (!inputText.value.trim())
    return

  parseLoading.value = true
  parseError.value = ''

  try {
    // Parse input text into references array
    const references = AnystyleService.parseInputText(inputText.value)

    // Call AnyStyle service to parse references
    const result = await AnystyleService.parseReferences(references)

    // Set parsed data in store
    parsedTokens.value = result.data?.tokens || []
    showTokenEditor.value = true

    console.warn('Parsed tokens set in store:', result.data?.tokens?.length, 'sequences')
  }
  catch (err) {
    parseError.value = err instanceof Error ? err.message : String(err)
    console.error('Parsing error:', err)
  }
  finally {
    parseLoading.value = false
  }
}
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <!-- Check References Button -->
    <v-tooltip
      :text="$t('check-references-shortcut')"
      location="bottom"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          variant="tonal"
          color="primary"
          :text="$t('check-references')"
          block
          :prepend-icon="mdiMagnify"
          :disabled
          @click="handleClick"
        />
      </template>
    </v-tooltip>

    <!-- Parse with AnyStyle Button -->
    <v-btn
      variant="outlined"
      color="secondary"
      :text="$t('trainingData.parseButton')"
      block
      :prepend-icon="mdiBrain"
      :disabled="!inputText.trim() || parseLoading"
      :loading="parseLoading"
      @click="handleParseClick"
    />

    <!-- Parse Error Display -->
    <v-alert
      v-if="parseError"
      type="error"
      variant="tonal"
      closable
      density="compact"
      @click:close="parseError = ''"
    >
      {{ parseError }}
    </v-alert>
  </div>
</template>
