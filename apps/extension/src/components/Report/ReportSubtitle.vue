<script setup lang="ts">
import { mdiAlertCircleOutline, mdiCheckCircleOutline, mdiCloseCircleOutline, mdiMagnify } from '@mdi/js'
import { useReferencesStore } from '@/extension/stores/references'

const { statusCounts } = storeToRefs(useReferencesStore())

// Actions for better user interaction
// const referencesStore = useReferencesStore()

// function handleVerificationAction() {
//   // Re-verify all references
//   referencesStore.extractAndVerifyReferences()
// }

// const showQuickActions = computed(() => {
//   return statusCounts.value.notVerified > 0 || statusCounts.value.error > 0
// })
</script>

<template>
  <div class="reference-summary">
    <!-- Detailed Status Chips -->
    <v-row
      no-gutters
      density="compact"
    >
      <!-- Total Found -->
      <v-col cols="auto">
        <v-tooltip :text="$t('found-references-tooltip')">
          <template #activator="{ props }">
            <v-chip
              label
              :prepend-icon="mdiMagnify"
              v-bind="props"
              variant="tonal"
              density="compact"
              color="blue"
              class="mx-1"
            >
              {{ statusCounts.total }} {{ $t('found') }}
            </v-chip>
          </template>
        </v-tooltip>
      </v-col>

      <!-- Matched -->
      <v-col cols="auto">
        <v-tooltip :text="$t('verified-references-tooltip')">
          <template #activator="{ props }">
            <v-chip
              label
              :prepend-icon="mdiCheckCircleOutline"
              v-bind="props"
              variant="tonal"
              density="compact"
              color="success"
              class="mx-1"
            >
              {{ statusCounts.matched }} {{ $t('verified') }}
            </v-chip>
          </template>
        </v-tooltip>
      </v-col>

      <!-- Not Matched -->
      <v-col
        v-if="statusCounts.notMatched > 0"
        cols="auto"
      >
        <v-tooltip :text="$t('unverified-references-tooltip')">
          <template #activator="{ props }">
            <v-chip
              label
              :prepend-icon="mdiAlertCircleOutline"
              v-bind="props"
              variant="tonal"
              density="compact"
              color="warning"
              class="mx-1"
            >
              {{ statusCounts.notMatched }} {{ $t('unverified') }}
            </v-chip>
          </template>
        </v-tooltip>
      </v-col>

      <!-- Errors -->
      <v-col
        v-if="statusCounts.error > 0"
        cols="auto"
      >
        <v-tooltip :text="$t('error-references-tooltip')">
          <template #activator="{ props }">
            <v-chip
              label
              :prepend-icon="mdiCloseCircleOutline"
              v-bind="props"
              variant="tonal"
              density="compact"
              color="error"
              class="mx-1"
            >
              {{ statusCounts.error }} {{ $t('error') }}
            </v-chip>
          </template>
        </v-tooltip>
      </v-col>
      <!-- <v-col
        v-if="showQuickActions"
      >
        <v-btn
          variant="outlined"
          color="primary"
          density="compact"
          @click="handleVerificationAction"
        >
          {{ $t('retry-verification') }}
        </v-btn>
      </v-col> -->
    </v-row>

    <!-- Quick Actions -->
  </div>
</template>

<style scoped>
.reference-summary .v-progress-linear {
  transition: all 0.3s ease-in-out;
}

.reference-summary .v-chip {
  transition: all 0.2s ease-in-out;
  font-weight: 500;
}

.reference-summary .v-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
