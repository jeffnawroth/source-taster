<script setup lang="ts">
// Navigation
const drawer = ref(true)
</script>

<template>
  <v-app>
    <AppBar
      v-model="drawer"
      hide-settings
      show-nav-bar-icon
    />
    <NavigationBar v-model="drawer" />
    <v-main>
      <RouterView />
    </v-main>
    <Footer />
  </v-app>
</template>
