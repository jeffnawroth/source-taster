<script setup lang="ts">
import { mdiCheckCircle, mdiKeyOutline, mdiRocketLaunchOutline } from '@mdi/js'
import { aiSettings, hasCompletedOnboarding } from '@/extension/logic/storage'

const { t } = useI18n()

const currentStep = ref(1)
const totalSteps = 3

const steps = computed(() => [
  {
    number: 1,
    icon: mdiRocketLaunchOutline,
    title: t('onboarding.welcome.title'),
    description: t('onboarding.welcome.description'),
  },
  {
    number: 2,
    icon: mdiKeyOutline,
    title: t('onboarding.apiKey.title'),
    description: t('onboarding.apiKey.description'),
  },
  {
    number: 3,
    icon: mdiCheckCircle,
    title: t('onboarding.ready.title'),
    description: t('onboarding.ready.description'),
  },
])

const canProceed = computed(() => {
  if (currentStep.value === 2) {
    return aiSettings.value.apiKey.trim().length > 0
  }
  return true
})

function nextStep() {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function completeOnboarding() {
  hasCompletedOnboarding.value = true
}

const apiKeyRules = [
  (v: string) => !!v || t('onboarding.apiKey.validation.required'),
  (v: string) => v.length > 10 || t('onboarding.apiKey.validation.minLength'),
]
</script>

<template>
  <v-card
    class="mx-auto"
    max-width="500"
    elevation="8"
  >
    <!-- Header -->
    <v-card-title class="text-center pa-6">
      <v-icon
        :icon="steps[currentStep - 1].icon"
        size="48"
        color="primary"
        class="mb-4"
      />
      <h2 class="text-h5">
        {{ steps[currentStep - 1].title }}
      </h2>
    </v-card-title>

    <!-- Progress -->
    <v-card-subtitle class="text-center pb-0">
      <v-progress-linear
        :model-value="(currentStep / totalSteps) * 100"
        color="primary"
        height="4"
        rounded
        class="mb-4"
      />
      <p class="text-caption">
        {{ t('onboarding.progress', { current: currentStep, total: totalSteps }) }}
      </p>
    </v-card-subtitle>

    <!-- Content -->
    <v-card-text class="pa-6">
      <p class="text-body-1 mb-6">
        {{ steps[currentStep - 1].description }}
      </p>

      <!-- Step 1: Welcome -->
      <div v-if="currentStep === 1">
        <v-list class="bg-transparent">
          <v-list-item>
            <template #prepend>
              <v-icon
                icon="mdi-check-circle"
                color="success"
                size="small"
              />
            </template>
            <v-list-item-title>{{ t('onboarding.features.extraction') }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <template #prepend>
              <v-icon
                icon="mdi-check-circle"
                color="success"
                size="small"
              />
            </template>
            <v-list-item-title>{{ t('onboarding.features.matching') }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <template #prepend>
              <v-icon
                icon="mdi-check-circle"
                color="success"
                size="small"
              />
            </template>
            <v-list-item-title>{{ t('onboarding.features.validation') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <!-- Step 2: API Key Setup -->
      <div v-if="currentStep === 2">
        <v-alert
          type="info"
          variant="tonal"
          class="mb-4"
        >
          <v-icon icon="mdi-information" />
          {{ t('onboarding.apiKey.info') }}
        </v-alert>

        <v-select
          v-model="aiSettings.provider"
          :items="[
            { value: 'openai', title: 'OpenAI' },
            { value: 'anthropic', title: 'Anthropic (Claude)' },
            { value: 'google', title: 'Google AI' },
            { value: 'deepseek', title: 'DeepSeek' },
          ]"
          :label="t('settings.ai.provider')"
          variant="outlined"
          class="mb-4"
        />

        <v-text-field
          v-model="aiSettings.apiKey"
          :label="t('settings.ai.apiKey')"
          :rules="apiKeyRules"
          type="password"
          variant="outlined"
          :hint="t('onboarding.apiKey.hint')"
          persistent-hint
        />

        <v-btn
          :href="t('onboarding.apiKey.learnMoreUrl')"
          target="_blank"
          variant="text"
          size="small"
          class="mt-2"
        >
          <v-icon start>
            mdi-open-in-new
          </v-icon>
          {{ t('onboarding.apiKey.learnMore') }}
        </v-btn>
      </div>

      <!-- Step 3: Ready -->
      <div v-if="currentStep === 3">
        <v-alert
          type="success"
          variant="tonal"
          class="mb-4"
        >
          <v-icon icon="mdi-check-circle" />
          {{ t('onboarding.ready.success') }}
        </v-alert>

        <p class="text-body-2">
          {{ t('onboarding.ready.nextSteps') }}
        </p>
      </div>
    </v-card-text>

    <!-- Actions -->
    <v-card-actions class="pa-6 pt-0">
      <v-btn
        v-if="currentStep > 1"
        variant="text"
        @click="previousStep"
      >
        {{ t('onboarding.actions.back') }}
      </v-btn>

      <v-spacer />

      <v-btn
        v-if="currentStep < totalSteps"
        :disabled="!canProceed"
        color="primary"
        variant="elevated"
        @click="nextStep"
      >
        {{ t('onboarding.actions.next') }}
        <v-icon end>
          mdi-arrow-right
        </v-icon>
      </v-btn>

      <v-btn
        v-if="currentStep === totalSteps"
        color="primary"
        variant="elevated"
        @click="completeOnboarding"
      >
        {{ t('onboarding.actions.complete') }}
        <v-icon end>
          mdi-check
        </v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
