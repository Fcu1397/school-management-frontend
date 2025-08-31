<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>校務選課管理系統</h1>
        <p>School Course Management System</p>
      </div>

      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          @submit.prevent="handleLogin"
          class="login-form"
      >
        <el-form-item prop="email">
          <el-input
              v-model="loginForm.email"
              placeholder="請輸入 Email"
              prefix-icon="User"
              size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="請輸入密碼"
              prefix-icon="Lock"
              size="large"
              show-password
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.rememberMe">記住我</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              size="large"
              @click="handleLogin"
              :loading="loading"
              style="width: 100%"
          >
            登入
          </el-button>
        </el-form-item>

        <div class="login-footer">
          <router-link to="/register">還沒有帳號？立即註冊</router-link>
        </div>
      </el-form>

      <!-- 測試帳號提示 -->
      <el-card class="demo-accounts">
        <template #header>
          <div class="card-header">
            <span>測試帳號</span>
          </div>
        </template>
        <div class="demo-account-list">
          <div class="demo-account">
            <strong>學生：</strong>
            <span>student1@school.edu / Test1234</span>
          </div>
          <div class="demo-account">
            <strong>教師：</strong>
            <span>teacher1@school.edu / Teacher123</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const rules = {
  email: [
    { required: true, message: '請輸入 Email', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的 Email 格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度至少 6 個字元', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  const valid = await loginFormRef.value.validate()
  if (!valid) return

  loading.value = true

  try {
    const result = await userStore.login(loginForm)

    if (result.success) {
      // 根據角色跳轉到不同頁面
      if (userStore.isStudent) {
        router.push('/dashboard/student/courses')
      } else if (userStore.isTeacher) {
        router.push('/dashboard/teacher/classes')
      } else if (userStore.isAdmin) {
        router.push('/dashboard/admin/users')
      } else {
        router.push('/dashboard')
      }
    } else {
      ElMessage.error(result.message || '登入失敗')
    }
  } catch (error) {
    console.error('登入錯誤:', error)
    ElMessage.error('登入失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.login-header h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

.login-header p {
  font-size: 14px;
  opacity: 0.9;
}

.login-form {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}

.login-footer a {
  color: #409eff;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}

.demo-accounts {
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.95);
}

.demo-account-list {
  font-size: 14px;
}

.demo-account {
  margin-bottom: 10px;
}

.demo-account:last-child {
  margin-bottom: 0;
}

.demo-account strong {
  margin-right: 10px;
}

.demo-account span {
  color: #606266;
}
</style>