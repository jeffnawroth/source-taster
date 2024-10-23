<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocale } from 'vuetify/lib/framework.mjs'
import { autoImportOption, getDisplayOption, localeOption, setDisplayOption, themeOption } from '~/logic/storage'

// i18n
const { t, locale } = useI18n()
const { current } = useLocale()

// Data

// Reactive variable to store whether Popup is selected
const isPopup = ref(false)

const languages = ref([
  { locale: 'de', name: 'German' },
  { locale: 'en', name: 'English' },
])

const themes = ref(['light', 'dark', 'system'])

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
watchEffect(() => {
  locale.value = localeOption.value
  current.value = localeOption.value
})
</script>

<template>
  <v-app>
    <AppBar />
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card flat>
              <v-list
                lines="two"
                subheader
              >
                <!-- Allgemeine Einstellungen -->
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
              </v-list>
            </v-card>
          </v-col>
          <v-col cols="12">
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
          </v-col>
          <v-col cols="12">
            <v-card>
              <v-list>
                <!-- Spracheinstellungen -->
                <v-list-subheader>{{ t('language') }}</v-list-subheader>

                <v-list-item
                  :title="t('language')"
                  :subtitle="t('language-option-description')"
                >
                  <template #prepend>
                    <v-list-item-action start>
                      <v-select
                        v-model="localeOption"
                        :items="languages"
                        :item-title="(option) => t(option.name.toLocaleLowerCase())"
                        item-value="locale"
                        hide-details
                        density="compact"
                        variant="solo"
                        flat
                      />
                    </v-list-item-action>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
