<script setup lang="ts">
import { mdiArrowLeft, mdiArrowRight, mdiCheckCircle, mdiKeyOutline, mdiOpenInNew, mdiRobot, mdiRocketLaunchOutline } from '@mdi/js'
import { aiSettings, hasCompletedOnboarding } from '@/extension/logic/storage'

const { t } = useI18n()

const currentStep = ref(1)

const steps = computed(() => [
  {
    step: 1,
    icon: mdiRocketLaunchOutline,
    title: t('onboarding.welcome.title'),
    description: t('onboarding.welcome.description'),
  },
  {
    step: 2,
    icon: mdiKeyOutline,
    title: t('onboarding.apiKey.title'),
    description: t('onboarding.apiKey.description'),
  },
  {
    step: 3,
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
  if (currentStep.value < 3) {
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
    max-width="600"
    elevation="8"
  >
    <v-stepper
      v-model="currentStep"
      :items="steps"
      hide-actions
      flat
    >
      <!-- Step 1: Welcome -->
      <template #[`item.1`]>
        <v-card
          flat
          class="pa-6"
        >
          <v-card-title class="text-center mb-4">
            <v-icon
              :icon="mdiRocketLaunchOutline"
              size="64"
              color="primary"
              class="mb-4"
            />
            <h2 class="text-h4">
              {{ t('onboarding.welcome.title') }}
            </h2>
          </v-card-title>

          <v-card-text class="text-center">
            <p class="text-h6 mb-6 text-medium-emphasis">
              {{ t('onboarding.welcome.description') }}
            </p>

            <v-list class="bg-transparent">
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon
                    :icon="mdiCheckCircle"
                    color="success"
                    size="small"
                  />
                </template>
                <v-list-item-title class="text-start">
                  {{ t('onboarding.features.extraction') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon
                    :icon="mdiCheckCircle"
                    color="success"
                    size="small"
                  />
                </template>
                <v-list-item-title class="text-start">
                  {{ t('onboarding.features.matching') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon
                    :icon="mdiCheckCircle"
                    color="success"
                    size="small"
                  />
                </template>
                <v-list-item-title class="text-start">
                  {{ t('onboarding.features.verification') }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </template>

      <!-- Step 2: API Key Setup -->
      <template #[`item.2`]>
        <v-card
          flat
          class="pa-6"
        >
          <v-card-title class="text-center mb-4">
            <v-icon
              :icon="mdiKeyOutline"
              size="64"
              color="primary"
              class="mb-4"
            />
            <h2 class="text-h4">
              {{ t('onboarding.apiKey.title') }}
            </h2>
          </v-card-title>

          <v-card-text>
            <p class="text-h6 mb-6 text-center text-medium-emphasis">
              {{ t('onboarding.apiKey.description') }}
            </p>

            <v-alert
              type="info"
              variant="tonal"
              class="mb-6"
            >
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
              :label="t('ai-settings-provider-label')"
              variant="outlined"
              class="mb-4"
              :prepend-inner-icon="mdiRobot"
            />

            <v-text-field
              v-model="aiSettings.apiKey"
              :label="t('ai-settings-api-key-label')"
              :rules="apiKeyRules"
              type="password"
              variant="outlined"
              :hint="t('onboarding.apiKey.hint')"
              persistent-hint
              :prepend-inner-icon="mdiKeyOutline"
              class="mb-4"
            />

            <div class="text-center">
              <v-btn
                :href="t('onboarding.apiKey.learnMoreUrl')"
                target="_blank"
                variant="text"
                size="small"
                color="primary"
              >
                <v-icon
                  start
                  :icon="mdiOpenInNew"
                />
                {{ t('onboarding.apiKey.learnMore') }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </template>

      <!-- Step 3: Ready -->
      <template #[`item.3`]>
        <v-card
          flat
          class="pa-6"
        >
          <v-card-title class="text-center mb-4">
            <v-icon
              :icon="mdiCheckCircle"
              size="64"
              color="success"
              class="mb-4"
            />
            <h2 class="text-h4">
              {{ t('onboarding.ready.title') }}
            </h2>
          </v-card-title>

          <v-card-text class="text-center">
            <p class="text-h6 mb-6 text-medium-emphasis">
              {{ t('onboarding.ready.description') }}
            </p>

            <v-alert
              type="success"
              variant="tonal"
              class="mb-6"
            >
              {{ t('onboarding.ready.success') }}
            </v-alert>

            <p class="text-body-1">
              {{ t('onboarding.ready.nextSteps') }}
            </p>
          </v-card-text>
        </v-card>
      </template>
    </v-stepper>

    <!-- Actions -->
    <v-card-actions class="pa-6 pt-0">
      <v-btn
        v-if="currentStep > 1"
        variant="text"
        :prepend-icon="mdiArrowLeft"
        :text="$t('onboarding.actions.back')"
        @click="previousStep"
      />

      <v-spacer />

      <v-btn
        v-if="currentStep < 3"
        :disabled="!canProceed"
        color="primary"
        variant="elevated"
        :append-icon="mdiArrowRight"
        :text="$t('onboarding.actions.next')"
        @click="nextStep"
      />

      <v-btn
        v-if="currentStep === 3"
        color="primary"
        variant="elevated"
        :append-icon="mdiCheckCircle"
        :text="$t('onboarding.actions.complete')"
        @click="completeOnboarding"
      />
    </v-card-actions>
  </v-card>
</template>
