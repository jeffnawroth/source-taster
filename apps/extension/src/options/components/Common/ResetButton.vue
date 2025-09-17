<script setup lang="ts">
import { mdiRestart } from '@mdi/js'

defineEmits<{
  click: []
}>()

const { t } = useI18n()
</script>

<template>
  <v-btn
    variant="tonal"
    color="primary"

    :prepend-icon="mdiRestart"
    @click="$emit('click')"
  >
    {{ t('reset-to-defaults') }}
  </v-btn>
</template>
