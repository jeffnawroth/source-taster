<script setup lang="ts">
import { mdiGithub, mdiHomeOutline } from '@mdi/js'
import icon128 from '/assets/icon128.png'

// TRANSLATION
const { t } = useI18n()

// VERSION
const version = `v${__APP_VERSION__}`
</script>

<template>
  <v-container class="fill-height flex-column">
    <div class="align-self-stretch">
      <p class="text-h5 font-weight-bold mb-3">
        {{ t('about') }}
      </p>

      <p class="text-body-2 text-medium-emphasis">
        {{ t('about-description') }}
      </p>
      <v-divider class="my-4" />
    </div>

    <v-responsive
      class="mx-auto align-center"
      max-width="600"
    >
      <v-img
        class="mb-4"
        height="150"
        :src="icon128"
      />

      <div class="text-center">
        <h1 class="text-h2 font-weight-bold mb-2">
          The Source Taster
        </h1>

        <div class="text-body-2 font-weight-light mb-2">
          {{ version }}
        </div>

        <v-btn
          :text="t('visit-website')"
          variant="text"
          :prepend-icon="mdiHomeOutline"
          href="https://sourcetaster.com"
        />

        <v-btn
          :prepend-icon="mdiGithub"
          :text="t('source-code')"
          variant="text"
          href="https://github.com/jeffnawroth/source-taster"
        />
      </div>
    </v-responsive>
  </v-container>
</template>
