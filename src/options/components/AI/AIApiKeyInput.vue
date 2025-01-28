<script setup lang="ts">
import { mdiKey } from '@mdi/js'
import { useDebounceFn } from '@vueuse/core'
import { geminiApiKey, isGeminiApiKeyValid } from '~/logic'
import { useAiStore } from '~/stores/ai'

// I18n
const { t } = useI18n()

// AI Store
const aiStore = useAiStore()
const { loading } = storeToRefs(aiStore)
const { testApiKey } = aiStore

// Data
const show = ref(false)

const apiKeyStatusIcon = ref(false)

// Watchers
watch(isGeminiApiKeyValid, (newVal) => {
  if (newVal === null)
    return

  showApiKeyStatusIcon()
})

const handleTextInput = useDebounceFn(async () => {
  await testApiKey()
}, 500)

watch(geminiApiKey, (newVal) => {
  if (!newVal || newVal.trim().length === 0) {
    isGeminiApiKeyValid.value = null
  }
  else {
    handleTextInput()
  }
})

// Methods
function showApiKeyStatusIcon() {
  apiKeyStatusIcon.value = true

  setTimeout(() => {
    apiKeyStatusIcon.value = false
  }, 2000)
}

// Computed
const type = computed(() => show.value ? 'text' : 'password')
</script>

<template>
  <v-text-field
    v-model="geminiApiKey"
    variant="solo-filled"
    placeholder="GEMINI_API_KEY"
    flat
    :prepend-inner-icon="mdiKey"
    :messages="t('api-key-texfield-message')"
    :type
    clearable
    @click:prepend-inner="show = !show"
  >
    <template #message="{ message }">
      {{ message }}  <a
        class="text-decoration-none"
        href="https://aistudio.google.com/app/apikey"
      >{{ t('create-one-here') }}</a>.
    </template>

    <template #append-inner>
      <v-progress-circular
        v-if="loading"
        indeterminate
        size="24"
      />

      <v-tooltip>
        <template #activator="{ props }">
          <v-icon
            v-show="apiKeyStatusIcon"
            v-bind="props"
            :icon="isGeminiApiKeyValid ? '$success' : ' $error'"
            :color=" isGeminiApiKeyValid ? 'success' : 'error'"
          />
        </template>
        {{ isGeminiApiKeyValid ? t('api-key-valid') : t('api-key-invalid') }}
      </v-tooltip>
    </template>
  </v-text-field>
</template>
