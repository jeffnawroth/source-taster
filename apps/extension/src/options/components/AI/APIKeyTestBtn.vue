<script setup lang="ts">
import { mdiCheckboxMarkedCircleOutline } from '@mdi/js'
import { useExtractionStore } from '@/extension/stores/extraction'

const props = defineProps<{ hasKey: boolean }>()
const emit = defineEmits<{ (e: 'tested', result: { ok: boolean, message: string }): void }>()

const extraction = useExtractionStore()
const isTesting = ref(false)

async function testApiKey() {
  if (!props.hasKey || isTesting.value)
    return
  isTesting.value = true
  try {
    const r = await extraction.testApiKeyWithExtraction()
    emit('tested', r)
  }
  finally {
    isTesting.value = false
  }
}
</script>

<template>
  <v-btn
    :disabled="!hasKey"
    variant="tonal"
    color="primary"
    @click="testApiKey"
  >
    <template #prepend>
      <v-progress-circular
        v-if="isTesting"
        size="20"
        width="2"
        indeterminate
      />

      <v-icon
        v-else
        :icon="mdiCheckboxMarkedCircleOutline"
      />
    </template>

    {{ isTesting ? `${$t('testing')}...` : $t('test-api-key') }}
  </v-btn>
</template>
