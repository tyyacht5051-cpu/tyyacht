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
    try {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')

      if (token && userData) {
        try {
          const user = JSON.parse(userData)
          this.state.token = token
          this.state.user = user
          this.state.isAuthenticated = true
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          this.state.isAuthenticated = false
          this.state.token = null
          this.state.user = null
        }
      } else {
        this.state.isAuthenticated = false
        this.state.token = null
        this.state.user = null
      }
    } catch (error) {
      console.error('Auth init error:', error)
      this.state.isAuthenticated = false
      this.state.token = null
      this.state.user = null
    }
  },

  // 로그인
  async login(credentials) {
    this.state.isLoading = true
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials)
      const { token, user } = response.data

      this.state.token = token
      this.state.user = user
      this.state.isAuthenticated = true

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      return { success: true }
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.error || '로그인 중 오류가 발생했습니다.'
      }
    } finally {
      this.state.isLoading = false
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
    return this.state.user?.role === 'admin' || this.state.user?.role === 'super_admin'
  },

  // 최고 관리자 권한 확인
  isSuperAdmin() {
    return this.state.user?.role === 'super_admin'
  }
}

// axios 응답 인터셉터 설정 (401 오류 시 자동 로그아웃)
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname
      const protectedPaths = ['/admin', '/mypage']

      if (protectedPaths.some(path => currentPath.startsWith(path))) {
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