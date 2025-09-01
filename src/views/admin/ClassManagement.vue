<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>班級管理</h2>
        </div>
      </template>
      <el-table :data="classes" v-loading="loading" style="width: 100%">
        <el-table-column prop="classId" label="Class ID" width="100"></el-table-column>
        <el-table-column prop="course.courseName" label="Course Name" min-width="200"></el-table-column>
        <el-table-column prop="teacher.teacherName" label="Teacher" width="150"></el-table-column>
        <el-table-column prop="academicYear" label="Year" width="120"></el-table-column>
        <el-table-column prop="semester" label="Semester" width="120"></el-table-column>
        <el-table-column prop="capacity" label="Capacity" width="100"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const classes = ref([])
const loading = ref(false)

const fetchClasses = async () => {
  loading.value = true
  try {
    const response = await api.getAdminAllClasses()
    if (response.success) {
      classes.value = response.data
    }
  } catch (error) {
    console.error("Failed to fetch classes:", error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchClasses()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
