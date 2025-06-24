<script setup lang="ts">
import { mdiMagnify } from '@mdi/js'
import { useAppStore } from '@/extension/stores/app'
import { useReferencesStore } from '@/extension/stores/references'

const referencesStore = useReferencesStore()

// DISABLE BUTTON IF NO TEXT AND FILE OR LOADING
const { inputText, isProcessing } = storeToRefs(referencesStore)
const { file } = storeToRefs(useAppStore())
const disabled = computed(() => (!inputText.value.trim() && !file.value) || isProcessing.value)

// HANDLE CLICK
const { extractAndVerifyReferences } = referencesStore
async function handleClick() {
  if (!disabled.value) {
    try {
      await extractAndVerifyReferences()
    }
    catch (error) {
      console.error('Error processing references:', error)
    }
  }
}
</script>

<template>
  <v-btn
    variant="tonal"
    color="primary"
    :text="$t('check-references')"
    block
    :prepend-icon="mdiMagnify"
    :disabled
    @click="handleClick"
  />
</template>
