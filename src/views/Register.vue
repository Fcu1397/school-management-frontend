<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>註冊新帳號</h1>
        <p>加入校務選課管理系統</p>
      </div>

      <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="rules"
          @submit.prevent="handleRegister"
          class="register-form"
          label-width="100px"
      >
        <el-form-item label="身份" prop="roleName">
          <el-radio-group v-model="registerForm.roleName">
            <el-radio label="STUDENT">學生</el-radio>
            <el-radio label="TEACHER">教師</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input
              v-model="registerForm.email"
              placeholder="請輸入 Email"
              @blur="checkEmailExists"
          />
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input
              v-model="registerForm.name"
              placeholder="請輸入姓名"
          />
        </el-form-item>

        <!-- 學生專用欄位 -->
        <el-form-item
            v-if="registerForm.roleName === 'STUDENT'"
            label="學號"
            prop="studentId"
        >
          <el-input
              v-model="registerForm.studentId"
              placeholder="例：B10901001"
              @blur="checkStudentIdExists"
          />
        </el-form-item>

        <!-- 教師專用欄位 -->
        <el-form-item
            v-if="registerForm.roleName === 'TEACHER'"
            label="教職員編號"
            prop="teacherId"
        >
          <el-input
              v-model="registerForm.teacherId"
              placeholder="例：T123456"
              @blur="checkTeacherIdExists"
          />
        </el-form-item>

        <el-form-item label="系所" prop="department">
          <el-select
              v-model="registerForm.department"
              placeholder="請選擇系所"
              style="width: 100%"
          >
            <el-option label="資訊工程系" value="資訊工程系" />
            <el-option label="電機工程系" value="電機工程系" />
            <el-option label="機械工程系" value="機械工程系" />
            <el-option label="企業管理系" value="企業管理系" />
            <el-option label="財務金融系" value="財務金融系" />
          </el-select>
        </el-form-item>

        <el-form-item label="密碼" prop="password">
          <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="請輸入密碼（至少8個字元）"
              show-password
          />
        </el-form-item>

        <el-form-item label="確認密碼" prop="confirmPassword">
          <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="請再次輸入密碼"
              show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              @click="handleRegister"
              :loading="loading"
              style="width: 100%"
          >
            註冊
          </el-button>
        </el-form-item>

        <div class="register-footer">
          <router-link to="/login">已有帳號？立即登入</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import api from '@/api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const registerFormRef = ref()
const loading = ref(false)

const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  roleName: 'STUDENT',
  studentId: '',
  teacherId: '',
  department: ''
})

// 動態驗證規則
const rules = computed(() => {
  const baseRules = {
    roleName: [
      { required: true, message: '請選擇身份', trigger: 'change' }
    ],
    email: [
      { required: true, message: '請輸入 Email', trigger: 'blur' },
      { type: 'email', message: '請輸入正確的 Email 格式', trigger: 'blur' }
    ],
    name: [
      { required: true, message: '請輸入姓名', trigger: 'blur' },
      { min: 2, max: 50, message: '姓名長度在 2 到 50 個字元', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '請輸入密碼', trigger: 'blur' },
      { min: 8, max: 20, message: '密碼長度在 8 到 20 個字元', trigger: 'blur' },
      {
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
        message: '密碼必須包含大小寫字母和數字',
        trigger: 'blur'
      }
    ],
    confirmPassword: [
      { required: true, message: '請確認密碼', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== registerForm.password) {
            callback(new Error('兩次輸入的密碼不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ],
    department: [
      { required: true, message: '請選擇系所', trigger: 'change' }
    ]
  }

  // 根據角色添加特定規則
  if (registerForm.roleName === 'STUDENT') {
    baseRules.studentId = [
      { required: true, message: '請輸入學號', trigger: 'blur' },
      {
        pattern: /^[A-Z]\d{8}$/,
        message: '學號格式不正確（例：B10901001）',
        trigger: 'blur'
      }
    ]
  } else if (registerForm.roleName === 'TEACHER') {
    baseRules.teacherId = [
      { required: true, message: '請輸入教職員編號', trigger: 'blur' },
      {
        pattern: /^T\d{6}$/,
        message: '教職員編號格式不正確（例：T123456）',
        trigger: 'blur'
      }
    ]
  }

  return baseRules
})

// 檢查 Email 是否已存在
const checkEmailExists = async () => {
  if (!registerForm.email) return

  try {
    const response = await api.checkEmail(registerForm.email)
    if (response.data.exists) {
      ElMessage.warning('此 Email 已被註冊')
    }
  } catch (error) {
    console.error('檢查 Email 失敗:', error)
  }
}

// 檢查學號是否已存在
const checkStudentIdExists = async () => {
  if (!registerForm.studentId) return

  try {
    const response = await api.checkStudentId(registerForm.studentId)
    if (response.data.exists) {
      ElMessage.warning('此學號已被註冊')
    }
  } catch (error) {
    console.error('檢查學號失敗:', error)
  }
}

// 檢查教職員編號是否已存在
const checkTeacherIdExists = async () => {
  if (!registerForm.teacherId) return

  try {
    const response = await api.checkTeacherId(registerForm.teacherId)
    if (response.data.exists) {
      ElMessage.warning('此教職員編號已被註冊')
    }
  } catch (error) {
    console.error('檢查教職員編號失敗:', error)
  }
}

// 處理註冊
const handleRegister = async () => {
  const valid = await registerFormRef.value.validate()
  if (!valid) return

  loading.value = true

  try {
    const result = await userStore.register(registerForm)

    if (result.success) {
      ElMessage.success('註冊成功！請登入')
      router.push('/login')
    } else {
      ElMessage.error(result.message || '註冊失敗')
    }
  } catch (error) {
    console.error('註冊錯誤:', error)
    ElMessage.error('註冊失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 600px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.register-header h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

.register-header p {
  font-size: 14px;
  opacity: 0.9;
}

.register-form {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-footer {
  text-align: center;
  margin-top: 20px;
}

.register-footer a {
  color: #409eff;
  text-decoration: none;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>