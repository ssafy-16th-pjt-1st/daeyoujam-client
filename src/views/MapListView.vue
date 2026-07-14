<script setup>
import { onMounted, shallowRef } from 'vue'

import AppHeader from '../components/common/AppHeader.vue'
import CategoryMap from '../components/place/CategoryMap.vue'
import { fetchAllPlaces } from '../api/places'

// 1,300개 배열은 deep 반응형이 불필요하므로 shallowRef로 보관한다.
const places = shallowRef([])
const loading = shallowRef(true)
const error = shallowRef('')

onMounted(async () => {
  try {
    places.value = await fetchAllPlaces()
  } catch {
    error.value = '장소 목록을 불러오지 못했어요.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppHeader />
  <main class="map-list-layout">
    <div class="map-list-heading">
      <h1>대전·충청 장소 지도</h1>
      <p>카테고리 색상으로 구분된 전체 장소를 지도에서 살펴보세요.</p>
    </div>

    <p v-if="error" class="notice">{{ error }}</p>
    <p v-else-if="loading" class="notice">장소를 불러오는 중...</p>

    <section class="map-shell">
      <CategoryMap :places="places" />
    </section>
  </main>
</template>

<style scoped>
.map-list-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.map-list-heading h1 {
  margin: 0 0 4px;
}

.map-list-heading p {
  margin: 0;
  color: #6b7280;
}

.notice {
  margin: 0;
  color: #6b7280;
}

.map-shell {
  height: 70vh;
  min-height: 480px;
}
</style>
