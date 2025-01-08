<script setup lang="ts">
import { mdiInformationOutline, mdiKey, mdiStarFourPointsOutline } from '@mdi/js'
import { useDebounceFn, useIntervalFn } from '@vueuse/core'
import { aiExtractionOption, geminiApiKey, requestsMadeThisMinute, requestsMadeToday, tokensUsedThisMintue } from '~/logic'
import { useAiStore } from '~/stores/ai'

// i18n
const { t } = useI18n()

const aiStore = useAiStore()
const { apiKeyValid, loading, MAX_REQUESTS_PER_MINUTE, MAX_REQUEST_PER_DAY, MAX_TOKENS_PER_MINUTE } = storeToRefs(useAiStore())
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

const secondsUntilReset = ref(0)
const hoursUntilReset = ref(0)

useIntervalFn(() => {
  const now = new Date()
  secondsUntilReset.value = 60 - now.getSeconds()
  if (secondsUntilReset.value === 60) {
    requestsMadeThisMinute.value = 0
    tokensUsedThisMintue.value = 0
  }
}, 1000)

useIntervalFn(() => {
  const now = new Date()
  hoursUntilReset.value = 24 - now.getHours()
  if (hoursUntilReset.value === 24) {
    requestsMadeToday.value = 0
  }
}, 1000)

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
    :subheader="t('advanced')"
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
    <v-list-item title="Usage" />

    <v-list-item
      title="Request Per Day"
    >
      <template #subtitle>
        <p>This is the daily limit of AI requests</p>
      </template>
      <p>Resets in {{ hoursUntilReset }}h </p>

      <template #append>
        <v-chip
          color="primary"
          label
        >
          {{ `${requestsMadeToday}/${MAX_REQUEST_PER_DAY}` }}
        </v-chip>
      </template>
    </v-list-item>
    <v-list-item
      title="Request Per Minute"
    >
      <template #subtitle>
        <p>This is the minute limit of AI requests</p>
      </template>
      <p>Resets in {{ secondsUntilReset }}s </p>

      <template #append>
        <v-chip
          color="primary"
          label
        >
          {{ `${requestsMadeThisMinute}/${MAX_REQUESTS_PER_MINUTE}` }}
        </v-chip>
      </template>
    </v-list-item>
    <v-list-item
      title="Tokens Per Minute"
    >
      <template #subtitle>
        <p>This is the minute limit of AI tokens</p>
      </template>
      <p>
        Resets in {{ secondsUntilReset }}s
      </p>
      <template #append>
        <v-chip
          color="primary"
          label
        >
          {{ `${tokensUsedThisMintue}/${MAX_TOKENS_PER_MINUTE}` }}
        </v-chip>
      </template>
    </v-list-item>
  </OptionCategory>
</template>
