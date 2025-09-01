import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/Register.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/dashboard',
        component: () => import('@/layouts/DashboardLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'Dashboard',
                component: () => import('@/views/Dashboard.vue')
            },
            // 學生路由
            {
                path: 'student/courses',
                name: 'StudentCourses',
                component: () => import('@/views/student/CourseSelection.vue'),
                meta: { role: 'STUDENT' }
            },
            {
                path: 'student/enrollments',
                name: 'StudentEnrollments',
                component: () => import('@/views/student/MyEnrollments.vue'),
                meta: { role: 'STUDENT' }
            },
            {
                path: 'student/grades',
                name: 'StudentGrades',
                component: () => import('@/views/student/MyGrades.vue'),
                meta: { role: 'STUDENT' }
            },
            {
                path: 'student/profile',
                name: 'StudentProfile',
                component: () => import('@/views/student/Profile.vue'),
                meta: { role: 'STUDENT' }
            },
            // // 教師路由
            // {
            //     path: 'teacher/classes',
            //     name: 'TeacherClasses',
            //     component: () => import('@/views/teacher/MyClasses.vue'),
            //     meta: { role: 'TEACHER' }
            // },
            // {
            //     path: 'teacher/students',
            //     name: 'TeacherStudents',
            //     component: () => import('@/views/teacher/StudentList.vue'),
            //     meta: { role: 'TEACHER' }
            // },
            // {
            //     path: 'teacher/grades',
            //     name: 'TeacherGrades',
            //     component: () => import('@/views/teacher/GradeManagement.vue'),
            //     meta: { role: 'TEACHER' }
            // },
            // 管理員路由
            {
                path: 'admin/users',
                name: 'AdminUsers',
                component: () => import('@/views/admin/UserManagement.vue'),
                meta: { role: 'ADMIN' }
            },
            {
                path: 'admin/courses',
                name: 'AdminCourses',
                component: () => import('@/views/admin/CourseManagement.vue'),
                meta: { role: 'ADMIN' }
            },
            {
                path: 'admin/classes',
                name: 'AdminClasses',
                component: () => import('@/views/admin/ClassManagement.vue'),
                meta: { role: 'ADMIN' }
            },
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('@/views/Profile.vue'),
                meta: { requiresAuth: true }
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守衛
router.beforeEach((to, from, next) => {
    const userStore = useUserStore()

    // 需要認證的路由
    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
        ElMessage.warning('請先登入')
        next('/login')
        return
    }

    // 已登入使用者訪問登入頁，重定向到儀表板
    if (userStore.isLoggedIn && (to.path === '/login' || to.path === '/')) {
        next('/dashboard')
        return
    }

    // 角色權限檢查
    const requiredRole = to.meta.role;
    if (requiredRole) {
        const userRole = userStore.userRole;
        // 如果使用者不是管理員，且角色不符合要求，則拒絕訪問
        if (userRole !== 'ADMIN' && userRole !== requiredRole) {
            ElMessage.error('沒有權限訪問此頁面');
            next('/dashboard');
            return;
        }
    }

    next()
})

export default router