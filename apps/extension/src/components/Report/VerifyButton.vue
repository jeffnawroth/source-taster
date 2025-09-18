<script setup lang="ts">
import { mdiClose, mdiMagnifyExpand } from '@mdi/js'
import { storeToRefs } from 'pinia'
import { useExtractionStore } from '@/extension/stores/extraction'
import { useVerificationStore } from '@/extension/stores/verification'

const verificationStore = useVerificationStore()
const { canVerify, isVerifying, verifyError } = storeToRefs(verificationStore)
const { verify, cancelVerification } = verificationStore

const extractionStore = useExtractionStore()
const { isExtracting } = storeToRefs(extractionStore)
</script>

<template>
  <v-btn
    v-if="isVerifying"
    color="warning"
    variant="tonal"
    block
    @click="cancelVerification"
  >
    <template #prepend>
      <v-progress-circular
        size="25"
        width="2"
        indeterminate
      >
        <v-icon
          :icon="mdiClose"
        />
      </v-progress-circular>
    </template>
    {{ $t('cancel-verification') }}
  </v-btn>
  <v-btn
    v-else
    :disabled="!canVerify || isExtracting"
    color="primary"
    variant="tonal"
    block
    @click="verify"
  >
    <template #prepend>
      <v-icon
        :icon="mdiMagnifyExpand"
        start
      />
    </template>
    {{ $t('verify-references') }}
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
      {{ $t(verifyError) }}
    </v-alert>
  </v-expand-transition>
</template>
