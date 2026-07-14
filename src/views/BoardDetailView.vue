<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { createComment, deleteComment, fetchComments, fetchPost } from '../api/posts'
import AppHeader from '../components/common/AppHeader.vue'
import { useProfileStore } from '../stores/profile'

const route = useRoute()
const profileStore = useProfileStore()
const post = ref(null)
const comments = ref([])
const error = ref('')
const commentForm = ref({ content: '', edit_password: '' })

onMounted(async () => {
  try {
    post.value = await fetchPost(route.params.postId)
    comments.value = await fetchComments(route.params.postId)
  } catch {
    error.value = '게시글을 불러오지 못했어요.'
  }
})

async function submitComment() {
  const comment = await createComment(route.params.postId, {
    nickname: profileStore.nickname,
    ...commentForm.value
  })
  comments.value.push(comment)
  commentForm.value = { content: '', edit_password: '' }
}

async function removeComment(comment) {
  const password = window.prompt('댓글 삭제 비밀번호를 입력해 주세요.')
  if (!password) return
  try {
    await deleteComment(route.params.postId, comment.id, password)
    comments.value = comments.value.filter((item) => item.id !== comment.id)
  } catch {
    window.alert('비밀번호가 일치하지 않거나 삭제할 수 없어요.')
  }
}
</script>

<template>
  <AppHeader />
  <main class="app-container page-stack">
    <p v-if="error" class="notice">{{ error }}</p>
    <article v-if="post" class="article-card">
      <p class="eyebrow">{{ post.category }} · {{ post.nickname }} · 조회 {{ post.view_count }}</p>
      <h1>{{ post.title }}</h1>
      <p>{{ post.content }}</p>
      <div class="button-row">
        <button class="outline-button" type="button">수정</button>
        <button class="outline-button" type="button">삭제</button>
      </div>
    </article>
    <section class="article-card">
      <h2>댓글</h2>
      <div v-for="comment in comments" :key="comment.id" class="comment-row">
        <div>
          <strong>{{ comment.nickname }}</strong>
          <p>{{ comment.content }}</p>
        </div>
        <button class="text-button" type="button" @click="removeComment(comment)">삭제</button>
      </div>
      <form class="comment-form" @submit.prevent="submitComment">
        <span class="comment-author">{{ profileStore.nickname }}</span>
        <input v-model="commentForm.content" required placeholder="댓글을 입력하세요" />
        <input v-model="commentForm.edit_password" required type="password" placeholder="비밀번호" />
        <button class="primary-button" type="submit">댓글 작성</button>
      </form>
    </section>
  </main>
</template>
