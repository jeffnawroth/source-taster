<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { localeOption } from '~/logic/storage'
import BibliographyInput from './BibliographyInput.vue'
import ReportCard from './ReportCard.vue'

// i18n
const { locale } = useI18n()

// Data
const dois = ref<string[]>([])

// Watchers
watchEffect(() => locale.value = localeOption.value)

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
