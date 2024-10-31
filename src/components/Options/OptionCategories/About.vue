<script setup lang="ts">
// I18n
const { t } = useI18n()

const appVersion = import.meta.env.VITE_APP_VERSION

// Data
const items = [
  {
    title: t('version'),
    subtitle: appVersion,
    href: `https://github.com/jeffnawroth/source-taster/releases/tag/${appVersion}`,
    appendIcon: 'mdi-open-in-new',
    prependIcon: 'mdi-tag-outline',
  },
  {
    title: 'GitHub',
    subtitle: 'https://github.com/jeffnawroth/source-taster',
    href: 'https://github.com/jeffnawroth/source-taster',
    appendIcon: 'mdi-open-in-new',
    prependIcon: 'mdi-github',
  },
]
</script>

<template>
  <OptionCategory :subheader="$t('about')">
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
