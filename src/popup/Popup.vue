<script setup lang="ts">
import { useLocale } from 'vuetify/lib/framework.mjs'
import { localeOption } from '~/logic/storage'

const { locale } = useI18n()
const { current } = useLocale()

// Watchers
watchEffect(() => {
  locale.value = localeOption.value
  current.value = localeOption.value
})

// Computed Props
</script>

<template>
  <v-app>
    <AppBar />
    <v-main>
      <v-container>
        <v-card
          flat
        >
          <v-card-text>
            <BibliographyInput />
            <v-divider
              class="mt-4 mb-2"
            />

            <ReportCard />
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>
