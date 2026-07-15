<script setup>
const keyword = defineModel({ type: String, default: "" });

// v-model은 한글 조합(IME) 중 모델 갱신을 보류해 한 음절씩 지연된다.
// :value + @input으로 직접 바인딩해 조합 중에도 즉시 반영한다.
function onInput(event) {
  keyword.value = event.target.value;
}
</script>

<template>
  <input
    :value="keyword"
    type="search"
    class="map-search-input"
    placeholder="장소 이름을 검색하세요"
    aria-label="장소 검색"
    @input="onInput"
  />
</template>

<style scoped>
.map-search-input {
  width: 100%;
  min-height: 48px;
  padding: 0 18px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-soft);
  font-size: 16px;
}

.map-search-input::placeholder {
  color: var(--color-text-muted);
}
</style>
