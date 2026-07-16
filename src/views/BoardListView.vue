<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import { fetchPosts, togglePostLike } from '../api/posts'
import AppHeader from '../components/common/AppHeader.vue'
import { useProfileStore } from '../stores/profile'

const profileStore = useProfileStore()
const posts = ref([])
const q = ref('')
const selectedCategory = ref('전체')
const selectedSort = ref('recent')
const error = ref('')
const page = ref(1)
const pageSize = 10
const total = ref(0)
const boardCategories = ['전체', '잡담', '음식점', '관광지', '문화시설', '축제', '쇼핑', '질문']
const sortOptions = [
  { value: 'recent', label: '최근순' },
  { value: 'likes', label: '좋아요순' },
  { value: 'views', label: '조회수순' },
]

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const visiblePages = computed(() => {
  const start = Math.max(1, page.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

async function loadPosts() {
  try {
    error.value = ''
    const category = selectedCategory.value === '전체' ? undefined : selectedCategory.value
    const response = await fetchPosts({
      q: q.value,
      category,
      page: page.value,
      limit: pageSize,
      sort: selectedSort.value,
      guest_id: profileStore.profile?.guestId,
    })
    posts.value = response.items
    total.value = response.total
    if (page.value > totalPages.value) {
      page.value = totalPages.value
      await loadPosts()
    }
  } catch {
    error.value = '게시글을 불러오지 못했어요.'
  }
}

function searchPosts() {
  page.value = 1
  loadPosts()
}

function goToPage(nextPage) {
  if (nextPage < 1 || nextPage > totalPages.value || nextPage === page.value) return
  page.value = nextPage
  loadPosts()
}

async function toggleLike(post) {
  if (!profileStore.profile?.guestId) return
  const result = await togglePostLike(post.id, profileStore.profile.guestId)
  post.like_count = result.like_count
  post.liked_by_viewer = result.liked_by_viewer
}

watch([selectedCategory, selectedSort], () => {
  page.value = 1
  loadPosts()
})
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
    <form class="search-bar" @submit.prevent="searchPosts">
      <input v-model="q" placeholder="게시글 제목을 검색하세요" />
      <button type="submit">검색</button>
    </form>
    <div class="board-filter-row">
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
      <label class="board-sort-select">
        <span>정렬</span>
        <select v-model="selectedSort" aria-label="게시글 정렬">
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
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
      <span>{{ post.nickname }} · {{ new Date(post.created_at).toLocaleDateString() }} · 조회 {{ post.view_count }} · 좋아요 {{ post.like_count || 0 }}</span>
      <p>{{ post.content }}</p>
    </RouterLink>
    <p v-if="!posts.length && !error" class="state-box">아직 게시글이 없어요.</p>
    <nav v-if="totalPages > 1" class="pagination" aria-label="게시글 페이지">
      <button type="button" :disabled="page === 1" @click="goToPage(page - 1)">이전</button>
      <button
        v-for="pageNumber in visiblePages"
        :key="pageNumber"
        type="button"
        :class="{ active: page === pageNumber }"
        :aria-current="page === pageNumber ? 'page' : undefined"
        @click="goToPage(pageNumber)"
      >
        {{ pageNumber }}
      </button>
      <button type="button" :disabled="page === totalPages" @click="goToPage(page + 1)">다음</button>
    </nav>
  </main>
</template>
