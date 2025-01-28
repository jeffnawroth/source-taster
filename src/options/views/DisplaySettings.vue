<script setup lang="ts">
import { mdiDesktopTowerMonitor, mdiPageLayoutSidebarRight, mdiWeatherNight, mdiWhiteBalanceSunny, mdiWindowMaximize } from '@mdi/js'
import { getDisplayOption, setDisplayOption, themeOption } from '~/logic'

// TRANSLATION
const { t } = useI18n()

// THEME
const themes = ref(['light', 'dark', 'system'])

const themePrependIcon = computed(() => {
  switch (themeOption.value) {
    case 'light':
      return mdiWhiteBalanceSunny
    case 'dark':
      return mdiWeatherNight
    case 'system':
      return mdiDesktopTowerMonitor
    default:
      return mdiDesktopTowerMonitor
  }
})

// DISPLAY
const displayOptions = ref([
  { title: 'side-panel', value: 'sidepanel' },
  { title: 'popup', value: 'popup' },
])
const selectedDisplayOption = ref('sidepanel')

const displayModePrependIcon = computed(() => {
  switch (selectedDisplayOption.value) {
    case 'sidepanel':
      return mdiPageLayoutSidebarRight
    case 'popup':
      return mdiWindowMaximize
    default:
      return mdiPageLayoutSidebarRight
  }
})

// Watch for changes for the display option
watch(selectedDisplayOption, (newValue) => {
  // eslint-disable-next-line no-console
  console.log('Display option changed to:', newValue)
  setDisplayOption(newValue)
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('Display option saved successfully:', newValue)
    })
    .catch((error) => {
      console.error('Failed to save display option:', error)
    })
})

// Load the saved option when the component is mounted
onMounted(() => {
  getDisplayOption()
    .then((option) => {
      selectedDisplayOption.value = option
      // eslint-disable-next-line no-console
      console.log('Loaded display option on mount:', option)
    })
    .catch((error) => {
      console.error('Failed to load display option:', error)
    })
})
</script>

<template>
  <v-container>
    <p class="text-h5 font-weight-bold mb-3">
      {{ t('appearance') }}
    </p>

    <p class="text-body-2 text-medium-emphasis">
      {{ t('appearance-description') }}
    </p>

    <v-divider class="my-4" />
    <OptionListItem
      :title="t('display-mode')"
      :subtitle="t('display-mode-description')"
      :prepend-icon="displayModePrependIcon"
    >
      <v-select
        v-model="selectedDisplayOption"
        :items="displayOptions"
        :item-title="(item) => t(item.title)"
        width="150"
        item-value="value"
        color="primary"
        density="compact"
        hide-details
        variant="solo-filled"
        flat
      />
    </OptionListItem>

    <v-divider class="my-4" />

    <OptionListItem
      :title="t('theme')"
      :subtitle="t('theme-option-description')"
      :prepend-icon="themePrependIcon"
    >
      <v-select
        v-model="themeOption"
        :items="themes"
        :item-title="(option) => t(option)"
        :item-value="(option) => option"
        width="150"
        density="compact"
        hide-details
        variant="solo-filled"
        flat
      />
    </OptionListItem>
  </v-container>
</template>
