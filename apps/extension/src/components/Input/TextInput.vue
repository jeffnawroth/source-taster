<script setup lang="ts">
import { mdiText } from '@mdi/js'
import { useDebounceFn } from '@vueuse/core'
import { onMessage } from 'webext-bridge/popup'
import { useAutoCheckReferences, useAutoImport } from '@/extension/logic'
import { useAppStore } from '@/extension/stores/app'
import { useReferencesStore } from '@/extension/stores/references'

// TRANSLATION
const { t } = useI18n()

// REFERENCES STORE
const referencesStore = useReferencesStore()
const { inputText } = storeToRefs(referencesStore)

// TEXTAREA PLACEHOLDER
const placeholder = computed(() => useAutoImport.value ? t('reload-page-auto-import') : t('insert-references'))

// AUTO CHECK REFERENCES
const { extractAndVerifyReferences } = referencesStore
const handleTextChange = useDebounceFn(async (newVal: string) => {
  if (useAutoCheckReferences.value && newVal.trim()) {
    inputText.value = newVal
    await extractAndVerifyReferences()
  }
}, 1000)

// SYNC TEXT
const currentText = ref('')

watch(currentText, async (newVal) => {
  if (newVal !== inputText.value) {
    inputText.value = newVal
  }
})

onMessage('selectedText', async ({ data }) => {
  currentText.value = data.text
  await handleTextChange(data.text)
})

// SET AUTO IMPORTED TEXT
onMessage('autoImportText', async ({ data }) => {
  if (!useAutoImport.value)
    return

  currentText.value = data.text
  await handleTextChange(data.text)
})

// CLEAR HANDLER
const { clearReferences } = referencesStore
function handleClear() {
  clearReferences()
  currentText.value = ''
}

// DISABLED STATE
const { isProcessing } = storeToRefs(referencesStore)
const { file } = storeToRefs(useAppStore())
const disabled = computed(() => !!file.value || isProcessing.value)
</script>

<template>
  <v-textarea
    v-model.trim="currentText"
    :prepend-inner-icon="mdiText"
    :placeholder
    hide-details="auto"
    rows="2"
    variant="solo-filled"
    clearable
    flat
    :disabled
    :messages="disabled ? [t('remove-file-to-enable-text-input')] : []"
    @click:clear="handleClear"
    @update:model-value="handleTextChange($event)"
  />
</template>
