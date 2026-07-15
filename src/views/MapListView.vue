<script setup>
import { computed, onMounted, ref, shallowRef } from "vue";

import AppHeader from "../components/common/AppHeader.vue";
import CategoryMap from "../components/place/CategoryMap.vue";
import MapSearchBar from "../components/place/MapSearchBar.vue";
import PlaceResultList from "../components/place/PlaceResultList.vue";
import { fetchAllPlaces } from "../api/places";
import { CATEGORY_LIST } from "../constants/categoryColors";
import { filterPlaces, hasValidCoords } from "../utils/placeSearch";

const MAX_LIST = 100;

// 1,300개 배열은 deep 반응형이 불필요하므로 shallowRef로 보관한다.
const places = shallowRef([]);
const loading = shallowRef(true);
const error = shallowRef("");
const query = ref("");
// 표시 중인 카테고리 목록. null이면(지도 준비 전) 필터를 적용하지 않는다.
const visibleCategories = ref(null);
const mapRef = ref(null);

// 지도 범례와 동일한 규칙으로 장소 카테고리를 판별한다.
function categoryOf(place) {
  return CATEGORY_LIST.includes(place.content_type) ? place.content_type : "기타";
}

// 1) 제목 검색(또는 전체) → 2) 표시 중인 카테고리로 필터.
const results = computed(() => {
  const base = query.value.trim()
    ? filterPlaces(places.value, query.value, Infinity)
    : places.value.filter(hasValidCoords);

  if (!visibleCategories.value) {
    return base;
  }
  const visible = new Set(visibleCategories.value);
  return base.filter((place) => visible.has(categoryOf(place)));
});

const visibleResults = computed(() => results.value.slice(0, MAX_LIST));

function handleSelect(place) {
  // level 3으로 줌인 이동. mapy=위도, mapx=경도 순서에 주의.
  mapRef.value?.moveTo(Number(place.mapy), Number(place.mapx), 3);
}

function handleVisibleChange(categories) {
  visibleCategories.value = categories;
}

onMounted(async () => {
  try {
    places.value = await fetchAllPlaces();
  } catch {
    error.value = "장소 목록을 불러오지 못했어요.";
  } finally {
    loading.value = false;
  }
});
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

    <div class="map-content">
      <section class="map-shell">
        <CategoryMap ref="mapRef" :places="places" @visible-change="handleVisibleChange" />
      </section>

      <aside class="map-side">
        <MapSearchBar v-model="query" />
        <PlaceResultList :places="visibleResults" :total="results.length" @select="handleSelect" />
      </aside>
    </div>
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
  color: var(--color-text-muted);
}

.notice {
  margin: 0;
  color: var(--color-text-muted);
}

.map-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 16px;
  height: 70vh;
  min-height: 480px;
}

.map-shell {
  height: 100%;
}

.map-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

@media (max-width: 720px) {
  .map-content {
    grid-template-columns: 1fr;
    height: auto;
  }

  .map-shell {
    height: 60vh;
    min-height: 360px;
  }

  .map-side {
    height: 50vh;
  }
}
</style>
