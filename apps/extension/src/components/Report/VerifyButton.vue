<script setup lang="ts">
import { mdiClose, mdiMagnifyExpand } from '@mdi/js'
import { storeToRefs } from 'pinia'
import { useExtractionStore } from '@/extension/stores/extraction'
import { useVerificationStore } from '@/extension/stores/verification'

const verificationStore = useVerificationStore()
const { canVerify, isVerifying } = storeToRefs(verificationStore)
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
        size="24"
        width="3"
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
</template>
