<template>
  <div class="course-selection">
    <el-card class="page-header">
      <h2>課程選擇</h2>
      <p>2024 學年度 上學期</p>
    </el-card>

    <!-- 搜尋和篩選 -->
    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
              v-model="searchText"
              placeholder="搜尋課程名稱或課號"
              prefix-icon="Search"
              clearable
          />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="fetchCourses">
            <el-icon><Refresh /></el-icon>
            重新整理
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 課程列表 -->
    <el-card v-loading="loading">
      <el-table
          :data="filteredCourses"
          style="width: 100%"
          empty-text="暫無可選課程"
      >
        <el-table-column prop="courseId" label="課號" width="100" />
        <el-table-column prop="courseName" label="課程名稱" min-width="150" />
        <el-table-column prop="credits" label="學分" width="80">
          <template #default="{ row }">
            {{ row.credits }} 學分
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="授課教師" width="120" />
        <el-table-column prop="capacity" label="人數" width="120">
          <template #default="{ row }">
            <el-tag
                :type="row.remainingSeats > 10 ? 'success' : row.remainingSeats > 0 ? 'warning' : 'danger'"
            >
              {{ row.currentEnrollment }} / {{ row.capacity }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remainingSeats" label="剩餘名額" width="100">
          <template #default="{ row }">
            <span :class="{ 'text-danger': row.remainingSeats === 0 }">
              {{ row.remainingSeats }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
                type="primary"
                size="small"
                @click="handleEnroll(row)"
                :disabled="row.remainingSeats === 0 || isEnrolled(row.classId)"
            >
              {{ isEnrolled(row.classId) ? '已選修' : '選課' }}
            </el-button>
            <el-button
                type="info"
                size="small"
                @click="showClassDetails(row)"
            >
              詳情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 班級詳情對話框 -->
    <el-dialog
        v-model="detailsDialogVisible"
        title="班級詳細資訊"
        width="500px"
    >
      <el-descriptions :column="1" border v-if="selectedClass">
        <el-descriptions-item label="課號">
          {{ selectedClass.courseId }}
        </el-descriptions-item>
        <el-descriptions-item label="課程名稱">
          {{ selectedClass.courseName }}
        </el-descriptions-item>
        <el-descriptions-item label="學分數">
          {{ selectedClass.credits }}
        </el-descriptions-item>
        <el-descriptions-item label="授課教師">
          {{ selectedClass.teacherName }}
        </el-descriptions-item>
        <el-descriptions-item label="班級容量">
          {{ selectedClass.capacity }} 人
        </el-descriptions-item>
        <el-descriptions-item label="目前選課人數">
          {{ selectedClass.currentEnrollment }} 人
        </el-descriptions-item>
        <el-descriptions-item label="剩餘名額">
          <el-tag :type="selectedClass.remainingSeats > 0 ? 'success' : 'danger'">
            {{ selectedClass.remainingSeats }} 個名額
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="detailsDialogVisible = false">關閉</el-button>
        <el-button
            type="primary"
            @click="handleEnrollFromDialog"
            :disabled="!selectedClass || selectedClass.remainingSeats === 0"
        >
          選修此課程
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useCourseStore } from '@/stores/course'
import api from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const courseStore = useCourseStore()

const loading = ref(false)
const searchText = ref('')
const availableClasses = ref([])
const myEnrollments = ref([])
const detailsDialogVisible = ref(false)
const selectedClass = ref(null)

// 過濾後的課程
const filteredCourses = computed(() => {
  if (!searchText.value) {
    return availableClasses.value
  }

  const search = searchText.value.toLowerCase()
  return availableClasses.value.filter(course =>
      course.courseId.toLowerCase().includes(search) ||
      course.courseName.toLowerCase().includes(search) ||
      course.teacherName.toLowerCase().includes(search)
  )
})

// 檢查是否已選修
const isEnrolled = (classId) => {
  return myEnrollments.value.some(e => e.classId === classId)
}

// 取得課程資料
const fetchCourses = async () => {
  loading.value = true
  try {
    // 取得可選班級
    const classesRes = await api.getAvailableClasses(2024, '上學期')
    if (classesRes.success) {
      availableClasses.value = classesRes.data
    }

    // 取得已選課程
    const enrollmentsRes = await api.getEnrollments(userStore.userId)
    if (enrollmentsRes.success) {
      myEnrollments.value = enrollmentsRes.data
    }
  } catch (error) {
    console.error('取得課程資料失敗:', error)
    ElMessage.error('取得課程資料失敗')
  } finally {
    loading.value = false
  }
}

// 處理選課
const handleEnroll = async (course) => {
  try {
    await ElMessageBox.confirm(
        `確定要選修「${course.courseName}」嗎？`,
        '確認選課',
        {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'info'
        }
    )

    const enrollmentData = {
      studentId: userStore.userId,
      classId: course.classId,
      reason: '線上選課'
    }

    const result = await courseStore.enrollCourse(enrollmentData)

    if (result.success) {
      ElMessage.success('選課成功！')
      await fetchCourses() // 重新載入資料
    } else {
      ElMessage.error(result.message || '選課失敗')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('選課錯誤:', error)
      ElMessage.error('選課失敗，請稍後再試')
    }
  }
}

// 顯示班級詳情
const showClassDetails = (course) => {
  selectedClass.value = course
  detailsDialogVisible.value = true
}

// 從詳情對話框選課
const handleEnrollFromDialog = async () => {
  if (selectedClass.value) {
    await handleEnroll(selectedClass.value)
    detailsDialogVisible.value = false
  }
}

// 初始化
onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.course-selection {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
}

.filter-card {
  margin-bottom: 20px;
}

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}
</style>