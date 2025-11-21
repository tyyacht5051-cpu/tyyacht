<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- 로고 섹션 -->
      <div class="nav-logo" @click="goHome">
        <img src="/images/logo.png" alt="통영요트학교" class="logo-img">
        <span class="logo-text"></span>
      </div>
      
      <!-- 메뉴 섹션 -->
      <ul class="nav-menu" :class="{ active: isMenuOpen }">
        <li class="nav-item">
          <router-link to="/about" class="nav-link">학교소개</router-link>
        </li>
        <li class="nav-item dropdown" :class="{ active: isDropdownOpen }" @mouseenter="showDropdown" @mouseleave="hideDropdown">
          <span class="nav-link dropdown-toggle">교육/체험프로그램</span>
          <ul class="dropdown-menu" :class="{ active: isDropdownOpen }">
            <li><router-link to="/program-guide" class="dropdown-link">프로그램안내</router-link></li>
            <li><router-link to="/cruise-education" class="dropdown-link">크루저 요트 교육</router-link></li>
            <li><router-link to="/cruise-experience" class="dropdown-link">크루저 요트 체험</router-link></li>
            <li><router-link to="/dinghy-education" class="dropdown-link">딩기 요트 교육</router-link></li>
            <li><router-link to="/dinghy-experience" class="dropdown-link">딩기 요트 체험</router-link></li>
            <li><router-link to="/paddleboard-experience" class="dropdown-link">패들보드 체험</router-link></li>
          </ul>
        </li>
        <li class="nav-item">
          <router-link to="/license" class="nav-link">요트면허취득과정</router-link>
        </li>
        <li class="nav-item dropdown" :class="{ active: isCommunityDropdownOpen }" @mouseenter="showCommunityDropdown" @mouseleave="hideCommunityDropdown">
          <span class="nav-link dropdown-toggle">커뮤니티</span>
          <ul class="dropdown-menu" :class="{ active: isCommunityDropdownOpen }">
            <li><router-link to="/community" class="dropdown-link">커뮤니티 홈</router-link></li>
            <li><router-link to="/community/photo-gallery" class="dropdown-link">포토갤러리</router-link></li>
            <li><router-link to="/community/video-gallery" class="dropdown-link">동영상갤러리</router-link></li>
            <li><router-link to="/community/free-board" class="dropdown-link">자유게시판</router-link></li>
            <li><router-link to="/community/review-board" class="dropdown-link">후기게시판</router-link></li>
            <li><router-link to="/community/crew-recruitment" class="dropdown-link">크루모집게시판</router-link></li>
          </ul>
        </li>
        <li class="nav-item dropdown" :class="{ active: isNoticeDropdownOpen }" @mouseenter="showNoticeDropdown" @mouseleave="hideNoticeDropdown">
          <span class="nav-link dropdown-toggle">공지사항</span>
          <ul class="dropdown-menu" :class="{ active: isNoticeDropdownOpen }">
            <li><router-link to="/notice" class="dropdown-link">공지사항 홈</router-link></li>
            <li><router-link to="/notice/exemption" class="dropdown-link">면제교육</router-link></li>
            <li><router-link to="/notice/cruise" class="dropdown-link">크루즈요트</router-link></li>
            <li><router-link to="/notice/dinghy" class="dropdown-link">딩기요트</router-link></li>
            <li><router-link to="/notice/recruitment" class="dropdown-link">채용</router-link></li>
            <li><router-link to="/notice/others" class="dropdown-link">기타</router-link></li>
          </ul>
        </li>
        <li class="nav-item">
          <router-link to="/experience-apply" class="nav-link apply-btn">승선체험 신청</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/exemption-apply" class="nav-link apply-btn">면제교육 신청</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/education-apply" class="nav-link apply-btn">요트교육 신청</router-link>
        </li>
        <!-- 로그인되지 않은 경우 -->
        <li v-if="!authStore.state.isAuthenticated" class="nav-item">
          <router-link to="/login" class="nav-link login-btn">로그인</router-link>
        </li>
        
        <!-- 로그인된 경우 -->
        <template v-if="authStore.state.isAuthenticated">
          <li class="nav-item">
            <router-link to="/mypage" class="nav-link mypage-btn">마이페이지</router-link>
          </li>
          <li v-if="authStore.isAdmin()" class="nav-item">
            <router-link to="/admin" class="nav-link admin-btn">관리자</router-link>
          </li>
          <li class="nav-item">
            <button @click="handleLogout" class="nav-link logout-btn">로그아웃</button>
          </li>
        </template>
      </ul>
      
      <!-- 모바일 햄버거 메뉴 -->
      <div class="hamburger" @click="toggleMenu" :class="{ active: isMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </div>
     </div>
  </nav>
</template>

<script>
import authStore from '../stores/auth.js'

export default {
  name: 'Navbar',
  data() {
    return {
      isMenuOpen: false,
      isDropdownOpen: false,
      isCommunityDropdownOpen: false,
      isNoticeDropdownOpen: false,
      authStore
    }
  },
  watch: {
    // 라우트 변경 시 모바일 메뉴 닫기
    '$route'() {
      this.closeMenu()
    }
  },
  mounted() {
    // 외부 클릭 감지 이벤트 리스너 추가
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    // 컴포넌트 제거 시 이벤트 리스너 정리
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    goHome() {
      this.$router.push('/')
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
    closeMenu() {
      this.isMenuOpen = false
      this.isDropdownOpen = false
      this.isCommunityDropdownOpen = false
      this.isNoticeDropdownOpen = false
    },
    handleClickOutside(event) {
      // 모바일 메뉴가 열려있을 때만 동작
      if (!this.isMenuOpen) return

      // 네비게이션 영역 전체를 참조
      const navbar = this.$el

      // 클릭한 요소가 네비게이션 외부인지 확인
      if (navbar && !navbar.contains(event.target)) {
        this.closeMenu()
      }
    },
    showDropdown() {
      this.isDropdownOpen = true
    },
    hideDropdown() {
      this.isDropdownOpen = false
    },
    showCommunityDropdown() {
      this.isCommunityDropdownOpen = true
    },
    hideCommunityDropdown() {
      this.isCommunityDropdownOpen = false
    },
    showNoticeDropdown() {
      this.isNoticeDropdownOpen = true
    },
    hideNoticeDropdown() {
      this.isNoticeDropdownOpen = false
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
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.nav-logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.3s;
}

.nav-logo:hover {
  opacity: 0.8;
}

.logo-img {
  height: 70px;
  margin-right: 10px;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: #2c5aa0;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin: 0 8px;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 8px 10px;
  border-radius: 5px;
  transition: all 0.3s;
  white-space: nowrap;
  font-size: 0.9rem;
}

.nav-link:hover {
  background: #f0f0f0;
  color: #2c5aa0;
}

.nav-link.router-link-active {
  background: #2c5aa0;
  color: white;
}

.apply-btn {
  background: #2c5aa0;
  color: white !important;
  margin-left: 5px;
  font-size: 0.85rem;
  padding: 8px 12px;
}

.apply-btn:hover {
  background: #1e3d6f !important;
}

.login-btn {
  background: #28a745;
  color: white !important;
  margin-left: 5px;
  font-size: 0.85rem;
  padding: 8px 12px;
}

.login-btn:hover {
  background: #218838 !important;
}

.mypage-btn {
  background: #17a2b8;
  color: white !important;
  margin-left: 5px;
  font-size: 0.85rem;
  padding: 8px 12px;
}

.mypage-btn:hover {
  background: #138496 !important;
}

.admin-btn {
  background: #dc3545;
  color: white !important;
  margin-left: 5px;
  font-size: 0.85rem;
  padding: 8px 12px;
}

.admin-btn:hover {
  background: #c82333 !important;
}

.logout-btn {
  background: #6c757d;
  color: white !important;
  margin-left: 5px;
  font-size: 0.85rem;
  padding: 8px 12px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.3s;
  text-decoration: none;
  white-space: nowrap;
  font-weight: 500;
  display: inline-block;
  text-align: center;
  vertical-align: middle;
}

.logout-btn:hover {
  background: #5a6268 !important;
}

/* 햄버거 메뉴 (모바일용) */
.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  padding: 5px;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background: #333;
  margin: 3px 0;
  transition: 0.3s;
}

/* 태블릿/작은 데스크톱 반응형 */
@media (max-width: 1024px) {
  .nav-item {
    margin: 0 5px;
  }
  
  .nav-link {
    font-size: 0.85rem;
    padding: 6px 8px;
  }
  
  .apply-btn, .login-btn, .mypage-btn, .admin-btn, .logout-btn {
    font-size: 0.8rem;
    padding: 6px 10px;
  }
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .nav-menu {
    position: fixed;
    left: 0;
    top: 70px;
    flex-direction: column;
    background: white;
    width: 100%;
    text-align: center;
    transition: transform 0.3s ease;
    box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
    padding: 20px 0;
    transform: translateY(-100vh);
    max-height: calc(100vh - 70px);
    overflow-y: auto;
  }

  .nav-menu.active {
    transform: translateY(0);
  }

  .nav-item {
    margin: 10px 0;
  }

  .hamburger {
    display: flex;
  }

  .hamburger.active span:nth-child(2) {
    opacity: 0;
  }

  .hamburger.active span:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
  }

  .hamburger.active span:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
  }
}

/* 드롭다운 메뉴 스타일 */
.dropdown {
  position: relative;
}

.dropdown-toggle {
  cursor: pointer;
  user-select: none;
}

.dropdown-toggle:after {
  content: ' ▼';
  font-size: 10px;
  margin-left: 5px;
  transition: transform 0.3s;
}

.dropdown.active .dropdown-toggle:after {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s;
  z-index: 1000;
  list-style: none;
  padding: 8px 0;
  margin: 0;
}

.dropdown-menu.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-menu li {
  margin: 0;
}

.dropdown-link {
  display: block;
  padding: 8px 16px;
  color: #333;
  text-decoration: none;
  transition: background 0.3s;
  white-space: nowrap;
}

.dropdown-link:hover {
  background: #f5f5f5;
  color: #2c5aa0;
}

.dropdown-link.router-link-active {
  background: #2c5aa0;
  color: white;
}
</style>