<script setup lang="ts">
import { useLocale } from 'vuetify/lib/framework.mjs'
import { localeOption } from '~/logic/storage'

// i18n
const { locale } = useI18n()
const { current } = useLocale()

// Data
const dois = ref<string[]>([])

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
            <BibliographyInput v-model="dois" />
            <v-divider
              class="mt-4 mb-2"
            />

            <ReportCard :dois />
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>
