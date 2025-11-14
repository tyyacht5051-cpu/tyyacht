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
          <button
            @click="refreshProfile"
            @keydown.enter="refreshProfile"
            class="btn btn-primary"
            :disabled="isLoading"
            :aria-label="isLoading ? '프로필 새로고침 중' : '프로필 새로고침'"
          >
            {{ isLoading ? '새로고침 중...' : '프로필 새로고침' }}
          </button>
          <button
            @click="handleLogout"
            @keydown.enter="handleLogout"
            class="btn btn-secondary"
            aria-label="로그아웃"
          >
            로그아웃
          </button>
        </div>
      </div>

      <!-- 신청 내역 -->
      <div class="history-section">
        <h2>나의 신청 내역</h2>
        <div v-if="isLoadingApplications" class="loading-state">
          <div class="loading-spinner"></div>
          <p>신청 내역을 불러오는 중...</p>
        </div>
        <div v-else-if="errors.applications" class="error-state">
          <p>{{ errors.applications }}</p>
          <button
            @click="loadApplications"
            @keydown.enter="loadApplications"
            class="btn btn-outline retry-btn"
            aria-label="신청 내역 다시 불러오기"
          >다시 시도</button>
        </div>
        <div v-else-if="exemptionApplications.length === 0" class="empty-state">
          <p>아직 신청 내역이 없습니다.</p>
          <div class="quick-links">
            <router-link to="/experience-apply" class="btn btn-outline">승선체험 신청</router-link>
            <router-link to="/exemption-apply" class="btn btn-outline">면제교육 신청</router-link>
          </div>
        </div>
        <div v-else class="applications-list">
          <div v-for="app in exemptionApplications" :key="app.id" class="application-item">
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

      <!-- 내가 작성한 크루 모집글 -->
      <div class="crew-posts-section">
        <h2>내가 작성한 크루 모집글</h2>
        <div v-if="isLoadingCrewPosts" class="loading-state">
          <div class="loading-spinner"></div>
          <p>크루 모집글을 불러오는 중...</p>
        </div>
        <div v-else-if="errors.crewPosts" class="error-state">
          <p>{{ errors.crewPosts }}</p>
          <button
            @click="loadCrewPosts"
            @keydown.enter="loadCrewPosts"
            class="btn btn-outline retry-btn"
            aria-label="크루 모집글 다시 불러오기"
          >다시 시도</button>
        </div>
        <div v-else-if="crewPosts.length === 0" class="empty-state">
          <p>작성한 크루 모집글이 없습니다.</p>
          <div class="quick-links">
            <router-link to="/crew-recruitment" class="btn btn-outline">크루 모집글 작성</router-link>
          </div>
        </div>
        <div v-else class="crew-posts-list">
          <div v-for="post in crewPosts" :key="post.id" class="crew-post-item">
            <div class="post-header">
              <h3>{{ post.title }}</h3>
              <div class="post-actions">
                <span :class="['status-badge', post.status]">
                  {{ post.status === 'recruiting' ? '모집중' : '모집마감' }}
                </span>
                <button
                  @click="toggleRecruitmentStatus(post)"
                  @keydown.enter="toggleRecruitmentStatus(post)"
                  class="btn btn-sm btn-outline"
                  :disabled="isUpdatingStatus"
                  :aria-label="`${post.title} 모집상태 ${post.status === 'recruiting' ? '마감' : '재개'}`"
                >
                  {{ post.status === 'recruiting' ? '모집마감' : '모집재개' }}
                </button>
                <button
                  @click="editPost(post)"
                  @keydown.enter="editPost(post)"
                  class="btn btn-sm btn-primary"
                  :aria-label="`${post.title} 수정`"
                >
                  수정
                </button>
                <button
                  @click="viewApplications(post)"
                  @keydown.enter="viewApplications(post)"
                  class="btn btn-sm btn-outline"
                  :aria-label="`${post.title} 신청자 보기`"
                >
                  신청자 보기
                </button>
              </div>
            </div>
            <div class="post-details">
              <div class="detail-item">
                <label>모집유형:</label>
                <span>{{ getRecruitmentTypeLabel(post.recruitment_type) }}</span>
              </div>
              <div class="detail-item">
                <label>모집인원:</label>
                <span>{{ post.current_crew }}/{{ post.max_crew }}명</span>
              </div>
              <div class="detail-item">
                <label>작성일:</label>
                <span>{{ formatDate(post.created_at) }}</span>
              </div>
              <div class="detail-item">
                <label>조회수:</label>
                <span>{{ post.views }}회</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 신청자 목록 모달 -->
      <div v-if="showApplicationsModal" class="modal" @click="showApplicationsModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ selectedPostForApplications?.title }} - 신청자 목록</h3>
            <button
              class="close-btn"
              @click="showApplicationsModal = false"
              @keydown.enter="showApplicationsModal = false"
              @keydown.escape="showApplicationsModal = false"
              aria-label="모달 닫기"
            >&times;</button>
          </div>
          <div class="applications-list-modal">
            <div v-if="crewApplications.length === 0" class="no-applications">
              <p>아직 신청자가 없습니다.</p>
            </div>
            <div v-else>
              <div v-for="application in crewApplications" :key="application.id" class="application-item-modal">
                <div class="applicant-info">
                  <div class="applicant-details">
                    <h4>{{ application.name }}</h4>
                  </div>
                  <div class="contact-info">
                    <div class="contact-item">
                      <span class="label">연락처:</span>
                      <span class="value">{{ application.phone || '-' }}</span>
                    </div>
                    <div class="contact-item">
                      <span class="label">신청일:</span>
                      <span class="value">{{ formatDate(application.applied_at) }}</span>
                    </div>
                  </div>
                </div>
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
      exemptionApplications: [],
      crewPosts: [],
      crewApplications: [],
      isLoadingApplications: false,
      isLoadingCrewPosts: false,
      isUpdatingStatus: false,
      showApplicationsModal: false,
      selectedPostForApplications: null,
      errors: {
        applications: null,
        crewPosts: null
      }
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
      await this.loadCrewPosts()
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
      this.isLoadingApplications = true
      this.errors.applications = null
      try {

        const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/api/applications/my-exemption`, {
          method: 'GET'
        })
        this.exemptionApplications = response.data
      } catch (error) {
        console.error('Failed to load applications:', error)
        this.errors.applications = '신청 내역을 불러오는데 실패했습니다.'
        this.toast?.error('신청 내역을 불러오는데 실패했습니다.', '⚠️ 로딩 오류')
      } finally {
        this.isLoadingApplications = false
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
      return this.formatDateUtil(dateString)
    },
    formatDateUtil(dateString) {
      if (!dateString) return '-'
      try {
        return new Date(dateString).toLocaleDateString('ko-KR')
      } catch (error) {
        return '-'
      }
    },
    formatPreferredDates(dateString) {
      if (!dateString) return '-'
      try {
        const dates = JSON.parse(dateString)
        if (Array.isArray(dates)) {
          return dates.map(date => this.formatDateUtil(date)).join(', ')
        }
        return this.formatDateUtil(dateString)
      } catch (error) {
        return dateString
      }
    },
    async makeAuthenticatedRequest(url, options = {}) {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('인증 토큰이 없습니다.')
      }

      return axios({
        url,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })
    },
    async loadCrewPosts() {
      this.isLoadingCrewPosts = true
      this.errors.crewPosts = null
      try {

        const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/api/crews/my/posts`, {
          method: 'GET'
        })
        this.crewPosts = response.data
      } catch (error) {
        console.error('Failed to load crew posts:', error)
        this.errors.crewPosts = '크루 모집글을 불러오는데 실패했습니다.'
        this.toast?.error('크루 모집글을 불러오는데 실패했습니다.', '⚠️ 로딩 오류')
      } finally {
        this.isLoadingCrewPosts = false
      }
    },
    getRecruitmentTypeLabel(type) {
      const typeMap = {
        'cruise': '크루즈',
        'dinghy': '딩기',
        'general': '일반'
      }
      return typeMap[type] || type
    },
    async toggleRecruitmentStatus(post) {
      if (!confirm(`정말로 ${post.status === 'recruiting' ? '모집을 마감' : '모집을 재개'}하시겠습니까?`)) {
        return
      }

      this.isUpdatingStatus = true
      try {
        const newStatus = post.status === 'recruiting' ? 'completed' : 'recruiting'

        await this.makeAuthenticatedRequest(`${API_BASE_URL}/api/crews/${post.id}/status`, {
          method: 'PATCH',
          data: { status: newStatus }
        })

        // 로컬 상태 업데이트
        post.status = newStatus
        this.toast.success(`모집상태가 ${newStatus === 'recruiting' ? '모집중' : '모집마감'}으로 변경되었습니다.`)

      } catch (error) {
        console.error('Failed to update status:', error)
        this.toast.error('상태 변경에 실패했습니다.')
      } finally {
        this.isUpdatingStatus = false
      }
    },
    editPost(post) {
      // 크루 모집 수정 페이지로 이동 (쿼리 파라미터로 post id 전달)
      this.$router.push(`/crew-recruitment?edit=${post.id}`)
    },
    async viewApplications(post) {
      this.selectedPostForApplications = post
      this.showApplicationsModal = true

      try {
        const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/api/crews/my/${post.id}/applications`, {
          method: 'GET'
        })
        this.crewApplications = response.data
      } catch (error) {
        console.error('Failed to load applications:', error)
        this.toast?.error('신청자 목록을 불러오는데 실패했습니다.', '⚠️ 로딩 오류')
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
.history-section,
.crew-posts-section {
  padding: 30px;
  border-bottom: 1px solid #eee;
}

.crew-posts-section {
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
.history-section h2,
.crew-posts-section h2 {
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

/* 크루 모집글 관련 스타일 */
.crew-posts-list {
  space-y: 1rem;
}

.crew-post-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
  gap: 1rem;
}

.post-header h3 {
  margin: 0;
  color: #2c5aa0;
  font-size: 1.1rem;
  flex: 1;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
}

.status-badge.recruiting {
  background: #d1edff;
  color: #0c5460;
}

.status-badge.completed {
  background: #f8d7da;
  color: #721c24;
}

.post-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

/* 포커스 개선 */
.btn:focus {
  outline: 2px solid #2c5aa0;
  outline-offset: 2px;
}

/* 터치 친화적 버튼 크기 */
@media (max-width: 768px) {
  .btn {
    min-height: 48px;
    min-width: 48px;
  }

  .btn-sm {
    min-height: 44px;
    min-width: 44px;
    padding: 8px 16px;
  }

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
  .history-section,
  .crew-posts-section {
    padding: 15px;
  }

  .mypage-header h1 {
    font-size: 1.5rem;
  }

  .mypage-header p {
    font-size: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .quick-links {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .post-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .post-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
    align-items: center;
  }

  .post-details {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .app-details {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  /* 모달 개선 */
  .modal {
    padding: 10px;
  }

  .modal-content {
    max-height: 95vh;
  }

  .modal-header {
    padding: 15px;
  }

  .applications-list-modal {
    padding: 15px;
  }

  .application-item-modal {
    padding: 15px;
  }
}

/* 로딩 및 에러 상태 스타일 */
.loading-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2c5aa0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 40px 20px;
  color: #dc3545;
  background: #f8d7da;
  border-radius: 8px;
  margin: 20px 0;
}

.error-state p {
  margin-bottom: 20px;
  font-weight: 600;
}

.retry-btn {
  margin-top: 10px;
}

/* 신청자 목록 모달 스타일 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #2c5aa0;
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.applications-list-modal {
  padding: 20px;
}

.no-applications {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.application-item-modal {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 15px;
  border-left: 4px solid #2c5aa0;
}

.applicant-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.applicant-details h4 {
  margin: 0;
  color: #2c5aa0;
  font-size: 1.1rem;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-item .label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 600;
}

.contact-item .value {
  color: #333;
  font-size: 0.95rem;
}

/* 스크린 리더를 위한 숨김 텍스트 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 접근성을 위한 고대비 모드 지원 */
@media (prefers-contrast: high) {
  .btn {
    border: 2px solid currentColor;
  }

  .status-badge {
    border: 1px solid currentColor;
  }
}

/* 모션을 줄인 사용자를 위한 애니메이션 제거 */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }

  .btn {
    transition: none;
  }
}
</style>