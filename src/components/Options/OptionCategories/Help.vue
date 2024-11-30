<script setup lang="ts">
// Data
const items = ref([

  {
    title: 'Demo',
    subtitle: 'view-demo',
    href: 'https://sourcetaster.com/demo.html',
    appendIcon: 'mdi-open-in-new',
    prependIcon: 'mdi-video-outline',
  },
  {
    title: 'contact',
    href: 'mailto:contact@sourcetaster.com',
    subtitle: 'contact-email',
    appendIcon: 'mdi-open-in-new',
    prependIcon: 'mdi-email-outline',
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
