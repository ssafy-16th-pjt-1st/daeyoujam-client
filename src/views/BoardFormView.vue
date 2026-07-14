<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { createPost } from '../api/posts'
import AppHeader from '../components/common/AppHeader.vue'
import { useProfileStore } from '../stores/profile'

const router = useRouter()
const profileStore = useProfileStore()
const error = ref('')
const categories = ['관광지', '문화시설', '축제공연행사', '여행코스', '레포츠', '숙박', '쇼핑', '음식점', '잡담']
const form = reactive({
  category: '음식점',
  title: '',
  content: '',
  edit_password: ''
})

async function submit() {
  try {
    const post = await createPost({
      ...form,
      nickname: profileStore.nickname
    })
    router.push(`/board/${post.id}`)
  } catch {
    error.value = '게시글을 저장하지 못했어요.'
  }
}
</script>

<template>
  <AppHeader />
  <main class="app-container page-stack">
    <section class="board-head">
      <div>
        <p class="eyebrow">대전 유잼 게시판</p>
        <h1>새 이야기를 남겨주세요.</h1>
      </div>
    </section>
    <form class="board-form" @submit.prevent="submit">
      <input v-model="form.title" required placeholder="제목" />
      <select v-model="form.category">
        <option v-for="category in categories" :key="category">{{ category }}</option>
      </select>
      <textarea v-model="form.content" required placeholder="대전에서 발견한 장소, 팁, 후기를 적어주세요."></textarea>
      <p class="muted">작성자 {{ profileStore.nickname }}</p>
      <input v-model="form.edit_password" required type="password" placeholder="수정/삭제 비밀번호" />
      <p v-if="error" class="notice">{{ error }}</p>
      <button class="primary-button" type="submit">저장</button>
    </form>
  </main>
</template>
