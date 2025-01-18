<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { requestsMadeThisMinute, requestsMadeToday, tokensUsedThisMintue } from '~/logic'
import { useAiStore } from '~/stores/ai'

const { t } = useI18n()

const aiStore = useAiStore()
const { MAX_REQUESTS_PER_MINUTE, MAX_REQUEST_PER_DAY, MAX_TOKENS_PER_MINUTE } = storeToRefs(aiStore)

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
</script>

<template>
  <v-list-item :title="t('usage')" />

  <v-list-item
    :title="t('requests-per-day')"
  >
    <template #subtitle>
      <p>{{ t('requests-per-day-description') }}</p>
    </template>
    <p> {{ `${t('resets-in')} ${hoursUntilReset}` }}h </p>

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
    :title="t('requests-per-minute')"
  >
    <template #subtitle>
      <p>{{ t('requests-per-minute-description') }}</p>
    </template>
    <p> {{ `${t('resets-in')} ${secondsUntilReset}` }}s </p>

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
    :title="t('tokens-per-minute')"
  >
    <template #subtitle>
      <p>{{ t('tokens-per-minute-description') }}</p>
    </template>
    <p>
      {{ `${t('resets-in')} ${secondsUntilReset}` }}s
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
</template>
