<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  prependIcon?: string
  appendIcon?: string
}>()
</script>

<template>
  <v-list-item
    :title="$t(title)"
    :subtitle="subtitle ? $t(subtitle) : undefined "
    :prepend-icon
    :append-icon
  >
    <template
      v-if="$slots.subtitle"
      #subtitle
    >
      <slot name="subtitle">
        {{ subtitle ? $t(subtitle) : undefined }}
      </slot>
    </template>
    <template
      #append
    >
      <v-icon v-if="appendIcon">
        {{ appendIcon }}
      </v-icon>
      <slot />
    </template>
  </v-list-item>
</template>
