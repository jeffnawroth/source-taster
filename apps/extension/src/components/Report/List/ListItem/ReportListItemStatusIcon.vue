<script setup lang="ts">
import { mdiCheckCircleOutline, mdiCloseCircleOutline } from '@mdi/js'

// Props
const { verified } = defineProps<{
  verified: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <v-tooltip>
    <template #activator="{ props: tooltipProps }">
      <v-icon
        v-bind="tooltipProps"
        size="large"
        :icon="verified ? mdiCheckCircleOutline : mdiCloseCircleOutline"
      />
    </template>
    <p>{{ verified ? t('valid-description') : t('invalid-description') }}</p>
    <!-- <template v-else>
      <div class="ma-1">
        <p>{{ t('doi-not-found') }}</p>
        <ul>
          <li>{{ t('doi-incorrect') }}</li>
          <li>{{ t('doi-incorrect-extracted') }}</li>
          <li>{{ t('doi-not-activated') }}</li>
        </ul>
      </div>
    </template> -->
  </v-tooltip>
</template>
