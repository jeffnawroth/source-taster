<script setup lang="ts">
import { mdiMagnifyScan } from '@mdi/js'
import { useReferencesStore } from '@/extension/stores/references'

const { currentPhase, processedCount, totalCount } = storeToRefs(useReferencesStore())

const progressText = computed(() => {
  const verified = processedCount.value || 0
  const total = totalCount.value || 0

  if (currentPhase.value === 'verifying' && totalCount.value > 0) {
    return `${verified} / ${total}`
  }
  return '0/0'
})

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
    <template #actions>
      <v-chip
        variant="outlined"
        class="mt-4"
      >
        {{ `${progressText} ${$t('checked')}` }}
      </v-chip>
    </template>
  </v-empty-state>
</template>
