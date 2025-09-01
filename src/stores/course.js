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