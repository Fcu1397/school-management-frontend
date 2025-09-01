<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>課程管理</h2>
        </div>
      </template>
      <el-table :data="courses" v-loading="loading" style="width: 100%">
        <el-table-column prop="courseId" label="Course ID" width="120"></el-table-column>
        <el-table-column prop="courseName" label="Course Name" min-width="200"></el-table-column>
        <el-table-column prop="credits" label="Credits" width="100"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const courses = ref([])
const loading = ref(false)

const fetchCourses = async () => {
  loading.value = true
  try {
    const response = await api.getAdminAllCourses()
    if (response.success) {
      courses.value = response.data
    }
  } catch (error) {
    console.error("Failed to fetch courses:", error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
