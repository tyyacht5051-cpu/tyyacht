import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '../pages/Home.vue'
import authStore from '../stores/auth.js'

// 타입 정의
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresAdmin?: boolean
  }
}

// 라우트 정의
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../pages/Intro.vue')
  },
  {
    path: '/program-guide',
    name: 'ProgramGuide',
    component: () => import('../pages/ProgramGuide.vue')
  },
  {
    path: '/cruise-education',
    name: 'CruiseEducation',
    component: () => import('../pages/CruiseEducation.vue')
  },
  {
    path: '/cruise-experience',
    name: 'CruiseExperience',
    component: () => import('../pages/CruiseExperience.vue')
  },
  {
    path: '/dinghy-education',
    name: 'DinghyEducation',
    component: () => import('../pages/DinghyEducation.vue')
  },
  {
    path: '/dinghy-experience',
    name: 'DinghyExperience',
    component: () => import('../pages/DinghyExperience.vue')
  },
  {
    path: '/paddleboard-experience',
    name: 'PaddleboardExperience',
    component: () => import('../pages/PaddleboardExperience.vue')
  },
  {
    path: '/license',
    name: 'License',
    component: () => import('../pages/LicenseEducation.vue')
  },
  {
    path: '/license-education',
    name: 'LicenseEducation',
    component: () => import('../pages/LicenseEducation.vue')
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('../pages/Community.vue')
  },
  {
    path: '/notice',
    name: 'Notice',
    component: () => import('../pages/Notice.vue')
  },
  {
    path: '/experience-apply',
    name: 'ExperienceApply',
    component: () => import('../pages/ExperienceApply.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/exemption-apply',
    name: 'ExemptionApply',
    component: () => import('../pages/ExemptionApply.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/practice-apply',
    name: 'PracticeApply',
    component: () => import('../pages/PracticeApply.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/education-apply',
    name: 'EducationApply',
    component: () => import('../pages/EducationApply.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/community/photo-gallery',
    name: 'PhotoGallery',
    component: () => import('../pages/PhotoGallery.vue')
  },
  {
    path: '/community/photo-gallery/edit/:id',
    name: 'PhotoGalleryEdit',
    component: () => import('../pages/PhotoGalleryEdit.vue')
  },
  {
    path: '/community/video-gallery',
    name: 'VideoGallery',
    component: () => import('../pages/VideoGallery.vue')
  },
  {
    path: '/community/free-board',
    name: 'FreeBoard',
    component: () => import('../pages/FreeBoard.vue')
  },
  {
    path: '/community/review-board',
    name: 'ReviewBoard',
    component: () => import('../pages/ReviewBoard.vue')
  },
  {
    path: '/community/crew-recruitment',
    name: 'CrewRecruitment',
    component: () => import('../pages/CrewRecruitment.vue')
  },
  {
    path: '/crew-recruitment',
    name: 'CrewRecruitmentDirect',
    component: () => import('../pages/CrewRecruitment.vue')
  },
  {
    path: '/review-board',
    name: 'ReviewBoardDirect',
    component: () => import('../pages/ReviewBoard.vue')
  },
  {
    path: '/notice/exemption',
    name: 'NoticeExemption',
    component: () => import('../pages/NoticeExemption.vue')
  },
  {
    path: '/notice/cruise',
    name: 'NoticeCruise',
    component: () => import('../pages/NoticeCruise.vue')
  },
  {
    path: '/notice/dinghy',
    name: 'NoticeDinghy',
    component: () => import('../pages/NoticeDinghy.vue')
  },
  {
    path: '/notice/recruitment',
    name: 'NoticeRecruitment',
    component: () => import('../pages/NoticeRecruitment.vue')
  },
  {
    path: '/notice/others',
    name: 'NoticeOthers',
    component: () => import('../pages/NoticeOthers.vue')
  },
  {
    path: '/notice/exemption/:id',
    name: 'NoticeExemptionDetail',
    component: () => import('../pages/NoticeExemptionPage.vue')
  },
  {
    path: '/notice/exemption/edit/:id',
    name: 'NoticeExemptionEdit',
    component: () => import('../pages/NoticeExemptionPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/notice/cruise/:id',
    name: 'NoticeCruiseDetail',
    component: () => import('../pages/NoticeCruisePage.vue')
  },
  {
    path: '/notice/cruise/edit/:id',
    name: 'NoticeCruiseEdit',
    component: () => import('../pages/NoticeCruisePage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/notice/dinghy/:id',
    name: 'NoticeDinghyDetail',
    component: () => import('../pages/NoticeDinghyPage.vue')
  },
  {
    path: '/notice/dinghy/edit/:id',
    name: 'NoticeDinghyEdit',
    component: () => import('../pages/NoticeDinghyPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/notice/recruitment/:id',
    name: 'NoticeRecruitmentDetail',
    component: () => import('../pages/NoticeRecruitmentPage.vue')
  },
  {
    path: '/notice/recruitment/edit/:id',
    name: 'NoticeRecruitmentEdit',
    component: () => import('../pages/NoticeRecruitmentPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/notice/others/:id',
    name: 'NoticeOthersDetail',
    component: () => import('../pages/NoticeOthersPage.vue')
  },
  {
    path: '/notice/others/edit/:id',
    name: 'NoticeOthersEdit',
    component: () => import('../pages/NoticeOthersPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue')
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('../pages/Terms.vue')
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('../pages/Privacy.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../pages/Admin.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/mypage',
    name: 'MyPage',
    component: () => import('../pages/MyPage.vue'),
    meta: { requiresAuth: true }
  },
  // 404 페이지 (선택사항)
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

// 라우터 생성
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 인증 상태 확인 함수
function checkAuthStatus(): { isAuthenticated: boolean; isAdmin: boolean; user: any | null } {
  try {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (!token || !userStr) {
      return { isAuthenticated: false, isAdmin: false, user: null }
    }

    // 기본적인 토큰 형식 검증 (JWT 형태인지 확인)
    if (!token.includes('.')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return { isAuthenticated: false, isAdmin: false, user: null }
    }

    // JWT 만료 시간 검증
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return { isAuthenticated: false, isAdmin: false, user: null }
      }
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return { isAuthenticated: false, isAdmin: false, user: null }
    }

    // 사용자 정보 파싱
    let user: any = null
    try {
      user = JSON.parse(userStr)
    } catch (parseError) {
      console.error('Failed to parse user data:', parseError)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return { isAuthenticated: false, isAdmin: false, user: null }
    }

    // 사용자 객체 기본 검증
    if (!user || !user.username || !user.id) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return { isAuthenticated: false, isAdmin: false, user: null }
    }

    // authStore 상태 동기화
    if (authStore.state) {
      authStore.state.token = token as any
      authStore.state.user = user
      authStore.state.isAuthenticated = true
    }

    return {
      isAuthenticated: true,
      isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
      user
    }
  } catch (error) {
    console.error('checkAuthStatus failed:', error)
    return { isAuthenticated: false, isAdmin: false, user: null }
  }
}

// 라우터 가드 설정
router.beforeEach((to, _from, next) => {
  const { isAuthenticated, isAdmin } = checkAuthStatus()

  const requiresAuth = to.matched.some(record => record.meta?.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta?.requiresAdmin)

  if (requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  if (requiresAdmin && !isAdmin) {
    next('/')
    return
  }

  if (to.path === '/login' && isAuthenticated) {
    next('/')
    return
  }

  next()
})

export default router
