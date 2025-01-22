<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { requestsMadeThisMinute, requestsMadeToday, tokensUsedThisMintue } from '~/logic'
import { useAiStore } from '~/stores/ai'
import AIUsageListItem from './AIUsageListItem.vue'

defineProps<{
  disabled?: boolean
}>()

// I18n
const { t } = useI18n({ useScope: 'global' })

// AI Store
const aiStore = useAiStore()
const { MAX_REQUESTS_PER_MINUTE, MAX_REQUEST_PER_DAY, MAX_TOKENS_PER_MINUTE } = storeToRefs(aiStore)

// Data
const secondsUntilReset = ref(0)
const hoursUntilReset = ref(0)

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

// Methods
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
