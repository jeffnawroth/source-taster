<script setup lang="ts">
import { mdiCodeTags } from '@mdi/js'
import { useAnystyleStore } from '@/extension/stores/anystyle'

// Props
interface Props {
  inputText: string
}

const props = defineProps<Props>()

// Stores
const anystyleStore = useAnystyleStore()

// Translation
const { t } = useI18n()

// Parse input text using AnyStyle
async function handleParseClick() {
  if (!props.inputText.trim())
    return

  try {
    // Split input text into individual reference lines
    // Remove empty lines and trim whitespace
    const referenceLines = props.inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    if (referenceLines.length === 0)
      return

    await anystyleStore.parseReferences(referenceLines)
  }
  catch (error) {
    console.error('Parsing failed:', error)
  }
}
</script>

<template>
  <v-btn
    variant="tonal"
    color="secondary"
    :disabled="!inputText.trim() || anystyleStore.isParsing"
    :loading="anystyleStore.isParsing"
    block
    @click="handleParseClick"
  >
    <v-icon start>
      {{ mdiCodeTags }}
    </v-icon>
    {{ t('parse-references') }}
  </v-btn>

  <!-- Error display -->
  <v-alert
    v-if="anystyleStore.parseError"
    type="error"
    variant="tonal"
    closable
    class="mt-2"
    @click:close="anystyleStore.clearParseResults()"
  >
    {{ anystyleStore.parseError }}
  </v-alert>
</template>
