<script setup lang="ts">
import { mdiMagnifyScan } from '@mdi/js'
import { useReferencesStore } from '@/extension/stores/references'

// const progressText = computed(() => {
//   const verified = processedCount.value || 0
//   const total = extractedReferencesMetadata.value?.length || 0

//   if (total > 0) {
//     return `${verified}/${total}`
//   }
//   return '0/0'
// })

const { currentPhase } = storeToRefs(useReferencesStore())
const show = computed(() => currentPhase.value === 'verifying')
</script>

<template>
  <div />
  <v-empty-state
    v-show="show"
    :title="$t('analyzing-references')"
    :text="$t('analyzing-references-description')"
    :headline="$t('search-and-verification')"
    :icon="mdiMagnifyScan"
  >
    <!-- <template #actions>
      <v-chip
        variant="outlined"
        class="mt-4"
      >
        {{ `${progressText} ${$t('checked')}` }}
      </v-chip>
    </template> -->
  </v-empty-state>
</template>
