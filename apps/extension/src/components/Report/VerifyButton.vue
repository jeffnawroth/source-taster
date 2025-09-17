<script setup lang="ts">
import { mdiMagnifyExpand } from '@mdi/js'
import { storeToRefs } from 'pinia'
import { useExtractionStore } from '@/extension/stores/extraction'
import { useVerificationStore } from '@/extension/stores/verification'

const verificationStore = useVerificationStore()
const { canVerify, isVerifying, verifyError } = storeToRefs(verificationStore)
const { verify } = verificationStore

const extractionStore = useExtractionStore()
const { isExtracting } = storeToRefs(extractionStore)
</script>

<template>
  <v-btn
    :disabled="!canVerify || isVerifying || isExtracting"
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
