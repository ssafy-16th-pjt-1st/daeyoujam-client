<script setup>
import { onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import { fetchPosts, togglePostLike } from '../api/posts'
import AppHeader from '../components/common/AppHeader.vue'
import { useProfileStore } from '../stores/profile'

const profileStore = useProfileStore()
const posts = ref([])
const q = ref('')
const selectedCategory = ref('전체')
const error = ref('')
const boardCategories = ['전체', '잡담', '음식점', '관광지', '문화시설', '축제', '쇼핑', '질문']

async function loadPosts() {
  try {
    const category = selectedCategory.value === '전체' ? undefined : selectedCategory.value
    const response = await fetchPosts({ q: q.value, category, guest_id: profileStore.profile?.guestId })
    posts.value = response.items
  } catch {
    error.value = '게시글을 불러오지 못했어요.'
  }
}

async function toggleLike(post) {
  if (!profileStore.profile?.guestId) return
  const result = await togglePostLike(post.id, profileStore.profile.guestId)
  post.like_count = result.like_count
  post.liked_by_viewer = result.liked_by_viewer
}

watch(selectedCategory, loadPosts)
onMounted(loadPosts)
</script>

<template>
  <AppHeader />
  <main class="app-container page-stack">
    <section class="board-head">
      <div>
        <p class="eyebrow">대전 유잼 게시판</p>
        <h1>동네 이야기를 모아봐요.</h1>
      </div>
      <RouterLink class="primary-link" to="/board/new">글쓰기</RouterLink>
    </section>
    <form class="search-bar" @submit.prevent="loadPosts">
      <input v-model="q" placeholder="게시글 제목을 검색하세요" />
      <button type="submit">검색</button>
    </form>
    <div class="board-category-filter" aria-label="게시판 카테고리 필터">
      <button
        v-for="category in boardCategories"
        :key="category"
        type="button"
        :class="{ active: selectedCategory === category }"
        @click="selectedCategory = category"
      >
        {{ category }}
      </button>
    </div>
    <p v-if="error" class="notice">{{ error }}</p>
    <RouterLink v-for="post in posts" :key="post.id" class="post-row" :to="`/board/${post.id}`">
      <div class="post-row-top">
        <span class="badge">{{ post.category }}</span>
        <button
          type="button"
          class="like-button"
          :class="{ liked: post.liked_by_viewer }"
          :aria-pressed="post.liked_by_viewer ? 'true' : 'false'"
          @click.prevent.stop="toggleLike(post)"
        >
          <span aria-hidden="true">♥</span>
          {{ post.like_count || 0 }}
        </button>
      </div>
      <strong>{{ post.title }}</strong>
      <span>{{ post.nickname }} · {{ new Date(post.created_at).toLocaleDateString() }} · 조회 {{ post.view_count }}</span>
      <p>{{ post.content }}</p>
    </RouterLink>
    <p v-if="!posts.length && !error" class="state-box">아직 게시글이 없어요.</p>
  </main>
</template>
