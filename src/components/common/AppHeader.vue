<script setup>
import { useRouter } from 'vue-router'

import { useProfileStore } from '../../stores/profile'

const router = useRouter()
const profileStore = useProfileStore()

function resetProfile() {
  profileStore.reset()
  router.push('/')
}
</script>

<template>
  <header class="app-header">
    <RouterLink class="brand daeyoujam-logo" to="/home">
      <span class="logo-dae">대<span class="logo-jeon">전</span></span><span>유잼</span>
    </RouterLink>
    <nav>
      <RouterLink to="/home">홈</RouterLink>
      <RouterLink to="/board">게시판</RouterLink>
      <button class="nav-reset" type="button" @click="resetProfile">관심사 다시 입력</button>
    </nav>
  </header>
</template>
