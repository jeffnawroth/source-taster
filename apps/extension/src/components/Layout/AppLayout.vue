<script setup lang="ts">
import { useLocale } from 'vuetify'
import { VDivider } from 'vuetify/lib/components/index.mjs'
import OnboardingLayout from '@/extension/components/Onboarding/OnboardingLayout.vue'
import ReportSection from '@/extension/components/Report/ReportSection.vue'
import { aiSettings, hasCompletedOnboarding, localeOption } from '@/extension/logic/storage'
import InputCard from '../Input/InputCard.vue'

// LOCALE
const { locale } = useI18n()
const { current } = useLocale()

watchEffect(() => {
  locale.value = localeOption.value
  current.value = localeOption.value
})

// Check if onboarding should be shown
const shouldShowOnboarding = computed(() => {
  return !hasCompletedOnboarding.value || !aiSettings.value.apiKey.trim()
})

watchEffect(() => {
  locale.value = localeOption.value
  current.value = localeOption.value
})

// COMPONENTS
const components = [
  InputCard,
  VDivider,
  ReportSection,
]
</script>

<template>
  <!-- Show onboarding if not completed or no API key -->
  <OnboardingLayout v-if="shouldShowOnboarding" />

  <!-- Show main app if onboarding is completed -->
  <v-card
    v-else
    flat
  >
    <v-card-text>
      <v-row>
        <v-col
          v-for="component in components"
          :key="component.name"
          cols="12"
        >
          <component :is="component" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
