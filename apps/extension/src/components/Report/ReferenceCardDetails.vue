<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'
import { mdiAccountGroup, mdiAlertCircle, mdiBookOpenBlankVariantOutline, mdiCalendarOutline, mdiCalendarRange, mdiCheckCircleOutline, mdiDatabaseOutline, mdiEarth, mdiFileDocumentOutline, mdiHelpCircleOutline, mdiIdentifier, mdiLink, mdiNotebookOutline, mdiText } from '@mdi/js'

const { reference } = defineProps<{
  reference: ProcessedReference
}>()

const { t } = useI18n()
</script>

<template>
  <v-expand-transition>
    <div>
      <v-divider />

      <v-list
        density="compact"
        slim
      >
        <!-- ORIGINAL TEXT -->
        <ReferenceCardDetailsItem
          :icon="mdiText"
          :title="t('original-text')"
          :text="reference.originalText"
        />

        <!-- TITLE -->
        <ReferenceCardDetailsItem
          :icon="mdiFileDocumentOutline"
          :title="t('title')"
          :text="reference.metadata.title"
        />

        <!-- AUTHORS -->
        <ReferenceCardDetailsItem
          :icon="mdiAccountGroup"
          :title="t('authors')"
          :text="reference.metadata.authors?.join(', ')"
        />

        <!-- JOURNAL -->
        <ReferenceCardDetailsItem
          :icon="mdiEarth"
          :title="t('journal')"
          :text="reference.metadata.journal"
        />

        <!-- YEAR -->
        <ReferenceCardDetailsItem
          :icon="mdiCalendarOutline"
          :title="t('year')"
          :text="reference.metadata.year"
        />

        <!-- DOI -->
        <ReferenceCardDetailsItem
          v-if="reference.metadata.volume"
          :icon="mdiIdentifier"
          title="DOI"
          :text="reference.metadata.doi"
        />

        <!-- VOLUME -->
        <ReferenceCardDetailsItem
          :icon="mdiBookOpenBlankVariantOutline"
          :title="t('volume')"
          :text="reference.metadata.volume"
        />

        <!-- ISSUE -->
        <ReferenceCardDetailsItem
          :icon="mdiCalendarRange"
          :title="t('issue')"
          :text="reference.metadata.issue"
        />

        <!-- PAGES -->
        <ReferenceCardDetailsItem
          :icon="mdiNotebookOutline"
          :title="t('pages')"
          :text="reference.metadata.pages"
        />

        <!-- URL -->
        <ReferenceCardDetailsItem
          :icon="mdiLink"
          title="URL"
          :text="reference.metadata.url"
        />
        <v-divider class="my-2" />

        <!-- VERIFIED -->
        <div v-if="reference.status === 'verified' && reference.verificationResult?.matchedSource">
          <ReferenceCardDetailsItem
            :icon="mdiCheckCircleOutline"
            :title="t('verified-against')"
            color="success"
            text=" "
          />

          <ReferenceCardDetailsItem
            :icon="mdiDatabaseOutline"
            :title="t('source')"
            :text="reference.verificationResult.matchedSource.source"
          />

          <ReferenceCardDetailsItem
            :icon="mdiIdentifier"
            title="DOI"
            :text="reference.verificationResult.matchedSource.metadata.doi"
          />

          <ReferenceCardDetailsItem
            :icon="mdiLink"
            title="URL"
            :text="reference.verificationResult.matchedSource.url"
            link
          />
        </div>

        <!-- ERROR -->
        <ReferenceCardDetailsItem
          v-if="reference.status === 'error' && reference.error"
          :icon="mdiAlertCircle"
          :title="t('error')"
          color="error"
          :text="reference.error || t('no-additional-error-info')"
        />

        <!-- NOT VERIFIED -->
        <ReferenceCardDetailsItem
          v-if="reference.status === 'not-verified'"
          :icon="mdiHelpCircleOutline"
          :title="t('not-verified')"
          color="warning"
          :text="t('no-matching-source-found')"
        />
      </v-list>
    </div>
  </v-expand-transition>
</template>
