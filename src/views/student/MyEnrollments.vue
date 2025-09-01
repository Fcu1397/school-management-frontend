<template>
  <div class="my-enrollments">
    <el-card class="page-header">
      <div class="header-content">
        <div>
          <h2>我的選課清單</h2>
          <p>2024 學年度 上學期</p>
        </div>
        <div class="header-stats">
          <el-statistic title="已選課程" :value="enrollments.length" />
          <el-statistic title="總學分" :value="totalCredits" />
        </div>
      </div>
    </el-card>

    <!-- 選課列表 -->
    <el-card v-loading="loading">
      <el-table
          :data="enrollments"
          style="width: 100%"
          empty-text="尚未選修任何課程"
      >
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="courseId" label="課號" width="100" />
        <el-table-column prop="courseName" label="課程名稱" min-width="150" />
        <el-table-column prop="credits" label="學分" width="80">
          <template #default="{ row }">
            {{ row.credits }} 學分
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="授課教師" width="120" />
        <el-table-column prop="semester" label="學期" width="100" />
        <el-table-column prop="score" label="成績" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.score" :type="row.isPassed ? 'success' : 'danger'">
              {{ row.score }}
            </el-tag>
            <span v-else class="text-muted">尚未評分</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
                type="danger"
                size="small"
                @click="handleDrop(row)"
                :disabled="row.score !== null"
            >
              退選
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 提示訊息 -->
      <el-alert
          v-if="totalCredits > 25"
          title="學分超載警告"
          type="warning"
          :closable="false"
          show-icon
          style="margin-top: 20px"
      >
        您本學期已選修 {{ totalCredits }} 學分，超過建議的 25 學分上限。
      </el-alert>

      <el-alert
          v-if="totalCredits < 9"
          title="學分不足提醒"
          type="info"
          :closable="false"
          show-icon
          style="margin-top: 20px"
      >
        您本學期只選修了 {{ totalCredits }} 學分，低於最低要求的 9 學分。
      </el-alert>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useCourseStore } from '@/stores/course'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const courseStore = useCourseStore()

const loading = ref(false)
const enrollments = ref([])

// 計算總學分
const totalCredits = computed(() => {
  return enrollments.value.reduce((sum, course) => {
    return sum + parseFloat(course.credits || 0)
  }, 0)
})

// 取得選課資料
const fetchEnrollments = async () => {
  loading.value = true
  try {
    await courseStore.fetchMyEnrollments(userStore.userId)
    enrollments.value = courseStore.myEnrollments
  } catch (error) {
    console.error('取得選課資料失敗:', error)
    ElMessage.error('取得選課資料失敗')
  } finally {
    loading.value = false
  }
}

// 處理退選
const handleDrop = async (course) => {
  try {
    await ElMessageBox.confirm(
        `確定要退選「${course.courseName}」嗎？`,
        '確認退選',
        {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const result = await courseStore.dropCourse(userStore.userId, course.classId)

    if (result.success) {
      ElMessage.success('退選成功！')
      await fetchEnrollments() // 重新載入資料
    } else {
      ElMessage.error(result.message || '退選失敗')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退選錯誤:', error)
      ElMessage.error('退選失敗，請稍後再試')
    }
  }
}

// 初始化
onMounted(() => {
  fetchEnrollments()
})
</script>

<style scoped>
.my-enrollments {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
}

.header-stats {
  display: flex;
  gap: 40px;
}

.text-muted {
  color: #909399;
}
</style>