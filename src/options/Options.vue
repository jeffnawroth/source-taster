<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { autoImportOption, getDisplayOption, setDisplayOption, toggleThemeOption } from '~/logic/storage'

// Reactive variable to store whether Popup is selected
const isPopup = ref(false)

// Load the saved option when the component is mounted
onMounted(() => {
  getDisplayOption().then((option) => {
    // Set the checkbox based on the saved display option
    isPopup.value = option === 'popup'
  }).catch((error) => {
    console.error('Failed to load display option:', error)
  })
})

// Save the user's choice when the checkbox is toggled
function saveDisplayOption() {
  const newValue = isPopup.value ? 'popup' : 'sidepanel'
  setDisplayOption(newValue).then(() => {
    // eslint-disable-next-line no-console
    console.log('Display option saved successfully:', newValue)
  }).catch((error) => {
    console.error('Failed to save display option:', error)
  })
}
</script>

<template>
  <v-app>
    <AppBar />
    <v-main>
      <v-container>
        <v-card flat>
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
              subtitle="Use a dark theme for the extension"
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
              title="Use Popup"
              subtitle="Choose whether to display the extension as a Popup"
            >
              <template #prepend>
                <v-list-item-action start>
                  <v-checkbox-btn
                    v-model="isPopup"
                    color="primary"
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
