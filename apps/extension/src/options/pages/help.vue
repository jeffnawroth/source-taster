<script setup lang="ts">
import { mdiEmailOutline, mdiOpenInNew, mdiVideoOutline } from '@mdi/js'

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
  <v-container>
    <p class="text-h5 font-weight-bold mb-3">
      {{ t('help') }}
    </p>

    <p class="text-body-2 text-medium-emphasis">
      {{ t('help-description') }}
    </p>

    <v-divider class="my-4" />

    <OptionListItem v-bind="items[0]" />

    <v-divider class="my-4" />

    <OptionListItem v-bind="items[1]" />
  </v-container>
</template>
