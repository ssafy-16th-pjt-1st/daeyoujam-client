<script setup>
const model = defineModel({ type: String, default: '전체' })
const categories = ['전체', '관광지', '문화시설', '축제공연행사', '여행코스', '레포츠', '숙박', '쇼핑', '음식점']
</script>

<template>
  <div class="chip-row" aria-label="카테고리">
    <button
      v-for="category in categories"
      :key="category"
      class="chip"
      :class="{ selected: model === category }"
      type="button"
      @click="model = category"
    >
      {{ category }}
    </button>
  </div>
</template>

