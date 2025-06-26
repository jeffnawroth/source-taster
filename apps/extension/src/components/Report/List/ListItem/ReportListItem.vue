<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'

// PROPS
const { reference } = defineProps<{
  reference: ProcessedReference
}>()

// TRANSLATION
const { t } = useI18n()

// CARD COLOR
const color = computed(() => {
  switch (reference.status) {
    case 'verified': return 'success'
    case 'not-verified': return 'warning'
    case 'error': return 'error'
    default: return undefined
  }
})

// TITLE
const title = computed(() => reference.metadata.title || t('no-title'))

// SHOW DETAILS
const showDetails = ref(false)
</script>

<template>
  <v-card
    density="compact"
    variant="outlined"
    class="mb-2"
    :title
    :color
  >
    <!-- STATUS ICON -->
    <template #append>
      <ReportListItemStatusIcon :reference />
    </template>

    <!-- SUBTITLE -->
    <ReferenceCardSubtitle :reference />

    <!-- ACTIONS -->
    <v-card-actions>
      <v-row dense>
        <v-col cols="auto">
          <ReportListItemOpenBtn :reference />
        </v-col>
        <v-col cols="auto">
          <ReportListItemBtnSearchWeb :query="reference.originalText" />
        </v-col>

        <v-col cols="auto">
          <ReportListItemCopyBtn :value="reference.originalText" />
        </v-col>

        <v-spacer />

        <v-col cols="auto">
          <ReferenceShowDetailsBtn v-model="showDetails" />
        </v-col>
      </v-row>
    </v-card-actions>

    <ReferenceCardDetails
      v-show="showDetails"
      :reference
    />
  </v-card>
</template>
