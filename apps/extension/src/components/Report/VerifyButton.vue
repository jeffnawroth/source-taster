<script setup lang="ts">
import { mdiMagnifyExpand } from '@mdi/js'
import { useVerification } from '@/extension/composables/useVerification'

const { canVerify, isVerifying, verifyError, verify } = useVerification()
</script>

<template>
  <v-btn
    :disabled="!canVerify || isVerifying"
    color="success"
    variant="tonal"
    block
    @click="verify"
  >
    <template #prepend>
      <v-progress-circular
        v-if="isVerifying"
        size="20"
        width="2"
        indeterminate
      />
      <v-icon
        v-else
        :icon="mdiMagnifyExpand"
        start
      />
    </template>
    {{ isVerifying ? `${$t('verifying')}...` : $t('verify-references') }}
  </v-btn>

  <v-expand-transition>
    <v-alert
      v-if="verifyError"
      type="error"
      variant="tonal"
      class="mt-3"
      closable
      @click:close="verifyError = null"
    >
      {{ verifyError }}
    </v-alert>
  </v-expand-transition>
</template>
