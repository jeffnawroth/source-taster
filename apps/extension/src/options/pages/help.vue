<script setup lang="ts">
import { mdiEmailOutline, mdiHelpCircleOutline, mdiOpenInNew, mdiVideoOutline } from '@mdi/js'

// TRANSLATION
const { t } = useI18n()

// LIST ITEMS
const items = ref([

  {
    title: 'Demo',
    subtitle: computed(() => t('view-demo')),
    href: 'https://sourcetaster.com/demo.html',
    appendIcon: mdiOpenInNew,
    prependIcon: mdiVideoOutline,

  },
  {
    title: computed(() => t('contact')),
    href: 'mailto:contact@sourcetaster.com',
    subtitle: computed(() => t('contact-email')),
    appendIcon: mdiOpenInNew,
    prependIcon: mdiEmailOutline,
  },
])
</script>

<template>
  <SettingsPageLayout
    :icon="mdiHelpCircleOutline"
    :title="t('help')"
    :description="t('help-description')"
  >
    <OptionListItem v-bind="items[0]" />

    <v-divider class="my-4" />

    <OptionListItem v-bind="items[1]" />
  </SettingsPageLayout>
</template>
