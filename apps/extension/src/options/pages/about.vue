<script setup lang="ts">
import { mdiGithub, mdiHomeOutline, mdiInformationOutline } from '@mdi/js'
import icon128 from '/assets/icon128.png'

// TRANSLATION
const { t } = useI18n()

// VERSION
const version = `v${__APP_VERSION__}`
</script>

<template>
  <SettingsPageLayout
    :icon="mdiInformationOutline"
    :title="t('about')"
    :description="t('about-description')"
  >
    <v-img
      class="mb-4"
      height="150"
      :src="icon128"
    />

    <div class="text-center">
      <h1 class="text-h2 font-weight-bold mb-2">
        {{ t('app-title') }}
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
  </SettingsPageLayout>
</template>
