<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  createComment,
  deleteComment,
  deletePost,
  fetchComments,
  fetchPostWithParams,
  togglePostLike,
  verifyPostPassword,
} from "../api/posts";
import AppHeader from "../components/common/AppHeader.vue";
import { useNotificationStore } from "../stores/notification";
import { useProfileStore } from "../stores/profile";

const route = useRoute();
const router = useRouter();
const profileStore = useProfileStore();
const notificationStore = useNotificationStore();

const post = ref(null);
const comments = ref([]);
const error = ref("");
const commentForm = ref({ content: "", edit_password: "" });

function notifySuccess(message, title = "완료되었습니다") {
  notificationStore.show({ title, message, tone: "success" });
}

function notifyError(message, title = "처리하지 못했습니다") {
  notificationStore.show({ title, message, tone: "error" });
}

async function loadPostDetail() {
  try {
    post.value = await fetchPostWithParams(route.params.postId, {
      guest_id: profileStore.profile?.guestId,
    });
    comments.value = await fetchComments(route.params.postId);
  } catch {
    error.value = "게시글을 불러오지 못했습니다.";
  }
}

async function removePost() {
  const password = window.prompt("삭제 비밀번호를 입력해 주세요.");
  if (!password) return;

  try {
    await deletePost(route.params.postId, password);
    notifySuccess("게시글이 삭제되었습니다.");
    router.push("/board");
  } catch {
    notifyError("비밀번호가 일치하지 않거나 삭제할 수 없습니다.");
  }
}

async function toggleLike() {
  if (!post.value) return;

  if (!profileStore.profile?.guestId) {
    notifyError("닉네임을 먼저 등록해 주세요.");
    return;
  }

  try {
    const result = await togglePostLike(post.value.id, profileStore.profile.guestId);
    post.value.like_count = result.like_count;
    post.value.liked_by_viewer = result.liked_by_viewer;
  } catch {
    notifyError("좋아요를 처리하지 못했습니다.");
  }
}

async function goToEdit() {
  const password = window.prompt("수정 비밀번호를 입력해 주세요.");
  if (!password) return;

  try {
    await verifyPostPassword(route.params.postId, password);
    router.push(`/board/${route.params.postId}/edit`);
  } catch {
    notifyError("비밀번호가 일치하지 않습니다.");
  }
}

async function submitComment() {
  try {
    const comment = await createComment(route.params.postId, {
      nickname: profileStore.nickname,
      ...commentForm.value,
    });
    comments.value.push(comment);
    commentForm.value = { content: "", edit_password: "" };
    notifySuccess("댓글이 등록되었습니다.");
  } catch {
    notifyError("댓글 내용과 비밀번호를 확인해 주세요.");
  }
}

async function removeComment(comment) {
  const password = window.prompt("댓글 삭제 비밀번호를 입력해 주세요.");
  if (!password) return;

  try {
    await deleteComment(route.params.postId, comment.id, password);
    comments.value = comments.value.filter((item) => item.id !== comment.id);
    notifySuccess("댓글이 삭제되었습니다.");
  } catch {
    notifyError("비밀번호가 일치하지 않거나 삭제할 수 없습니다.");
  }
}

onMounted(loadPostDetail);
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
        <button
          class="like-button"
          :class="{ liked: post.liked_by_viewer }"
          type="button"
          :aria-pressed="post.liked_by_viewer ? 'true' : 'false'"
          @click="toggleLike"
        >
          <span aria-hidden="true">♥</span>
          {{ post.like_count || 0 }}
        </button>
        <button class="outline-button" type="button" @click="goToEdit">수정</button>
        <button class="outline-button" type="button" @click="removePost">삭제</button>
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
        <input v-model="commentForm.content" required placeholder="댓글을 입력하세요." />
        <input v-model="commentForm.edit_password" required type="password" placeholder="비밀번호" />
        <button class="primary-button" type="submit">댓글 작성</button>
      </form>
    </section>
  </main>
</template>
