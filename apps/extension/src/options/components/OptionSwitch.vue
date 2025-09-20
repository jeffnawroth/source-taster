<script setup lang="ts">
import { mdiCheck, mdiClose } from '@mdi/js'

const model = defineModel()
</script>

<template>
  <v-switch
    v-model="model"
    color="primary"
    inset
    :false-icon="mdiClose"
    :true-icon="mdiCheck"
  />
</template>
