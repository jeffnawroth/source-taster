<script setup lang="ts">
// I18n
const { t } = useI18n({ useScope: 'global' })

const version = `v${__APP_VERSION__}`

// Data
const items = [
  {
    title: t('website'),
    subtitle: 'visit-website',
    href: 'https://sourcetaster.com',
    appendIcon: 'mdi-open-in-new',
    prependIcon: 'mdi-home-outline',
  },
  {
    title: 'GitHub',
    subtitle: 'view-github',
    href: 'https://github.com/jeffnawroth/source-taster',
    appendIcon: 'mdi-open-in-new',
    prependIcon: 'mdi-github',
  },
  {
    title: 'Version',
    subtitle: version,
    href: `https://github.com/jeffnawroth/source-taster/releases/tag/${version}`,
    appendIcon: 'mdi-open-in-new',
    prependIcon: 'mdi-tag-outline',
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
