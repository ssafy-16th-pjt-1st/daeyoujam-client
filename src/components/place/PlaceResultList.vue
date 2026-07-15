<script setup>
defineProps({
  places: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
});

const emit = defineEmits(["select"]);
</script>

<template>
  <div class="place-result-list">
    <p class="result-count">{{ total }}곳</p>

    <ul v-if="places.length" class="result-items" role="listbox">
      <li v-for="place in places" :key="place.id" role="option">
        <button type="button" class="result-item" @click="emit('select', place)">
          <span class="title">{{ place.title }}</span>
          <span class="addr">{{ place.addr1 }}</span>
        </button>
      </li>
    </ul>

    <p v-else class="result-empty">검색 결과가 없습니다.</p>

    <p v-if="total > places.length" class="result-more">상위 {{ places.length }}곳만 표시됩니다.</p>
  </div>
</template>

<style scoped>
.place-result-list {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.result-count {
  margin: 0 0 8px;
  padding: 0 4px;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 700;
}

.result-items {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  align-content: start; /* 항목이 적을 때 남는 공간에 벌어지지 않고 위쪽 정렬 */
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.result-item {
  display: grid;
  gap: 2px;
  width: 100%;
  min-height: 48px;
  padding: 8px 12px;
  text-align: left;
  background: var(--color-bg);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.result-item:hover {
  background: var(--color-surface);
}

.result-item .title {
  color: var(--color-text);
  font-weight: 700;
}

.result-item .addr {
  color: var(--color-text-muted);
  font-size: 13px;
}

.result-empty,
.result-more {
  margin: 8px 0 0;
  padding: 0 4px;
  color: var(--color-text-muted);
  font-size: 13px;
}
</style>
