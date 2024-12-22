<script setup lang="ts">
import { mdiGithub, mdiHomeOutline, mdiOpenInNew, mdiTagOutline } from '@mdi/js'
// I18n
const { t } = useI18n({ useScope: 'global' })

const version = `v${__APP_VERSION__}`

// Data
const items = [
  {
    title: t('website'),
    subtitle: 'visit-website',
    href: 'https://sourcetaster.com',
    appendIcon: mdiOpenInNew,
    prependIcon: mdiHomeOutline,
  },
  {
    title: 'GitHub',
    subtitle: 'view-github',
    href: 'https://github.com/jeffnawroth/source-taster',
    appendIcon: mdiOpenInNew,
    prependIcon: mdiGithub,
  },
  {
    title: 'Version',
    subtitle: version,
    href: `https://github.com/jeffnawroth/source-taster/releases/tag/${version}`,
    appendIcon: mdiOpenInNew,
    prependIcon: mdiTagOutline,
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
