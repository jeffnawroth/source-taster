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
  <v-container>
    <v-stepper
      v-model="currentStep"
      :items="steps"
      hide-actions
      flat
    >
      <!-- Step 1: Welcome -->
      <template #[`item.1`]>
        <v-sheet
          class="pa-0 text-center mx-auto"
        >
          <v-icon
            :icon="mdiRocketLaunchOutline"
            size="64"
            color="primary"
            class="mb-5"
          />
          <h2 class="text-h5 mb-6">
            {{ t('onboarding.welcome.title') }}
          </h2>
          <p class="mb-4 text-medium-emphasis text-body-2">
            {{ t('onboarding.welcome.description') }}
          </p>

          <v-list class="text-start">
            <v-list-item>
              <v-list-item-title class="text-wrap">
                {{ t('onboarding.features.extraction') }}
              </v-list-item-title>
              <template #prepend>
                <v-icon
                  :icon="mdiCheckCircle"
                  color="success"
                />
              </template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title class="text-wrap">
                {{ t('onboarding.features.matching') }}
              </v-list-item-title>
              <template #prepend>
                <v-icon
                  :icon="mdiCheckCircle"
                  color="success"
                />
              </template>
            </v-list-item>

            <v-list-item>
              <v-list-item-title class="text-wrap">
                {{ t('onboarding.features.verification') }}
              </v-list-item-title>
              <template #prepend>
                <v-icon
                  :icon="mdiCheckCircle"
                  color="success"
                />
              </template>
            </v-list-item>
          </v-list>
        </v-sheet>
      </template>

      <!-- Step 2: Extraction Methods -->
      <template #[`item.2`]>
        <v-sheet class="pa-0 text-center mx-auto">
          <h2 class="text-h5 mb-4 text-center">
            {{ t('onboarding.methods.title') }}
          </h2>
          <p class="mb-4 text-medium-emphasis text-body-2">
            {{ t('onboarding.methods.description') }}
          </p>
          <v-row
            no-gutters
          >
            <v-col
              cols="12"
              md="6"
            >
              <v-card
                variant="outlined"
                class="mb-2 text-start"
                :title="t('onboarding.methods.ai.title')"
              >
                <template #prepend>
                  <v-icon
                    :icon="mdiRobot"
                    color="primary"
                  />
                </template>
                <v-card-text>
                  <p class="mb-2">
                    {{ t('onboarding.methods.ai.description') }}
                  </p>
                  <v-chip
                    color="success"
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
                class="text-start"
                :title="t('onboarding.methods.anystyle.title')"
              >
                <template #prepend>
                  <v-icon
                    :icon="mdiRocketLaunchOutline"
                    color="secondary"
                  />
                </template>

                <v-card-text>
                  <p class="mb-2">
                    {{ t('onboarding.methods.anystyle.description') }}
                  </p>
                  <v-chip
                    color="info"
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
            class="mt-2"
          >
            {{ t('onboarding.methods.info') }}
          </v-alert>
        </v-sheet>
      </template>

      <!-- Step 3: Ready -->
      <template #[`item.3`]>
        <v-sheet
          class="text-center mx-auto pa-0"
        >
          <v-icon
            :icon="mdiCheckCircle"
            size="64"
            color="success"
            class="mb-5"
          />
          <h2 class="text-h5 mb-6">
            {{ t('onboarding.ready.title') }}
          </h2>

          <p class="mb-4 text-medium-emphasis text-body-2">
            {{ t('onboarding.ready.description') }}
          </p>
        </v-sheet>
      </template>

      <!-- Actions -->
      <v-card-actions>
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
    </v-stepper>
  </v-container>
</template>
