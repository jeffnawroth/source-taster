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
          <template #append>
            <!-- <v-tooltip>
            <template #activator="{ props }">
              <v-icon
                size="large"
                icon="-mdi-help-circle-outline"
                v-bind="props"
              />
            </template>
            <p class="text-h6">
              How does it work?
            </p>
            <p><span class="font-italic font-weight-bold">The Source Taster</span> extracts the DOIs from your bibliography and checks them using the CrossRef database.</p>
          </v-tooltip> -->
          </template>

          <v-card-text>
            <BibliographyInput v-model="dois" />
          </v-card-text>
        </v-card>

        <v-divider />

        <ReportCard :dois />
      </v-container>
    </v-main>
  </v-app>
</template>
