import { defineStore } from "pinia";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    isOpen: false,
    title: "",
    message: "",
    tone: "info",
  }),
  actions: {
    show({ title = "알림", message = "", tone = "info" } = {}) {
      this.title = title;
      this.message = message;
      this.tone = tone;
      this.isOpen = true;
    },
    close() {
      this.isOpen = false;
    },
  },
});
