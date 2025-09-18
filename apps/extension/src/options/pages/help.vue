<script setup lang="ts">
import { mdiBookOpenPageVariant, mdiEmailOutline, mdiHelpCircleOutline, mdiOpenInNew } from '@mdi/js'

// TRANSLATION
const { t } = useI18n()

// LIST ITEMS
const items = ref([
  {
    title: computed(() => t('documentation')),
    subtitle: computed(() => t('view-docs')),
    href: 'https://docs.sourcetaster.com/',
    appendIcon: mdiOpenInNew,
    prependIcon: mdiBookOpenPageVariant,
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
    <div
      v-for="(item, index) in items"
      :key="item.href"
    >
      <OptionListItem v-bind="item" />

      <v-divider
        v-if="index < items.length - 1"
        class="my-4"
      />
    </div>
  </SettingsPageLayout>
</template>
