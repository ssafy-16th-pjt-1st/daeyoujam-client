<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, shallowRef, watch } from "vue";
import { useRouter } from "vue-router";

import { CATEGORY_LIST, DEFAULT_COLOR, colorOf } from "../../constants/categoryColors";
import { clusterStyles, getMarkerImage } from "../../utils/markerFactory";
import { loadKakaoMaps } from "../../utils/kakaoLoader";

const props = defineProps({
  places: { type: Array, default: () => [] },
});

const emit = defineEmits(["visible-change"]);

const router = useRouter();

const mapContainer = shallowRef(null);
const status = shallowRef("loading"); // 'loading' | 'ready' | 'error'
const errorMessage = shallowRef("");

// 범례 표시용 카테고리별 개수 + 표시 여부(작은 객체라 reactive 사용).
const legend = reactive([]);

const allVisible = computed(() => legend.length > 0 && legend.every((item) => item.visible));

// kakao 관련 인스턴스는 반응형 추적이 불필요하므로 setup 스코프 변수로 보관한다.
// (1,300개 배열/마커를 deep watch 하지 않기 위함)
let kakao = null;
let map = null;
// content_type -> { color, markers: kakao.maps.Marker[], clusterer }
const groups = new Map();

// 현재 표시 중인 카테고리 목록을 부모로 알린다(우측 검색 리스트 필터용).
function emitVisible() {
  emit(
    "visible-change",
    legend.filter((item) => item.visible).map((item) => item.category),
  );
}

// 좌표 파싱은 로드 직후 1회만 수행한다(렌더 루프 밖).
function buildMarkers() {
  const grouped = new Map();

  for (const place of props.places) {
    const lng = Number(place.mapx);
    const lat = Number(place.mapy);
    if (Number.isNaN(lat) || Number.isNaN(lng) || lat === 0 || lng === 0) {
      continue;
    }

    const category = CATEGORY_LIST.includes(place.content_type) ? place.content_type : "기타";
    const color = category === "기타" ? DEFAULT_COLOR : colorOf(category);
    const image = getMarkerImage(kakao, color);

    const marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(lat, lng), // 위도, 경도 순
      image,
      title: place.title,
    });
    kakao.maps.event.addListener(marker, "click", () => {
      router.push(`/map/${place.id}`);
    });

    if (!grouped.has(category)) {
      grouped.set(category, { color, markers: [] });
    }
    grouped.get(category).markers.push(marker);
  }

  return grouped;
}

function createClusterers(grouped) {
  for (const [category, { color, markers }] of grouped) {
    // 카테고리별 클러스터러 분리 → 클러스터에도 카테고리 색상을 입힌다.
    const clusterer = new kakao.maps.MarkerClusterer({
      map,
      averageCenter: true,
      minLevel: 5, // 이 레벨 이상(저줌)에서만 클러스터링, 확대하면 개별 마커로 분해
      gridSize: 100, // 저줌에서 확실히 뭉치도록 넉넉히
      disableClickZoom: false,
      styles: clusterStyles(color),
    });
    clusterer.addMarkers(markers); // 개별 addMarker 반복 대신 일괄 추가

    groups.set(category, { color, markers, clusterer });
    legend.push({ category, color, count: markers.length, visible: true });
  }
  emitVisible(); // 초기 표시 상태 통지
}

function clearClusterers() {
  for (const { clusterer } of groups.values()) {
    clusterer.clear();
    clusterer.setMap(null);
  }
  groups.clear();
  legend.splice(0, legend.length);
}

// 범례 클릭 = 카테고리 필터. 전량 파괴/재생성 없이 해당 클러스터러만
// clear() / addMarkers()로 토글한다.
function setCategoryVisible(item, visible) {
  const group = groups.get(item.category);
  if (!group || item.visible === visible) {
    return;
  }
  item.visible = visible;
  if (visible) {
    group.clusterer.addMarkers(group.markers);
  } else {
    group.clusterer.clear();
  }
  emitVisible(); // 변경 통지
}

function toggleCategory(item) {
  setCategoryVisible(item, !item.visible);
}

// 전체 카테고리를 한 번에 켜거나 끈다. 하나라도 꺼져 있으면 전체 켜기로 동작.
function toggleAll() {
  const turnOn = legend.some((item) => !item.visible);
  for (const item of legend) {
    setCategoryVisible(item, turnOn);
  }
}

// 지정 좌표로 이동한다. level이 작을수록 확대된다(검색 선택 시 줌인용).
function moveTo(lat, lng, level = 4) {
  if (!map) {
    return;
  }
  map.setLevel(level);
  map.setCenter(new kakao.maps.LatLng(lat, lng));
}

defineExpose({ moveTo });

function renderMap() {
  if (!mapContainer.value) {
    return;
  }
  map = new kakao.maps.Map(mapContainer.value, {
    center: new kakao.maps.LatLng(36.3505, 127.3848), // 대전광역시청 기준 고정 중심
    level: 9,
  });

  const grouped = buildMarkers();
  createClusterers(grouped);
  status.value = "ready";
}

async function initialize() {
  try {
    kakao = await loadKakaoMaps();
    renderMap();
  } catch (error) {
    status.value = "error";
    errorMessage.value = error?.message || "지도를 불러오지 못했어요.";
  }
}

onMounted(initialize);

// deep watch 금지: 배열 참조가 교체될 때(로드 완료 시 1회)만 재구성한다.
watch(
  () => props.places,
  () => {
    if (!map) {
      return;
    }
    clearClusterers();
    createClusterers(buildMarkers());
  },
);

onBeforeUnmount(() => {
  clearClusterers();
  // 마커 클릭 리스너는 마커 파괴와 함께 해제되고, map/kakao 참조를 끊어 누수를 막는다.
  map = null;
  kakao = null;
});
</script>

<template>
  <div class="category-map">
    <div ref="mapContainer" class="map-canvas" aria-label="카테고리 지도"></div>

    <div v-if="legend.length" class="legend" aria-label="카테고리 토글">
      <div class="legend-head">
        <span class="legend-title">카테고리</span>
        <button type="button" class="toggle-all" @click="toggleAll">
          {{ allVisible ? "전체 끄기" : "전체 켜기" }}
        </button>
      </div>
      <ul class="legend-list">
        <li v-for="item in legend" :key="item.category">
          <button
            type="button"
            class="legend-item"
            :class="{ off: !item.visible }"
            role="switch"
            :aria-checked="item.visible"
            @click="toggleCategory(item)"
          >
            <span class="swatch" :style="{ background: item.color }"></span>
            <span class="label">{{ item.category }}</span>
            <span class="count">{{ item.count }}</span>
            <span class="switch" :class="{ on: item.visible }" aria-hidden="true"></span>
          </button>
        </li>
      </ul>
    </div>

    <p v-if="status === 'loading'" class="status">지도 불러오는 중...</p>
    <p v-else-if="status === 'error'" class="status error">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.category-map {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-canvas {
  width: 100%;
  height: 100%;
  min-height: 480px;
  border-radius: 12px;
  overflow: hidden;
}

.legend {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 176px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
  max-height: 70%;
  overflow-y: auto;
}

.legend-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  padding: 0 2px 6px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.legend-title {
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
}

.toggle-all {
  border: none;
  background: transparent;
  padding: 2px 4px;
  font-size: 12px;
  color: #2d7dd2;
  cursor: pointer;
}

.toggle-all:hover {
  text-decoration: underline;
}

.legend-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 4px 6px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: #1f2937;
}

.legend-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.legend-item.off .label,
.legend-item.off .count {
  opacity: 0.45;
}

.legend-item.off .swatch {
  filter: grayscale(1);
  opacity: 0.45;
}

.swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-item .label {
  flex: 1;
  text-align: left;
  white-space: nowrap;
}

.legend-item .count {
  color: #6b7280;
  font-variant-numeric: tabular-nums;
}

/* on/off 스위치 */
.legend-item .switch {
  position: relative;
  width: 26px;
  height: 15px;
  flex-shrink: 0;
  border-radius: 999px;
  background: #cbd5e1;
  transition: background 0.15s ease;
}

.legend-item .switch::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s ease;
}

.legend-item .switch.on {
  background: #12a150;
}

.legend-item .switch.on::after {
  transform: translateX(11px);
}

.status {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 8px;
  color: #374151;
}

.status.error {
  color: #d83b18;
}
</style>
