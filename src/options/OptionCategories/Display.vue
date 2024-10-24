<script setup lang="ts">
import { getDisplayOption, setDisplayOption, themeOption } from '~/logic'

// I18n
const { t } = useI18n()

// Data
const themes = ref(['light', 'dark', 'system'])
const isPopup = ref(false)

// Lifecycle hooks

// Load the saved option when the component is mounted
onMounted(() => {
  getDisplayOption().then((option) => {
    // Set the checkbox based on the saved display option
    isPopup.value = option === 'popup'
  }).catch((error) => {
    console.error('Failed to load display option:', error)
  })
})

// Methods

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
  <v-card>
    <v-list>
      <!-- Darstellungseinstellungen -->
      <v-list-subheader>{{ t('display') }}</v-list-subheader>

      <v-list-item
        :title="t('use-popup')"
        :subtitle="t('use-popup-description')"
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
      <v-list-item
        :title="t('theme')"
        :subtitle="t('theme-option-description')"
      >
        <template #prepend>
          <v-list-item-action start>
            <v-select
              v-model="themeOption"
              :items="themes"
              :item-title="(option) => t(option)"
              :item-value="(option) => option"
              density="compact"
              hide-details
              variant="solo"
              flat
            />
          </v-list-item-action>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>
