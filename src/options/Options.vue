<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { autoImportOption, getDisplayOption, localeOption, setDisplayOption, toggleThemeOption } from '~/logic/storage'

// i18n
const { t, locale } = useI18n()

// Data

// Reactive variable to store whether Popup is selected
const isPopup = ref(false)

const languages = ref([
  { locale: 'de', name: t('german') },
  { locale: 'en', name: t('english') },
])

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

// Watchers
watchEffect(() => locale.value = localeOption.value)
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
            <v-list-subheader>{{ t('general') }}</v-list-subheader>

            <v-list-item
              :subtitle="t('auto-import-dois-description')"
              :title="t('auto-import-dois')"
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
              :title="t('use-dark-mode')"
              :subtitle="t('use-dark-mode-description')"
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
              :title="t('language')"
              :subtitle="t('language-option-description')"
            >
              <template #prepend>
                <v-list-item-action start>
                  <v-select
                    v-model="localeOption"
                    :items="languages"
                    item-title="name"
                    item-value="locale"
                    hide-details
                    density="compact"
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
