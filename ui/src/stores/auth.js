import { reactive } from 'vue'
import { API_BASE_URL } from '../config/env.js'
import axios from 'axios'

// axios 인터셉터 설정
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// axios 응답 인터셉터는 authStore 생성 후에 설정

const state = reactive({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false
})

const authStore = {
  state,

  // 초기화 - 로컬 스토리지에서 토큰과 사용자 정보 복원
  init() {
    console.log('🚀 AuthStore.init() started')
    try {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')

      console.log('📊 AuthStore init check:', { 
        hasToken: !!token, 
        hasUserData: !!userData,
        tokenLength: token?.length || 0,
        userDataLength: userData?.length || 0
      })

      if (token && userData) {
        try {
          const user = JSON.parse(userData)
          this.state.token = token
          this.state.user = user
          this.state.isAuthenticated = true
          console.log('✅ Auth initialized successfully', { 
            user: user.username, 
            role: user.role,
            authenticated: this.state.isAuthenticated 
          })
        } catch (parseError) {
          console.error('❌ Failed to parse user data:', parseError)
          // 잘못된 데이터 정리
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          this.state.isAuthenticated = false
          this.state.token = null
          this.state.user = null
        }
      } else {
        console.log('⚠️ No valid token or user data found')
        this.state.isAuthenticated = false
        this.state.token = null
        this.state.user = null
      }
      
      console.log('🏁 AuthStore init completed:', {
        isAuthenticated: this.state.isAuthenticated,
        user: this.state.user?.username || 'none'
      })
    } catch (error) {
      console.error('💥 Auth init error:', error)
      this.state.isAuthenticated = false
      this.state.token = null
      this.state.user = null
    }
  },

  // 로그인
  async login(credentials) {
    console.log('🔐 AuthStore.login() started with credentials:', { username: credentials.username })
    this.state.isLoading = true
    try {
      console.log('📡 Sending login request to:', `${API_BASE_URL}/api/auth/login`)
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials)
      console.log('✅ Login response received:', { status: response.status, hasData: !!response.data })
      
      const { token, user } = response.data
      console.log('📊 Login response data:', { 
        hasToken: !!token, 
        tokenLength: token?.length || 0,
        hasUser: !!user,
        username: user?.username 
      })

      // 상태 업데이트
      this.state.token = token
      this.state.user = user
      this.state.isAuthenticated = true
      console.log('🔄 AuthStore state updated:', { 
        isAuthenticated: this.state.isAuthenticated,
        user: this.state.user?.username 
      })

      // 로컬 스토리지에 저장
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      console.log('💾 Data saved to localStorage:', {
        tokenSaved: !!localStorage.getItem('token'),
        userSaved: !!localStorage.getItem('user')
      })

      return { success: true }
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message)
      return { 
        success: false, 
        error: error.response?.data?.error || '로그인 중 오류가 발생했습니다.' 
      }
    } finally {
      this.state.isLoading = false
      console.log('🏁 Login process completed')
    }
  },

  // 로그아웃
  async logout() {
    try {
      // 서버에 로그아웃 요청
      await axios.post(`${API_BASE_URL}/api/auth/logout`)
    } catch (error) {
      console.error('로그아웃 요청 실패:', error)
    }

    // 상태 초기화
    this.state.token = null
    this.state.user = null
    this.state.isAuthenticated = false

    // 로컬 스토리지 정리
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // 회원가입
  async register(userData) {
    this.state.isLoading = true
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, userData)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || '회원가입 중 오류가 발생했습니다.' 
      }
    } finally {
      this.state.isLoading = false
    }
  },

  // 사용자 정보 가져오기
  async fetchUser() {
    if (!this.state.token) return

    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`)
      this.state.user = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error)
      // 토큰이 유효하지 않다면 로그아웃
      if (error.response?.status === 401) {
        this.logout()
      }
    }
  },

  // 관리자 권한 확인
  isAdmin() {
    return this.state.user?.role === 'admin'
  }
}

// axios 응답 인터셉터 설정 (401 오류 시 자동 로그아웃)
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('❌ 401 오류 발생:', window.location.pathname, error.response?.data)
      // 보호된 페이지에서만 자동 로그아웃 처리
      const currentPath = window.location.pathname
      const protectedPaths = ['/admin', '/mypage']
      
      if (protectedPaths.some(path => currentPath.startsWith(path))) {
        console.log('보호된 페이지에서 401 오류, 로그아웃 처리')
        authStore.logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// 앱 시작 시 초기화
authStore.init()

export default authStore