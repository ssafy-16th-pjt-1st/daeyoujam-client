import { defineStore } from 'pinia'

const STORAGE_KEY = 'localhub-profile'

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null
  } catch {
    return null
  }
}

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: loadProfile()
  }),
  getters: {
    isCompleted: (state) => Boolean(state.profile?.onboardingCompleted),
    nickname: (state) => state.profile?.nickname || '여행자'
  },
  actions: {
    save(payload) {
      const profile = {
        guestId: this.profile?.guestId || crypto.randomUUID(),
        ...payload,
        onboardingCompleted: true
      }
      this.profile = profile
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    },
    reset() {
      this.profile = null
      localStorage.removeItem(STORAGE_KEY)
    }
  }
})
