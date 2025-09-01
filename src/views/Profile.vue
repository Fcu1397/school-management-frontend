<template>
  <div class="max-w-2xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">個人資料管理</h1>

    <!-- 載入指示器 -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <span class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></span>
    </div>

    <!-- 成功/錯誤訊息 -->
    <div v-if="successMessage" class="mb-2 text-green-600">{{ successMessage }}</div>
    <div v-if="error" class="mb-2 text-red-600">{{ error }}</div>

    <!-- 資料檢視區 -->
    <div v-if="!editMode && profile" class="bg-white rounded shadow p-4 mb-4">
      <div class="flex items-center mb-4">
        <img v-if="profile.profilePicture" :src="profile.profilePicture" alt="頭像" class="w-20 h-20 rounded-full object-cover mr-4" />
        <div>
          <div class="font-bold text-lg">{{ profile.fullName || '未填寫姓名' }}</div>
          <div class="text-gray-500">{{ profile.roleName }}</div>
        </div>
      </div>
      <div class="mb-2"><span class="font-semibold">Email：</span>{{ profile.email }}</div>
      <div class="mb-2"><span class="font-semibold">電話：</span>{{ profile.phone || '未填寫' }}</div>
      <div class="mb-2"><span class="font-semibold">地址：</span>{{ profile.address || '未填寫' }}</div>
      <div class="mb-2"><span class="font-semibold">生日：</span>{{ profile.birthDate || '未填寫' }}</div>
      <div class="mb-2"><span class="font-semibold">性別：</span>{{ profile.gender || '未填寫' }}</div>
      <div class="flex gap-2 mt-4">
        <button class="btn btn-primary" @click="onEdit">編輯</button>
        <button class="btn btn-secondary" @click="reload">重新載入</button>
      </div>
    </div>

    <!-- 編輯表單 -->
    <form v-if="editMode && profile" @submit.prevent="onSave" class="bg-white rounded shadow p-4">
      <div class="flex items-center mb-4">
        <img v-if="form.profilePicture" :src="form.profilePicture" alt="頭像預覽" class="w-20 h-20 rounded-full object-cover mr-4" />
        <input v-model="form.profilePicture" type="url" placeholder="頭像圖片 URL" class="input input-bordered flex-1" />
      </div>
      <div class="mb-2">
        <label class="block font-semibold">Email <span class="text-red-500">*</span></label>
        <input v-model="form.email" type="email" class="input input-bordered w-full" :class="{'border-red-500': errors.email}" />
        <div v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</div>
      </div>
      <div class="mb-2">
        <label class="block font-semibold">姓名</label>
        <input v-model="form.fullName" type="text" class="input input-bordered w-full" />
      </div>
      <div class="mb-2">
        <label class="block font-semibold">電話</label>
        <input v-model="form.phone" type="text" class="input input-bordered w-full" :class="{'border-red-500': errors.phone}" />
        <div v-if="errors.phone" class="text-red-500 text-sm">{{ errors.phone }}</div>
      </div>
      <div class="mb-2">
        <label class="block font-semibold">地址</label>
        <input v-model="form.address" type="text" class="input input-bordered w-full" />
      </div>
      <div class="mb-2">
        <label class="block font-semibold">生日</label>
        <input v-model="form.birthDate" type="date" class="input input-bordered w-full" :class="{'border-red-500': errors.birthDate}" />
        <div v-if="errors.birthDate" class="text-red-500 text-sm">{{ errors.birthDate }}</div>
      </div>
      <div class="mb-2">
        <label class="block font-semibold">性別</label>
        <select v-model="form.gender" class="input input-bordered w-full">
          <option value="">請選擇</option>
          <option value="男">男</option>
          <option value="女">女</option>
          <option value="其他">其他</option>
        </select>
      </div>
      <div class="flex gap-2 mt-4">
        <button type="submit" class="btn btn-primary">儲存</button>
        <button type="button" class="btn btn-secondary" @click="onCancel">取消</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { storeToRefs } from 'pinia'

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

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function reload() {
  profileStore.clearMessages()
  profileStore.fetchProfile(userId)
}

function onEdit() {
  if (!profile.value) return
  Object.assign(form, profile.value)
  errors.email = ''
  errors.phone = ''
  errors.birthDate = ''
  editMode.value = true
  profileStore.clearMessages()
}

function onCancel() {
  editMode.value = false
  profileStore.clearMessages()
}

function validate() {
  let valid = true
  // Email 必填且格式
  if (!form.email) {
    errors.email = 'Email 為必填'
    valid = false
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Email 格式錯誤'
    valid = false
  } else {
    errors.email = ''
  }
  // Phone 格式
  if (form.phone && !/^[0-9\-+()\s]+$/.test(form.phone)) {
    errors.phone = '電話格式錯誤'
    valid = false
  } else {
    errors.phone = ''
  }
  // BirthDate 格式
  if (form.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(form.birthDate)) {
    errors.birthDate = '日期格式錯誤 (YYYY-MM-DD)'
    valid = false
  } else {
    errors.birthDate = ''
  }
  // profilePicture URL 格式
  if (form.profilePicture && !/^https?:\/\/.+/.test(form.profilePicture)) {
    // 不強制，但可加提示
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
.btn { @apply px-4 py-2 rounded font-semibold transition-colors; }
.btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700; }
.btn-secondary { @apply bg-gray-200 text-gray-700 hover:bg-gray-300; }
.input { @apply border rounded px-2 py-1; }
.input-bordered { @apply border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200; }
</style>
