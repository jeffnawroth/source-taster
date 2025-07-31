<script setup lang="ts">
import { mdiCheckboxMarkedCircleOutline } from '@mdi/js'
import { ReferencesService } from '@/extension/services/referencesService'

const props = defineProps<{
  apiKey: string
  apiKeyError: string | null
}>()

const { t } = useI18n()

const modelValue = defineModel<{ success: boolean, message: string } | null>({ required: true })
const isTestingApiKey = ref(false)

// Test API key function
async function testApiKey() {
  if (!props.apiKey || props.apiKeyError) {
    return
  }

  isTestingApiKey.value = true
  modelValue.value = null

  try {
    // Use the ReferencesService to test the API key with a simple extraction
    const testText = 'Test citation: Smith, J. (2024). A test paper. Journal of Testing, 1(1), 1-5.'
    const references = await ReferencesService.extractReferences(testText)

    if (references && references.length > 0) {
      modelValue.value = {
        success: true,
        message: t('api-key-test-success'),
      }
    }
    else {
      modelValue.value = {
        success: false,
        message: t('api-key-test-failed'),
      }
    }
  }
  catch (error) {
    modelValue.value = {
      success: false,
      message: error instanceof Error ? error.message : t('api-key-test-error'),
    }
  }
  finally {
    isTestingApiKey.value = false
  }
}
</script>

<template>
  <v-btn
    :disabled="!apiKey || !!apiKeyError"
    variant="tonal"
    color="primary"
    class="mb-3"
    @click="testApiKey"
  >
    <template #prepend>
      <v-progress-circular
        v-if="isTestingApiKey"
        size="20"
        width="2"
        indeterminate
      />
      <v-icon
        v-else
        :icon="mdiCheckboxMarkedCircleOutline"
      />
    </template>
    {{ t('test-api-key') }}
  </v-btn>
</template>
