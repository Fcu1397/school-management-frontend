// File: src/api/index.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 建立 axios 實例
const request = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 請求攔截器
request.interceptors.request.use(
    config => {
        // 從 localStorage 取得 token
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        console.error('請求錯誤:', error)
        return Promise.reject(error)
    }
)

// 回應攔截器
request.interceptors.response.use(
    response => {
        const res = response.data

        // 如果回應不是成功狀態
        if (!res.success) {
            ElMessage.error(res.message || '操作失敗')
            return Promise.reject(new Error(res.message || 'Error'))
        }

        return res
    },
    error => {
        console.error('回應錯誤:', error)

        if (error.response) {
            const { status, data } = error.response

            switch (status) {
                case 401:
                    ElMessage.error('請先登入')
                    localStorage.removeItem('token')
                    localStorage.removeItem('userInfo')
                    router.push('/login')
                    break
                case 403:
                    ElMessage.error('沒有權限')
                    break
                case 404:
                    ElMessage.error('請求的資源不存在')
                    break
                case 500:
                    ElMessage.error('伺服器錯誤')
                    break
                default:
                    ElMessage.error(data.message || '請求失敗')
            }
        } else {
            ElMessage.error('網路錯誤，請檢查網路連線')
        }

        return Promise.reject(error)
    }
)

// API 方法
const api = {
    // ========== 認證相關 ==========
    // 註冊
    register(data) {
        return request.post('/auth/register', data)
    },

    // 登入
    login(data) {
        return request.post('/auth/login', data)
    },

    // 登出
    logout() {
        return request.post('/auth/logout')
    },

    // 檢查 Email
    checkEmail(email) {
        return request.get('/auth/check-email', { params: { email } })
    },

    // 檢查學號
    checkStudentId(studentId) {
        return request.get('/auth/check-student-id', { params: { studentId } })
    },

    // 檢查教職員編號
    checkTeacherId(teacherId) {
        return request.get('/auth/check-teacher-id', { params: { teacherId } })
    },

    // ========== 學生功能 ==========
    // 查詢學生資訊
    getStudentInfo(studentId) {
        return request.get(`/student/${studentId}`)
    },

    // 查詢可選課程
    getAvailableCourses() {
        return request.get('/student/courses/available')
    },

    // 查詢選課清單
    getEnrollments(studentId) {
        return request.get(`/student/enrollments/${studentId}`)
    },

    // 查詢學期選課
    getEnrollmentsBySemester(studentId, academicYear, semester) {
        return request.get(`/student/enrollments/${studentId}/semester`, {
            params: { academicYear, semester }
        })
    },

    // 選課
    enrollCourse(data) {
        return request.post('/student/enroll', data)
    },

    // 退選
    dropCourse(studentId, classId) {
        return request.delete('/student/drop', {
            params: { studentId, classId }
        })
    },

    // 檢查衝堂
    checkConflict(studentId, classId) {
        return request.get('/student/check-conflict', {
            params: { studentId, classId }
        })
    },

    // ========== 課程管理 ==========
    // 查詢所有課程
    getAllCourses() {
        return request.get('/courses')
    },

    // 查詢課程的班級
    getClassesByCourse(courseId) {
        return request.get(`/courses/${courseId}/classes`)
    },

    // 查詢可選班級
    getAvailableClasses(academicYear = 2024, semester = '上學期') {
        return request.get('/courses/available', {
            params: { academicYear, semester }
        })
    },

    // 查詢班級詳情
    getClassDetails(classId) {
        return request.get(`/courses/class/${classId}`)
    },

    // ========== 測試相關 ==========
    // 健康檢查
    healthCheck() {
        return request.get('/test/health')
    },

    // 資料庫檢查
    databaseCheck() {
        return request.get('/test/database')
    }
}

export default api