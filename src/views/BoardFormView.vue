<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createPost, fetchPost, updatePost } from '../api/posts'
import AppHeader from '../components/common/AppHeader.vue'
import { useProfileStore } from '../stores/profile'

const router = useRouter()
const route = useRoute()
const profileStore = useProfileStore()
const error = ref('')
const isLoading = ref(true) // 로딩 상태 추가

const isEditMode = computed(() => !!route.params.postId)

const form = reactive({
  category: '음식점',
  title: '',
  content: '',
  edit_password: ''
})

onMounted(async () => {
  if (isEditMode.value) {
    try {
      const post = await fetchPost(route.params.postId)
      form.category = post.category
      form.title = post.title
      form.content = post.content
    } catch (e) {
      error.value = '글을 불러오지 못했습니다.'
      console.error(e)
    }
  }
  isLoading.value = false // 로딩 완료
})

async function submit() {
  try {
    if (isEditMode.value) {
      await updatePost(route.params.postId, form)
      router.push(`/board/${route.params.postId}`)
    } else {
      const post = await createPost({ ...form, nickname: profileStore.nickname })
      router.push(`/board/${post.id}`)
    }
  } catch {
    error.value = '저장에 실패했습니다. 비밀번호를 확인하세요.'
  }
}
</script>

<template>
  <AppHeader />
  <!-- 로딩 중일 때는 화면을 잠시 숨김 -->
  <main v-if="!isLoading" class="app-container page-stack">
    <section class="board-head">
      <h1>{{ isEditMode ? '이야기를 수정합니다.' : '새 이야기를 남겨주세요.' }}</h1>
    </section>
    <form class="board-form" @submit.prevent="submit">
      <input v-model="form.title" required placeholder="제목" />
      <select v-model="form.category">
        <option v-for="cat in ['관광지', '문화시설', '축제공연행사', '여행코스', '레포츠', '숙박', '쇼핑', '음식점', '잡담']" :key="cat">
          {{ cat }}
        </option>
      </select>
      <textarea v-model="form.content" required placeholder="내용을 입력하세요"></textarea>
      <input v-model="form.edit_password" required type="password" placeholder="수정/삭제 비밀번호" />
      <button class="primary-button" type="submit">{{ isEditMode ? '수정하기' : '저장' }}</button>
    </form>
    <p v-if="error" class="notice">{{ error }}</p>
  </main>
</template>