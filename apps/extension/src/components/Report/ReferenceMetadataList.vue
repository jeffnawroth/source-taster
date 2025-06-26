<script setup lang="ts">
import type { ExternalSource, Reference } from '@source-taster/types'
import { mdiAccountGroup, mdiBookOpenBlankVariantOutline, mdiCalendarOutline, mdiCalendarRange, mdiEarth, mdiFileDocumentOutline, mdiIdentifier, mdiLink, mdiNotebookOutline, mdiText } from '@mdi/js'

defineProps<{
  reference: Reference | ExternalSource
  subheader?: string
}>()

const { t } = useI18n()
</script>

<template>
  <v-list
    density="compact"
    slim
  >
    <v-list-subheader>{{ subheader }}</v-list-subheader>

    <!-- ORIGINAL TEXT -->
    <ReferenceCardDetailsItem
      v-if="'originalText' in reference && reference.originalText"
      :icon="mdiText"
      :title="t('original-text')"
      :text="reference.originalText"
    />

    <!-- TITLE -->
    <ReferenceCardDetailsItem
      v-if="reference.metadata.title"
      :icon="mdiFileDocumentOutline"
      :title="t('title')"
      :text="reference.metadata.title"
    />

    <!-- AUTHORS -->
    <ReferenceCardDetailsItem
      v-if="reference.metadata.authors?.length"
      :icon="mdiAccountGroup"
      :title="t('authors')"
      :text="reference.metadata.authors?.join(', ')"
    />

    <!-- JOURNAL -->
    <ReferenceCardDetailsItem
      v-if="reference.metadata.journal"
      :icon="mdiEarth"
      :title="t('journal')"
      :text="reference.metadata.journal"
    />

    <!-- YEAR -->
    <ReferenceCardDetailsItem
      v-if="reference.metadata.year"
      :icon="mdiCalendarOutline"
      :title="t('year')"
      :text="reference.metadata.year"
    />

    <!-- VOLUME -->
    <ReferenceCardDetailsItem
      v-if="reference.metadata.volume"
      :icon="mdiBookOpenBlankVariantOutline"
      :title="t('volume')"
      :text="reference.metadata.volume"
    />

    <!-- ISSUE -->
    <ReferenceCardDetailsItem
      v-if="reference.metadata.issue"
      :icon="mdiCalendarRange"
      :title="t('issue')"
      :text="reference.metadata.issue"
    />

    <!-- PAGES -->
    <ReferenceCardDetailsItem
      v-if="reference.metadata.pages"
      :icon="mdiNotebookOutline"
      :title="t('pages')"
      :text="reference.metadata.pages"
    />

    <!-- DOI -->
    <ReferenceCardDetailsItem
      v-if="reference.metadata.doi"
      :icon="mdiIdentifier"
      title="DOI"
      :text="reference.metadata.doi"
    />

    <!-- URL -->
    <ReferenceCardDetailsItem
      v-if="reference.metadata.url"
      :icon="mdiLink"
      title="URL"
      :text="reference.metadata.url"
      link
    />
  </v-list>
</template>
