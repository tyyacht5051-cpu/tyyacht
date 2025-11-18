<template>
    <div class="notice">
        <section class="hero-section">
            <div class="hero-background"></div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">공지사항</h1>
                <p class="hero-subtitle">통영요트학교의 중요한 소식과 공지사항을 확인하세요</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="notice-overview">
                    <h2>공지사항 안내</h2>
                    <p>
                        각 분야별 공지사항과 중요한 알림사항을 확인하실 수 있습니다.
                        새로운 소식은 정기적으로 업데이트됩니다.
                    </p>
                </div>

                <div class="notice-filter">
                    <div class="filter-buttons">
                        <button
                            v-for="category in filterCategories"
                            :key="category.id"
                            @click="setCurrentCategory(category.id)"
                            :class="['filter-btn', { active: currentCategory === category.id }]">
                            {{ category.icon }} {{ category.title }}
                        </button>
                    </div>
                </div>

                <div class="notices-list">
                    <h2>공지사항</h2>
                    <div class="notices-table">
                        <div class="table-header">
                            <div class="col-category">분류</div>
                            <div class="col-title">제목</div>
                            <div class="col-date">작성일</div>
                            <div class="col-views">조회</div>
                        </div>
                        <div v-if="filteredNotices.length === 0" class="no-notices">
                            <p>등록된 공지사항이 없습니다.</p>
                        </div>
                        <div v-for="notice in filteredNotices" :key="notice.id" class="table-row" :class="{ 'important-row': notice.important }" @click="viewNotice(notice)">
                            <div class="col-category">
                                <span class="category-badge" :class="notice.categoryClass">{{ notice.category }}</span>
                            </div>
                            <div class="col-title">
                                <span class="title-text" :class="{ 'important-title': notice.important }">{{ notice.title }}</span>
                                <span v-if="isNewNotice(notice.date)" class="new-badge">NEW</span>
                                <span v-if="notice.important" class="important-badge">📌 중요</span>
                            </div>
                            <div class="col-date">{{ formatDate(notice.date) }}</div>
                            <div class="col-views">{{ notice.views }}</div>
                        </div>
                    </div>
                </div>


                <!-- 일반 사용자 안내 -->
                <div v-if="!isAdmin && authStore.state.isAuthenticated" class="user-info-section">
                    <div class="info-box">
                        <div class="info-icon">📖</div>
                        <div class="info-text">
                            <h3>공지사항 안내</h3>
                            <p>공지사항은 관리자가 작성한 중요한 소식입니다. 모든 공지사항을 자유롭게 열람하실 수 있습니다.</p>
                        </div>
                    </div>
                </div>

                <!-- 관리자 기능 -->
                <div class="admin-section" v-if="isAdmin">
                    <h2>관리자 기능</h2>
                    <div class="admin-buttons">
                        <button class="admin-btn manage-btn" @click="manageNotices">
                            🗂️ 공지사항 관리
                        </button>
                    </div>
                    <p style="margin-top: 15px; color: #666; font-size: 0.9rem;">
                        💡 공지사항 작성은 각 카테고리 페이지에서 진행할 수 있습니다.
                    </p>
                </div>

            </div>
        </section>
    </div>
</template>

<script>
import authStore from '../stores/auth.js'
import { API_BASE_URL } from '../config/env.js'
import axios from 'axios'
import { useToast } from '../components/Toast.vue'

export default {
    name: 'Notice',
    setup() {
        const toast = useToast()
        return { toast }
    },
    data() {
        return {
            authStore,
            currentCategory: 'all',
            categories: [
                {
                    id: 'exemption',
                    title: '면제교육',
                    description: '요트면허 면제교육 관련 공지사항',
                    icon: '📋',
                    count: 0,
                    latestDate: null,
                    path: '/notice/exemption'
                },
                {
                    id: 'cruise',
                    title: '크루즈요트',
                    description: '크루즈요트 교육 및 체험 관련 공지',
                    icon: '⛵',
                    count: 0,
                    latestDate: null,
                    path: '/notice/cruise'
                },
                {
                    id: 'dinghy',
                    title: '딩기요트',
                    description: '딩기요트 교육 및 체험 관련 공지',
                    icon: '🚤',
                    count: 0,
                    latestDate: null,
                    path: '/notice/dinghy'
                },
                {
                    id: 'recruitment',
                    title: '채용',
                    description: '직원 채용 및 모집 공고',
                    icon: '👥',
                    count: 0,
                    latestDate: null,
                    path: '/notice/recruitment'
                },
                {
                    id: 'others',
                    title: '기타',
                    description: '기타 일반 공지사항',
                    icon: '📢',
                    count: 0,
                    latestDate: null,
                    path: '/notice/others'
                }
            ],
            allNotices: []
        };
    },
    computed: {
        isAdmin() {
            return this.authStore.state.isAuthenticated && this.authStore.state.user?.role === 'admin';
        },
        filterCategories() {
            return [
                { id: 'all', title: '전체', icon: '📋' },
                ...this.categories
            ];
        },
        filteredNotices() {
            if (this.currentCategory === 'all') {
                return this.allNotices;
            }
            return this.allNotices.filter(notice => notice.category_id === this.currentCategory);
        }
    },
    async mounted() {
        await this.loadData();
    },
    methods: {
        setCurrentCategory(categoryId) {
      console.log('🔵 카테고리 클릭됨:', categoryId);
      if (categoryId === 'all') {
          this.currentCategory = categoryId;
      } else {
          const category = this.categories.find(c => c.id === categoryId);
          console.log('🔍 찾은 카테고리:', category);
          if (category && category.path) {
              console.log('✅ 이동할 경로:', category.path);
              this.$router.push(category.path);
          } else {
              console.log('❌ 카테고리 또는 경로 없음');
          }
      }
  },
        viewNotice(notice) {
            // 카테고리별 개별 페이지로 직접 이동
            this.$router.push(`/notice/${notice.category_id}/${notice.id}`);
        },
        async loadData() {
            try {
                // 공지사항 목록 로드 (모든 공지사항)
                const noticesRes = await axios.get(`${API_BASE_URL}/api/notices`, {
                    params: { limit: 50 }
                });
                this.allNotices = noticesRes.data.map(notice => ({
                    ...notice,
                    category: this.getCategoryTitle(notice.category_id),
                    categoryClass: notice.category_id,
                    date: notice.created_at.split('T')[0]
                }));

                // 카테고리별 통계 로드
                const statsRes = await axios.get(`${API_BASE_URL}/api/notices/stats/categories`);
                this.updateCategoryStats(statsRes.data);
            } catch (error) {
                console.error('데이터 로드 중 오류:', error);
                this.toast.error('공지사항을 불러오는데 실패했습니다.', '⚠️ 로드 오류');
            }
        },
        getCategoryTitle(categoryId) {
            const category = this.categories.find(c => c.id === categoryId);
            return category ? category.title : '기타';
        },
        updateCategoryStats(stats) {
            this.categories.forEach(category => {
                const stat = stats.find(s => s.category_id === category.id);
                if (stat) {
                    category.count = stat.count;
                    category.latestDate = stat.latest_date ? stat.latest_date.split('T')[0] : null;
                }
            });
        },
        manageNotices() {
            this.$router.push('/admin');
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            const today = new Date();
            const diffTime = today - date;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return '오늘';
            if (diffDays === 1) return '어제';
            if (diffDays < 7) return `${diffDays}일 전`;
            
            return date.toLocaleDateString('ko-KR');
        },
        isNewNotice(dateString) {
            const noticeDate = new Date(dateString);
            const today = new Date();
            const diffTime = today - noticeDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            return diffDays <= 3;
        }
    }
};
</script>

<style scoped>
.notice {
    padding-top: 70px;
}

.hero-section {
    position: relative;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.hero-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #2c5aa0, #1e3d6f);
    z-index: 1;
}

.hero-background::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('/images/yacht-hero.jpg');
    background-size: cover;
    background-position: center;
    opacity: 0.3;
    z-index: 2;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(44, 90, 160, 0.7);
    z-index: 3;
}

.hero-content {
    position: relative;
    z-index: 4;
    text-align: center;
    color: white;
}

.hero-title {
    font-size: 3rem;
    margin-bottom: 1rem;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.content-section {
    padding: 80px 0;
    background: white;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.container > div {
    margin-bottom: 80px;
}

.container h2 {
    color: #2c5aa0;
    font-size: 2rem;
    text-align: center;
    margin-bottom: 40px;
}

.notice-overview p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #666;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
}

.notice-filter {
    margin-bottom: 40px;
}

.filter-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
}

.filter-btn {
    padding: 10px 20px;
    border: 2px solid #e0e0e0;
    background: white;
    color: #666;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
}

.filter-btn:hover {
    border-color: #2c5aa0;
    color: #2c5aa0;
}

.filter-btn.active {
    background: #2c5aa0;
    border-color: #2c5aa0;
    color: white;
}

.no-notices {
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 1.1rem;
}

.notices-table {
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
}

.table-header {
    display: grid;
    grid-template-columns: 120px 1fr 120px 80px;
    background: #f8f9fa;
    padding: 15px;
    font-weight: 600;
    color: #333;
    border-bottom: 1px solid #f0f0f0;
}

.table-row {
    display: grid;
    grid-template-columns: 120px 1fr 120px 80px;
    padding: 15px;
    border-bottom: 1px solid #f9f9f9;
    cursor: pointer;
    transition: all 0.3s;
}

.table-row:hover {
    background: #f8f9fa;
}

.table-row.important-row {
    background: linear-gradient(to right, #fff9e6, #ffffff);
    border-left: 4px solid #ffc107;
    font-weight: 500;
}

.table-row.important-row:hover {
    background: linear-gradient(to right, #fff3cd, #f8f9fa);
    box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2);
}

.col-category {
    display: flex;
    align-items: center;
}

.category-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
}

.category-badge.exemption {
    background: #28a745;
}

.category-badge.cruise {
    background: #007bff;
}

.category-badge.dinghy {
    background: #17a2b8;
}

.category-badge.recruitment {
    background: #6f42c1;
}

.category-badge.others {
    background: #6c757d;
}

.col-title {
    display: flex;
    align-items: center;
    gap: 8px;
}

.title-text {
    color: #333;
    flex: 1;
}

.title-text.important-title {
    color: #d97706;
    font-weight: 600;
}

.new-badge {
    background: #dc3545;
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 600;
}

.important-badge {
    background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
    color: #000;
    font-size: 0.75rem;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 700;
    box-shadow: 0 2px 4px rgba(255, 193, 7, 0.3);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.85;
    }
}

.col-date,
.col-views {
    display: flex;
    align-items: center;
    color: #666;
    font-size: 0.9rem;
}

.admin-section {
    background: #f8f9fa;
    padding: 30px;
    border-radius: 15px;
}

.admin-section h2 {
    text-align: left;
    margin-bottom: 20px;
}

.admin-buttons {
    display: flex;
    gap: 15px;
}

.admin-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.write-btn {
    background: #28a745;
    color: white;
}

.manage-btn {
    background: white;
    color: #2c5aa0;
    border: 2px solid #2c5aa0;
}

.admin-btn:hover {
    transform: translateY(-2px);
}


/* 사용자 안내 섹션 */
.user-info-section {
    margin-bottom: 40px;
}

.info-box {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    border: 1px solid #2196f3;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
}

.info-icon {
    font-size: 2.5rem;
    margin-right: 20px;
    flex-shrink: 0;
}

.info-text h3 {
    color: #1976d2;
    font-size: 1.3rem;
    margin-bottom: 8px;
}

.info-text p {
    color: #424242;
    font-size: 1rem;
    line-height: 1.6;
    margin: 0;
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 2.2rem;
    }
    
    .hero-subtitle {
        font-size: 1rem;
    }

    .filter-buttons {
        justify-content: flex-start;
        gap: 8px;
    }

    .filter-btn {
        padding: 8px 16px;
        font-size: 0.9rem;
    }

    .table-header,
    .table-row {
        grid-template-columns: 80px 1fr 80px 60px;
        font-size: 0.8rem;
        padding: 10px;
    }

    .admin-buttons {
        flex-direction: column;
    }

    .form-actions {
        flex-direction: column;
    }

    .info-box {
        flex-direction: column;
        text-align: center;
        padding: 15px;
    }

    .info-icon {
        margin-right: 0;
        margin-bottom: 15px;
    }
}
</style>
