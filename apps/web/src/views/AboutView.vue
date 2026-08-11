<script setup lang="ts">
</script>

<template>
  <v-row justify="center">
    <v-col cols="12" md="8">
      <h1 class="text-h4 mb-4">
        {{ $t('about.title') }}
      </h1>
      <p class="text-body-1 mb-3">
        {{ $t('about.webIntro') }}
      </p>
      <p class="text-body-1 mb-3">
        {{ $t('about.extensionIntro') }}
      </p>
      <p class="text-body-1 mb-6">
        {{ $t('about.privacy') }}
      </p>
      <v-btn color="primary" href="https://chromewebstore.google.com/detail/the-source-taster/leggmjghcbdfilhfkgnllhnhhbalpanp" target="_blank" rel="noopener" class="mr-3">
        {{ $t('about.extensionLink') }}
      </v-btn>
      <v-btn variant="tonal" href="https://sourcetaster.com" target="_blank" rel="noopener" class="mr-3">
        {{ $t('about.landingLink') }}
      </v-btn>
      <v-btn variant="tonal" href="https://sourcetaster.github.io/source-taster/" target="_blank" rel="noopener">
        {{ $t('about.docsLink') }}
      </v-btn>
    </v-col>
  </v-row>
</template>
