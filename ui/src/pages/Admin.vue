<template>
  <div class="admin-container" v-if="isAdmin">
    <div class="admin-header">
      <h1>관리자 대시보드</h1>
      <div class="admin-nav">
        <button @click="activeTab = 'users'" :class="{ active: activeTab === 'users' }">
          사용자 관리
        </button>
        <button @click="activeTab = 'logs'" :class="{ active: activeTab === 'logs' }">
          로그인 기록
        </button>
        <button @click="activeTab = 'schedules'" :class="{ active: activeTab === 'schedules' }">
          면제교육 일정
        </button>
        <button @click="activeTab = 'applications'" :class="{ active: activeTab === 'applications' }">
          면제교육 신청자
        </button>
        <button @click="activeTab = 'boarding'" :class="{ active: activeTab === 'boarding' }">
          승선 체험 신청서
        </button>
        <button @click="activeTab = 'education'" :class="{ active: activeTab === 'education' }">
          요트교육 신청자
        </button>
        <button @click="activeTab = 'notices'" :class="{ active: activeTab === 'notices' }">
          공지사항 관리
        </button>
        <button @click="activeTab = 'community'" :class="{ active: activeTab === 'community' }">
          커뮤니티 관리
        </button>
        <button @click="activeTab = 'settings'" :class="{ active: activeTab === 'settings' }">
          설정
        </button>
        <button @click="logout" class="logout-btn">
          로그아웃
        </button>
      </div>
    </div>

    <!-- 사용자 관리 탭 -->
    <div v-if="activeTab === 'users'" class="admin-content">
      <!-- 통계 카드 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-number">{{ stats.totalUsers || 0 }}</div>
          <div class="stat-label">총 사용자</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.activeUsers || 0 }}</div>
          <div class="stat-label">활성 사용자</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.recentLogins || 0 }}</div>
          <div class="stat-label">최근 7일 로그인</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.inactiveUsers || 0 }}</div>
          <div class="stat-label">비활성 사용자</div>
        </div>
      </div>

      <div class="content-header">
        <h2>등록된 사용자 목록</h2>
        <button @click="refreshUsers" class="refresh-btn">새로고침</button>
      </div>
      
      <div class="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>사용자명</th>
              <th>이메일</th>
              <th>이름</th>
              <th>전화번호</th>
              <th>역할</th>
              <th>상태</th>
              <th>가입일</th>
              <th>마지막 로그인</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.full_name }}</td>
              <td>{{ user.phone || '-' }}</td>
              <td>
                <span :class="['role-badge', user.role]">
                  {{ user.role === 'admin' ? '관리자' : '일반사용자' }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', user.is_active ? 'active' : 'inactive']">
                  {{ user.is_active ? '활성' : '비활성' }}
                </span>
              </td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>{{ user.last_login ? formatDate(user.last_login) : '-' }}</td>
              <td>
                <button 
                  @click="toggleUserStatus(user)" 
                  :class="['action-btn', user.is_active ? 'deactivate' : 'activate']"
                  :disabled="user.role === 'admin'"
                >
                  {{ user.is_active ? '비활성화' : '활성화' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 로그인 기록 탭 -->
    <div v-if="activeTab === 'logs'" class="admin-content">
      <div class="content-header">
        <h2>로그인 기록</h2>
        <button @click="refreshLogs" class="refresh-btn">새로고침</button>
      </div>
      
      <div class="logs-display">
        <div v-if="loginLogs.length === 0" class="no-logs">
          로그인 기록이 없습니다.
        </div>
        <div v-else class="logs-content">
          <div v-for="(log, index) in loginLogs" :key="index" 
               :class="['log-entry', log.includes('FAILED') ? 'failed' : 'success']">
            {{ log }}
          </div>
        </div>
      </div>
    </div>

    <!-- 면제교육 일정 탭 -->
    <div v-if="activeTab === 'schedules'" class="admin-content">
      <div class="content-header">
        <h2>면제교육 일정 관리</h2>
        <button @click="saveSchedules" class="save-btn">저장</button>
      </div>
      
      <div class="schedule-section">
        <div class="schedule-info">
          <p>각 월별로 면제교육이 가능한 날짜를 최대 5일까지 선택할 수 있습니다.</p>
          <p>선택된 날짜는 사용자들이 면제교육 신청 시 선택할 수 있는 날짜로 표시됩니다.</p>
        </div>
        
        <div class="calendar-container">
          <div class="month-navigation">
            <button @click="previousMonth" class="nav-btn">&lt;</button>
            <h3>{{ currentMonthYear }}</h3>
            <button @click="nextMonth" class="nav-btn">&gt;</button>
          </div>
          
          <div class="calendar">
            <div class="calendar-header">
              <div class="day-header">일</div>
              <div class="day-header">월</div>
              <div class="day-header">화</div>
              <div class="day-header">수</div>
              <div class="day-header">목</div>
              <div class="day-header">금</div>
              <div class="day-header">토</div>
            </div>
            
            <div class="calendar-body">
              <div 
                v-for="day in calendarDays" 
                :key="day.date"
                :class="[
                  'calendar-day',
                  { 
                    'other-month': !day.isCurrentMonth,
                    'selected': day.isSelected,
                    'disabled': !day.isCurrentMonth || day.isPast
                  }
                ]"
                @click="toggleDay(day)"
              >
                {{ day.day }}
              </div>
            </div>
          </div>
          
          <div class="selected-dates">
            <h4>선택된 날짜 ({{ selectedDates.length }}/5)</h4>
            <div class="date-tags">
              <span 
                v-for="date in selectedDates" 
                :key="date"
                class="date-tag"
                @click="removeDate(date)"
              >
                {{ formatSelectedDate(date) }}
                <span class="remove-btn">×</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 면제교육 신청자 탭 -->
    <div v-if="activeTab === 'applications'" class="admin-content">
      <div class="content-header">
        <h2>면제교육 신청자 관리</h2>
        <div class="header-actions">
          <button @click="exportApplications" class="export-btn">엑셀 다운로드</button>
          <button @click="refreshApplications" class="refresh-btn">새로고침</button>
        </div>
      </div>
      
      <div class="applications-filters">
        <div class="filter-group">
          <label>신청일자:</label>
          <input type="date" v-model="applicationFilters.startDate">
          <span>~</span>
          <input type="date" v-model="applicationFilters.endDate">
        </div>
        <div class="filter-group">
          <label>교육과정:</label>
          <select v-model="applicationFilters.courseType">
            <option value="">전체</option>
            <option value="general">면제교육</option>
            <option value="practical">실기 연수</option>
          </select>
        </div>
        <div class="filter-group">
          <label>상태:</label>
          <select v-model="applicationFilters.status">
            <option value="">전체</option>
            <option value="pending">대기중</option>
            <option value="approved">승인</option>
            <option value="rejected">거부</option>
          </select>
        </div>
        <button @click="applyFilters" class="filter-btn">필터 적용</button>
      </div>

      <div class="applications-stats">
        <div class="stat-card">
          <div class="stat-number">{{ applicationStats.total || 0 }}</div>
          <div class="stat-label">총 신청자</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ applicationStats.pending || 0 }}</div>
          <div class="stat-label">승인 대기</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ applicationStats.approved || 0 }}</div>
          <div class="stat-label">승인 완료</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ applicationStats.thisMonth || 0 }}</div>
          <div class="stat-label">이번달 신청</div>
        </div>
      </div>
      
      <div class="applications-table">
        <table>
          <thead>
            <tr>
              <th>신청일</th>
              <th>이름</th>
              <th>연락처</th>
              <th>이메일</th>
              <th>생년월일</th>
              <th>주소</th>
              <th>자격증</th>
              <th>교육과정</th>
              <th>희망일자</th>
              <th>할인혜택</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in applications" :key="app.id" :class="['app-row', app.status]">
              <td>{{ formatDate(app.created_at) }}</td>
              <td class="name-cell">
                <strong>{{ app.name }}</strong>
                <span v-if="!app.user_id" class="guest-badge">비회원</span>
              </td>
              <td>{{ app.phone }}</td>
              <td>{{ app.email }}</td>
              <td>{{ formatDate(app.birth_date) }}</td>
              <td class="address-cell">{{ app.address }}</td>
              <td>{{ formatLicense(app.boat_license_number) }}</td>
              <td class="course-cell">
                <span :class="['course-badge', app.education_type]">
                  {{ app.education_type === 'general' ? '면제교육' : '실기연수' }}
                </span>
              </td>
              <td class="dates-cell">
                <div v-for="date in parsePreferredDates(app.preferred_date)" :key="date" class="date-item">
                  {{ formatShortDate(date) }}
                </div>
              </td>
              <td>{{ formatDiscount(app.special_requests) }}</td>
              <td>
                <span :class="['status-badge', app.status]">
                  {{ getStatusLabel(app.status) }}
                </span>
              </td>
              <td class="actions-cell">
                <select 
                  @change="updateApplicationStatus(app, $event.target.value)" 
                  :value="app.status"
                  class="status-select"
                >
                  <option value="pending">대기중</option>
                  <option value="approved">승인</option>
                  <option value="rejected">거부</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="applications.length === 0" class="no-applications">
          신청자가 없습니다.
        </div>
      </div>
    </div>

    <!-- 승선 체험 신청서 탭 -->
    <div v-if="activeTab === 'boarding'" class="admin-content">
      <!-- 통계 카드 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-number">{{ boardingStats.total || 0 }}</div>
          <div class="stat-label">총 신청</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ boardingStats.pending || 0 }}</div>
          <div class="stat-label">대기중</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ boardingStats.confirmed || 0 }}</div>
          <div class="stat-label">승인됨</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ boardingStats.cancelled || 0 }}</div>
          <div class="stat-label">취소됨</div>
        </div>
      </div>

      <div class="content-header">
        <h2>승선 체험 신청서 관리</h2>
        <div class="header-actions">
          <button @click="exportBoardingApplications" class="export-btn">엑셀 다운로드</button>
          <button @click="refreshBoardingApplications" class="refresh-btn">새로고침</button>
        </div>
      </div>
      
      <div class="applications-filters">
        <div class="filter-group">
          <label>신청일자:</label>
          <input type="date" v-model="boardingFilters.startDate">
          <span>~</span>
          <input type="date" v-model="boardingFilters.endDate">
        </div>
        <div class="filter-group">
          <label>체험 유형:</label>
          <select v-model="boardingFilters.experienceType">
            <option value="">전체</option>
            <option value="cruise">크루즈요트</option>
            <option value="dinghy">딩기요트</option>
            <option value="paddleboard">패들보드</option>
          </select>
        </div>
        <div class="filter-group">
          <label>상태:</label>
          <select v-model="boardingFilters.status">
            <option value="">전체</option>
            <option value="pending">대기중</option>
            <option value="confirmed">승인됨</option>
            <option value="cancelled">취소됨</option>
          </select>
        </div>
        <button @click="applyBoardingFilters" class="filter-btn">필터 적용</button>
      </div>

      <div class="applications-table-container">
        <table class="applications-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>연락처</th>
              <th>이메일</th>
              <th>체험 유형</th>
              <th>시간</th>
              <th>희망 날짜</th>
              <th>인원</th>
              <th>상태</th>
              <th>신청일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in boardingApplications" :key="app.id">
              <td>{{ app.id }}</td>
              <td>{{ app.name }}</td>
              <td>{{ app.phone }}</td>
              <td>{{ app.email }}</td>
              <td>
                <span class="program-badge" :class="app.experienceType">
                  {{ getExperienceTypeLabel(app.experienceType) }}
                </span>
              </td>
              <td>{{ app.duration || '-' }}</td>
              <td>{{ formatDate(app.desiredDate) }}</td>
              <td>{{ app.participants }}명</td>
              <td>
                <select v-model="app.status" @change="updateBoardingApplicationStatus(app, app.status)" 
                        class="status-select" :class="app.status">
                  <option value="pending">대기중</option>
                  <option value="confirmed">승인됨</option>
                  <option value="cancelled">취소됨</option>
                </select>
              </td>
              <td>{{ formatDate(app.createdAt) }}</td>
              <td class="actions">
                <button @click="viewBoardingApplication(app)" class="view-btn">상세보기</button>
                <button @click="deleteBoardingApplication(app.id)" class="delete-btn">삭제</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 요트교육 신청자 탭 -->
    <div v-if="activeTab === 'education'" class="admin-content">
      <!-- 통계 카드 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-number">{{ educationStats.total || 0 }}</div>
          <div class="stat-label">총 신청</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ educationStats.pending || 0 }}</div>
          <div class="stat-label">대기중</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ educationStats.confirmed || 0 }}</div>
          <div class="stat-label">승인됨</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ educationStats.thisMonth || 0 }}</div>
          <div class="stat-label">이번달 신청</div>
        </div>
      </div>

      <div class="content-header">
        <h2>요트교육 신청자 관리</h2>
        <div class="header-actions">
          <button @click="exportEducationApplications" class="export-btn">엑셀 다운로드</button>
          <button @click="refreshEducationApplications" class="refresh-btn">새로고침</button>
        </div>
      </div>
      
      <div class="applications-filters">
        <div class="filter-group">
          <label>신청일자:</label>
          <input type="date" v-model="educationFilters.startDate">
          <span>~</span>
          <input type="date" v-model="educationFilters.endDate">
        </div>
        <div class="filter-group">
          <label>교육과정:</label>
          <select v-model="educationFilters.courseType">
            <option value="">전체</option>
            <option value="크루즈">크루즈 요트 교육</option>
            <option value="딩기">딩기 요트 교육</option>
          </select>
        </div>
        <div class="filter-group">
          <label>상태:</label>
          <select v-model="educationFilters.status">
            <option value="">전체</option>
            <option value="pending">대기중</option>
            <option value="approved">승인</option>
            <option value="rejected">거부</option>
          </select>
        </div>
        <button @click="applyEducationFilters" class="filter-btn">필터 적용</button>
      </div>

      <div class="applications-table-container">
        <table class="applications-table">
          <thead>
            <tr>
              <th>신청일</th>
              <th>이름</th>
              <th>연락처</th>
              <th>이메일</th>
              <th>생년월일</th>
              <th>성별</th>
              <th>소재지</th>
              <th>교육과정</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in educationApplications" :key="app.id" :class="['app-row', app.status]">
              <td>{{ formatDate(app.createdAt) }}</td>
              <td class="name-cell">
                <strong>{{ app.name }}</strong>
                <span v-if="!app.user_id" class="guest-badge">비회원</span>
              </td>
              <td>{{ app.phone }}</td>
              <td>{{ app.email }}</td>
              <td>{{ formatDate(app.birthDate) }}</td>
              <td>{{ formatGender(app.gender) }}</td>
              <td class="address-cell">{{ app.address }}</td>
              <td class="course-cell">
                <span :class="['course-badge', getCourseTypeClass(app.courseType)]">
                  {{ app.courseType }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', app.status]">
                  {{ getStatusLabel(app.status) }}
                </span>
              </td>
              <td class="actions-cell">
                <select 
                  @change="updateEducationApplicationStatus(app, $event.target.value)" 
                  :value="app.status"
                  class="status-select"
                >
                  <option value="pending">대기중</option>
                  <option value="approved">승인</option>
                  <option value="rejected">거부</option>
                </select>
                <button @click="viewEducationApplication(app)" class="view-btn">상세보기</button>
                <button @click="deleteEducationApplication(app.id)" class="delete-btn">삭제</button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="educationApplications.length === 0" class="no-applications">
          요트교육 신청자가 없습니다.
        </div>
      </div>
    </div>

    <!-- 공지사항 관리 탭 -->
    <div v-if="activeTab === 'notices'" class="admin-content">
      <div class="content-header">
        <h2>공지사항 관리</h2>
        <div class="header-actions">
          <button @click="refreshNotices" class="refresh-btn">새로고침</button>
        </div>
      </div>
      
      <div class="notices-filters">
        <div class="filter-group">
          <label>카테고리:</label>
          <select v-model="noticeFilters.category">
            <option value="">전체</option>
            <option value="exemption">면제교육</option>
            <option value="cruise">크루즈요트</option>
            <option value="dinghy">딩기요트</option>
            <option value="recruitment">채용</option>
            <option value="others">기타</option>
          </select>
        </div>
        <div class="filter-group">
          <label>작성일자:</label>
          <input type="date" v-model="noticeFilters.startDate">
          <span>~</span>
          <input type="date" v-model="noticeFilters.endDate">
        </div>
        <button @click="applyNoticeFilters" class="filter-btn">필터 적용</button>
      </div>

      <div class="notices-table-container">
        <table class="notices-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>카테고리</th>
              <th>제목</th>
              <th>작성자</th>
              <th>작성일</th>
              <th>조회수</th>
              <th>상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="notice in notices" :key="notice.id">
              <td>{{ notice.id }}</td>
              <td>
                <span class="category-badge" :class="notice.categoryClass">
                  {{ getCategoryLabel(notice.category) }}
                </span>
              </td>
              <td class="title-cell">
                <span class="notice-title">{{ notice.title }}</span>
                <span v-if="notice.important" class="important-badge">중요</span>
              </td>
              <td>{{ notice.author || '관리자' }}</td>
              <td>{{ formatDate(notice.date) }}</td>
              <td>{{ notice.views }}</td>
              <td>
                <span class="status-badge" :class="notice.published ? 'published' : 'draft'">
                  {{ notice.published ? '게시중' : '임시저장' }}
                </span>
              </td>
              <td class="actions">
                <button @click="editNotice(notice)" class="edit-btn">수정</button>
                <button @click="deleteNotice(notice.id)" class="delete-btn">삭제</button>
                <button @click="toggleNoticeStatus(notice)" class="toggle-btn">
                  {{ notice.published ? '비공개' : '공개' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 커뮤니티 관리 탭 -->
    <div v-if="activeTab === 'community'" class="admin-content">
      <div class="content-header">
        <h2>커뮤니티 관리</h2>
        <div class="header-actions">
          <button @click="refreshCommunity" class="refresh-btn">새로고침</button>
        </div>
      </div>
      
      <div class="community-filters">
        <div class="filter-group">
          <label>콘텐츠 타입:</label>
          <select v-model="communityFilters.contentType">
            <option value="">전체</option>
            <option value="posts">게시글</option>
            <option value="photos">사진</option>
            <option value="videos">동영상</option>
          </select>
        </div>
        <div class="filter-group">
          <label>게시판:</label>
          <select v-model="communityFilters.board">
            <option value="">전체</option>
            <option value="free">자유게시판</option>
            <option value="qna">질문답변</option>
            <option value="review">후기게시판</option>
            <option value="gallery">갤러리</option>
          </select>
        </div>
        <div class="filter-group">
          <label>작성일자:</label>
          <input type="date" v-model="communityFilters.startDate">
          <span>~</span>
          <input type="date" v-model="communityFilters.endDate">
        </div>
        <button @click="applyCommunityFilters" class="filter-btn">필터 적용</button>
      </div>

      <div class="community-table-container">
        <table class="community-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>타입</th>
              <th>카테고리</th>
              <th>제목/파일명</th>
              <th>작성자</th>
              <th>작성일</th>
              <th>조회수</th>
              <th>미리보기</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredCommunityItems" :key="`${item.type}-${item.id}`">
              <td>{{ item.id }}</td>
              <td>
                <span class="type-badge" :class="item.type">
                  {{ getContentTypeLabel(item.type) }}
                </span>
              </td>
              <td>
                <span class="category-badge" :class="item.category">
                  {{ getCategoryLabel(item.category) }}
                </span>
              </td>
              <td class="title-cell">
                <span class="item-title">{{ item.title || item.filename }}</span>
                <div v-if="item.description" class="item-description">{{ item.description }}</div>
              </td>
              <td>{{ item.author }}</td>
              <td>{{ formatDate(item.date) }}</td>
              <td>{{ item.views || 0 }}</td>
              <td class="preview-cell">
                <div v-if="item.type === 'photo'" class="photo-preview">
                  <img :src="getPreviewUrl(item)" :alt="item.title" class="preview-image" />
                </div>
                <div v-else-if="item.type === 'video'" class="video-preview">
                  <video :src="getPreviewUrl(item)" class="preview-video" muted></video>
                  <div class="video-duration">{{ item.duration || '00:00' }}</div>
                </div>
                <div v-else class="text-preview">
                  {{ item.content?.substring(0, 50) || '내용 없음' }}...
                </div>
              </td>
              <td class="actions">
                <button @click="viewCommunityItem(item)" class="view-btn">상세보기</button>
                <button @click="editCommunityItem(item)" class="edit-btn">수정</button>
                <button @click="deleteCommunityItem(item)" class="delete-btn">삭제</button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="filteredCommunityItems.length === 0" class="no-content">
          표시할 콘텐츠가 없습니다.
        </div>
      </div>
    </div>

    <!-- 설정 탭 -->
    <div v-if="activeTab === 'settings'" class="admin-content">
      <div class="content-header">
        <h2>시스템 설정</h2>
      </div>
      
      <div class="settings-section">
        <div class="setting-item">
          <h3>데이터베이스 상태</h3>
          <p>현재 데이터베이스가 정상적으로 연결되어 있습니다.</p>
          <button @click="checkDatabase" class="check-btn">연결 확인</button>
        </div>
        
        <div class="setting-item">
          <h3>관리자 정보</h3>
          <div class="admin-info">
            <p><strong>사용자명:</strong> {{ currentUser.username }}</p>
            <p><strong>이메일:</strong> {{ currentUser.email }}</p>
            <p><strong>이름:</strong> {{ currentUser.fullName }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 접근 권한 없음 -->
  <div v-else class="access-denied">
    <div class="access-denied-content">
      <h1>접근 권한 없음</h1>
      <p>관리자만 접근할 수 있는 페이지입니다.</p>
      <button @click="$router.push('/login')" class="login-redirect-btn">로그인하기</button>
    </div>
  </div>
</template>

<script>
import { API_BASE_URL } from '../config/env.js';
import axios from 'axios';
import authStore from '../stores/auth.js';

import { useToast } from '../components/Toast.vue'

export default {
  name: 'Admin',
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      authStore,
      activeTab: 'users',
      users: [],
      loginLogs: [],
      isLoading: false,
      stats: {},
      currentDate: new Date(),
      selectedDates: [],
      schedules: {},
      applications: [],
      applicationStats: {},
      applicationFilters: {
        startDate: '',
        endDate: '',
        courseType: '',
        status: ''
      },
      // 승선 체험 신청서 관련 데이터
      boardingApplications: [],
      boardingStats: {},
      boardingFilters: {
        status: '',
        experienceType: '',
        startDate: '',
        endDate: ''
      },
      boardingCurrentPage: 1,
      boardingItemsPerPage: 10,
      // 요트교육 신청자 관련 데이터
      educationApplications: [],
      educationStats: {},
      educationFilters: {
        status: '',
        courseType: '',
        startDate: '',
        endDate: ''
      },
      // 공지사항 관리 관련 데이터
      notices: [],
      noticeFilters: {
        category: '',
        startDate: '',
        endDate: ''
      },
      // 커뮤니티 관리 관련 데이터
      communityPosts: [],
      communityPhotos: [],
      communityVideos: [],
      communityFilters: {
        contentType: '',
        board: '',
        startDate: '',
        endDate: ''
      }
    };
  },
  computed: {
    isAdmin() {
      return this.authStore.state.isAuthenticated && this.authStore.isAdmin();
    },
    currentUser() {
      return this.authStore.state.user || {};
    },
    
    filteredCommunityItems() {
      let items = [];
      
      // 게시글 추가
      const posts = this.communityPosts.map(post => ({
        ...post,
        type: 'post'
      }));
      
      // 사진 추가
      const photos = this.communityPhotos.map(photo => ({
        ...photo,
        type: 'photo'
      }));
      
      // 동영상 추가
      const videos = this.communityVideos.map(video => ({
        ...video,
        type: 'video'
      }));
      
      items = [...posts, ...photos, ...videos];
      
      // 필터링 적용
      if (this.communityFilters.contentType) {
        items = items.filter(item => item.type === this.communityFilters.contentType);
      }
      
      if (this.communityFilters.board) {
        items = items.filter(item => item.category === this.communityFilters.board);
      }
      
      if (this.communityFilters.startDate) {
        items = items.filter(item => item.date >= this.communityFilters.startDate);
      }
      
      if (this.communityFilters.endDate) {
        items = items.filter(item => item.date <= this.communityFilters.endDate);
      }
      
      // 날짜순 정렬
      return items.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    currentMonthYear() {
      return this.currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
    },
    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      const days = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dateString = date.toISOString().split('T')[0];
        const isCurrentMonth = date.getMonth() === month;
        const isPast = date < today;
        
        days.push({
          date: dateString,
          day: date.getDate(),
          isCurrentMonth,
          isPast,
          isSelected: this.selectedDates.includes(dateString)
        });
      }
      
      return days;
    }
  },
  async mounted() {
    if (!this.isAdmin) {
      this.$router.push('/login');
      return;
    }
    
    try {
      await this.loadUsers();
      await this.loadStats();
      await this.loadSchedules();
      await this.loadApplications();
      await this.loadApplicationStats();
      // 승선 체험 데이터 초기 로드
      if (this.activeTab === 'boarding') {
        await this.loadBoardingApplications();
        await this.loadBoardingStats();
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        this.toast.urgent('관리자 권한이 없거나 로그인이 필요합니다.');
        this.$router.push('/login');
      }
    }
  },
  methods: {
    async loadStats() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/stats`);
        this.stats = response.data;
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    },

    async loadUsers() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/users`);
        this.users = response.data;
      } catch (error) {
        console.error('Failed to load users:', error);
        this.toast.error('사용자 목록을 불러오는데 실패했습니다.');
      }
    },

    async loadLoginLogs() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/logs`);
        this.loginLogs = response.data.logs || [];
      } catch (error) {
        console.error('Failed to load login logs:', error);
        this.toast.error('로그인 기록을 불러오는데 실패했습니다.');
      }
    },

    async toggleUserStatus(user) {
      if (user.role === 'admin') {
        this.toast.warning('관리자 계정은 상태를 변경할 수 없습니다.');
        return;
      }

      try {
        await axios.patch(`${API_BASE_URL}/api/admin/users/${user.id}/toggle-status`);
        user.is_active = !user.is_active;
        this.toast.success(`사용자 상태가 ${user.is_active ? '활성화' : '비활성화'}되었습니다.`);
      } catch (error) {
        console.error('Failed to toggle user status:', error);
        this.toast.error('사용자 상태 변경에 실패했습니다.');
      }
    },

    async refreshUsers() {
      await this.loadUsers();
    },

    async refreshLogs() {
      if (this.activeTab === 'logs' && this.loginLogs.length === 0) {
        await this.loadLoginLogs();
      } else {
        await this.loadLoginLogs();
      }
    },

    async checkDatabase() {
      try {
        await axios.get(`${API_BASE_URL}/api/admin/database-status`);
        this.toast.success('데이터베이스 연결이 정상적입니다.', '✓ 연결 성공');
      } catch (error) {
        console.error('Database check failed:', error);
        this.toast.error('데이터베이스 연결에 문제가 있습니다.', '⚠ 연결 실패');
      }
    },

    // 승선 체험 신청서 관련 메서드
    async loadBoardingApplications() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/applications/cruise`, {
          params: {
            status: this.boardingFilters.status,
            limit: this.boardingItemsPerPage,
            offset: (this.boardingCurrentPage - 1) * this.boardingItemsPerPage
          }
        });
        
        // 실제 API 응답 데이터를 관리자 페이지 형식에 맞게 변환
        this.boardingApplications = (response.data || []).map(app => ({
          id: app.id,
          name: app.name,
          phone: app.phone,
          email: app.email,
          experienceType: 'cruise', // 크루즈 체험
          duration: this.extractDurationFromSpecialRequests(app.special_requests),
          desiredDate: app.experience_date,
          participants: app.participants,
          status: this.mapCruiseStatusToBoardingStatus(app.status),
          createdAt: app.created_at,
          message: app.special_requests || ''
        }));
      } catch (error) {
        console.error('Failed to load boarding applications:', error);
        // 에러 시 빈 배열
        this.boardingApplications = [];
        if (this.toast) {
          this.toast.error('승선 체험 신청서 목록을 불러오는데 실패했습니다.');
        }
      }
    },

    async loadBoardingStats() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/applications/stats`);
        
        // 실제 API 응답 데이터 사용
        const cruiseStats = (response.data && response.data.cruise) ? response.data.cruise : [];
        
        const getStatusCount = (status) => {
          if (!Array.isArray(cruiseStats)) return 0;
          const stat = cruiseStats.find(s => s && s.status === status);
          return stat ? (stat.count || 0) : 0;
        };
        
        this.boardingStats = {
          total: Array.isArray(cruiseStats) ? cruiseStats.reduce((sum, stat) => sum + (stat.count || 0), 0) : 0,
          pending: getStatusCount('pending'),
          confirmed: getStatusCount('approved') + getStatusCount('completed'),
          cancelled: getStatusCount('rejected')
        };
      } catch (error) {
        console.error('Failed to load boarding stats:', error);
        // 임시 통계 데이터
        this.boardingStats = {
          total: this.boardingApplications.length,
          pending: this.boardingApplications.filter(app => app.status === 'pending').length,
          confirmed: this.boardingApplications.filter(app => app.status === 'confirmed').length,
          cancelled: this.boardingApplications.filter(app => app.status === 'cancelled').length
        };
      }
    },

    async refreshBoardingApplications() {
      await this.loadBoardingApplications();
      await this.loadBoardingStats();
      if (this.toast) {
        this.toast.success('승선 체험 신청서 목록이 새로고침되었습니다.', '🔄 새로고침');
      }
    },

    async applyBoardingFilters() {
      this.boardingCurrentPage = 1;
      await this.loadBoardingApplications();
      await this.loadBoardingStats();
    },

    async updateBoardingApplicationStatus(app, newStatus) {
      try {
        // 관리자 페이지 상태를 API 상태로 변환
        const apiStatus = this.mapBoardingStatusToCruiseStatus(newStatus);
        
        await axios.put(`${API_BASE_URL}/api/applications/cruise/${app.id}/status`, {
          status: apiStatus
        });
        
        app.status = newStatus;
        if (this.toast) {
          this.toast.success(`신청 상태가 ${this.getBoardingStatusLabel(newStatus)}로 변경되었습니다.`, '📋 상태 변경');
        }
        await this.loadBoardingStats();
      } catch (error) {
        console.error('Failed to update boarding application status:', error);
        if (this.toast) {
          this.toast.error('상태 변경에 실패했습니다.');
        }
      }
    },

    mapBoardingStatusToCruiseStatus(boardingStatus) {
      const statusMap = {
        'pending': 'pending',
        'confirmed': 'approved',
        'cancelled': 'rejected'
      };
      return statusMap[boardingStatus] || boardingStatus;
    },

    async exportBoardingApplications() {
      try {
        // 실제 구현에서는 서버에서 엑셀 파일을 생성해서 다운로드
        const response = await axios.get(`${API_BASE_URL}/api/applications/cruise/export`, {
          params: this.boardingFilters,
          responseType: 'blob'
        });

        // 임시로 클라이언트에서 CSV 파일 생성
        const csvContent = this.generateBoardingCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `승선체험신청서_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.toast.success('승선 체험 신청서 목록이 다운로드되었습니다.', '📊 다운로드 완료');
      } catch (error) {
        console.error('Failed to export boarding applications:', error);
        this.toast.error('엑셀 다운로드에 실패했습니다.', '📄 다운로드 실패');
      }
    },

    generateBoardingCSV() {
      const headers = ['ID', '이름', '연락처', '이메일', '체험유형', '희망날짜', '인원', '상태', '신청일', '메시지'];
      const rows = this.boardingApplications.map(app => [
        app.id,
        app.name,
        app.phone,
        app.email,
        this.getExperienceTypeLabel(app.experienceType),
        app.desiredDate,
        app.participants + '명',
        this.getBoardingStatusLabel(app.status),
        this.formatDate(app.createdAt),
        app.message || ''
      ]);

      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
    },

    async viewBoardingApplication(app) {
      const message = `
신청자: ${app.name}
연락처: ${app.phone}
이메일: ${app.email}
체험 유형: ${this.getExperienceTypeLabel(app.experienceType)}
희망 날짜: ${app.desiredDate}
참가 인원: ${app.participants}명
상태: ${this.getBoardingStatusLabel(app.status)}
신청일: ${this.formatDate(app.createdAt)}
메시지: ${app.message || '없음'}
      `;
      
      if (this.toast) {
        this.toast.info(message, '👁️ 승선 체험 신청서 상세');
      }
    },

    async deleteBoardingApplication(appId) {
      if (!confirm('정말로 이 신청서를 삭제하시겠습니까?')) return;
      
      try {
        await axios.delete(`${API_BASE_URL}/api/applications/cruise/${appId}`);
        
        // 임시로 배열에서 제거
        this.boardingApplications = this.boardingApplications.filter(app => app.id !== appId);
        await this.loadBoardingStats();
        
        if (this.toast) {
          this.toast.success('승선 체험 신청서가 삭제되었습니다.', '🗑️ 삭제 완료');
        }
      } catch (error) {
        console.error('Failed to delete boarding application:', error);
        if (this.toast) {
          this.toast.error('신청서 삭제에 실패했습니다.');
        }
      }
    },

    getExperienceTypeLabel(type) {
      const typeMap = {
        'cruise': '크루즈요트',
        'dinghy': '딩기요트',
        'paddleboard': '패들보드'
      };
      return typeMap[type] || type;
    },

    getBoardingStatusLabel(status) {
      const statusMap = {
        'pending': '대기중',
        'confirmed': '승인됨',
        'cancelled': '취소됨'
      };
      return statusMap[status] || status;
    },

    async logout() {
      if (confirm('로그아웃 하시겠습니까?')) {
        await this.authStore.logout();
        this.$router.push('/');
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleString('ko-KR');
    },

    // 스케줄 관리 메서드들
    async loadSchedules() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/schedules`);
        this.schedules = response.data;
        this.updateSelectedDatesForCurrentMonth();
      } catch (error) {
        console.error('Failed to load schedules:', error);
      }
    },

    async saveSchedules() {
      try {
        const monthKey = `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}`;
        
        const response = await axios.post(`${API_BASE_URL}/api/schedules`, {
          month: monthKey,
          dates: this.selectedDates
        });
        
        this.schedules[monthKey] = this.selectedDates;
        this.toast.celebrate('일정이 성공적으로 저장되었습니다.', '📅 일정 저장 완료');
      } catch (error) {
        console.error('Failed to save schedules:', error);
        this.toast.error('일정 저장에 실패했습니다.');
      }
    },

    updateSelectedDatesForCurrentMonth() {
      const monthKey = `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}`;
      this.selectedDates = this.schedules[monthKey] || [];
    },

    toggleDay(day) {
      if (day.disabled || !day.isCurrentMonth || day.isPast) return;
      
      const dateIndex = this.selectedDates.indexOf(day.date);
      
      if (dateIndex > -1) {
        this.selectedDates.splice(dateIndex, 1);
      } else if (this.selectedDates.length < 5) {
        this.selectedDates.push(day.date);
        this.selectedDates.sort();
      } else {
        this.toast.warning('한 달에 최대 5일까지만 선택할 수 있습니다.', '📅 선택 제한');
      }
    },

    removeDate(date) {
      const index = this.selectedDates.indexOf(date);
      if (index > -1) {
        this.selectedDates.splice(index, 1);
      }
    },

    formatSelectedDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    },

    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
      this.updateSelectedDatesForCurrentMonth();
    },

    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
      this.updateSelectedDatesForCurrentMonth();
    },

    // 신청자 관리 메서드들
    async loadApplications() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/applications/exemption`, {
          params: this.applicationFilters
        });
        this.applications = response.data;
      } catch (error) {
        console.error('Failed to load applications:', error);
      }
    },

    async loadApplicationStats() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/applications/exemption/stats`);
        this.applicationStats = response.data;
      } catch (error) {
        console.error('Failed to load application stats:', error);
      }
    },

    async refreshApplications() {
      await this.loadApplications();
      await this.loadApplicationStats();
    },

    async applyFilters() {
      await this.loadApplications();
    },

    async updateApplicationStatus(app, newStatus) {
      try {
        await axios.patch(`${API_BASE_URL}/api/applications/exemption/${app.id}/status`, {
          status: newStatus
        });
        
        app.status = newStatus;
        this.toast.success(`신청 상태가 ${this.getStatusLabel(newStatus)}로 변경되었습니다.`, '📋 상태 변경');
        await this.loadApplicationStats();
      } catch (error) {
        console.error('Failed to update application status:', error);
        this.toast.error('상태 변경에 실패했습니다.');
      }
    },

    async exportApplications() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/applications/exemption/export`, {
          params: this.applicationFilters,
          responseType: 'blob'
        });
        
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `면제교육신청자_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to export applications:', error);
        this.toast.error('엑셀 다운로드에 실패했습니다.', '📄 다운로드 실패');
      }
    },

    parsePreferredDates(datesString) {
      if (!datesString) return [];
      try {
        return JSON.parse(datesString);
      } catch {
        return datesString.split(',').map(d => d.trim());
      }
    },

    formatLicense(license) {
      if (!license) return '-';
      const licenseMap = {
        'general1': '일반조종 1급',
        'general2': '일반조종 2급'
      };
      return licenseMap[license] || license;
    },

    formatDiscount(discount) {
      if (!discount) return '-';
      const discountMap = {
        'tongyeong': '통영시민할인 20%',
        'partner': '협력단체 20%',
        'disabled': '장애인할인 20%'
      };
      return discountMap[discount] || discount;
    },

    formatShortDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric'
      });
    },

    getStatusLabel(status) {
      const statusMap = {
        'pending': '대기중',
        'approved': '승인',
        'rejected': '거부'
      };
      return statusMap[status] || status;
    },

    // 공지사항 관리 메서드
    async loadNotices() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/notices`, {
          params: this.noticeFilters
        });
        
        // 임시 데이터
        this.notices = [
          {
            id: 1,
            title: '2024년 상반기 요트면허 면제교육 일정 안내',
            content: '2024년 상반기 요트면허 면제교육 일정을 안내드립니다...',
            category: 'exemption',
            categoryClass: 'exemption',
            author: '관리자',
            date: '2024-03-16',
            views: 156,
            important: true,
            published: true
          },
          {
            id: 2,
            title: '크루즈요트 체험 프로그램 요금 변경 안내',
            content: '2024년 4월부터 크루즈요트 체험 프로그램 요금이 조정됩니다...',
            category: 'cruise',
            categoryClass: 'cruise',
            author: '관리자',
            date: '2024-03-15',
            views: 89,
            important: false,
            published: true
          },
          {
            id: 3,
            title: '딩기요트 교육 안전수칙 업데이트',
            content: '딩기요트 교육 시 준수해야 할 안전수칙이 업데이트되었습니다...',
            category: 'dinghy',
            categoryClass: 'dinghy',
            author: '관리자',
            date: '2024-03-14',
            views: 67,
            important: false,
            published: false
          },
          {
            id: 4,
            title: '통영요트학교 강사 채용 공고',
            content: '통영요트학교에서 요트 교육 강사를 모집합니다...',
            category: 'recruitment',
            categoryClass: 'recruitment',
            author: '관리자',
            date: '2024-03-13',
            views: 234,
            important: true,
            published: true
          },
          {
            id: 5,
            title: '봄철 요트 체험 프로그램 운영 안내',
            content: '봄철을 맞이하여 특별 요트 체험 프로그램을 운영합니다...',
            category: 'others',
            categoryClass: 'others',
            author: '관리자',
            date: '2024-03-12',
            views: 123,
            important: false,
            published: true
          }
        ];
      } catch (error) {
        console.error('Failed to load notices:', error);
        this.notices = [];
      }
    },

    async refreshNotices() {
      await this.loadNotices();
      this.toast.success('공지사항 목록이 새로고침되었습니다.', '🔄 새로고침');
    },

    async applyNoticeFilters() {
      await this.loadNotices();
    },

    async editNotice(notice) {
      // 공지사항 수정 기능 (추후 구현)
      const message = `
제목: ${notice.title}
내용: ${notice.content.substring(0, 100)}...
카테고리: ${this.getCategoryLabel(notice.category)}
작성일: ${this.formatDate(notice.date)}
조회수: ${notice.views}
      `;
      
      this.toast.info(message, '✏️ 공지사항 수정');
    },

    async deleteNotice(noticeId) {
      if (!confirm('정말로 이 공지사항을 삭제하시겠습니까?')) return;
      
      try {
        await axios.delete(`${API_BASE_URL}/api/notices/${noticeId}`);
        
        this.notices = this.notices.filter(notice => notice.id !== noticeId);
        this.toast.success('공지사항이 삭제되었습니다.', '🗑️ 삭제 완료');
      } catch (error) {
        console.error('Failed to delete notice:', error);
        this.toast.error('공지사항 삭제에 실패했습니다.');
      }
    },

    async toggleNoticeStatus(notice) {
      try {
        const newStatus = !notice.published;
        await axios.patch(`${API_BASE_URL}/api/notices/${notice.id}/status`, {
          published: newStatus
        });
        
        notice.published = newStatus;
        this.toast.success(`공지사항이 ${newStatus ? '공개' : '비공개'}로 변경되었습니다.`, '🔄 상태 변경');
      } catch (error) {
        console.error('Failed to toggle notice status:', error);
        this.toast.error('공지사항 상태 변경에 실패했습니다.');
      }
    },

    getCategoryLabel(category) {
      const categoryMap = {
        'exemption': '면제교육',
        'cruise': '크루즈요트',
        'dinghy': '딩기요트',
        'recruitment': '채용',
        'others': '기타'
      };
      return categoryMap[category] || category;
    },

    // 커뮤니티 관리 메서드
    async loadCommunityPosts() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/community`, {
          params: this.communityFilters
        });
        
        // 임시 데이터
        this.communityPosts = [
          {
            id: 1,
            title: '요트 체험 후기입니다',
            content: '어제 처음으로 요트를 타보았는데...',
            board: 'review',
            author: '김요트',
            date: '2024-03-16',
            views: 45,
            comments: 3
          },
          {
            id: 2,
            title: '요트 면허 취득에 대해 질문이 있습니다',
            content: '요트 면허 취득 과정에서 궁금한 점이...',
            board: 'qna',
            author: '해대간',
            date: '2024-03-15',
            views: 78,
            comments: 5
          },
          {
            id: 3,
            title: '통영에서 요트 체험하기 좋은 곳',
            content: '통영에서 요트 체험하기 좋은 곳을 추천해드려요...',
            board: 'free',
            author: '바다사랑',
            date: '2024-03-14',
            views: 92,
            comments: 7
          },
          {
            id: 4,
            title: '요트 교육 수강 후기',
            content: '어제 요트 교육을 수강했는데 정말 좋았습니다...',
            board: 'review',
            author: '서울에서온객',
            date: '2024-03-13',
            views: 134,
            comments: 12
          },
          {
            id: 5,
            title: '요트 체험 예약 시간 문의',
            content: '요트 체험 예약을 하고 싶은데 시간에 대해...',
            board: 'qna',
            author: '따뜻한바람',
            date: '2024-03-12',
            views: 67,
            comments: 2
          }
        ];
      } catch (error) {
        console.error('Failed to load community posts:', error);
        this.communityPosts = [];
      }
    },

    async refreshCommunity() {
      await this.loadCommunityPosts();
      this.toast.success('커뮤니티 게시글 목록이 새로고침되었습니다.', '🔄 새로고침');
    },

    async applyCommunityFilters() {
      await this.loadCommunityPosts();
    },

    async viewCommunityPost(post) {
      const message = `
제목: ${post.title}
내용: ${post.content.substring(0, 100)}...
게시판: ${this.getBoardLabel(post.board)}
작성자: ${post.author}
작성일: ${this.formatDate(post.date)}
조회수: ${post.views}
댓글수: ${post.comments}
      `;
      
      this.toast.info(message, '👁️ 커뮤니티 게시글 상세');
    },

    async deleteCommunityPost(postId) {
      if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
      
      try {
        await axios.delete(`${API_BASE_URL}/api/community/${postId}`);
        
        this.communityPosts = this.communityPosts.filter(post => post.id !== postId);
        this.toast.success('커뮤니티 게시글이 삭제되었습니다.', '🗑️ 삭제 완료');
      } catch (error) {
        console.error('Failed to delete community post:', error);
        this.toast.error('커뮤니티 게시글 삭제에 실패했습니다.');
      }
    },

    getBoardLabel(board) {
      const boardMap = {
        'free': '자유게시판',
        'qna': '질문답변',
        'review': '후기게시판'
      };
      return boardMap[board] || board;
    },

    // 승선체험 데이터 매핑 메서드들
    extractDurationFromSpecialRequests(specialRequests) {
      if (!specialRequests) return '-';
      
      // special_requests에서 시간 정보 추출
      const timeMatch = specialRequests.match(/(단순 체험|체험 플러스|1시간|1시간 30분|4시간|8시간)/i);
      return timeMatch ? timeMatch[1] : '크루즈 체험';
    },

    mapCruiseStatusToBoardingStatus(cruiseStatus) {
      const statusMap = {
        'pending': 'pending',
        'approved': 'confirmed', 
        'completed': 'confirmed',
        'rejected': 'cancelled'
      };
      return statusMap[cruiseStatus] || cruiseStatus;
    },

    // 요트교육 신청 관리 메서드들
    async loadEducationApplications() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/applications/education`, {
          params: this.educationFilters
        });
        
        // 실제 API 응답 데이터를 관리자 페이지 형식에 맞게 변환
        this.educationApplications = (response.data || []).map(app => ({
          id: app.id,
          name: app.name,
          phone: app.phone,
          email: app.email,
          birthDate: app.birthDate,
          gender: app.gender,
          address: app.address,
          license: app.license || '',
          courseType: app.courseType,
          preferredDates: app.preferredDates || [],
          discountEligibility: app.discountEligibility || '',
          experience: app.experience || 'none',
          motivation: app.motivation || '',
          status: app.status || 'pending',
          createdAt: app.created_at,
          user_id: app.user_id
        }));
      } catch (error) {
        console.error('Failed to load education applications:', error);
        // 임시 데이터로 대체
        this.educationApplications = [
          {
            id: 1,
            name: '김교육',
            phone: '010-1234-5678',
            email: 'education@example.com',
            birthDate: '1990-05-15',
            gender: 'male',
            address: '경상남도 통영시',
            courseType: '크루즈-초급과정',
            status: 'pending',
            createdAt: '2024-03-16T10:30:00Z',
            user_id: null
          },
          {
            id: 2,
            name: '이요트',
            phone: '010-9876-5432',
            email: '',
            birthDate: '1985-08-22',
            gender: 'female',
            address: '부산광역시 해운대구',
            courseType: '딩기요트-토파즈 우노 기초',
            status: 'approved',
            createdAt: '2024-03-15T14:20:00Z',
            user_id: 2
          }
        ];
      }
    },

    async loadEducationStats() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/applications/education/stats`);
        this.educationStats = response.data;
      } catch (error) {
        console.error('Failed to load education stats:', error);
        // 임시 통계 데이터
        this.educationStats = {
          total: this.educationApplications.length,
          pending: this.educationApplications.filter(app => app.status === 'pending').length,
          confirmed: this.educationApplications.filter(app => app.status === 'approved').length,
          thisMonth: this.educationApplications.filter(app => {
            const appDate = new Date(app.createdAt);
            const now = new Date();
            return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
          }).length
        };
      }
    },

    async refreshEducationApplications() {
      await this.loadEducationApplications();
      await this.loadEducationStats();
      if (this.toast) {
        this.toast.success('요트교육 신청자 목록이 새로고침되었습니다.', '🔄 새로고침');
      }
    },

    async applyEducationFilters() {
      await this.loadEducationApplications();
      await this.loadEducationStats();
    },

    async updateEducationApplicationStatus(app, newStatus) {
      try {
        await axios.patch(`${API_BASE_URL}/api/applications/education/${app.id}/status`, {
          status: newStatus
        });
        
        app.status = newStatus;
        this.toast.success(`신청 상태가 ${this.getStatusLabel(newStatus)}로 변경되었습니다.`, '📋 상태 변경');
        await this.loadEducationStats();
      } catch (error) {
        console.error('Failed to update education application status:', error);
        this.toast.error('상태 변경에 실패했습니다.');
      }
    },

    async exportEducationApplications() {
      try {
        // 임시로 클라이언트에서 CSV 파일 생성
        const csvContent = this.generateEducationCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `요트교육신청자_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.toast.success('요트교육 신청자 목록이 다운로드되었습니다.', '📊 다운로드 완료');
      } catch (error) {
        console.error('Failed to export education applications:', error);
        this.toast.error('엑셀 다운로드에 실패했습니다.', '📄 다운로드 실패');
      }
    },

    generateEducationCSV() {
      const headers = ['ID', '이름', '연락처', '이메일', '생년월일', '성별', '소재지', '교육과정', '상태', '신청일'];
      const rows = this.educationApplications.map(app => [
        app.id,
        app.name,
        app.phone,
        app.email || '미입력',
        app.birthDate,
        this.formatGender(app.gender),
        app.address,
        app.courseType,
        this.getStatusLabel(app.status),
        this.formatDate(app.createdAt)
      ]);

      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
    },

    async viewEducationApplication(app) {
      const message = `
신청자: ${app.name}
연락처: ${app.phone}
이메일: ${app.email || '미입력'}
생년월일: ${app.birthDate}
성별: ${this.formatGender(app.gender)}
소재지: ${app.address}
교육과정: ${app.courseType}
상태: ${this.getStatusLabel(app.status)}
신청일: ${this.formatDate(app.createdAt)}
      `;
      
      if (this.toast) {
        this.toast.info(message, '👁️ 요트교육 신청서 상세');
      }
    },

    async deleteEducationApplication(appId) {
      if (!confirm('정말로 이 신청서를 삭제하시겠습니까?')) return;
      
      try {
        await axios.delete(`${API_BASE_URL}/api/applications/education/${appId}`);
        
        // 임시로 배열에서 제거
        this.educationApplications = this.educationApplications.filter(app => app.id !== appId);
        await this.loadEducationStats();
        
        if (this.toast) {
          this.toast.success('요트교육 신청서가 삭제되었습니다.', '🗑️ 삭제 완료');
        }
      } catch (error) {
        console.error('Failed to delete education application:', error);
        if (this.toast) {
          this.toast.error('신청서 삭제에 실패했습니다.');
        }
      }
    },

    formatGender(gender) {
      const genderMap = {
        'male': '남성',
        'female': '여성'
      };
      return genderMap[gender] || gender || '-';
    },

    getCourseTypeClass(courseType) {
      if (courseType?.includes('크루즈') || courseType?.includes('섬간항해')) {
        return 'cruise';
      } else if (courseType?.includes('딩기') || courseType?.includes('토파즈') || courseType?.includes('호비')) {
        return 'dinghy';
      }
      return 'other';
    },

    // 커뮤니티 관리 메서드들
    async loadCommunityPosts() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/community/posts`);
        this.communityPosts = response.data || [];
      } catch (error) {
        console.error('Failed to load community posts:', error);
        // 임시 데이터
        this.communityPosts = [
          {
            id: 1,
            title: '요트 체험 후기',
            content: '정말 즐거운 경험이었습니다...',
            author: '김요트',
            date: '2024-03-15',
            views: 45,
            category: 'review',
            comments: 3
          },
          {
            id: 2,
            title: '요트 관련 질문이 있습니다',
            content: '초보자도 쉽게 배울 수 있나요?',
            author: '이바다',
            date: '2024-03-14',
            views: 23,
            category: 'qna',
            comments: 5
          }
        ];
      }
    },

    async loadCommunityPhotos() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/photos`);
        this.communityPhotos = (response.data || []).map(photo => ({
          id: photo.id,
          title: photo.title,
          filename: photo.original_name,
          description: photo.description,
          author: photo.author_name || '관리자',
          date: photo.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          views: 0,
          category: photo.category_id,
          file_path: photo.file_path
        }));
      } catch (error) {
        console.error('Failed to load photos:', error);
        // 임시 데이터
        this.communityPhotos = [
          {
            id: 1,
            title: '아름다운 일몰',
            filename: 'sunset.jpg',
            description: '통영 바다의 아름다운 일몰',
            author: '관리자',
            date: '2024-03-16',
            views: 120,
            category: 'gallery',
            file_path: '/uploads/photos/sunset.jpg'
          }
        ];
      }
    },

    async loadCommunityVideos() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/videos`);
        this.communityVideos = (response.data || []).map(video => ({
          id: video.id,
          title: video.title,
          filename: video.original_name,
          description: video.description,
          author: video.author_name || '관리자',
          date: video.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          views: video.views || 0,
          category: video.category_id,
          file_path: video.file_path,
          duration: video.duration
        }));
      } catch (error) {
        console.error('Failed to load videos:', error);
        // 임시 데이터
        this.communityVideos = [
          {
            id: 1,
            title: '요트 교육 영상',
            filename: 'education.mp4',
            description: '초보자를 위한 요트 교육',
            author: '관리자',
            date: '2024-03-15',
            views: 85,
            category: 'gallery',
            file_path: '/uploads/videos/education.mp4',
            duration: '05:30'
          }
        ];
      }
    },

    async refreshCommunity() {
      await Promise.all([
        this.loadCommunityPosts(),
        this.loadCommunityPhotos(),
        this.loadCommunityVideos()
      ]);
      this.toast.success('커뮤니티 데이터가 새로고침되었습니다.', '🔄 새로고침');
    },

    applyCommunityFilters() {
      // 필터가 적용되면 computed 속성이 자동으로 갱신됨
      this.toast.info('필터가 적용되었습니다.');
    },

    getContentTypeLabel(type) {
      const labels = {
        post: '게시글',
        photo: '사진',
        video: '동영상'
      };
      return labels[type] || type;
    },

    getCategoryLabel(category) {
      const labels = {
        free: '자유게시판',
        qna: '질문답변',
        review: '후기게시판',
        gallery: '갤러리',
        notice: '공지사항'
      };
      return labels[category] || category;
    },

    getPreviewUrl(item) {
      if (item.file_path) {
        return `${API_BASE_URL}${item.file_path}`;
      }
      return '/default-preview.jpg';
    },

    viewCommunityItem(item) {
      const typeLabel = this.getContentTypeLabel(item.type);
      const message = `
타입: ${typeLabel}
제목: ${item.title || item.filename}
작성자: ${item.author}
작성일: ${this.formatDate(item.date)}
카테고리: ${this.getCategoryLabel(item.category)}
조회수: ${item.views || 0}
${item.description ? `설명: ${item.description}` : ''}
${item.content ? `내용: ${item.content.substring(0, 100)}...` : ''}
      `;
      
      this.toast.info(message, `👁️ ${typeLabel} 상세보기`);
    },

    editCommunityItem(item) {
      const typeLabel = this.getContentTypeLabel(item.type);
      
      // 실제로는 모달이나 별도 페이지를 열어야 하지만, 여기서는 간단한 확인만
      if (confirm(`${typeLabel} "${item.title || item.filename}"을(를) 수정하시겠습니까?`)) {
        this.toast.info(`${typeLabel} 수정 기능은 개발 중입니다.`, '🔧 수정');
        
        // TODO: 실제 수정 모달이나 페이지 열기
        // this.openEditModal(item);
      }
    },

    async deleteCommunityItem(item) {
      const typeLabel = this.getContentTypeLabel(item.type);
      
      if (!confirm(`정말로 이 ${typeLabel}을(를) 삭제하시겠습니까?\n\n제목: ${item.title || item.filename}`)) {
        return;
      }
      
      try {
        let endpoint = '';
        switch (item.type) {
          case 'post':
            endpoint = `/api/community/posts/${item.id}`;
            break;
          case 'photo':
            endpoint = `/api/photos/${item.id}`;
            break;
          case 'video':
            endpoint = `/api/videos/${item.id}`;
            break;
          default:
            throw new Error('알 수 없는 컨텐츠 타입');
        }
        
        await axios.delete(`${API_BASE_URL}${endpoint}`);
        
        // 로컬 데이터에서도 제거
        switch (item.type) {
          case 'post':
            this.communityPosts = this.communityPosts.filter(p => p.id !== item.id);
            break;
          case 'photo':
            this.communityPhotos = this.communityPhotos.filter(p => p.id !== item.id);
            break;
          case 'video':
            this.communityVideos = this.communityVideos.filter(v => v.id !== item.id);
            break;
        }
        
        this.toast.success(`${typeLabel}이(가) 삭제되었습니다.`, '🗑️ 삭제 완료');
      } catch (error) {
        console.error('Failed to delete community item:', error);
        this.toast.error(`${typeLabel} 삭제에 실패했습니다.`, '삭제 오류');
      }
    }
  },

  watch: {
    activeTab(newTab) {
      if (newTab === 'logs' && this.loginLogs.length === 0) {
        this.loadLoginLogs();
      }
      if (newTab === 'boarding' && this.boardingApplications.length === 0) {
        this.loadBoardingApplications();
        this.loadBoardingStats();
      }
      if (newTab === 'notices' && this.notices.length === 0) {
        this.loadNotices();
      }
      if (newTab === 'community' && this.communityPosts.length === 0) {
        this.refreshCommunity();
      }
      if (newTab === 'education' && this.educationApplications.length === 0) {
        this.loadEducationApplications();
        this.loadEducationStats();
      }
    }
  }
};
</script>

<style scoped>
.admin-container {
  min-height: calc(100vh - 140px);
  background: #f8f9fa;
  padding: 20px;
  padding-top: 90px; /* 네비게이션 바 높이만큼 여백 추가 */
}

.admin-header {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-header h1 {
  color: #2c5aa0;
  margin: 0;
}

.admin-nav {
  display: flex;
  gap: 10px;
}

.admin-nav button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  background: #e9ecef;
  color: #333;
}

.admin-nav button.active {
  background: #2c5aa0;
  color: white;
}

.admin-nav button:hover {
  background: #2c5aa0;
  color: white;
}

.logout-btn {
  background: #dc3545 !important;
  color: white !important;
}

.logout-btn:hover {
  background: #c82333 !important;
}

.admin-content {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-left: 4px solid #2c5aa0;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #2c5aa0;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.content-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-header h2 {
  margin: 0;
  color: #333;
}

.refresh-btn, .check-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.refresh-btn:hover, .check-btn:hover {
  background: #218838;
}

.users-table {
  overflow-x: auto;
}

.users-table table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.role-badge,
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.role-badge.admin {
  background: #dc3545;
  color: white;
}

.role-badge.user {
  background: #6c757d;
  color: white;
}

.status-badge.active {
  background: #28a745;
  color: white;
}

.status-badge.inactive {
  background: #6c757d;
  color: white;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.3s;
}

.action-btn.deactivate {
  background: #ffc107;
  color: #212529;
}

.action-btn.activate {
  background: #28a745;
  color: white;
}

.action-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.logs-display {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.no-logs {
  text-align: center;
  color: #6c757d;
  padding: 40px;
}

.logs-content {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.log-entry {
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 4px;
  border-left: 4px solid transparent;
}

.log-entry.success {
  background: #d4edda;
  border-left-color: #28a745;
  color: #155724;
}

.log-entry.failed {
  background: #f8d7da;
  border-left-color: #dc3545;
  color: #721c24;
}

.settings-section {
  padding: 20px;
}

.setting-item {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.setting-item h3 {
  color: #2c5aa0;
  margin-bottom: 10px;
}

.admin-info {
  margin-top: 10px;
}

.admin-info p {
  margin: 5px 0;
}

.access-denied {
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding-top: 70px; /* 네비게이션 바 높이 고려 */
}

.access-denied-content {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.access-denied-content h1 {
  color: #dc3545;
  margin-bottom: 20px;
}

.login-redirect-btn {
  background: #2c5aa0;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 20px;
}

.login-redirect-btn:hover {
  background: #1e3d6f;
}

.save-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.save-btn:hover {
  background: #218838;
}

.schedule-section {
  padding: 20px;
}

.schedule-info {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #2c5aa0;
}

.schedule-info p {
  margin: 5px 0;
  color: #1565c0;
}

.calendar-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.month-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.nav-btn {
  background: #2c5aa0;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.3s;
}

.nav-btn:hover {
  background: #1e3d6f;
}

.month-navigation h3 {
  margin: 0;
  color: #2c5aa0;
  font-size: 1.5rem;
}

.calendar {
  margin-bottom: 30px;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 10px;
}

.day-header {
  text-align: center;
  font-weight: bold;
  padding: 10px;
  background: #f8f9fa;
  color: #2c5aa0;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-day {
  background: white;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.calendar-day:hover:not(.disabled) {
  background: #e3f2fd;
}

.calendar-day.other-month {
  color: #ccc;
  background: #f8f9fa;
}

.calendar-day.selected {
  background: #2c5aa0 !important;
  color: white;
}

.calendar-day.disabled {
  color: #ccc;
  cursor: not-allowed;
  background: #f8f9fa;
}

.selected-dates {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.selected-dates h4 {
  color: #2c5aa0;
  margin-bottom: 15px;
}

.date-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.date-tag {
  background: #2c5aa0;
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.date-tag:hover {
  background: #1e3d6f;
}

.remove-btn {
  font-size: 1.2rem;
  font-weight: bold;
  margin-left: 5px;
}

@media (max-width: 768px) {
  .admin-container {
    padding-top: 80px; /* 모바일에서 네비게이션 바 높이 조정 */
  }

  .admin-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .admin-nav {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .users-table {
    font-size: 0.85rem;
  }
  
  .users-table th,
  .users-table td {
    padding: 8px;
  }

  .calendar-container {
    padding: 10px;
  }

  .calendar-day {
    padding: 10px;
    min-height: 40px;
    font-size: 0.9rem;
  }

  .date-tags {
    gap: 5px;
  }

  .date-tag {
    font-size: 0.8rem;
    padding: 6px 10px;
  }
}

/* 신청자 관리 스타일 */
.header-actions {
  display: flex;
  gap: 10px;
}

.export-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.export-btn:hover {
  background: #218838;
}

.applications-filters {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #333;
}

.filter-group input,
.filter-group select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.filter-btn {
  background: #2c5aa0;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.filter-btn:hover {
  background: #1e3d6f;
}

.applications-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
}

.applications-table {
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
}

.applications-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.applications-table th,
.applications-table td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #eee;
  vertical-align: top;
}

.applications-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 1;
}

.app-row.pending {
  background: rgba(255, 193, 7, 0.1);
}

.app-row.approved {
  background: rgba(40, 167, 69, 0.1);
}

.app-row.rejected {
  background: rgba(220, 53, 69, 0.1);
}

.name-cell {
  min-width: 120px;
}

.guest-badge {
  background: #6c757d;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  margin-left: 5px;
}

.address-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.course-badge.general {
  background: #2c5aa0;
  color: white;
}

.course-badge.practical {
  background: #28a745;
  color: white;
}

.course-badge.cruise {
  background: #007bff;
  color: white;
}

.course-badge.dinghy {
  background: #17a2b8;
  color: white;
}

/* 커뮤니티 관리 스타일 */
.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.type-badge.post {
  background: #28a745;
  color: white;
}

.type-badge.photo {
  background: #fd7e14;
  color: white;
}

.type-badge.video {
  background: #6f42c1;
  color: white;
}

.preview-cell {
  width: 120px;
  text-align: center;
}

.photo-preview .preview-image {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.video-preview {
  position: relative;
  display: inline-block;
}

.video-preview .preview-video {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.video-duration {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.7rem;
  padding: 1px 3px;
  border-radius: 2px;
}

.text-preview {
  font-size: 0.8rem;
  color: #6c757d;
  line-height: 1.2;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-description {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 4px;
}

.no-content {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
}

.dates-cell {
  min-width: 120px;
}

.date-item {
  padding: 2px 6px;
  background: #e3f2fd;
  border-radius: 8px;
  font-size: 0.75rem;
  margin-bottom: 2px;
  display: inline-block;
  margin-right: 4px;
}

.status-select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.no-applications {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
}

@media (max-width: 768px) {
  .applications-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    justify-content: space-between;
  }
  
  .applications-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 15px;
  }
  
  .applications-table {
    font-size: 0.8rem;
  }
  
  .applications-table th,
  .applications-table td {
    padding: 6px 4px;
  }
}

/* 공지사항 및 커뮤니티 관리 스타일 */
.notices-filters,
.community-filters {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
}

.notices-table-container,
.community-table-container {
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
}

.notices-table,
.community-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.notices-table th,
.notices-table td,
.community-table th,
.community-table td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #eee;
  vertical-align: top;
}

.notices-table th,
.community-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 1;
}

.title-cell {
  min-width: 200px;
  max-width: 300px;
}

.notice-title,
.post-title {
  color: #333;
  font-weight: 500;
  display: inline-block;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.board-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.board-badge.free {
  background: #28a745;
}

.board-badge.qna {
  background: #17a2b8;
}

.board-badge.review {
  background: #007bff;
}

.status-badge.published {
  background: #28a745;
  color: white;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
}

.status-badge.draft {
  background: #6c757d;
  color: white;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
}

.edit-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-right: 5px;
}

.edit-btn:hover {
  background: #0056b3;
}

.view-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-right: 5px;
}

.view-btn:hover {
  background: #218838;
}

.delete-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-right: 5px;
}

.delete-btn:hover {
  background: #c82333;
}

.toggle-btn {
  background: #ffc107;
  color: #333;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.toggle-btn:hover {
  background: #e0a800;
}

/* 승선 체험 신청서 관련 스타일 */
.experience-type-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.experience-type-badge.cruise {
  background: #007bff;
}

.experience-type-badge.dinghy {
  background: #17a2b8;
}

.experience-type-badge.paddleboard {
  background: #28a745;
}

.status-select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 0.8rem;
}

.status-select.pending {
  background: #fff3cd;
  color: #856404;
}

.status-select.confirmed {
  background: #d4edda;
  color: #155724;
}

.status-select.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.filters-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 150px;
}

.filter-item label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.filter-item select,
.filter-item input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.page-info {
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-item {
    min-width: auto;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .admin-table,
  .notices-table,
  .community-table {
    min-width: 800px;
  }
  
  .notices-filters,
  .community-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    justify-content: space-between;
  }
}
</style>