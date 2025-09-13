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

                <div class="notice-categories">
                    <div class="categories-grid">
                        <div class="category-card" v-for="category in categories" :key="category.id" @click="goToCategory(category.path)">
                            <div class="category-icon">{{ category.icon }}</div>
                            <h3>{{ category.title }}</h3>
                            <p>{{ category.description }}</p>
                            <div class="category-info">
                                <span class="post-count">{{ category.count }}개 게시물</span>
                                <span class="latest-date" v-if="category.latestDate">최근 {{ category.latestDate }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="recent-notices">
                    <h2>최근 공지사항</h2>
                    <div class="notices-table">
                        <div class="table-header">
                            <div class="col-category">분류</div>
                            <div class="col-title">제목</div>
                            <div class="col-date">작성일</div>
                            <div class="col-views">조회</div>
                        </div>
                        <div v-for="notice in recentNotices" :key="notice.id" class="table-row" @click="viewNotice(notice)">
                            <div class="col-category">
                                <span class="category-badge" :class="notice.categoryClass">{{ notice.category }}</span>
                            </div>
                            <div class="col-title">
                                <span class="title-text">{{ notice.title }}</span>
                                <span v-if="isNewNotice(notice.date)" class="new-badge">NEW</span>
                                <span v-if="notice.important" class="important-badge">중요</span>
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
                        <button class="admin-btn write-btn" @click="showWriteForm = true">
                            ✏️ 공지사항 작성
                        </button>
                        <button class="admin-btn manage-btn" @click="manageNotices">
                            🗂️ 공지사항 관리
                        </button>
                    </div>
                </div>

                <!-- 공지사항 작성 폼 (관리자 전용) -->
                <div v-if="showWriteForm && isAdmin" class="write-form">
                    <div class="form-header">
                        <h3>공지사항 작성</h3>
                        <button class="close-btn" @click="showWriteForm = false">✕</button>
                    </div>
                    <form @submit.prevent="submitNotice">
                        <div class="form-group">
                            <label>분류</label>
                            <select v-model="newNotice.categoryId" required>
                                <option value="">분류 선택</option>
                                <option v-for="category in categories" 
                                        :key="category.id" :value="category.id">
                                    {{ category.title }}
                                </option>
                            </select>
                        </div>
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
                                <span class="checkmark"></span>
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
            </div>
        </section>
    </div>
</template>

<script>
import authStore from '../stores/auth.js'

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
            showWriteForm: false,
            newNotice: {
                title: '',
                content: '',
                categoryId: '',
                important: false
            },
            selectedImages: [],
            categories: [
                {
                    id: 'exemption',
                    title: '면제교육',
                    description: '요트면허 면제교육 관련 공지사항',
                    icon: '📋',
                    count: 8,
                    latestDate: '2024-03-15',
                    path: '/notice/exemption'
                },
                {
                    id: 'cruise',
                    title: '크루즈요트',
                    description: '크루즈요트 교육 및 체험 관련 공지',
                    icon: '⛵',
                    count: 12,
                    latestDate: '2024-03-14',
                    path: '/notice/cruise'
                },
                {
                    id: 'dinghy',
                    title: '딩기요트',
                    description: '딩기요트 교육 및 체험 관련 공지',
                    icon: '🚤',
                    count: 6,
                    latestDate: '2024-03-13',
                    path: '/notice/dinghy'
                },
                {
                    id: 'recruitment',
                    title: '채용',
                    description: '직원 채용 및 모집 공고',
                    icon: '👥',
                    count: 3,
                    latestDate: '2024-03-10',
                    path: '/notice/recruitment'
                },
                {
                    id: 'others',
                    title: '기타',
                    description: '기타 일반 공지사항',
                    icon: '📢',
                    count: 15,
                    latestDate: '2024-03-16',
                    path: '/notice/others'
                }
            ],
            recentNotices: [
                {
                    id: 1,
                    title: '2024년 상반기 요트면허 면제교육 일정 안내',
                    content: '2024년 상반기 요트면허 면제교육 일정을 안내드립니다...',
                    category: '면제교육',
                    categoryClass: 'exemption',
                    date: '2024-03-16',
                    views: 156,
                    important: true,
                    images: []
                },
                {
                    id: 2,
                    title: '크루즈요트 체험 프로그램 요금 변경 안내',
                    content: '2024년 4월부터 크루즈요트 체험 프로그램 요금이 조정됩니다...',
                    category: '크루즈요트',
                    categoryClass: 'cruise',
                    date: '2024-03-15',
                    views: 89,
                    important: false
                },
                {
                    id: 3,
                    title: '딩기요트 교육 안전수칙 업데이트',
                    content: '딩기요트 교육 시 준수해야 할 안전수칙이 업데이트되었습니다...',
                    category: '딩기요트',
                    categoryClass: 'dinghy',
                    date: '2024-03-14',
                    views: 67,
                    important: false
                },
                {
                    id: 4,
                    title: '통영요트학교 강사 채용 공고',
                    content: '통영요트학교에서 요트 교육 강사를 모집합니다...',
                    category: '채용',
                    categoryClass: 'recruitment',
                    date: '2024-03-13',
                    views: 234,
                    important: true
                },
                {
                    id: 5,
                    title: '봄철 요트 체험 프로그램 운영 안내',
                    content: '봄철을 맞이하여 특별 요트 체험 프로그램을 운영합니다...',
                    category: '기타',
                    categoryClass: 'others',
                    date: '2024-03-12',
                    views: 123,
                    important: false
                }
            ]
        };
    },
    computed: {
        isAdmin() {
            return this.authStore.state.isAuthenticated && this.authStore.state.user?.role === 'admin';
        }
    },
    methods: {
        goToCategory(path) {
            this.$router.push(path);
        },
        viewNotice(notice) {
            // 공지사항 상세보기 (추후 구현)
        },
        submitNotice() {
            if (!this.newNotice.title || !this.newNotice.content || !this.newNotice.categoryId) {
                this.toast.warning('모든 필수 항목을 입력해주세요.', '✏️ 입력 확인');
                return;
            }

            const category = this.categories.find(c => c.id === this.newNotice.categoryId);
            const newNoticeItem = {
                id: Math.max(...this.recentNotices.map(n => n.id)) + 1,
                title: this.newNotice.title,
                content: this.newNotice.content,
                category: category.title,
                categoryClass: this.newNotice.categoryId,
                date: new Date().toISOString().split('T')[0],
                views: 0,
                important: this.newNotice.important,
                images: this.selectedImages.map(img => img.preview)
            };

            this.recentNotices.unshift(newNoticeItem);
            
            // 카테고리 개수 업데이트
            category.count++;
            category.latestDate = newNoticeItem.date;

            // 폼 초기화
            this.showWriteForm = false;
            this.newNotice = { title: '', content: '', categoryId: '', important: false };
            this.selectedImages = [];
            if (this.$refs.imageFileInput) {
                this.$refs.imageFileInput.value = '';
            }

            this.toast.celebrate('공지사항이 등록되었습니다.', '📢 공지 등록 완료');
        },
        handleImageSelection(event) {
            const files = Array.from(event.target.files);
            
            if (files.length > 3) {
                this.toast.warning('최대 3개의 이미지만 선택할 수 있습니다.', '🖼️ 이미지 제한');
                return;
            }

            this.selectedImages = [];

            files.forEach(file => {
                // 파일 크기 체크 (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    this.toast.error(`${file.name}은(는) 파일 크기가 5MB를 초과합니다.`, '⚠️ 파일 크기 초과');
                    return;
                }

                // 이미지 파일 타입 체크
                if (!file.type.startsWith('image/')) {
                    this.toast.error(`${file.name}은(는) 이미지 파일이 아닙니다.`, '⚠️ 파일 형식 오류');
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

.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.category-card {
    background: white;
    border: 2px solid #f0f0f0;
    border-radius: 20px;
    padding: 30px;
    text-align: center;
    transition: all 0.3s;
    cursor: pointer;
}

.category-card:hover {
    border-color: #2c5aa0;
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(44, 90, 160, 0.1);
}

.category-icon {
    font-size: 4rem;
    margin-bottom: 20px;
}

.category-card h3 {
    color: #2c5aa0;
    font-size: 1.5rem;
    margin-bottom: 15px;
}

.category-card p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
}

.category-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #f0f0f0;
    font-size: 0.9rem;
}

.post-count {
    color: #2c5aa0;
    font-weight: 600;
}

.latest-date {
    color: #999;
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
    transition: background 0.3s;
}

.table-row:hover {
    background: #f8f9fa;
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

.write-form {
    background: white;
    border: 2px solid #2c5aa0;
    border-radius: 15px;
    padding: 30px;
}

.form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
}

.form-header h3 {
    color: #2c5aa0;
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
.form-group textarea,
.form-group select {
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

.selected-images {
    margin-top: 20px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.selected-images h4 {
    color: #2c5aa0;
    margin-bottom: 15px;
    font-size: 1rem;
}

.image-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.image-item {
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

    .categories-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .table-header,
    .table-row {
        grid-template-columns: 80px 1fr 80px 60px;
        font-size: 0.8rem;
        padding: 10px;
    }

    .category-info {
        flex-direction: column;
        gap: 8px;
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
