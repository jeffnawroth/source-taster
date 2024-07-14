<script setup lang="ts">
import { autoImportOption } from '~/logic/storage'
</script>

<template>
  <v-app>
    <v-main>
      <v-container>
        <v-card
          title="Settings - The Source Taster"
          flat
        >
          <v-card-text>
            <input
              id="checkbox"
              v-model="autoImportOption"
              type="checkbox"
            >
            <label for="checkbox">
              Auto-import for literature
            </label>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>
