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
                        <button @click="showWriteForm = true" class="write-btn">✏️ 글쓰기</button>
                    </div>
                </div>

                <div class="notices-table">
                    <div class="table-header">
                        <div class="col-number">번호</div>
                        <div class="col-title">제목</div>
                        <div class="col-date">작성일</div>
                        <div class="col-views">조회</div>
                    </div>

                    <div v-for="notice in paginatedNotices" :key="notice.id" class="table-row" @click="viewNotice(notice)">
                        <div class="col-number">{{ notice.id }}</div>
                        <div class="col-title">
                            <span class="title-text">{{ notice.title }}</span>
                            <span v-if="isNewNotice(notice.date)" class="new-badge">NEW</span>
                            <span v-if="notice.important" class="important-badge">중요</span>
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

                <!-- 공지사항 작성 폼 (관리자 전용) -->
                <div v-if="showWriteForm && isAdmin" class="write-form">
                    <div class="form-header">
                        <h3>면제교육 공지사항 작성</h3>
                        <button class="close-btn" @click="showWriteForm = false">✕</button>
                    </div>
                    <form @submit.prevent="submitNotice">
                        <div class="form-group">
                            <label>제목</label>
                            <input v-model="newNotice.title" type="text" required />
                        </div>
                        <div class="form-group">
                            <label>내용</label>
                            <textarea v-model="newNotice.content" rows="10" required></textarea>
                        </div>
                        <div class="form-group">
                            <label>이미지 첨부</label>
                            <input type="file" accept="image/*" multiple @change="handleImageSelection" ref="imageFileInput" />
                            <small>지원 형식: JPG, PNG, GIF (최대 5MB, 최대 3개 파일)</small>
                        </div>
                        <div v-if="selectedImages.length > 0" class="selected-images">
                            <h4>선택된 이미지:</h4>
                            <div class="image-list">
                                <div v-for="(image, index) in selectedImages" :key="index" class="image-item">
                                    <div class="image-preview">
                                        <img :src="image.preview" :alt="image.name" />
                                    </div>
                                    <div class="image-info">
                                        <span class="image-name">{{ image.name }}</span>
                                        <span class="image-size">{{ formatFileSize(image.size) }}</span>
                                    </div>
                                    <button type="button" @click="removeImage(index)" class="remove-image">✕</button>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="newNotice.important" />
                                중요 공지사항
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="cancel-btn" @click="showWriteForm = false">
                                취소
                            </button>
                            <button type="submit" class="submit-btn">등록</button>
                        </div>
                    </form>
                </div>

                <!-- 공지사항 상세보기 -->
                <div v-if="selectedNotice" class="notice-detail">
                    <div class="detail-header">
                        <h3>{{ selectedNotice.title }}</h3>
                        <button class="close-btn" @click="selectedNotice = null">✕</button>
                    </div>
                    <div class="detail-meta">
                        <span>작성일: {{ formatDate(selectedNotice.date) }}</span>
                        <span>조회수: {{ selectedNotice.views }}</span>
                        <span v-if="selectedNotice.important" class="important-badge">중요</span>
                    </div>
                    <div class="detail-content">
                        {{ selectedNotice.content }}
                    </div>
                </div>
            </div>
        </section>

        <!-- 뒤로가기 버튼 -->
        <div class="back-button">
            <button @click="goBack" class="back-btn">
                ← 공지사항으로 돌아가기
            </button>
        </div>
    </div>
</template>

<script>
import noticeStore from '../services/noticeStore.js';
import { useToast } from '../components/Toast.vue';
import authStore from '../stores/auth.js';

export default {
    name: 'NoticeExemption',
    setup() {
        const toast = useToast()
        return { toast }
    },
    data() {
        return {
            authStore,
            showWriteForm: false,
            selectedNotice: null,
            searchType: 'title',
            searchKeyword: '',
            currentPage: 1,
            noticesPerPage: 10,
            newNotice: {
                title: '',
                content: '',
                important: false
            },
            selectedImages: [],
            notices: [
                {
                    id: 8,
                    title: '2024년 상반기 요트면허 면제교육 일정 안내',
                    content: '2024년 상반기 요트면허 면제교육 일정을 안내드립니다.\n\n교육 일정:\n- 1차: 4월 15일-19일 (5일)\n- 2차: 5월 20일-24일 (5일)\n- 3차: 6월 17일-21일 (5일)\n\n참가비: 70만원\n신청 방법: 전화 또는 방문 접수\n문의: 055-641-5051~2',
                    date: '2024-03-16',
                    views: 156,
                    important: true
                },
                {
                    id: 7,
                    title: '면제교육 시 준비물 안내',
                    content: '면제교육 참가 시 준비해주실 물품들을 안내드립니다.\n\n필수 준비물:\n- 신분증\n- 수영복 또는 운동복\n- 운동화\n- 개인 세면도구\n- 필기구\n\n제공 물품:\n- 교재\n- 구명조끼\n- 점심식사',
                    date: '2024-03-14',
                    views: 89,
                    important: false
                },
                {
                    id: 6,
                    title: '면제교육 이론/실기 시간표 변경',
                    content: '면제교육의 이론 및 실기 시간표가 일부 변경되었습니다.\n\n변경 내용:\n- 이론교육: 09:00-17:00 (기존 09:00-18:00)\n- 실기교육: 09:00-16:00 (기존 10:00-17:00)\n\n변경 사유: 교육생들의 편의를 위한 조정\n적용일: 2024년 4월부터',
                    date: '2024-03-12',
                    views: 134,
                    important: true
                },
                {
                    id: 5,
                    title: '면제교육 수료증 발급 절차 안내',
                    content: '면제교육 수료 후 수료증 발급 절차를 안내드립니다.\n\n발급 절차:\n1. 교육 이수 완료\n2. 평가 통과 (이론+실기)\n3. 수료증 신청서 작성\n4. 수료증 발급 (3-5일 소요)\n\n발급비용: 무료\n수령방법: 직접 수령 또는 우편 발송',
                    date: '2024-03-10',
                    views: 78,
                    important: false
                }
            ]
        };
    },
    
    mounted() {
        // 기존 데이터를 noticeStore에 로드
        noticeStore.loadCategoryNotices('exemption', this.notices);
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
        viewNotice(notice) {
            notice.views++;
            this.selectedNotice = notice;
        },
        submitNotice() {
            if (!this.newNotice.title || !this.newNotice.content) {
                this.toast.error('제목과 내용을 입력해주세요.');
                return;
            }

            const newNoticeItem = {
                id: Math.max(...this.notices.map(n => n.id)) + 1,
                title: this.newNotice.title,
                content: this.newNotice.content,
                date: new Date().toISOString().split('T')[0],
                views: 0,
                important: this.newNotice.important,
                images: this.selectedImages.map(img => img.preview)
            };
            
            this.notices.unshift(newNoticeItem);
            
            // noticeStore에 새 공지사항 추가
            noticeStore.addNotice(newNoticeItem, 'exemption');

            // 폼 초기화
            this.showWriteForm = false;
            this.newNotice = { title: '', content: '', important: false };
            this.selectedImages = [];
            if (this.$refs.imageFileInput) {
                this.$refs.imageFileInput.value = '';
            }

            this.toast.success('공지사항이 등록되었습니다.', '등록 완료');
        },
        handleImageSelection(event) {
            const files = Array.from(event.target.files);
            
            if (files.length > 3) {
                this.toast.error('최대 3개의 이미지만 선택할 수 있습니다.');
                return;
            }

            this.selectedImages = [];

            files.forEach(file => {
                // 파일 크기 체크 (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    this.toast.error(`${file.name}은(는) 파일 크기가 5MB를 초과합니다.`);
                    return;
                }

                // 이미지 파일 타입 체크
                if (!file.type.startsWith('image/')) {
                    this.toast.error(`${file.name}은(는) 이미지 파일이 아닙니다.`);
                    return;
                }

                // 미리보기 생성
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.selectedImages.push({
                        file: file,
                        name: file.name,
                        size: file.size,
                        preview: e.target.result
                    });
                };
                reader.readAsDataURL(file);
            });
        },
        removeImage(index) {
            this.selectedImages.splice(index, 1);
        },
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    cursor: pointer;
    transition: background 0.3s;
}

.table-row:hover {
    background: #f8f9fa;
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

.new-badge {
    background: #dc3545;
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 600;
}

.important-badge {
    background: #ffc107;
    color: #333;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 600;
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
    line-height: 1.8;
    color: #333;
    min-height: 200px;
    padding: 20px;
    background: #fafafa;
    border-radius: 8px;
    white-space: pre-wrap;
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
}
</style>