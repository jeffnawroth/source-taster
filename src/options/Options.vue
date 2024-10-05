<!-- eslint-disable no-console -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { autoImportOption, toggleThemeOption } from '~/logic/storage'

// Set the default value
const displayOption = ref('popup') // Default to 'popup'

// Load the saved option when the component is mounted
onMounted(() => {
  chrome.storage.sync.get('displayOption', (result: { displayOption: string }) => {
    console.log('Loaded display option from storage:', result.displayOption)
    // Set the option to the saved value or default to 'popup' if no value is found
    displayOption.value = result.displayOption || 'popup'
  })
})

// Watcher to save the selected option immediately after it changes
watch(displayOption, (newValue) => {
  console.log('Saving display option:', newValue)
  // Save the updated option to chrome.storage.sync
  chrome.storage.sync.set({ displayOption: newValue }, () => {
    console.log('Display option saved successfully:', newValue)
  })
})
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
              subtitle="Automatically detect and import DOIs from the current page"
              title="Auto-import DOIs"
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
            <v-list-item
              title="Display Mode"
              subtitle="Choose whether to display the extension as a Sidepanel or Popup"
            >
              <template #prepend>
                <v-list-item-action start>
                  <v-select
                    v-model="displayOption"
                    :items="['popup', 'sidepanel']"
                    @change="saveDisplayOption"
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
