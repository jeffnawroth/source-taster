<script setup lang="ts">
import { mdiClose } from '@mdi/js'
import { computed, onBeforeUnmount, ref, useAttrs, watch } from 'vue'

type AlertVariant = 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain'
type AlertType = 'info' | 'success' | 'warning' | 'error'

const props = withDefaults(defineProps<{
  modelValue: string | null
  type?: AlertType
  variant?: AlertVariant
  timeout?: number
  autoClose?: boolean
  closable?: boolean
}>(), {
  type: 'info',
  variant: 'tonal',
  timeout: 5000,
  autoClose: true,
  closable: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'closed', reason: 'auto' | 'manual'): void
}>()

const attrs = useAttrs()

const isVisible = computed(() => !!props.modelValue)
const showControl = computed(() => props.closable || (props.autoClose && props.timeout > 0))

const timeoutId = ref<number | null>(null)
const frameId = ref<number | null>(null)
const progress = ref(0)
const lastCloseReason = ref<'auto' | 'manual' | null>(null)

const intervalId = ref<NodeJS.Timeout | null>(null)

function clearTimer() {
  if (timeoutId.value !== null) {
    clearTimeout(timeoutId.value)
    timeoutId.value = null
  }
  if (intervalId.value !== null) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
}

function cancelAnimation() {
  if (frameId.value !== null) {
    cancelAnimationFrame(frameId.value)
    frameId.value = null
  }
  if (intervalId.value !== null) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
}

function handleClose(reason: 'auto' | 'manual' = 'manual') {
  if (!isVisible.value)
    return

  clearTimer()
  cancelAnimation()

  lastCloseReason.value = reason

  if (reason === 'auto' && props.autoClose && props.timeout > 0)
    progress.value = 100

  emit('update:modelValue', null)
  emit('closed', reason)
}

function animateProgress() {
  const duration = props.timeout
  const steps = 100
  const stepInterval = duration / steps

  if (!props.autoClose || duration <= 0 || !isVisible.value) {
    return
  }

  progress.value = 0

  intervalId.value = setInterval(() => {
    if (!isVisible.value) {
      clearInterval(intervalId.value!)
      intervalId.value = null
      return
    }

    progress.value += 1

    if (progress.value >= 100) {
      clearInterval(intervalId.value!)
      intervalId.value = null
      progress.value = 100

      setTimeout(() => {
        if (isVisible.value)
          handleClose('auto')
      }, 100)
    }
  }, stepInterval)
}

function resetProgress() {
  cancelAnimation()
  progress.value = 0
}

function beginCountdown() {
  lastCloseReason.value = null
  progress.value = 0

  if (props.autoClose && props.timeout > 0)
    animateProgress()
}

watch(() => props.modelValue, (value) => {
  clearTimer()
  cancelAnimation()

  if (value) {
    beginCountdown()
  }
  else {
    if (lastCloseReason.value === 'auto' && props.autoClose && props.timeout > 0)
      progress.value = 100

    requestAnimationFrame(() => {
      resetProgress()
      lastCloseReason.value = null
    })
  }
}, { immediate: true })

const progressValue = computed(() => {
  if (!props.autoClose || props.timeout <= 0)
    return 100
  return progress.value
})

onBeforeUnmount(() => {
  clearTimer()
  cancelAnimation()
})
</script>

<template>
  <v-expand-transition>
    <div
      v-if="isVisible"
    >
      <v-alert
        v-bind="attrs"
        :type
        :variant
        :closable="false"
      >
        <slot :value="modelValue">
          {{ typeof modelValue === 'string' ? modelValue : '' }}
        </slot>

        <template
          v-if="showControl"
          #append
        >
          <v-btn
            density="comfortable"
            variant="text"
            icon
            :disabled="!props.closable"
            aria-label="Close alert"
            @click.stop="handleClose()"
          >
            <v-progress-circular
              :model-value="progressValue"
              size="24"
              width="3"
            >
              <v-icon
                :icon="mdiClose"
                size="18"
              />
            </v-progress-circular>
          </v-btn>
        </template>
      </v-alert>
    </div>
  </v-expand-transition>
</template>
