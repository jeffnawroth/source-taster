<script setup lang="ts">
import { useLocale } from 'vuetify'
import { VDivider } from 'vuetify/lib/components/index.mjs'
import OnboardingLayout from '@/extension/components/Onboarding/OnboardingLayout.vue'
import TokenEditor from '@/extension/components/References/TokenEditor.vue'
import ReportSection from '@/extension/components/Report/ReportSection.vue'
import { hasCompletedOnboarding, settings } from '@/extension/logic/storage'
import InputCard from '../Input/InputCard.vue'

// LOCALE
const { locale } = useI18n()
const { current } = useLocale()

watchEffect(() => {
  locale.value = settings.value.locale
  current.value = settings.value.locale
})

// Check if onboarding should be shown - now optional since AnyStyle parsing is available
const shouldShowOnboarding = computed(() => {
  return !hasCompletedOnboarding.value
})

// COMPONENTS
// const components = [
//   InputCard,
//   VDivider,
//   TokenEditor,
//   VDivider,
//   ReportSection,
// ]
</script>

<template>
  <!-- Show onboarding if not completed -->
  <OnboardingLayout v-if="shouldShowOnboarding" />

  <!-- Show main app if onboarding is completed -->
  <v-card
    v-else
    flat
    density="compact"
    class="d-flex flex-column flex-1 min-h-0 overflow-hidden"
  >
    <v-card-text class="d-flex flex-column flex-1 min-h-0">
      <div class="d-flex flex-column gap-3 flex-0">
        <InputCard />
        <VDivider />
        <TokenEditor />
        <VDivider />
      </div>

      <!-- Report gets the remaining height -->
      <div class="d-flex flex-column flex-1 min-h-0">
        <ReportSection />
      </div>
    </v-card-text>
  </v-card>
</template>
