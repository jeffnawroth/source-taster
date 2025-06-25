<script setup lang="ts">
import { mdiChevronDown, mdiChevronUp } from '@mdi/js'

const showDetails = defineModel<boolean>({ required: true })
</script>

<template>
  <v-btn
    :append-icon="showDetails ? mdiChevronUp : mdiChevronDown"
    variant="text"
    slim
    :text="showDetails ? 'Hide details' : 'Show details'"
    @click="showDetails = !showDetails"
  />
</template>
