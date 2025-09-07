<script setup lang="ts">
import { useFuse } from '@vueuse/integrations/useFuse'
import { useAnystyleStore } from '@/extension/stores/anystyle'
import { useUIStore } from '@/extension/stores/ui'

// Get state from new specialized stores
const uiStore = useUIStore()
const { displayReferences } = storeToRefs(uiStore)

// Use display references for the UI (these contain the combined data)
const references = displayReferences

// Check for AnyStyle parsed tokens
const anystyleStore = useAnystyleStore()
const { hasParseResults } = storeToRefs(anystyleStore)
const hasAnystyleParsedTokens = computed(() => hasParseResults.value)

const search = ref('')

const { results } = useFuse(search, references, {
  fuseOptions: {
    keys: [
      'originalText',
      'metadata.title',
      'metadata.author',
      'metadata.container-title',
    ],
    threshold: 0.3,
  },
  matchAllWhenSearchEmpty: true,
})
</script>

<template>
  <v-card
    flat
    :title="`3. ${$t('verify')}`"
    :subtitle="$t('verify-references-by-searching-and-matching-them-to-entries-in-scholarly-databases')"
  >
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

      <!-- VERIFY BUTTON - Always show but disabled when no parsed tokens -->
      <VerifyButton
        :disabled="!hasAnystyleParsedTokens"
        class="mb-3"
      />

      <!-- References Container with fixed height -->
      <div
        class="references-container"
        style="max-height: calc(100vh - 610px)"
      >
        <!-- LIST - Show when we have references -->
        <ReferencesList
          v-if="references.length > 0"
          :results
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.references-container {
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 0.5rem;
  scrollbar-color: #404040b3 transparent; /*firefox*/
  scrollbar-width: thin;
}

/* Webkit browsers (Chrome, Safari, Edge) */
.references-container::-webkit-scrollbar {
  width: 6px;
}

.references-container::-webkit-scrollbar-track {
  background: transparent;
}

.references-container::-webkit-scrollbar-thumb {
  background: rgba(64, 64, 64, 0.7);
  border-radius: 3px;
}

.references-container::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 64, 64, 0.9);
}
</style>
