<script setup lang="ts">
import TrainingDataManager from '@/extension/components/References/TrainingDataManager.vue'
</script>

<template>
  <v-app>
    <v-app-bar
      color="primary"
      dark
    >
      <v-app-bar-title>
        <v-icon start>
          mdi-brain
        </v-icon>
        AnyStyle Model Training Demo
      </v-app-bar-title>
    </v-app-bar>

    <v-main>
      <TrainingDataManager />
    </v-main>
  </v-app>
</template>
