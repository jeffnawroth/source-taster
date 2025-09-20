<script setup lang="ts">
import { mdiClose, mdiMagnifyExpand } from '@mdi/js'
import { useMagicKeys } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { useExtractionStore } from '@/extension/stores/extraction'
import { useVerificationStore } from '@/extension/stores/verification'

const verificationStore = useVerificationStore()
const { canVerify, isVerifying } = storeToRefs(verificationStore)
const { verify, cancelVerification } = verificationStore

const extractionStore = useExtractionStore()
const { isExtracting } = storeToRefs(extractionStore)

const keys = useMagicKeys()

watch([keys['Cmd+Alt+Enter'], keys['Ctrl+Alt+Enter']], ([cmdAlt, ctrlAlt]) => {
  if ((cmdAlt || ctrlAlt) && canVerify.value && !isExtracting.value && !isVerifying.value)
    verify()
})
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
        size="16"
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
</template>
