<template>
  <el-container class="dashboard-container">
    <!-- 側邊欄 -->
    <el-aside :width="isCollapse ? '64px' : '250px'" class="dashboard-aside">
      <div class="logo-container">
        <img src="/vite.svg" alt="Logo" class="logo" v-if="!isCollapse">
        <span v-if="!isCollapse" class="logo-text">校務管理系統</span>
        <el-icon v-else class="logo-icon"><School /></el-icon>
      </div>

      <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :collapse-transition="false"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
      >
        <!-- 學生選單 -->
        <template v-if="userStore.isStudent">
          <el-menu-item index="/dashboard/student/courses">
            <el-icon><Reading /></el-icon>
            <span>課程選擇</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/student/enrollments">
            <el-icon><Notebook /></el-icon>
            <span>我的選課</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/student/grades">
            <el-icon><TrophyBase /></el-icon>
            <span>成績查詢</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/student/profile">
            <el-icon><User /></el-icon>
            <span>個人資料</span>
          </el-menu-item>
        </template>

        <!-- 教師選單 -->
        <template v-if="userStore.isTeacher">
          <el-menu-item index="/dashboard/teacher/classes">
            <el-icon><Collection /></el-icon>
            <span>我的課程</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/teacher/students">
            <el-icon><UserFilled /></el-icon>
            <span>學生名單</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/teacher/grades">
            <el-icon><EditPen /></el-icon>
            <span>成績管理</span>
          </el-menu-item>
        </template>

        <!-- 管理員選單 -->
        <template v-if="userStore.isAdmin">
          <el-menu-item index="/dashboard/admin/users">
            <el-icon><UserFilled /></el-icon>
            <span>使用者管理</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/admin/courses">
            <el-icon><Collection /></el-icon>
            <span>課程管理</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/admin/classes">
            <el-icon><Calendar /></el-icon>
            <span>班級管理</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <!-- 主要內容區 -->
    <el-container>
      <!-- 頂部導覽列 -->
      <el-header class="dashboard-header">
        <div class="header-left">
          <el-icon
              class="collapse-icon"
              @click="toggleCollapse"
              :size="20"
          >
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>

          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首頁</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRouteName">
              {{ currentRouteName }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown class="user-dropdown" @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="avatarUrl">
                {{ userStore.userName.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ userStore.userName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  <div class="dropdown-user-info">
                    <div>{{ userStore.userName }}</div>
                    <div class="user-role">{{ getRoleName(userStore.userRole) }}</div>
                    <div class="user-id">{{ userStore.userId }}</div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item divided command="profile">
                  <el-icon><User /></el-icon>
                  個人資料
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  設定
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  登出
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要內容 -->
      <el-main class="dashboard-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const avatarUrl = ref('')

// 當前選中的選單
const activeMenu = computed(() => route.path)

// 當前路由名稱
const currentRouteName = computed(() => {
  const routeNameMap = {
    'StudentCourses': '課程選擇',
    'StudentEnrollments': '我的選課',
    'StudentGrades': '成績查詢',
    'StudentProfile': '個人資料',
    'TeacherClasses': '我的課程',
    'TeacherStudents': '學生名單',
    'TeacherGrades': '成績管理',
    'AdminUsers': '使用者管理',
    'AdminCourses': '課程管理',
    'AdminClasses': '班級管理'
  }
  return routeNameMap[route.name] || ''
})

// 切換側邊欄摺疊狀態
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 取得角色名稱
const getRoleName = (role) => {
  const roleMap = {
    'STUDENT': '學生',
    'TEACHER': '教師',
    'ADMIN': '管理員'
  }
  return roleMap[role] || role
}

// 處理下拉選單命令
const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      if (userStore.isStudent) {
        router.push('/dashboard/student/profile')
      }
      break
    case 'settings':
      ElMessageBox.alert('設定功能開發中', '提示')
      break
    case 'logout':
      ElMessageBox.confirm('確定要登出嗎？', '提示', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await userStore.logout()
        router.push('/login')
      }).catch(() => {
        // 使用者取消登出
      })
      break
  }
}
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
}

.dashboard-aside {
  background-color: #304156;
  transition: width 0.3s;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b364a;
  color: white;
}

.logo {
  height: 32px;
  width: 32px;
  margin-right: 10px;
}

.logo-text {
  font-size: 16px;
  font-weight: bold;
}

.logo-icon {
  font-size: 24px;
}

.dashboard-header {
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-icon {
  cursor: pointer;
  margin-right: 20px;
  transition: transform 0.3s;
}

.collapse-icon:hover {
  transform: scale(1.1);
}

.breadcrumb {
  margin-left: 10px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  color: #303133;
}

.dropdown-user-info {
  padding: 10px;
  text-align: center;
}

.user-role {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.user-id {
  font-size: 12px;
  color: #909399;
}

.dashboard-main {
  background-color: #f5f7fa;
  padding: 20px;
}

/* 過渡動畫 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>