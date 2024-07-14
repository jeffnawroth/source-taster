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
            <v-checkbox
              v-model="autoImportOption"
              label="Auto-import bibliography"
            />
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>
