<script setup lang="ts">
import { mdiArrowLeft, mdiArrowRight, mdiCheckCircle, mdiRobot, mdiRocketLaunchOutline } from '@mdi/js'
import { hasCompletedOnboarding } from '@/extension/logic/storage'

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
    icon: mdiRobot,
    title: t('onboarding.methods.title'),
    description: t('onboarding.methods.description'),
  },
  {
    step: 3,
    icon: mdiCheckCircle,
    title: t('onboarding.ready.title'),
    description: t('onboarding.ready.description'),
  },
])

const canProceed = computed(() => {
  // All steps are now optional - users can proceed without API key
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

      <!-- Step 2: Extraction Methods -->
      <template #[`item.2`]>
        <v-card
          flat
          class="pa-6"
        >
          <v-card-title class="text-center mb-4">
            <v-icon
              :icon="mdiRobot"
              size="64"
              color="primary"
              class="mb-4"
            />
            <h2 class="text-h4">
              {{ t('onboarding.methods.title') }}
            </h2>
          </v-card-title>

          <v-card-text>
            <p class="text-h6 mb-6 text-center text-medium-emphasis">
              {{ t('onboarding.methods.description') }}
            </p>

            <v-row>
              <v-col
                cols="12"
                md="6"
              >
                <v-card
                  variant="outlined"
                  class="h-100"
                >
                  <v-card-title class="text-center">
                    <v-icon
                      :icon="mdiRobot"
                      color="primary"
                      size="large"
                      class="mb-2"
                    />
                    <br>
                    {{ t('onboarding.methods.ai.title') }}
                  </v-card-title>
                  <v-card-text>
                    <p class="text-body-2 mb-3">
                      {{ t('onboarding.methods.ai.description') }}
                    </p>
                    <v-chip
                      color="success"
                      size="small"
                      variant="tonal"
                    >
                      {{ t('onboarding.methods.ai.accuracy') }}
                    </v-chip>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col
                cols="12"
                md="6"
              >
                <v-card
                  variant="outlined"
                  class="h-100"
                >
                  <v-card-title class="text-center">
                    <v-icon
                      :icon="mdiRocketLaunchOutline"
                      color="secondary"
                      size="large"
                      class="mb-2"
                    />
                    <br>
                    {{ t('onboarding.methods.anystyle.title') }}
                  </v-card-title>
                  <v-card-text>
                    <p class="text-body-2 mb-3">
                      {{ t('onboarding.methods.anystyle.description') }}
                    </p>
                    <v-chip
                      color="info"
                      size="small"
                      variant="tonal"
                    >
                      {{ t('onboarding.methods.anystyle.free') }}
                    </v-chip>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-alert
              type="info"
              variant="tonal"
              class="mt-6"
            >
              {{ t('onboarding.methods.info') }}
            </v-alert>
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
          </v-card-text>
        </v-card>
      </template>
    </v-stepper>

    <!-- Actions -->
    <v-card-actions class="pa-6 pt-0">
      <v-btn
        v-if="currentStep > 1"
        variant="text"
        color="primary"
        :prepend-icon="mdiArrowLeft"
        :text="$t('onboarding.actions.back')"
        @click="previousStep"
      />

      <v-spacer />

      <v-btn
        v-if="currentStep < 3"
        :disabled="!canProceed"
        variant="elevated"
        :append-icon="mdiArrowRight"
        color="primary"
        :text="$t('onboarding.actions.next')"
        @click="nextStep"
      />

      <v-btn
        v-if="currentStep === 3"
        variant="elevated"
        color="primary"
        :append-icon="mdiCheckCircle"
        :text="$t('onboarding.actions.complete')"
        @click="completeOnboarding"
      />
    </v-card-actions>
  </v-card>
</template>
