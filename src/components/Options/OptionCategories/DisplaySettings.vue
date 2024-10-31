<script setup lang="ts">
import { getDisplayOption, setDisplayOption, themeOption } from '~/logic'

// I18n
const { t } = useI18n()

// Data
const themes = ref(['light', 'dark', 'system'])
const displayOptions = ref([
  { label: 'Sidepanel', value: 'sidepanel' },
  { label: 'Popup', value: 'popup' },
])
const selectedDisplayOption = ref('sidepanel')
// Lifecycle hooks

const themePrependIcon = computed(() => {
  switch (themeOption.value) {
    case 'light':
      return 'mdi-white-balance-sunny'
    case 'dark':
      return 'mdi-weather-night'
    case 'system':
      return 'mdi-desktop-tower-monitor'
    default:
      return 'mdi-desktop-tower-monitor'
  }
})

const displayModePrependIcon = computed(() => {
  switch (selectedDisplayOption.value) {
    case 'sidepanel':
      return 'mdi-page-layout-sidebar-right'
    case 'popup':
      return 'mdi-window-maximize'
    default:
      return 'mdi-page-layout-sidebar-right'
  }
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

// Methods

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
</script>

<template>
  <OptionCategory :subheader="t('display')">
    <OptionListItem
      :title="t('display-mode')"
      :subtitle="t('display-mode-description')"
      :prepend-icon="displayModePrependIcon"
    >
      <v-select
        v-model="selectedDisplayOption"
        :items="displayOptions"
        item-title="label"
        item-value="value"
        color="primary"
        density="compact"
        hide-details
        variant="solo-filled"
        flat
      />
    </OptionListItem>

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
        density="compact"
        hide-details
        variant="solo-filled"
        flat
      />
    </OptionListItem>
  </OptionCategory>
</template>
