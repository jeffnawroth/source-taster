<script setup lang="ts">
import { mdiChevronDown, mdiChevronUp } from '@mdi/js'
import { computed } from 'vue'

const showDetails = defineModel({
  default: false,
})

const { t } = useI18n()

const tooltipText = computed(() =>
  showDetails.value ? t('hide-details') : t('show-details'),
)
</script>

<template>
  <!-- Details Toggle -->
  <v-tooltip location="bottom">
    <template #activator="{ props: tooltipProps }">
      <v-icon
        :icon="showDetails ? mdiChevronUp : mdiChevronDown"
        class="cursor-pointer"
        v-bind="tooltipProps"
        @click="showDetails = !showDetails"
      />
    </template>
    {{ tooltipText }}
  </v-tooltip>
</template>
