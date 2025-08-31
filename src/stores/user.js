import { defineStore } from 'pinia'
import api from '@/api'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', {
    state: () => ({
        userInfo: null,
        token: null,
        isLoggedIn: false
    }),

    getters: {
        // 取得使用者名稱
        userName: (state) => state.userInfo?.name || '',

        // 取得使用者角色
        userRole: (state) => state.userInfo?.roleName || '',

        // 取得使用者 ID (學號或教職員編號)
        userId: (state) => state.userInfo?.identifier || '',

        // 是否為學生
        isStudent: (state) => state.userInfo?.roleName === 'STUDENT',

        // 是否為教師
        isTeacher: (state) => state.userInfo?.roleName === 'TEACHER',

        // 是否為管理員
        isAdmin: (state) => state.userInfo?.roleName === 'ADMIN'
    },

    actions: {
        // 初始化（從 localStorage 恢復狀態）
        initializeStore() {
            const token = localStorage.getItem('token')
            const userInfo = localStorage.getItem('userInfo')

            if (token && userInfo) {
                this.token = token
                this.userInfo = JSON.parse(userInfo)
                this.isLoggedIn = true
            }
        },

        // 登入
        async login(loginData) {
            try {
                const response = await api.login(loginData)

                if (response.success) {
                    const userData = response.data

                    // 儲存使用者資訊
                    this.userInfo = userData
                    this.isLoggedIn = true

                    // 暫時使用假 token（實際應該從後端返回）
                    this.token = btoa(JSON.stringify(userData))

                    // 儲存到 localStorage
                    localStorage.setItem('token', this.token)
                    localStorage.setItem('userInfo', JSON.stringify(userData))

                    ElMessage.success('登入成功')

                    return { success: true }
                }
            } catch (error) {
                console.error('登入失敗:', error)
                return { success: false, message: error.message }
            }
        },

        // 註冊
        async register(registerData) {
            try {
                const response = await api.register(registerData)

                if (response.success) {
                    ElMessage.success('註冊成功，請登入')
                    return { success: true }
                }
            } catch (error) {
                console.error('註冊失敗:', error)
                return { success: false, message: error.message }
            }
        },

        // 登出
        async logout() {
            try {
                await api.logout()
            } catch (error) {
                console.error('登出 API 呼叫失敗:', error)
            } finally {
                // 清除狀態
                this.userInfo = null
                this.token = null
                this.isLoggedIn = false

                // 清除 localStorage
                localStorage.removeItem('token')
                localStorage.removeItem('userInfo')

                ElMessage.success('已成功登出')
            }
        },

        // 更新使用者資訊
        updateUserInfo(userInfo) {
            this.userInfo = userInfo
            localStorage.setItem('userInfo', JSON.stringify(userInfo))
        }
    }
})

// ===================================
// File: src/stores/course.js
import { defineStore } from 'pinia'
import api from '@/api'

export const useCourseStore = defineStore('course', {
    state: () => ({
        courses: [],
        availableClasses: [],
        myEnrollments: [],
        loading: false
    }),

    actions: {
        // 取得所有課程
        async fetchCourses() {
            this.loading = true
            try {
                const response = await api.getAllCourses()
                if (response.success) {
                    this.courses = response.data
                }
            } catch (error) {
                console.error('取得課程失敗:', error)
            } finally {
                this.loading = false
            }
        },

        // 取得可選班級
        async fetchAvailableClasses(academicYear, semester) {
            this.loading = true
            try {
                const response = await api.getAvailableClasses(academicYear, semester)
                if (response.success) {
                    this.availableClasses = response.data
                }
            } catch (error) {
                console.error('取得可選班級失敗:', error)
            } finally {
                this.loading = false
            }
        },

        // 取得我的選課
        async fetchMyEnrollments(studentId) {
            this.loading = true
            try {
                const response = await api.getEnrollments(studentId)
                if (response.success) {
                    this.myEnrollments = response.data
                }
            } catch (error) {
                console.error('取得選課清單失敗:', error)
            } finally {
                this.loading = false
            }
        },

        // 選課
        async enrollCourse(enrollmentData) {
            try {
                const response = await api.enrollCourse(enrollmentData)
                if (response.success) {
                    // 重新取得選課清單
                    await this.fetchMyEnrollments(enrollmentData.studentId)
                    return { success: true, data: response.data }
                }
            } catch (error) {
                console.error('選課失敗:', error)
                return { success: false, message: error.message }
            }
        },

        // 退選
        async dropCourse(studentId, classId) {
            try {
                const response = await api.dropCourse(studentId, classId)
                if (response.success) {
                    // 重新取得選課清單
                    await this.fetchMyEnrollments(studentId)
                    return { success: true }
                }
            } catch (error) {
                console.error('退選失敗:', error)
                return { success: false, message: error.message }
            }
        }
    }
})