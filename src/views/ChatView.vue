<template>
  <AppHeader />
  <main class="app-container page-stack">
    <section class="article-card">
      <p class="eyebrow">AI 동네 가이드</p>
      <h1>대유잼 챗봇</h1>
      <p class="muted">RAG 챗봇 화면입니다. 다음 단계에서 사용자 프로필, 장소 데이터, 게시물/댓글을 근거로 답변하도록 연결합니다.</p>
      <div class="chat-shell">
        <div class="chat-message bot">궁금한 지역, 분위기, 동행 유형을 알려주면 맞춤 장소를 찾아드릴게요.</div>
        <form class="search-bar">
          <input placeholder="예: 유성구에서 연인이랑 갈 만한 야경 카페 추천해줘" />
          <button type="button">전송</button>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup>
import AppHeader from '../components/common/AppHeader.vue'
</script>
