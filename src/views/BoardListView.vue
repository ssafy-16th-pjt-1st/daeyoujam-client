<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import AppHeader from '../components/common/AppHeader.vue'
import { fetchPosts } from '../api/posts'

const posts = ref([])
const q = ref('')
const error = ref('')

async function loadPosts() {
  try {
    const response = await fetchPosts({ q: q.value })
    posts.value = response.items
  } catch {
    error.value = '게시글을 불러오지 못했어요.'
  }
}

onMounted(loadPosts)
</script>

<template>
  <AppHeader />
  <main class="app-container page-stack">
    <section class="board-head">
      <div>
        <p class="eyebrow">동네 이야기</p>
        <h1>대유잼 게시판</h1>
      </div>
      <RouterLink class="primary-link" to="/board/new">글쓰기</RouterLink>
    </section>
    <form class="search-bar" @submit.prevent="loadPosts">
      <input v-model="q" placeholder="게시글 제목 검색" />
      <button type="submit">검색</button>
    </form>
    <p v-if="error" class="notice">{{ error }}</p>
    <RouterLink v-for="post in posts" :key="post.id" class="post-row" :to="`/board/${post.id}`">
      <span class="badge">{{ post.category }}</span>
      <strong>{{ post.title }}</strong>
      <span>{{ post.nickname }} · {{ new Date(post.created_at).toLocaleDateString() }} · 조회 {{ post.view_count }}</span>
      <p>{{ post.content }}</p>
    </RouterLink>
    <p v-if="!posts.length && !error" class="state-box">아직 게시글이 없어요.</p>
  </main>
</template>
