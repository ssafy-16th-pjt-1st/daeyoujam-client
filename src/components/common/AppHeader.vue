<script setup>
import { useRoute, useRouter } from 'vue-router'

import { useProfileStore } from '../../stores/profile'

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
    <RouterLink class="brand daeyoujam-logo" to="/home" aria-label="대유잼 홈">
      <span class="logo-dae">대<span class="logo-jeon">전</span></span><span>유잼</span>
    </RouterLink>
    <nav class="nav-pill" aria-label="주요 메뉴">
      <RouterLink :class="{ active: route.name === 'home' }" to="/home">Home</RouterLink>
      <RouterLink :class="{ active: route.name === 'chat' }" to="/chat">Chat</RouterLink>
      <RouterLink :class="{ active: String(route.name).startsWith('board') }" to="/board">Board</RouterLink>
    </nav>
    <button class="icon-button" type="button" title="취향 다시 입력" @click="resetProfile">↺</button>
  </header>
</template>
