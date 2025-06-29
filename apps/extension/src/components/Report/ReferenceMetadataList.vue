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
      :text="reference.metadata.authors?.map(author =>
        typeof author === 'string' ? author : `${author.firstName || ''} ${author.lastName || ''}`.trim(),
      ).join(', ')"
    />

    <!-- JOURNAL/CONTAINER TITLE -->
    <ReferenceCardDetailsItem
      v-if="reference.metadata.source.containerTitle"
      :icon="mdiEarth"
      :title="t('journal')"
      :text="reference.metadata.source.containerTitle"
    />

    <!-- YEAR -->
    <ReferenceCardDetailsItem
      v-if="reference.metadata.date.year"
      :icon="mdiCalendarOutline"
      :title="t('year')"
      :text="reference.metadata.date.year"
    />

    <!-- VOLUME -->
    <ReferenceCardDetailsItem
      v-if="reference.metadata.source.volume"
      :icon="mdiBookOpenBlankVariantOutline"
      :title="t('volume')"
      :text="reference.metadata.source.volume"
    />

    <!-- ISSUE -->
    <ReferenceCardDetailsItem
      v-if="reference.metadata.source.issue"
      :icon="mdiCalendarRange"
      :title="t('issue')"
      :text="reference.metadata.source.issue"
    />

    <!-- PAGES -->
    <ReferenceCardDetailsItem
      v-if="reference.metadata.source.pages"
      :icon="mdiNotebookOutline"
      :title="t('pages')"
      :text="reference.metadata.source.pages"
    />

    <!-- DOI -->
    <ReferenceCardDetailsItem
      v-if="reference.metadata.identifiers?.doi"
      :icon="mdiIdentifier"
      title="DOI"
      :text="reference.metadata.identifiers.doi"
    />

    <!-- URL for ExternalSource -->
    <ReferenceCardDetailsItem
      v-if="'url' in reference && reference.url"
      :icon="mdiLink"
      title="URL"
      :text="reference.url"
      link
    />
  </v-list>
</template>
