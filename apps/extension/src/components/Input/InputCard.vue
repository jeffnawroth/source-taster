<script setup lang="ts">
import CheckReferencesButton from './CheckReferencesButton.vue'
import FileInput from './FileInput.vue'
import TextInput from './TextInput.vue'

// COMPONENTS
const components = [
  FileInput,
  TextInput,
  CheckReferencesButton,
]
</script>

<template>
  <v-card
    flat
  >
    <v-card-text
      class="pa-0"
    >
      <v-row dense>
        <v-col
          v-for="(component, index) in components"
          :key="index"
          cols="12"
        >
          <component :is="component" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
