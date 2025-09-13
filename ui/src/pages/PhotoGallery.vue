<template>
    <div class="photo-gallery">
        <section class="hero-section">
            <div class="hero-background"></div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">포토갤러리</h1>
                <p class="hero-subtitle">통영요트학교의 생생한 순간들을 사진으로 만나보세요</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="gallery-header">
                    <div class="header-info">
                        <h2>사진 갤러리</h2>
                        <p>관리자 전용 공간입니다. 다양한 교육 활동과 체험 현장의 모습을 담았습니다.</p>
                    </div>
                    <div class="admin-notice">
                        <div class="notice-icon">🔒</div>
                        <span>관리자 전용</span>
                    </div>
                </div>

                <div class="gallery-categories">
                    <div class="category-tabs">
                        <button 
                            v-for="category in categories" 
                            :key="category.id"
                            :class="['tab-button', { active: activeCategory === category.id }]"
                            @click="setActiveCategory(category.id)"
                        >
                            {{ category.name }} ({{ category.count }})
                        </button>
                    </div>
                </div>

                <div class="photo-grid">
                    <div 
                        v-for="photo in filteredPhotos" 
                        :key="photo.id"
                        class="photo-card"
                        @click="openModal(photo)"
                    >
                        <div class="photo-container">
                            <div class="photo-placeholder">
                                <div class="placeholder-icon">📷</div>
                                <div class="placeholder-text">{{ photo.title }}</div>
                            </div>
                        </div>
                        <div class="photo-info">
                            <h4>{{ photo.title }}</h4>
                            <p>{{ photo.description }}</p>
                            <div class="photo-meta">
                                <span class="date">{{ photo.date }}</span>
                                <span class="category">{{ getCategoryName(photo.categoryId) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="empty-state" v-if="filteredPhotos.length === 0">
                    <div class="empty-icon">📸</div>
                    <h3>아직 사진이 없습니다</h3>
                    <p>관리자가 곧 멋진 사진들을 업로드할 예정입니다.</p>
                </div>

                <div class="admin-section" v-if="isAdmin">
                    <h3>관리자 기능</h3>
                    <div class="admin-buttons">
                        <button class="admin-btn upload-btn" @click="showUploadForm = true">
                            📷 사진 업로드
                        </button>
                        <button class="admin-btn manage-btn" @click="managePhotos">
                            🗂️ 사진 관리
                        </button>
                    </div>
                </div>

                <!-- 업로드 폼 (관리자 전용) -->
                <div v-if="showUploadForm && isAdmin" class="upload-form">
                    <div class="form-header">
                        <h3>사진 업로드</h3>
                        <button class="close-btn" @click="showUploadForm = false">✕</button>
                    </div>
                    <form @submit.prevent="uploadPhoto">
                        <div class="form-group">
                            <label>제목</label>
                            <input v-model="newPhoto.title" type="text" required />
                        </div>
                        <div class="form-group">
                            <label>설명</label>
                            <textarea v-model="newPhoto.description" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label>카테고리</label>
                            <select v-model="newPhoto.categoryId" required>
                                <option value="">카테고리 선택</option>
                                <option v-for="category in categories.filter(c => c.id !== 'all')" 
                                        :key="category.id" :value="category.id">
                                    {{ category.name }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>사진 파일</label>
                            <input type="file" accept="image/*" multiple @change="handleFileSelection" ref="photoFileInput" />
                            <small>지원 형식: JPG, PNG, GIF (최대 10MB, 최대 5개 파일)</small>
                        </div>
                        <div v-if="selectedFiles.length > 0" class="selected-files">
                            <h4>선택된 파일:</h4>
                            <div class="file-list">
                                <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                                    <div class="file-preview">
                                        <img v-if="file.preview" :src="file.preview" :alt="file.name" />
                                        <div v-else class="no-preview">📷</div>
                                    </div>
                                    <div class="file-info">
                                        <span class="file-name">{{ file.name }}</span>
                                        <span class="file-size">{{ formatFileSize(file.size) }}</span>
                                    </div>
                                    <button type="button" @click="removeFile(index)" class="remove-file">✕</button>
                                </div>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="cancel-btn" @click="showUploadForm = false">
                                취소
                            </button>
                            <button type="submit" class="upload-btn">업로드</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>

        <!-- 뒤로가기 버튼 -->
        <div class="back-button">
            <button @click="goBack" class="back-btn">
                ← 커뮤니티로 돌아가기
            </button>
        </div>
    </div>
</template>

<script>
import authStore from '../stores/auth.js'

import { useToast } from '../components/Toast.vue'

export default {
    name: 'PhotoGallery',
    setup() {
        const toast = useToast()
        return { toast }
    },
    data() {
        return {
            authStore,
            activeCategory: 'all',
            showUploadForm: false,
            newPhoto: {
                title: '',
                description: '',
                categoryId: ''
            },
            selectedFiles: [],
            categories: [
                { id: 'all', name: '전체', count: 24 },
                { id: 'cruise-education', name: '크루즈 요트 교육', count: 8 },
                { id: 'cruise-experience', name: '크루즈 요트 체험', count: 6 },
                { id: 'dinghy-education', name: '딩기 요트 교육', count: 5 },
                { id: 'dinghy-experience', name: '딩기 요트 체험', count: 3 },
                { id: 'paddleboard', name: '패들보드 체험', count: 2 }
            ],
            photos: [
                {
                    id: 1,
                    title: '크루즈 요트 교육 현장',
                    description: '참가자들이 열심히 요트 조종법을 배우고 있는 모습',
                    categoryId: 'cruise-education',
                    date: '2024-03-15',
                    url: '/images/sample1.jpg'
                },
                {
                    id: 2,
                    title: '딩기 요트 실습',
                    description: '딩기 요트로 실제 항해를 연습하는 교육생들',
                    categoryId: 'dinghy-education',
                    date: '2024-03-14',
                    url: '/images/sample2.jpg'
                },
                {
                    id: 3,
                    title: '가족 요트 체험',
                    description: '가족들이 함께 즐기는 요트 체험 시간',
                    categoryId: 'cruise-experience',
                    date: '2024-03-13',
                    url: '/images/sample3.jpg'
                },
                {
                    id: 4,
                    title: '패들보드 체험',
                    description: '청정 바다에서 즐기는 패들보드 체험',
                    categoryId: 'paddleboard',
                    date: '2024-03-12',
                    url: '/images/sample4.jpg'
                }
            ]
        };
    },
    computed: {
        filteredPhotos() {
            if (this.activeCategory === 'all') {
                return this.photos;
            }
            return this.photos.filter(photo => photo.categoryId === this.activeCategory);
        },
        isAdmin() {
            return this.authStore.state.isAuthenticated && this.authStore.isAdmin();
        }
    },
    methods: {
        setActiveCategory(categoryId) {
            this.activeCategory = categoryId;
        },
        getCategoryName(categoryId) {
            const category = this.categories.find(c => c.id === categoryId);
            return category ? category.name : '';
        },
        openModal(photo) {
            // 사진 확대 보기 모달 구현
            console.log('Open photo modal:', photo);
        },
        uploadPhoto() {
            if (this.selectedFiles.length === 0) {
                this.toast.warning('사진을 선택해주세요.', '📷 사진 선택 필요');
                return;
            }

            if (!this.newPhoto.title || !this.newPhoto.categoryId) {
                this.toast.warning('제목과 카테고리를 입력해주세요.', '✏️ 정보 입력 필요');
                return;
            }

            // 각 선택된 파일에 대해 새 사진 항목 생성
            this.selectedFiles.forEach((file, index) => {
                const newPhotoItem = {
                    id: Math.max(...this.photos.map(p => p.id)) + 1 + index,
                    title: this.selectedFiles.length > 1 ? `${this.newPhoto.title} ${index + 1}` : this.newPhoto.title,
                    description: this.newPhoto.description,
                    categoryId: this.newPhoto.categoryId,
                    date: new Date().toISOString().split('T')[0],
                    url: file.preview || '/images/placeholder.jpg'
                };
                this.photos.unshift(newPhotoItem);
            });

            // 카테고리 개수 업데이트
            this.updateCategoryCounts();

            // 폼 초기화
            this.showUploadForm = false;
            this.newPhoto = { title: '', description: '', categoryId: '' };
            this.selectedFiles = [];
            this.$refs.photoFileInput.value = '';

            this.toast.celebrate(`${this.selectedFiles.length > 1 ? this.selectedFiles.length + '개의 ' : ''}사진이 업로드되었습니다.`, '📸 사진 업로드 완료');
        },
        handleFileSelection(event) {
            const files = Array.from(event.target.files);
            
            if (files.length > 5) {
                this.toast.warning('최대 5개의 파일만 선택할 수 있습니다.', '📁 파일 수 제한');
                return;
            }

            this.selectedFiles = [];

            files.forEach(file => {
                // 파일 크기 체크 (10MB)
                if (file.size > 10 * 1024 * 1024) {
                    this.toast.error(`${file.name}은(는) 파일 크기가 10MB를 초과합니다.`, '⚠️ 파일 크기 초과');
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
                    this.selectedFiles.push({
                        file: file,
                        name: file.name,
                        size: file.size,
                        preview: e.target.result
                    });
                };
                reader.readAsDataURL(file);
            });
        },
        removeFile(index) {
            this.selectedFiles.splice(index, 1);
        },
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        updateCategoryCounts() {
            this.categories.forEach(category => {
                if (category.id === 'all') {
                    category.count = this.photos.length;
                } else {
                    category.count = this.photos.filter(photo => photo.categoryId === category.id).length;
                }
            });
        },
        managePhotos() {
            // 사진 관리 페이지로 이동
            console.log('Manage photos');
        },
        goBack() {
            this.$router.push('/community');
        }
    }
};
</script>

<style scoped>
.photo-gallery {
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
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #2c5aa0, #1e3d6f);
    z-index: 1;
}

.hero-background::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('/images/yacht-hero.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.3;
    z-index: 2;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(44, 90, 160, 0.7);
    z-index: 3;
}

.hero-content {
    position: relative;
    z-index: 4;
    text-align: center;
    color: white;
    padding: 20px;
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

.gallery-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;
}

.header-info h2 {
    color: #2c5aa0;
    font-size: 1.8rem;
    margin-bottom: 10px;
}

.header-info p {
    color: #666;
    margin: 0;
}

.admin-notice {
    display: flex;
    align-items: center;
    background: #ffebee;
    color: #c62828;
    padding: 8px 15px;
    border-radius: 20px;
    font-weight: 600;
}

.notice-icon {
    margin-right: 8px;
}

.gallery-categories {
    margin-bottom: 40px;
}

.category-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
}

.tab-button {
    padding: 10px 20px;
    border: 2px solid #f0f0f0;
    background: white;
    color: #666;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
}

.tab-button:hover {
    border-color: #2c5aa0;
    color: #2c5aa0;
}

.tab-button.active {
    background: #2c5aa0;
    color: white;
    border-color: #2c5aa0;
}

.photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 25px;
    margin-bottom: 40px;
}

.photo-card {
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 15px;
    overflow: hidden;
    transition: all 0.3s;
    cursor: pointer;
}

.photo-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border-color: #2c5aa0;
}

.photo-container {
    height: 200px;
    overflow: hidden;
}

.photo-placeholder {
    height: 100%;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
}

.placeholder-icon {
    font-size: 3rem;
    margin-bottom: 10px;
}

.placeholder-text {
    font-weight: 500;
}

.photo-info {
    padding: 20px;
}

.photo-info h4 {
    color: #2c5aa0;
    margin-bottom: 8px;
    font-size: 1.1rem;
}

.photo-info p {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 15px;
}

.photo-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: #999;
}

.category {
    background: #f0f0f0;
    padding: 3px 8px;
    border-radius: 10px;
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

.admin-section {
    background: #f8f9fa;
    padding: 30px;
    border-radius: 15px;
    margin-bottom: 40px;
}

.admin-section h3 {
    color: #2c5aa0;
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

.upload-btn {
    background: #2c5aa0;
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

.upload-form {
    background: white;
    border: 2px solid #2c5aa0;
    border-radius: 15px;
    padding: 30px;
    margin-top: 30px;
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

.selected-files {
    margin-top: 20px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.selected-files h4 {
    color: #2c5aa0;
    margin-bottom: 15px;
    font-size: 1rem;
}

.file-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
}

.file-preview {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.file-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.no-preview {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f0f0;
    color: #999;
    font-size: 1.5rem;
}

.file-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.file-name {
    font-weight: 500;
    color: #333;
    word-break: break-all;
}

.file-size {
    color: #666;
    font-size: 0.9rem;
}

.remove-file {
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

.remove-file:hover {
    background: #c82333;
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
    background: #2c5aa0;
    color: white;
    border-color: #2c5aa0;
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 2rem;
    }

    .gallery-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .photo-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .admin-buttons {
        flex-direction: column;
    }

    .form-actions {
        flex-direction: column;
    }
}
</style>