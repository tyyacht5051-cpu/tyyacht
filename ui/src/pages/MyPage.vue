<template>
  <div class="mypage-container">
    <div class="mypage-card">
      <div class="mypage-header">
        <h1>마이페이지</h1>
        <p>{{ user?.fullName }}님의 개인정보를 관리하실 수 있습니다.</p>
      </div>

      <!-- 프로필 정보 -->
      <div class="profile-section">
        <h2>프로필 정보</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>이름</label>
            <span>{{ user?.fullName || '-' }}</span>
          </div>
          <div class="info-item">
            <label>아이디</label>
            <span>{{ user?.username || '-' }}</span>
          </div>
          <div class="info-item">
            <label>이메일</label>
            <span>{{ user?.email || '-' }}</span>
          </div>
          <div class="info-item">
            <label>권한</label>
            <span class="role-badge" :class="user?.role">
              {{ getRoleName(user?.role) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 계정 관리 -->
      <div class="account-section">
        <h2>계정 관리</h2>
        <div class="action-buttons">
          <button @click="refreshProfile" class="btn btn-primary" :disabled="isLoading">
            {{ isLoading ? '새로고침 중...' : '프로필 새로고침' }}
          </button>
          <button @click="handleLogout" class="btn btn-secondary">
            로그아웃
          </button>
        </div>
      </div>

      <!-- 신청 내역 -->
      <div class="history-section">
        <h2>나의 신청 내역</h2>
        <div v-if="applications.length === 0" class="empty-state">
          <p>아직 신청 내역이 없습니다.</p>
          <div class="quick-links">
            <router-link to="/experience-apply" class="btn btn-outline">승선체험 신청</router-link>
            <router-link to="/exemption-apply" class="btn btn-outline">면제교육 신청</router-link>
          </div>
        </div>
        <div v-else class="applications-list">
          <div v-for="app in applications" :key="app.id" class="application-item">
            <div class="app-header">
              <h3>면제교육 신청</h3>
              <span :class="['status-badge', app.status]">{{ getStatusLabel(app.status) }}</span>
            </div>
            <div class="app-details">
              <div class="detail-item">
                <label>신청일:</label>
                <span>{{ formatDate(app.created_at) }}</span>
              </div>
              <div class="detail-item">
                <label>교육과정:</label>
                <span>{{ app.education_type === 'general' ? '면제교육' : '실기연수' }}</span>
              </div>
              <div class="detail-item">
                <label>희망날짜:</label>
                <span>{{ formatPreferredDates(app.preferred_date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authStore from '../stores/auth.js'
import { API_BASE_URL } from '../config/env.js'
import axios from 'axios'

import { useToast } from '../components/Toast.vue'

export default {
  name: 'MyPage',
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      authStore,
      isLoading: false,
      applications: []
    }
  },
  computed: {
    user() {
      return this.authStore.state.user
    }
  },
  async mounted() {
    // 안전장치: 인증 상태가 불일치한 경우 다시 초기화
    if (!this.authStore.state.isAuthenticated && localStorage.getItem('token')) {
      this.authStore.init()
    }
    
    // 인증된 경우에만 신청 내역 로드
    if (this.authStore.state.isAuthenticated) {
      await this.loadApplications()
    }
  },
  methods: {
    getRoleName(role) {
      const roleMap = {
        admin: '관리자',
        user: '일반 사용자'
      }
      return roleMap[role] || '사용자'
    },
    async refreshProfile() {
      this.isLoading = true
      try {
        await this.authStore.fetchUser()
      } catch (error) {
        this.toast.error('프로필 새로고침에 실패했습니다.', '⚠️ 프로필 오류')
      } finally {
        this.isLoading = false
      }
    },
    async loadApplications() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        
        const response = await axios.get(`${API_BASE_URL}/api/applications/my-exemption`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        this.applications = response.data
      } catch (error) {
        console.error('Failed to load applications:', error)
      }
    },
    getStatusLabel(status) {
      const statusMap = {
        pending: '승인대기',
        approved: '승인완료',
        rejected: '승인거부'
      }
      return statusMap[status] || status
    },
    formatDate(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('ko-KR')
    },
    formatPreferredDates(dateString) {
      if (!dateString) return '-'
      try {
        const dates = JSON.parse(dateString)
        if (Array.isArray(dates)) {
          return dates.map(date => new Date(date).toLocaleDateString('ko-KR')).join(', ')
        }
        return new Date(dateString).toLocaleDateString('ko-KR')
      } catch (error) {
        return dateString
      }
    },
    async handleLogout() {
      if (confirm('로그아웃 하시겠습니까?')) {
        await this.authStore.logout()
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.mypage-container {
  min-height: calc(100vh - 140px);
  padding: 20px;
  padding-top: 90px; /* 네비게이션 바 높이만큼 여백 추가 */
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.mypage-card {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.mypage-header {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3d6f 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.mypage-header h1 {
  margin: 0 0 10px 0;
  font-size: 2rem;
}

.mypage-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.profile-section,
.account-section,
.history-section {
  padding: 30px;
  border-bottom: 1px solid #eee;
}

.history-section {
  border-bottom: none;
}

.applications-list {
  space-y: 1rem;
}

.application-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.app-header h3 {
  margin: 0;
  color: #2c5aa0;
  font-size: 1.1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background: #d1edff;
  color: #0c5460;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.app-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.detail-item span {
  color: #333;
}

.profile-section h2,
.account-section h2,
.history-section h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.3rem;
  border-left: 4px solid #2c5aa0;
  padding-left: 15px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.info-item span {
  font-size: 1rem;
  color: #333;
  padding: 8px 0;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  width: fit-content;
}

.role-badge.admin {
  background: #dc3545;
  color: white;
}

.role-badge.user {
  background: #28a745;
  color: white;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: #2c5aa0;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1e3d6f;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-outline {
  background: transparent;
  border: 2px solid #2c5aa0;
  color: #2c5aa0;
}

.btn-outline:hover {
  background: #2c5aa0;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.quick-links {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .mypage-container {
    padding: 10px;
    padding-top: 80px; /* 모바일에서 네비게이션 바 높이 조정 */
  }
  
  .mypage-card {
    margin: 0;
  }
  
  .mypage-header,
  .profile-section,
  .account-section,
  .history-section {
    padding: 20px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .quick-links {
    flex-direction: column;
    align-items: center;
  }
}
</style>