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
    component: () => import('../pages/ExperienceApply.vue')
  },
  {
    path: '/exemption-apply',
    name: 'ExemptionApply',
    component: () => import('../pages/ExemptionApply.vue')
  },
  {
    path: '/practice-apply',
    name: 'PracticeApply',
    component: () => import('../pages/PracticeApply.vue')
  },
  {
    path: '/education-apply',
    name: 'EducationApply',
    component: () => import('../pages/EducationApply.vue')
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
  console.log('🔍 checkAuthStatus() called')
  try {
    // localStorage에서 토큰과 사용자 정보 확인
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    console.log('🔍 checkAuthStatus localStorage:', {
      hasToken: !!token,
      hasUserStr: !!userStr,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
    })
    
    if (!token || !userStr) {
      console.log('❌ checkAuthStatus: Missing token or user data')
      return { isAuthenticated: false, isAdmin: false, user: null }
    }

    // 기본적인 토큰 형식 검증 (JWT 형태인지 확인)
    if (!token.includes('.')) {
      console.log('❌ checkAuthStatus: Invalid token format')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return { isAuthenticated: false, isAdmin: false, user: null }
    }

    // 사용자 정보 파싱
    let user: any = null
    try {
      user = JSON.parse(userStr)
      console.log('✅ checkAuthStatus: User data parsed:', { username: user?.username, role: user?.role })
    } catch (parseError) {
      console.error('❌ checkAuthStatus: Failed to parse user data:', parseError)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return { isAuthenticated: false, isAdmin: false, user: null }
    }

    // 사용자 객체 기본 검증
    if (!user || !user.username || !user.id) {
      console.log('❌ checkAuthStatus: Invalid user object')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return { isAuthenticated: false, isAdmin: false, user: null }
    }

    // authStore 상태 동기화
    if (authStore.state) {
      authStore.state.token = token as any
      authStore.state.user = user
      authStore.state.isAuthenticated = true
      console.log('🔄 checkAuthStatus: AuthStore synchronized')
    }

    const result = {
      isAuthenticated: true,
      isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
      user
    }
    
    console.log('✅ checkAuthStatus result:', result)
    return result
  } catch (error) {
    console.error('💥 checkAuthStatus failed:', error)
    return { isAuthenticated: false, isAdmin: false, user: null }
  }
}

// 라우터 가드 설정
router.beforeEach((to, _from, next) => {
  console.log(`🔄 Router Guard: Navigating to ${to.path}`)
  
  // localStorage 직접 확인
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  console.log('📦 localStorage check:', {
    hasToken: !!token,
    hasUser: !!userStr,
    tokenLength: token?.length || 0
  })

  // 인증 상태 확인
  const { isAuthenticated, isAdmin, user } = checkAuthStatus()
  
  // authStore 상태도 확인
  console.log('🏪 AuthStore state:', {
    storeAuthenticated: authStore.state?.isAuthenticated,
    storeUser: (authStore.state?.user as any)?.username,
    storeToken: !!authStore.state?.token
  })
  
  // 라우트 메타 정보 확인
  const requiresAuth = to.matched.some(record => record.meta?.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta?.requiresAdmin)

  console.log('🔐 Router Auth Check:', {
    path: to.path,
    requiresAuth,
    requiresAdmin,
    isAuthenticated,
    isAdmin,
    user: user?.username || 'none'
  })

  // 권한 검사
  if (requiresAuth && !isAuthenticated) {
    console.log('❌ REDIRECT: Authentication required but not authenticated')
    next('/login')
    return
  }

  if (requiresAdmin && !isAdmin) {
    console.log('❌ REDIRECT: Admin required but not admin')
    next('/')
    return
  }

  // 이미 로그인한 사용자가 로그인 페이지에 접근하는 경우
  if (to.path === '/login' && isAuthenticated) {
    console.log('↩️ REDIRECT: Already authenticated, going to home')
    next('/')
    return
  }

  console.log('✅ ACCESS GRANTED to:', to.path)
  next()
})

export default router
