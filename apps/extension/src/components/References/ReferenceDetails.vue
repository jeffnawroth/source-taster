<script setup lang="ts">
import type { ApiExtractReference } from '@source-taster/types'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'

const { reference } = defineProps<{
  reference: DeepReadonly<UnwrapNestedRefs<ApiExtractReference>>
}>()

// const { t } = useI18n()
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
      <!-- <ReferenceMetadataItem
        v-if="reference.status === 'error' && reference.error"
        :icon="mdiAlertCircle"
        :title="t('error')"
        color="error"
        :text="reference.error || t('no-additional-error-info')"
      /> -->

      <!-- All Source Evaluations for Transparency -->
      <!-- <EvaluationList
        v-if="reference.matchingResult?.sourceEvaluations?.length"
        :source-evaluations="reference.matchingResult.sourceEvaluations"
      /> -->
    </div>
  </v-expand-transition>
</template>
