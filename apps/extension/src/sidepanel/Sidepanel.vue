<script></script>

<template>
  <v-app style="height: 100vh; overflow: hidden;">
    <AppBar />
    <v-main :scrollable="false">
      <v-container style="max-height: calc(100vh - 64px - 20px); overflow: hidden; display: flex; flex: 1;">
        <AppCard />
      </v-container>
    </v-main>
    <Footer />
  </v-app>
</template>
