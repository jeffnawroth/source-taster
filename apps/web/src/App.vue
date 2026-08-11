<script setup lang="ts">
</script>

<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>
        <router-link to="/" class="text-white text-decoration-none">
          Source Taster
        </router-link>
      </v-app-bar-title>
      <v-btn to="/about" text>
        About
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>
