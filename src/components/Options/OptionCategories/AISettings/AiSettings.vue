<script setup lang="ts">
import { mdiInformationOutline, mdiKey, mdiStarFourPointsOutline } from '@mdi/js'
import { useDebounceFn } from '@vueuse/core'
import { aiExtractionOption, geminiApiKey } from '~/logic'
import { useAiStore } from '~/stores/ai'
import AIUsageList from './AIUsageList.vue'

// i18n
const { t } = useI18n()

const aiStore = useAiStore()
const { apiKeyValid, loading } = storeToRefs(useAiStore())
const { testApiKey } = aiStore

const show = ref(false)

const apiKeyStatusIcon = ref(false)

const handleTextInput = useDebounceFn(async () => {
  await testApiKey()
}, 500)

watch(geminiApiKey, (newVal) => {
  if (newVal.trim().length === 0) {
    apiKeyValid.value = null
  }
  else {
    handleTextInput()
  }
})

watch(apiKeyValid, (newVal) => {
  if (newVal === null)
    return

  showApiKeyStatusIcon()
})

function showApiKeyStatusIcon() {
  apiKeyStatusIcon.value = true

  setTimeout(() => {
    apiKeyStatusIcon.value = false
    apiKeyValid.value = null
  }, 2000)
}
</script>

<template>
  <OptionCategory
    :subheader="t('ai')"
  >
    <OptionListItem
      :disabled="!geminiApiKey"
      :title="t('ai-extraction')"
      :prepend-icon="mdiStarFourPointsOutline"
      @click="aiExtractionOption = !aiExtractionOption"
    >
      <template #subtitle>
        <p>{{ t('ai-extraction-description') }}</p>
        <p class="text-medium-emphasis mt-2">
          <v-icon
            :icon="mdiInformationOutline"
            size="small"
          />
          {{ t('ai-extraction-description-info') }}
          <a
            class="text-decoration-none"
            href="https://ai.google.dev/"
          >
            {{ t('learn-more') }}
          </a>
        </p>
      </template>

      <OptionSwitch
        v-model="aiExtractionOption"
        :disabled="!geminiApiKey"
      />
    </OptionListItem>
    <v-list-item>
      <v-form>
        <v-text-field
          v-model="geminiApiKey"
          variant="solo-filled"
          placeholder="GEMINI_API_KEY"
          flat
          :prepend-inner-icon="mdiKey"
          :messages="t('api-key-texfield-message')"
          :type="show ? 'text' : 'password'"
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
                  :icon="apiKeyValid ? '$success' : ' $error'"
                  :color=" apiKeyValid ? 'success' : 'error'"
                />
              </template>
              {{ apiKeyValid ? t('api-key-valid') : t('api-key-invalid') }}
            </v-tooltip>
          </template>
        </v-text-field>
      </v-form>
    </v-list-item>
    <v-divider />

    <AIUsageList />
  </OptionCategory>
</template>
