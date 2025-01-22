<script setup lang="ts">
import { mdiGithub, mdiHomeOutline, mdiOpenInNew, mdiTagOutline } from '@mdi/js'
// I18n
const { t } = useI18n()

const version = `v${__APP_VERSION__}`

// Data
const items = ref([
  {
    title: computed(() => t('website')),
    subtitle: computed(() => t('visit-website')),
    href: 'https://sourcetaster.com',
    appendIcon: mdiOpenInNew,
    prependIcon: mdiHomeOutline,
  },
  {
    title: 'GitHub',
    subtitle: computed(() => t('view-github')),
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
])
</script>

<template>
  <OptionCategory :subheader="$t('about')">
    <OptionListItem
      v-for="item in items"
      :key="item.title"
      v-bind="item"
    />
  </OptionCategory>
</template>
