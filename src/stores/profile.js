import { defineStore } from 'pinia'
import api from '@/api'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
    loading: false,
    error: null,
    successMessage: ''
  }),
  actions: {
    async fetchProfile(userId) {
      this.loading = true
      this.error = null
      try {
        const res = await api.getProfile(userId)
        this.profile = res.data
      } catch (err) {
        this.error = err.message || '取得個人資料失敗'
      } finally {
        this.loading = false
      }
    },
    async updateProfile(userId, profileData) {
      this.loading = true
      this.error = null
      this.successMessage = ''
      try {
        const res = await api.updateProfile(userId, profileData)
        this.profile = res.data
        this.successMessage = '個人資料更新成功'
      } catch (err) {
        this.error = err.message || '個人資料更新失敗'
      } finally {
        this.loading = false
      }
    },
    clearMessages() {
      this.error = null
      this.successMessage = ''
    }
  }
})

