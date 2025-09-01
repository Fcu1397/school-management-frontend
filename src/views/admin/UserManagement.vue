<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>使用者管理</h2>
        </div>
      </template>
      <el-table :data="users" v-loading="loading" style="width: 100%">
        <el-table-column prop="userId" label="User ID" width="100"></el-table-column>
        <el-table-column prop="email" label="Email" min-width="200"></el-table-column>
        <el-table-column prop="role.roleName" label="Role" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role.roleName)">{{ row.role.roleName }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const users = ref([])
const loading = ref(false)

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.getAdminAllUsers()
    if (response.success) {
      users.value = response.data
    }
  } catch (error) {
    console.error("Failed to fetch users:", error)
  } finally {
    loading.value = false
  }
}

const getRoleTagType = (roleName) => {
  if (roleName === 'ADMIN') return 'danger'
  if (roleName === 'TEACHER') return 'warning'
  return 'success'
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
