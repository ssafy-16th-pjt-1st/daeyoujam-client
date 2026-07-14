<script setup>
defineProps({
  to: { type: String, default: '/home' }
})
</script>

<template>
  <RouterLink class="brand daeyoujam-logo" :to="to" aria-label="대유잼 홈">
    <span class="logo-mark">
      <span class="logo-dae">대</span>
      <span class="logo-jeon">전</span>
    </span>
    <span class="logo-youjam">유잼</span>
  </RouterLink>
</template>
