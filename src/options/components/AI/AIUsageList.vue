<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { requestsMadeThisMinute, requestsMadeToday, tokensUsedThisMintue } from '~/logic'
import { useAiStore } from '~/stores/ai'
import AIUsageListItem from './AIUsageListItem.vue'

// PROPS
defineProps<{
  disabled?: boolean
}>()

// TRANSLATIONS
const { t } = useI18n({ useScope: 'global' })

// RESET REQUESTS MADE AND TOKENS USED THIS MINUTE
const secondsUntilReset = ref(0)

useIntervalFn(() => {
  const now = new Date()
  secondsUntilReset.value = 60 - now.getSeconds()
  if (now.getSeconds() === 0) {
    requestsMadeThisMinute.value = 0
    tokensUsedThisMintue.value = 0
  }
}, 1000)

// RESET REQUESTS MADE TODAY
const hoursUntilReset = ref(0)

function getPSTMidnightOffset() {
  const now = new Date()
  const pstNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const midnightPST = new Date(pstNow)
  midnightPST.setHours(24, 0, 0, 0)
  return (midnightPST.getTime() - pstNow.getTime()) / 1000
}

useIntervalFn(() => {
  const secondsUntilReset = getPSTMidnightOffset()
  hoursUntilReset.value = Math.ceil(secondsUntilReset / 3600)

  if (secondsUntilReset <= 0) {
    requestsMadeToday.value = 0
  }
}, 1000)

// AI USAGE LIST ITEMS

const { MAX_REQUESTS_PER_MINUTE, MAX_REQUEST_PER_DAY, MAX_TOKENS_PER_MINUTE } = storeToRefs(useAiStore())

const aiUsageListItems = ref([
  {
    title: computed(() => t('requests-per-day')),
    subtitle: computed(() => t('requests-per-day-description')),
    resetInterval: hoursUntilReset,
    intervalUnit: 'hr' as 'hr' | 'sec' | 'min',
    maxCount: MAX_REQUEST_PER_DAY,
    count: requestsMadeToday,
  },
  {
    title: computed(() => t('requests-per-minute')),
    subtitle: computed(() => t('requests-per-minute-description')),
    resetInterval: secondsUntilReset,
    intervalUnit: 'sec' as 'hr' | 'sec' | 'min',
    maxCount: MAX_REQUESTS_PER_MINUTE,
    count: requestsMadeThisMinute,
  },
  {
    title: computed(() => t('tokens-per-minute')),
    subtitle: computed(() => t('tokens-per-minute-description')),
    resetInterval: secondsUntilReset,
    intervalUnit: 'sec' as 'hr' | 'sec' | 'min',
    maxCount: MAX_TOKENS_PER_MINUTE,
    count: tokensUsedThisMintue,
  },
])
</script>

<template>
  <v-list-item
    :disabled
    :title="t('usage')"
  />

  <AIUsageListItem
    v-for="item in aiUsageListItems"
    :key="item.title"
    :disabled
    v-bind="item"
  />
</template>
