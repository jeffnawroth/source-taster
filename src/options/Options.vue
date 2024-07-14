<script setup lang="ts">
import { autoImportOption, toggleThemeOption } from '~/logic/storage'
</script>

<template>
  <v-app>
    <AppBar />
    <v-main>
      <v-container>
        <v-card
          flat
        >
          <v-list
            lines="two"
            subheader
          >
            <v-list-subheader>General</v-list-subheader>

            <v-list-item
              subtitle="Automatically import bibliography from the current page"
              title="Auto-import bibliography"
              @click="autoImportOption = !autoImportOption"
            >
              <template #prepend>
                <v-list-item-action start>
                  <v-checkbox-btn
                    v-model="autoImportOption"
                    color="primary"
                  />
                </v-list-item-action>
              </template>
            </v-list-item>

            <v-list-item
              title="Use Dark Mode"
              subtitle="Toggle between light and dark mode"
              @click="toggleThemeOption = toggleThemeOption === 'dark' ? 'light' : 'dark'"
            >
              <template #prepend>
                <v-list-item-action start>
                  <v-checkbox-btn
                    v-model="toggleThemeOption"
                    false-value="light"
                    true-value="dark"
                    color="primary"
                  />
                </v-list-item-action>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>
