<script setup lang="ts">
import { mdiChevronDown, mdiChevronUp } from '@mdi/js'

const showDetails = defineModel({
  default: false,
})
</script>

<template>
  <!-- Details Toggle -->
  <v-icon
    :icon="showDetails ? mdiChevronUp : mdiChevronDown"
    class="cursor-pointer"
    @click="showDetails = !showDetails"
  >
    <!-- {{ showDetails ? $t('hide-details') : $t('show-details') }} -->
  </v-icon>
</template>
