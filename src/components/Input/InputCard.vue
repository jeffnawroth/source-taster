<script setup lang="ts">
import FileInput from './FileInput.vue'
import TextInput from './TextInput.vue'
import UrlInput from './UrlInput.vue'

const components = [
  FileInput,
  UrlInput,
  TextInput,
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
          <span>{{ component.name }}</span>
          <component :is="component" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
