<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import AppFooter from "../components/common/AppFooter.vue";
import AppHeader from "../components/common/AppHeader.vue";
import EmptyState from "../components/common/EmptyState.vue";
import LoadingState from "../components/common/LoadingState.vue";
import CategoryChips from "../components/place/CategoryChips.vue";
import PlaceCard from "../components/place/PlaceCard.vue";
import { fetchPlaces, searchPlaces } from "../api/places";
import { fetchRecommendations, fetchRecommendedPosts } from "../api/recommendations";
import { HOME_HERO_SLIDES } from "../constants/slides";
import { useProfileStore } from "../stores/profile";

const profileStore = useProfileStore();
const selectedCategory = ref("전체");
const query = ref("");
const places = ref([]);
const posts = ref([]);
const loading = ref(false);
const error = ref("");
const activeSlide = ref(0);
let slideTimer;

const mockPlaces = [
  {
    id: 1,
    title: "한밭수목원",
    content_type: "관광지",
    addr1: "대전광역시 서구",
    average_rating: 0,
    review_count: 0,
    recommendation_reason: "산책과 사진 촬영 취향에 잘 맞는 넓은 녹지 공간이에요.",
  },
  {
    id: 2,
    title: "성심당 본점",
    content_type: "음식점",
    addr1: "대전광역시 중구",
    average_rating: 0,
    review_count: 0,
    recommendation_reason: "대전 여행에서 빠지기 어려운 대표 맛집이에요.",
  },
];

const profile = computed(() => profileStore.profile || {});
const filteredPlaces = computed(() => places.value);
const currentSlide = computed(() => HOME_HERO_SLIDES[activeSlide.value]);

function goToSlide(index) {
  activeSlide.value = index;
  restartSlideTimer();
}

function nextSlide() {
  activeSlide.value = (activeSlide.value + 1) % HOME_HERO_SLIDES.length;
}

function restartSlideTimer() {
  window.clearInterval(slideTimer);
  slideTimer = window.setInterval(nextSlide, 4200);
}

async function loadPlaces() {
  loading.value = true;
  error.value = "";
  const category = selectedCategory.value === "전체" ? undefined : selectedCategory.value;
  try {
    const response = query.value.trim()
      ? await searchPlaces({ q: query.value.trim(), category, size: 12 })
      : selectedCategory.value === "전체"
        ? await fetchRecommendations({
            age_group: profile.value.ageGroup,
            gender: profile.value.gender,
            district: profile.value.district,
            interests: profile.value.interests || [],
            limit: 12,
          })
        : await fetchPlaces({ category, size: 12 });
    places.value = response.items;
  } catch {
    error.value = "API 연결이 불안정해 예시 데이터를 표시합니다.";
    places.value = mockPlaces;
  } finally {
    loading.value = false;
  }
}

async function loadPosts() {
  try {
    const response = await fetchRecommendedPosts({
      age_group: profile.value.ageGroup,
      gender: profile.value.gender,
      district: profile.value.district,
      interests: profile.value.interests || [],
      limit: 6,
    });
    posts.value = response.items;
  } catch {
    posts.value = [];
  }
}

watch(selectedCategory, loadPlaces);
onMounted(() => {
  loadPlaces();
  loadPosts();
  restartSlideTimer();
});
onBeforeUnmount(() => window.clearInterval(slideTimer));
</script>

<template>
  <AppHeader />
  <main class="app-container page-stack">
    <section class="home-hero airbnb-hero">
      <div class="hero-copy">
        <p class="eyebrow">{{ currentSlide.eyebrow }}</p>
        <h1>{{ currentSlide.title }}</h1>
        <p>{{ currentSlide.description }}</p>

        <form class="search-bar search-bar-pill" @submit.prevent="loadPlaces">
          <label>
            <span>Where</span>
            <input v-model="query" placeholder="장소 검색" />
          </label>
          <button type="submit" aria-label="검색">
            <span aria-hidden="true"></span>
          </button>
        </form>
      </div>

      <div class="hero-stage" :class="`theme-${currentSlide.theme}`">
        <transition name="hero-fade" mode="out-in">
          <img :key="currentSlide.image" :src="currentSlide.image" :alt="currentSlide.imageAlt" />
        </transition>
      </div>

      <div class="hero-dots" aria-label="배너 선택">
        <button
          v-for="(_, index) in HOME_HERO_SLIDES"
          :key="index"
          :class="{ active: activeSlide === index }"
          type="button"
          @click="goToSlide(index)"
        ></button>
      </div>
    </section>

    <section class="personal-note">
      <div>
        <p class="eyebrow">{{ profile.district || profile.city || "대전" }} 기반 추천</p>
        <h2>{{ profile.nickname || "여행자" }}님, 오늘은 어디가 유잼일까요?</h2>
      </div>
      <RouterLink class="outline-button" to="/map-list">지도로 보기</RouterLink>
    </section>

    <section class="tool-strip">
      <CategoryChips v-model="selectedCategory" />
    </section>

    <p v-if="error" class="notice">{{ error }}</p>
    <LoadingState v-if="loading" />
    <EmptyState v-else-if="!filteredPlaces.length" />
    <section v-else class="place-grid">
      <PlaceCard v-for="place in filteredPlaces" :key="place.id" :place="place" />
    </section>

    <section class="section-card feature-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Board</p>
          <h2>지금 보면 좋은 대전 이야기</h2>
        </div>
        <RouterLink class="text-link" to="/board">전체 보기</RouterLink>
      </div>
      <div v-if="posts.length" class="post-grid">
        <RouterLink
          v-for="post in posts"
          :key="post.id"
          class="post-card"
          :to="`/board/${post.id}`"
        >
          <span class="badge">{{ post.category }}</span>
          <strong>{{ post.title }}</strong>
          <p>{{ post.content }}</p>
          <small>{{ post.nickname }} · 조회 {{ post.view_count }}</small>
          <em>{{ post.recommendation_reason }}</em>
        </RouterLink>
      </div>
      <p v-else class="muted">아직 추천할 게시물이 없어요.</p>
    </section>
  </main>
  <RouterLink class="floating-chat" to="/chat" aria-label="AI 추천 챗봇 열기">
    <span class="chat-orb floating-chat-orb" aria-hidden="true">
      <span class="chat-bubble-mark"></span>
    </span>
    <span class="floating-chat-label">AI 추천</span>
  </RouterLink>
  <RouterLink class="floating-write" to="/board/new">글쓰기</RouterLink>
  <AppFooter />
</template>
