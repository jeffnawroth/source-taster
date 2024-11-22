<script setup lang="ts">
// I18n
const { t } = useI18n()

const version = `v${__APP_VERSION__}`

// Data
const items = [
  {
    title: t('version'),
    subtitle: version,
    href: `https://github.com/jeffnawroth/source-taster/releases/tag/${version}`,
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
  {
    title: 'Homepage',
    subtitle: 'https://source-taster.jeffnawroth.me',
    href: 'https://source-taster.jeffnawroth.me',
    appendIcon: 'mdi-open-in-new',
    prependIcon: 'mdi-home',
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
