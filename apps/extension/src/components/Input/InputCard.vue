<script setup lang="ts">
import ExtractButton from './ExtractButton.vue'
import FileInput from './FileInput.vue'
import ParseButton from './ParseButton.vue'
import TextInput from './TextInput.vue'
</script>

<template>
  <v-card
    flat
    :title="`1. ${$t('parse')}`"
    :subtitle="$t('input-references-as-text-or-upload-a-file')"
  >
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

        <!-- Extract Button -->
        <v-col cols="12">
          <ExtractButton />
        </v-col>

        <!-- Parse Button -->
        <v-col cols="12">
          <ParseButton />
        </v-col>

        <!-- Check Button -->
        <!-- <v-col cols="12">
          <CheckButton />
        </v-col> -->
      </v-row>
    </v-card-text>
  </v-card>
</template>
