<script setup lang="ts">
import { mdiEmailOutline, mdiOpenInNew, mdiVideoOutline } from '@mdi/js'

// I18n
const { t } = useI18n()

// Data
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
  <OptionCategory :subheader="$t('help')">
    <OptionListItem
      v-for="item in items"
      :key="item.title"
      v-bind="item"
    />
  </OptionCategory>
</template>
