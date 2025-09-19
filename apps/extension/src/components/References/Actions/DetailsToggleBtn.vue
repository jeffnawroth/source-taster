<script setup lang="ts">
import { mdiChevronDown, mdiChevronUp } from '@mdi/js'

const showDetails = defineModel({
  default: false,
})
</script>

<template>
  <!-- Details Toggle -->
  <v-btn
    variant="text"
    :prepend-icon="showDetails ? mdiChevronUp : mdiChevronDown"
    @click="showDetails = !showDetails"
  >
    {{ showDetails ? $t('hide-details') : $t('show-details') }}
  </v-btn>
</template>
