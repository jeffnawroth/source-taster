<script setup lang="ts">
import { mdiEmailOutline, mdiOpenInNew, mdiVideoOutline } from '@mdi/js'
// Data
const items = ref([

  {
    title: 'Demo',
    subtitle: 'view-demo',
    href: 'https://sourcetaster.com/demo.html',
    appendIcon: mdiOpenInNew,
    prependIcon: mdiVideoOutline,
  },
  {
    title: 'contact',
    href: 'mailto:contact@sourcetaster.com',
    subtitle: 'contact-email',
    appendIcon: mdiOpenInNew,
    prependIcon: mdiEmailOutline,
  },
])
</script>

<template>
  <OptionCategory :subheader="$t('help')">
    <OptionListItem
      v-for="{ title, subtitle, href, appendIcon, prependIcon } in items"
      :key="title"
      :title
      :subtitle
      :href
      :append-icon
      :prepend-icon
    />
  </OptionCategory>
</template>
