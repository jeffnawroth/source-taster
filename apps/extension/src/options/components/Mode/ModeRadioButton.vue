<script setup lang="ts" generic="TMode extends string">
interface Props {
  value: TMode
  icon: string
  label: string
  description: string
}

defineProps<Props>()
</script>

<template>
  <v-radio
    :value
    class="flex-grow-1"
  >
    <template #label>
      <div>
        <div class="font-weight-medium d-flex align-center">
          <v-icon
            :icon
            size="small"
            class="me-2"
          />
          {{ label }}
        </div>
        <div class="text-caption text-medium-emphasis">
          {{ description }}
        </div>
      </div>
    </template>
  </v-radio>
</template>

<style scoped>
.v-radio :deep(.v-label) {
  opacity: 1;
}
</style>
