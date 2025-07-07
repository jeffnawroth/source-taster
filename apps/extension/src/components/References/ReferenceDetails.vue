<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'
import { mdiAlertCircle } from '@mdi/js'

const { reference } = defineProps<{
  reference: ProcessedReference
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
        v-if="reference.verificationResult?.verificationDetails?.allSourceEvaluations?.length"
        :source-evaluations="reference.verificationResult.verificationDetails.allSourceEvaluations"
      />
    </div>
  </v-expand-transition>
</template>
