<script setup lang="ts">
interface Props {
  totalWeight: number
  isValidConfiguration: boolean
}

defineProps<Props>()

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <v-alert
    :type="isValidConfiguration ? 'success' : 'warning'"
    class="mb-4"
    density="compact"
  >
    <div class="d-flex justify-space-between align-center">
      <span>{{ t('total-weight') }}: {{ totalWeight }}%</span>
      <span
        v-if="!isValidConfiguration"
        class="text-caption"
      >
        {{ t('weights-should-sum-to-100') }}
      </span>
    </div>
  </v-alert>
</template>
