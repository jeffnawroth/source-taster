<script setup lang="ts">
import { mdiCodeTags } from '@mdi/js'
import { useMagicKeys } from '@vueuse/core'
import { useAnystyleStore } from '@/extension/stores/anystyle'
import { useUIStore } from '@/extension/stores/ui'

const anystyle = useAnystyleStore()
const ui = useUIStore()
const { inputText } = storeToRefs(ui)

const { t } = useI18n()

function linesFromInput(text: string): string[] {
  return text
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
}

async function handleParseClick() {
  anystyle.clearParseResults()

  const refs = linesFromInput(inputText.value)
  if (refs.length === 0)
    return

  await anystyle.parseReferences(refs)
}

const isDisabled = computed(
  () => !inputText.value.trim() || anystyle.isParsing,
)

// Keyboard Shortcuts: Cmd/Ctrl + Enter
const keys = useMagicKeys()
watch([keys['Cmd+Enter'], keys['Ctrl+Enter']], ([cmd, ctrl]) => {
  if ((cmd || ctrl) && !isDisabled.value)
    handleParseClick()
})
</script>

<template>
  <v-btn
    variant="tonal"
    color="primary"
    :disabled="isDisabled"
    block
    @click="handleParseClick"
  >
    <template #prepend>
      <v-progress-circular
        v-if="anystyle.isParsing"
        size="20"
        width="2"
        indeterminate
      />
      <v-icon
        v-else
        :icon="mdiCodeTags"
      />
    </template>
    {{ anystyle.isParsing ? `${t('parsing')}...` : t('parse-references') }}
  </v-btn>
</template>
