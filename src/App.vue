<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  // 初始化使用者狀態
  userStore.initializeStore()
})
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
