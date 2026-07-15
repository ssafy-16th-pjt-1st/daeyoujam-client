<template>
  <RouterView />
  <AppFooter />
  <GlobalNotification />
</template>

<script setup>
import AppFooter from "./components/common/AppFooter.vue";
import GlobalNotification from "./components/common/GlobalNotification.vue";
</script>
