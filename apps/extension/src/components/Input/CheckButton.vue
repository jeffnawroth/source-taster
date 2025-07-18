<script setup lang="ts">
import { mdiMagnify } from '@mdi/js'
import { useReferencesStore } from '@/extension/stores/references'

const referencesStore = useReferencesStore()

// DISABLE BUTTON IF NO TEXT AND FILE OR LOADING
const { inputText, isProcessing, file } = storeToRefs(referencesStore)
const disabled = computed(() => (!inputText.value.trim() && !file.value) || isProcessing.value)

// HANDLE CLICK
const { extractAndMatchReferences } = referencesStore
async function handleClick() {
  if (!disabled.value) {
    try {
      await extractAndMatchReferences()
    }
    catch (error) {
      console.error('Error processing references:', error)
    }
  }
}
</script>

<template>
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
</template>
