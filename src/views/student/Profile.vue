<template>
  <el-card class="profile-card" v-loading="loading">
    <template #header>
      <div class="card-header">
        <span>個人資料管理</span>
      </div>
    </template>

    <!-- 成功/錯誤訊息 -->
    <el-alert v-if="successMessage" :title="successMessage" type="success" show-icon class="mb-4" />
    <el-alert v-if="error" :title="error" type="error" show-icon class="mb-4" />

    <!-- 資料檢視區 -->
    <div v-if="!editMode && profile">
      <el-descriptions :column="2" border>
        <template #extra>
          <el-button type="primary" @click="onEdit">編輯</el-button>
          <el-button @click="reload">重新載入</el-button>
        </template>

        <el-descriptions-item label="頭像">
          <el-avatar :size="80" :src="profile.profilePicture" />
        </el-descriptions-item>
        <el-descriptions-item label="姓名">{{ profile.fullName || '未填寫' }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ profile.roleName }}</el-descriptions-item>
        <el-descriptions-item label="Email">{{ profile.email }}</el-descriptions-item>
        <el-descriptions-item label="電話">{{ profile.phone || '未填寫' }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ profile.address || '未填寫' }}</el-descriptions-item>
        <el-descriptions-item label="生日">{{ profile.birthDate || '未填寫' }}</el-descriptions-item>
        <el-descriptions-item label="性別">{{ profile.gender || '未填寫' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 編輯表單 -->
    <el-form v-if="editMode && profile" :model="form" label-width="80px" @submit.prevent="onSave">
      <el-form-item label="頭像 URL">
        <el-input v-model="form.profilePicture" placeholder="請輸入圖片 URL" />
      </el-form-item>
      <el-form-item label="Email" :error="errors.email" required>
        <el-input v-model="form.email" type="email" />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="form.fullName" />
      </el-form-item>
      <el-form-item label="電話" :error="errors.phone">
        <el-input v-model="form.phone" />
      </el-form-item>
      <el-form-item label="地址">
        <el-input v-model="form.address" />
      </el-form-item>
      <el-form-item label="生日" :error="errors.birthDate">
        <el-date-picker v-model="form.birthDate" type="date" placeholder="選擇日期" value-format="YYYY-MM-DD" style="width: 100%" />
      </el-form-item>
      <el-form-item label="性別">
        <el-select v-model="form.gender" placeholder="請選擇">
          <el-option label="男" value="男" />
          <el-option label="女" value="女" />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSave">儲存</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { storeToRefs } from 'pinia'
import { ElCard, ElAlert, ElDescriptions, ElDescriptionsItem, ElAvatar, ElButton, ElForm, ElFormItem, ElInput, ElDatePicker, ElSelect, ElOption } from 'element-plus'

// 假設 userId 來自 localStorage 或全域狀態
const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
const userId = userInfo.userId

const profileStore = useProfileStore()
const { profile, loading, error, successMessage } = storeToRefs(profileStore)

const editMode = ref(false)
const form = reactive({
  email: '',
  fullName: '',
  phone: '',
  address: '',
  birthDate: '',
  gender: '',
  profilePicture: ''
})
const errors = reactive({})

function reload() {
  profileStore.clearMessages()
  profileStore.fetchProfile(userId)
}

function onEdit() {
  if (!profile.value) return
  Object.assign(form, profile.value)
  // 清除舊的錯誤
  Object.keys(errors).forEach(key => { errors[key] = '' })
  editMode.value = true
  profileStore.clearMessages()
}

function onCancel() {
  editMode.value = false
  profileStore.clearMessages()
}

function validate() {
  let valid = true
  // 清除舊的錯誤
  Object.keys(errors).forEach(key => { errors[key] = '' })

  // Email 必填且格式
  if (!form.email) {
    errors.email = 'Email 為必填'
    valid = false
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Email 格式錯誤'
    valid = false
  }

  // Phone 格式
  if (form.phone && !/^[0-9\-+()\s]+$/.test(form.phone)) {
    errors.phone = '電話格式錯誤'
    valid = false
  }

  // BirthDate 格式
  if (form.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(form.birthDate)) {
    errors.birthDate = '日期格式錯誤 (YYYY-MM-DD)'
    valid = false
  }

  return valid
}

async function onSave() {
  if (!validate()) return
  await profileStore.updateProfile(userId, form)
  if (!profileStore.error) {
    editMode.value = false
  }
}

onMounted(() => {
  reload()
})
</script>

<style scoped>
.profile-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
  font-weight: bold;
}

.mb-4 {
  margin-bottom: 1rem;
}
</style>
