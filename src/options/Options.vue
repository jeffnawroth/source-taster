<script setup lang="ts">
import { autoImportOption } from '~/logic/storage'
</script>

<template>
  <v-app>
    <v-app-bar
      flat
      title="The Source Taster - Settings"
    />
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
          </v-list>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>
