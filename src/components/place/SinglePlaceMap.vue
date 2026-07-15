<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { http } from "../../api/http";

const props = defineProps({
  content_id: { type: [Number, String], required: true },
});

const mapContainer = ref(null);
const place = ref(null);
const loading = ref(true);
const error = ref("");

let mapInstance = null;
let markerInstance = null;
let sdkLoadPromise = null;

function ensureKakaoMapsSdk() {
  if (window.kakao?.maps) {
    return Promise.resolve(window.kakao);
  }

  if (!sdkLoadPromise) {
    sdkLoadPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-kakao-maps-sdk="true"]');

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(window.kakao), { once: true });
        existingScript.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY}&autoload=false`;
      script.async = true;
      script.defer = true;
      script.dataset.kakaoMapsSdk = "true";
      script.onload = () => resolve(window.kakao);
      script.onerror = () => reject(new Error("Kakao Maps SDK load failed"));
      document.head.appendChild(script);
    });
  }

  return sdkLoadPromise;
}

function renderMap() {
  if (!place.value || !mapContainer.value || !window.kakao?.maps) {
    return;
  }

  const latitude = parseFloat(place.value.mapy);
  const longitude = parseFloat(place.value.mapx);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    error.value = "위치 정보를 확인할 수 없어 지도를 표시할 수 없어요.";
    return;
  }

  const center = new window.kakao.maps.LatLng(latitude, longitude);

  if (!mapInstance) {
    mapInstance = new window.kakao.maps.Map(mapContainer.value, {
      center,
      level: 3,
    });
  } else {
    mapInstance.setCenter(center);
  }

  if (!markerInstance) {
    markerInstance = new window.kakao.maps.Marker({ position: center });
  } else {
    markerInstance.setPosition(center);
  }

  markerInstance.setMap(mapInstance);
  mapInstance.setCenter(center);
}

async function loadPlaceAndMap() {
  loading.value = true;
  error.value = "";

  try {
    const { data } = await http.get(`/api/places/${props.content_id}`);
    place.value = data;

    await ensureKakaoMapsSdk();
    await nextTick();
    window.kakao.maps.load(() => {
      renderMap();
      loading.value = false;
    });
  } catch (fetchError) {
    error.value = "장소와 지도를 불러오지 못했어요.";
    loading.value = false;
    place.value = null;
    return fetchError;
  }
}

onMounted(loadPlaceAndMap);

watch(
  () => props.content_id,
  () => {
    loadPlaceAndMap();
  },
);

onBeforeUnmount(() => {
  if (markerInstance) {
    markerInstance.setMap(null);
  }
  mapInstance = null;
  markerInstance = null;
});
</script>

<template>
  <div class="single-place-map">
    <div ref="mapContainer" class="map-canvas" aria-label="카카오맵"></div>
    <p v-if="loading" class="status">지도 불러오는 중...</p>
    <p v-else-if="error" class="status error">{{ error }}</p>
  </div>
</template>
