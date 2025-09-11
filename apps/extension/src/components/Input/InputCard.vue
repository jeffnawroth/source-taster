<script setup lang="ts">
import { mdiChevronDown, mdiChevronUp } from '@mdi/js'
import { settings } from '@/extension/logic'
import ExtractButton from './ExtractButton.vue'
import FileInput from './FileInput.vue'
import ParseButton from './ParseButton.vue'
import TextInput from './TextInput.vue'

const showInputCard = ref(true)
</script>

<template>
  <v-card
    flat
    :title="`1. ${$t('parse')}`"
    :subtitle="$t('input-references-as-text-or-upload-a-file')"
  >
    <template #append>
      <AIToggleSwitch
        v-model="settings.extract.useAi"
        :show-alert="false"
        :show-description="false"
      />
      <v-btn
        variant="text"
        :icon="showInputCard ? mdiChevronUp : mdiChevronDown"
        @click="showInputCard = !showInputCard"
      />
    </template>
    <v-expand-transition>
      <div v-if="showInputCard">
        <v-card-text
          class="pa-0"
        >
          <v-row dense>
            <!-- File Input -->
            <v-col cols="12">
              <FileInput />
            </v-col>

            <!-- Text Input -->
            <v-col cols="12">
              <TextInput />
            </v-col>

            <v-col cols="6">
              <ParseButton />
            </v-col>
            <!-- Extract Button -->
            <v-col cols="6">
              <ExtractButton />
            </v-col>

            <!-- Parse Button -->
          </v-row>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>
