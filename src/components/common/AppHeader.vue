<script setup>
import { useRoute, useRouter } from 'vue-router'

import { useProfileStore } from '../../stores/profile'
import AppLogo from './AppLogo.vue'

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()

function resetProfile() {
  profileStore.reset()
  router.push('/')
}
</script>

<template>
  <header class="app-header">
    <AppLogo />

    <nav class="nav-pill" aria-label="주요 메뉴">
      <RouterLink :class="{ active: route.name === 'home' }" to="/home">Home</RouterLink>
      <RouterLink :class="{ active: String(route.name).startsWith('map') }" to="/map-list">Map</RouterLink>
      <RouterLink :class="{ active: route.name === 'chat' }" to="/chat">Chat</RouterLink>
      <RouterLink :class="{ active: String(route.name).startsWith('board') }" to="/board">Board</RouterLink>
    </nav>

    <button class="header-reset" type="button" @click="resetProfile">취향 재설정</button>
  </header>
</template>
