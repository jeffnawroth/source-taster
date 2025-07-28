<script setup lang="ts">
import type { ExtractedReference } from '@/extension/types/reference'
import { mdiAlertCircle } from '@mdi/js'

const { reference } = defineProps<{
  reference: ExtractedReference
}>()

const { t } = useI18n()
</script>

<template>
  <v-expand-transition>
    <div>
      <v-divider />

      <ReferenceMetadataList
        :reference
        :subheader="$t('reference-metadata')"
      />

      <v-divider class="my-2" />

      <!-- ERROR -->
      <ReferenceMetadataItem
        v-if="reference.status === 'error' && reference.error"
        :icon="mdiAlertCircle"
        :title="t('error')"
        color="error"
        :text="reference.error || t('no-additional-error-info')"
      />

      <!-- All Source Evaluations for Transparency -->
      <EvaluationList
        v-if="reference.matchingResult?.sourceEvaluations?.length"
        :source-evaluations="reference.matchingResult.sourceEvaluations"
      />
    </div>
  </v-expand-transition>
</template>
