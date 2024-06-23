<script setup lang="ts">
import BibliographyInput from './BibliographyInput.vue'
import ReportCard from './ReportCard.vue'

const dois = ref<string[]>([])

// Computed Props
</script>

<template>
  <v-card
    flat
    min-width="400px"
    title="The Source Taster"
  >
    <template #append>
      <v-tooltip>
        <template #activator="{ props }">
          <v-icon
            size="large"
            icon="i-mdi-help-circle-outline"
            v-bind="props"
          />
        </template>
        <p class="text-h6">
          How does it work?
        </p>
        <p><span class="font-italic font-weight-bold">The Source Taster</span> extracts the DOIs from your bibliography and checks them using the CrossRef database.</p>
      </v-tooltip>
    </template>
    <v-card-text>
      <BibliographyInput v-model="dois" />
    </v-card-text>
  </v-card>

  <v-divider class="border-opacity-100" />

  <ReportCard :dois />
</template>
