<template>
    <div class="notice-exemption">
        <section class="hero-section">
            <div class="hero-background"></div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">면제교육 공지사항</h1>
                <p class="hero-subtitle">요트면허 면제교육 관련 공지사항을 확인하세요</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="notice-header">
                    <div class="breadcrumb">
                        <router-link to="/notice">공지사항</router-link>
                        <span class="separator">></span>
                        <span class="current">면제교육</span>
                    </div>
                    <div class="notice-info">
                        <span class="total-count">총 {{ filteredNotices.length }}개 게시물</span>
                    </div>
                </div>

                <div class="search-section">
                    <div class="search-controls">
                        <select v-model="searchType" class="search-select">
                            <option value="title">제목</option>
                            <option value="content">내용</option>
                            <option value="all">전체</option>
                        </select>
                        <input 
                            v-model="searchKeyword" 
                            type="text" 
                            placeholder="검색어를 입력하세요"
                            class="search-input"
                            @keyup.enter="searchNotices"
                        />
                        <button @click="searchNotices" class="search-btn">검색</button>
                    </div>
                    <div class="admin-controls" v-if="isAdmin">
                        <button @click="createNewPage" class="write-btn">✏️ 글쓰기</button>
                    </div>
                </div>

                <div class="notices-table">
                    <div class="table-header">
                        <div class="col-number">번호</div>
                        <div class="col-title">제목</div>
                        <div class="col-date">작성일</div>
                        <div class="col-views">조회</div>
                    </div>

                    <div v-for="notice in paginatedNotices" :key="notice.id" class="table-row" :class="{ 'important-row': notice.important }">
                        <div class="col-number">{{ notice.id }}</div>
                        <div class="col-title">
                            <router-link :to="`/notice/exemption/${notice.id}`" class="title-link">
                                <span class="title-text" :class="{ 'important-title': notice.important }">{{ notice.title }}</span>
                                <span v-if="isNewNotice(notice.date)" class="new-badge">NEW</span>
                                <span v-if="notice.important" class="important-badge">📌 중요</span>
                            </router-link>
                        </div>
                        <div class="col-date">{{ formatDate(notice.date) }}</div>
                        <div class="col-views">{{ notice.views }}</div>
                    </div>
                </div>

                <div class="empty-state" v-if="filteredNotices.length === 0">
                    <div class="empty-icon">📋</div>
                    <h3>공지사항이 없습니다</h3>
                    <p>관리자가 곧 중요한 소식을 전해드릴 예정입니다.</p>
                </div>

                <!-- 페이지네이션 -->
                <div class="pagination" v-if="totalPages > 1">
                    <button 
                        @click="changePage(page)" 
                        v-for="page in visiblePages" 
                        :key="page"
                        :class="['page-btn', { active: currentPage === page }]"
                    >
                        {{ page }}
                    </button>
                </div>

            </div>
        </section>

        <!-- 뒤로가기 버튼 -->
        <div class="back-button">
            <button @click="goBack" class="back-btn">
                ← 공지사항으로 돌아가기
            </button>
        </div>

        <!-- 이미지 모달 -->
        <div v-if="imageModal.show" class="image-modal" @click="closeImageModal">
            <div class="modal-content" @click.stop>
                <button class="modal-close" @click="closeImageModal">✕</button>
                <img :src="`${API_BASE_URL}${imageModal.image.url}`"
                     :alt="imageModal.image.original_name" />
                <div class="modal-info">
                    <p>{{ imageModal.image.original_name }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useToast } from '../components/Toast.vue';
import authStore from '../stores/auth.js';
import { API_BASE_URL } from '../config/env.js';
import axios from 'axios';

export default {
    name: 'NoticeExemption',
    setup() {
        const toast = useToast()
        return { toast }
    },
    data() {
        return {
            authStore,
            searchType: 'title',
            searchKeyword: '',
            currentPage: 1,
            noticesPerPage: 10,
            imageModal: {
                show: false,
                image: null
            },
            notices: [],
            API_BASE_URL
        };
    },
    
    async mounted() {
        await this.loadNotices();
    },
    computed: {
        isAdmin() {
            return this.authStore.state.isAuthenticated && this.authStore.state.user?.role === 'admin';
        },
        filteredNotices() {
            if (!this.searchKeyword) return this.notices;
            
            return this.notices.filter(notice => {
                switch (this.searchType) {
                    case 'title':
                        return notice.title.includes(this.searchKeyword);
                    case 'content':
                        return notice.content.includes(this.searchKeyword);
                    case 'all':
                        return notice.title.includes(this.searchKeyword) || 
                               notice.content.includes(this.searchKeyword);
                    default:
                        return true;
                }
            });
        },
        paginatedNotices() {
            const start = (this.currentPage - 1) * this.noticesPerPage;
            const end = start + this.noticesPerPage;
            return this.filteredNotices.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredNotices.length / this.noticesPerPage);
        },
        visiblePages() {
            const pages = [];
            const maxVisible = 5;
            let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
            let end = Math.min(this.totalPages, start + maxVisible - 1);
            
            if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1);
            }
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            return pages;
        }
    },
    methods: {
        searchNotices() {
            this.currentPage = 1;
        },
        changePage(page) {
            this.currentPage = page;
        },
        async loadNotices() {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/notices`, {
                    params: {
                        category: 'exemption',
                        limit: 100
                    }
                });
                this.notices = response.data.map(notice => ({
                    ...notice,
                    date: notice.created_at.split('T')[0]
                }));
            } catch (error) {
                console.error('면제교육 공지사항 로드 실패:', error);
                this.toast.error('공지사항을 불러오는데 실패했습니다.', '⚠️ 로드 오류');
            }
        },
        async createNewPage() {
            try {
                // 새로운 빈 공지사항을 서버에 먼저 생성
                const response = await axios.post(`${API_BASE_URL}/api/notices/draft`, {
                    category_id: 'exemption',
                    title: '새 공지사항',
                    content: '내용을 입력하세요...'
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.authStore.state.token}`
                    }
                });

                const newPostId = response.data.id;

                // 새로 생성된 페이지로 이동 (편집 모드)
                this.$router.push(`/notice/exemption/edit/${newPostId}`);
            } catch (error) {
                console.error('새 페이지 생성 실패:', error);
                if (error.response?.status === 401) {
                    this.toast.urgent('로그인이 필요합니다.', '🔐 로그인 필요');
                    this.$router.push('/login');
                } else if (error.response?.status === 403) {
                    this.toast.urgent('관리자만 글을 작성할 수 있습니다.', '⚠️ 권한 없음');
                } else {
                    this.toast.error('새 페이지 생성에 실패했습니다.', '❌ 생성 실패');
                }
            }
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
        },
        goBack() {
            this.$router.push('/notice');
        },
        openImageModal(image) {
            this.imageModal.show = true;
            this.imageModal.image = image;
        },
        closeImageModal() {
            this.imageModal.show = false;
            this.imageModal.image = null;
        }
    }
};
</script>

<style scoped>
.notice-exemption {
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
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.content-section {
    padding: 60px 0;
    background: white;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.notice-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
}

.breadcrumb {
    color: #666;
    font-size: 0.9rem;
}

.breadcrumb a {
    color: #2c5aa0;
    text-decoration: none;
}

.separator {
    margin: 0 8px;
}

.current {
    color: #28a745;
    font-weight: 600;
}

.total-count {
    color: #28a745;
    font-weight: 600;
}

.search-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    gap: 20px;
}

.search-controls {
    display: flex;
    gap: 10px;
    flex: 1;
}

.search-select {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
}

.search-input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
}

.search-btn {
    padding: 10px 20px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
}

.write-btn {
    padding: 10px 20px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    white-space: nowrap;
}

.notices-table {
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 30px;
}

.table-header {
    display: grid;
    grid-template-columns: 80px 1fr 120px 80px;
    background: #f8f9fa;
    padding: 15px;
    font-weight: 600;
    color: #333;
    border-bottom: 1px solid #f0f0f0;
}

.table-row {
    display: grid;
    grid-template-columns: 80px 1fr 120px 80px;
    padding: 15px;
    border-bottom: 1px solid #f9f9f9;
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

.col-title {
    display: flex;
    align-items: center;
    gap: 8px;
}

.title-link {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: inherit;
    width: 100%;
}

.title-link:hover {
    color: #28a745;
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

.col-number,
.col-date,
.col-views {
    display: flex;
    align-items: center;
    color: #666;
    font-size: 0.9rem;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #999;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
}

.empty-state h3 {
    margin-bottom: 10px;
    color: #666;
}

.pagination {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-bottom: 40px;
}

.page-btn {
    padding: 10px 15px;
    border: 1px solid #ddd;
    background: white;
    color: #666;
    cursor: pointer;
    border-radius: 5px;
    transition: all 0.3s;
}

.page-btn:hover {
    background: #f8f9fa;
    border-color: #28a745;
}

.page-btn.active {
    background: #28a745;
    color: white;
    border-color: #28a745;
}

.write-form,
.notice-detail {
    background: white;
    border: 2px solid #28a745;
    border-radius: 15px;
    padding: 30px;
    margin-bottom: 30px;
    position: relative;
    z-index: 10;
}

.form-header,
.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
}

.form-header h3,
.detail-header h3 {
    color: #28a745;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
}

.checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: 500 !important;
}

.checkbox-label input[type="checkbox"] {
    width: auto;
    margin-right: 10px;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
}

.cancel-btn {
    padding: 12px 24px;
    border: 2px solid #ddd;
    background: white;
    color: #666;
    border-radius: 25px;
    cursor: pointer;
}

.submit-btn {
    padding: 12px 24px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
}

.detail-meta {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #666;
    flex-wrap: wrap;
}

.detail-content {
    padding: 20px;
    background: #fafafa;
    border-radius: 8px;
}

.content-text {
    line-height: 1.8;
    color: #333;
    white-space: pre-wrap;
    margin-bottom: 20px;
}

.content-images {
    margin-top: 20px;
}

.back-button {
    text-align: center;
    padding: 20px;
}

.back-btn {
    padding: 12px 24px;
    background: #f8f9fa;
    border: 2px solid #ddd;
    color: #666;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;
}

.back-btn:hover {
    background: #28a745;
    color: white;
    border-color: #28a745;
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 2rem;
    }
    
    .hero-subtitle {
        font-size: 1rem;
    }

    .notice-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .search-section {
        flex-direction: column;
        align-items: stretch;
    }

    .search-controls {
        flex-direction: column;
    }

    .table-header,
    .table-row {
        grid-template-columns: 60px 1fr 80px 50px;
        font-size: 0.8rem;
        padding: 10px;
    }

    .pagination {
        flex-wrap: wrap;
    }

    .detail-meta {
        flex-direction: column;
        gap: 8px;
    }

    .form-actions {
        flex-direction: column;
    }

    .images-gallery {
        grid-template-columns: 1fr;
    }

    .images-gallery .image-item img {
        height: 200px;
    }
}

.images-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
}

.images-gallery .image-item {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.images-gallery .image-item img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    cursor: pointer;
    transition: transform 0.3s;
}

.images-gallery .image-item img:hover {
    transform: scale(1.02);
}

/* 이미지 모달 */
.image-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-size: 1rem;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content img {
    width: 100%;
    height: auto;
    max-height: 80vh;
    object-fit: contain;
}

.modal-info {
    padding: 15px;
    background: #f8f9fa;
    text-align: center;
}

.modal-info p {
    margin: 0;
    color: #333;
    font-weight: 500;
}

.selected-images {
    margin-top: 20px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.selected-images h4 {
    color: #28a745;
    margin-bottom: 15px;
    font-size: 1rem;
}

.image-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.image-list .image-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
}

.image-preview {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.image-name {
    font-weight: 500;
    color: #333;
    word-break: break-all;
}

.image-size {
    color: #666;
    font-size: 0.9rem;
}

.remove-image {
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 0.8rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.remove-image:hover {
    background: #c82333;
}
</style>