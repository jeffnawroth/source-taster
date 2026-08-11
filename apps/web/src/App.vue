<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)
const themeLabel = computed(() => (isDark.value ? 'Light mode' : 'Dark mode'))

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" dark flat>
      <v-app-bar-title>
        <router-link to="/" class="text-white text-decoration-none d-flex align-center ga-2">
          <v-icon icon="mdi-book-search" />
          {{ $t('app.title') }}
        </router-link>
      </v-app-bar-title>
      <v-btn to="/" text>
        {{ $t('nav.home') }}
      </v-btn>
      <v-btn to="/results" text>
        {{ $t('nav.results') }}
      </v-btn>
      <v-btn to="/about" text>
        {{ $t('nav.about') }}
      </v-btn>
      <v-btn icon :title="themeLabel" @click="toggleTheme">
        <v-icon>{{ isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>

    <v-footer app color="primary-dark" dark>
      <v-col class="text-center">
        <a href="https://sourcetaster.com" class="text-white">sourcetaster.com</a> ·
        <a href="https://github.com/jeffnawroth/source-taster" class="text-white">GitHub</a> ·
        {{ $t('app.tagline') }}
      </v-col>
    </v-footer>
  </v-app>
</template>
