<script setup lang="ts">
import { mdiFileDocumentOutline } from '@mdi/js'
import { useFuse } from '@vueuse/integrations/useFuse'
import { useReferencesStore } from '@/extension/stores/references'

const { t } = useI18n()
const { references, isProcessing } = storeToRefs(useReferencesStore())

const search = ref('')

const { results } = useFuse(search, references, {
  fuseOptions: {
    keys: [
      'originalText',
      'metadata.title',
      'metadata.authors',
      'metadata.source.containerTitle',
      'metadata.date.year',
    ],
    threshold: 0.3,
  },
  matchAllWhenSearchEmpty: true,
})
</script>

<template>
  <v-card
    flat
  >
    <v-card-title class="px-0">
      <v-icon size="x-small">
        {{ mdiFileDocumentOutline }}
      </v-icon>
      {{ t('report') }}
    </v-card-title>

    <!-- SUBTITLE -->
    <v-card-subtitle class="px-0">
      <ReportSubtitle />
    </v-card-subtitle>
    <v-card-text class="px-0">
      <!-- SEARCH -->
      <ReferencesSearchInput
        v-model="search"
        class="mb-2"
      />

      <!-- PROGRESS FEEDBACK -->
      <ProgressFeedback />

      <div
        style="max-height: calc(100vh - 528px); overflow-y: auto;"
      >
        <!-- LIST - Show immediately after extraction, even during processing -->
        <ReferencesList
          v-if="references.length > 0"
          :results
        />
      </div>

      <!-- STATES - Only show when no references available AND not processing -->
      <IdleState v-if="references.length === 0 && !isProcessing" />
    </v-card-text>
  </v-card>
</template>

<style scoped>
* {
  scrollbar-color: #404040b3 transparent; /*firefox*/
  scrollbar-width: thin;
}
</style>
