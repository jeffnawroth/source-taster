<script setup lang="ts">
import BibliographyInput from './BibliographyInput.vue'
import ReportCard from './ReportCard.vue'

const dois = ref<string[]>([])

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
