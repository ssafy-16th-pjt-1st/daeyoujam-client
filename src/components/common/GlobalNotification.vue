<script setup>
import { computed } from "vue";

import { useNotificationStore } from "../../stores/notification";

const notificationStore = useNotificationStore();

const toneLabel = computed(() => {
  if (notificationStore.tone === "success") return "완료";
  if (notificationStore.tone === "error") return "확인 필요";
  return "알림";
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="notificationStore.isOpen"
      class="notification-backdrop"
      role="presentation"
      @click.self="notificationStore.close"
    >
      <section
        class="notification-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="global-notification-title"
      >
        <p class="eyebrow">{{ toneLabel }}</p>
        <h2 id="global-notification-title">{{ notificationStore.title }}</h2>
        <p>{{ notificationStore.message }}</p>
        <button class="primary-button" type="button" @click="notificationStore.close">확인</button>
      </section>
    </div>
  </Teleport>
</template>
