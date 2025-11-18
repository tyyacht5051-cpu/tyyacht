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
                        v-for="gallery in filteredPhotos"
                        :key="gallery.id"
                        class="photo-card"
                    >
                        <div class="photo-container" @click="openModal(gallery)">
                            <img v-if="gallery.url" :src="`${API_BASE_URL}${gallery.url}`" :alt="gallery.title" class="photo-image" />
                            <div v-else class="photo-placeholder">
                                <div class="placeholder-icon">📷</div>
                                <div class="placeholder-text">사진 없음</div>
                            </div>
                            <div v-if="gallery.photo_count > 1" class="photo-count-badge">
                                {{ gallery.photo_count }}장
                            </div>
                        </div>
                        <div class="photo-info">
                            <div @click="openModal(gallery)" style="cursor: pointer;">
                                <h4>{{ gallery.title }}</h4>
                                <p class="description-text">{{ truncateDescription(gallery.description) }}</p>
                                <div class="photo-meta">
                                    <span class="date">{{ gallery.date }}</span>
                                    <span class="category">{{ getCategoryName(gallery.categoryId) }}</span>
                                </div>
                            </div>
                            <div v-if="isAdmin" class="admin-actions">
                                <button @click.stop="editGallery(gallery)" class="edit-btn" title="편집">
                                    ✏️ 편집
                                </button>
                                <button @click.stop="deleteGallery(gallery)" class="delete-btn" title="삭제">
                                    🗑️ 삭제
                                </button>
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
                            <small>지원 형식: JPG, PNG, GIF (최대 100MB, 최대 20개 파일)</small>
                        </div>
                        <div v-if="selectedFiles.length > 0" class="selected-files">
                            <h4>선택된 파일: <small>(드래그해서 순서 변경 가능)</small></h4>
                            <div class="file-list">
                                <div
                                    v-for="(file, index) in selectedFiles"
                                    :key="`file-${index}-${file.name}`"
                                    class="file-item"
                                    draggable="true"
                                    @dragstart="onDragStart(index, $event)"
                                    @dragover="onDragOver($event)"
                                    @dragenter="onDragEnter($event)"
                                    @dragleave="onDragLeave($event)"
                                    @drop="onDrop(index, $event)"
                                    @dragend="onDragEnd"
                                    :class="{ 'dragging': draggedIndex === index }"
                                >
                                    <div class="drag-handle">⋮⋮</div>
                                    <div class="file-order">{{ index + 1 }}</div>
                                    <div class="file-preview">
                                        <img v-if="file.preview" :src="file.preview" :alt="file.name" />
                                        <div v-else class="no-preview">📷</div>
                                    </div>
                                    <div class="file-info">
                                        <span class="file-name">{{ file.name }}</span>
                                        <span class="file-size">{{ formatFileSize(file.size) }}</span>
                                    </div>
                                    <div class="file-controls">
                                        <button
                                            type="button"
                                            @click="moveFile(index, 'up')"
                                            :disabled="index === 0"
                                            class="move-btn up-btn"
                                            title="위로 이동"
                                        >↑</button>
                                        <button
                                            type="button"
                                            @click="moveFile(index, 'down')"
                                            :disabled="index === selectedFiles.length - 1"
                                            class="move-btn down-btn"
                                            title="아래로 이동"
                                        >↓</button>
                                        <button type="button" @click="removeFile(index)" class="remove-file">✕</button>
                                    </div>
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

        <!-- 갤러리 모달 -->
        <div v-if="showModal" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <button class="modal-close" @click="closeModal">&times;</button>
                <div class="modal-image-container">
                    <div v-if="selectedGallery && selectedGallery.photos && selectedGallery.photos.length > 0" class="gallery-slider">
                        <button v-if="selectedGallery.photos.length > 1" class="slider-btn prev-btn" @click="prevImage" :disabled="currentImageIndex === 0">‹</button>
                        <img :src="`${API_BASE_URL}${selectedGallery.photos[currentImageIndex].url}`" :alt="selectedGallery.title" class="modal-image" />
                        <button v-if="selectedGallery.photos.length > 1" class="slider-btn next-btn" @click="nextImage" :disabled="currentImageIndex === selectedGallery.photos.length - 1">›</button>
                        <div v-if="selectedGallery.photos.length > 1" class="image-counter">
                            {{ currentImageIndex + 1 }} / {{ selectedGallery.photos.length }}
                        </div>
                    </div>
                    <div v-else class="no-images">
                        <div class="no-images-icon">📷</div>
                        <p>이 갤러리에는 이미지가 없습니다.</p>
                    </div>
                </div>
                <div class="modal-info">
                    <h3>{{ selectedGallery.title }}</h3>
                    <p v-if="selectedGallery.description">{{ selectedGallery.description }}</p>
                    <div class="modal-meta">
                        <span class="modal-date">{{ selectedGallery.date }}</span>
                        <span class="modal-category">{{ getCategoryName(selectedGallery.categoryId) }}</span>
                        <span v-if="selectedGallery.photos" class="modal-count">{{ selectedGallery.photos.length }}장</span>
                    </div>
                </div>
                <div v-if="selectedGallery && selectedGallery.photos && selectedGallery.photos.length > 1" class="modal-thumbnails">
                    <div class="thumbnails-container">
                        <div
                            v-for="(photo, index) in selectedGallery.photos"
                            :key="photo.id"
                            :class="['thumbnail', { active: index === currentImageIndex }]"
                            @click="setCurrentImage(index)"
                        >
                            <img :src="`${API_BASE_URL}${photo.url}`" :alt="`이미지 ${index + 1}`" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import authStore from '../stores/auth.js'
import axios from 'axios'
import { useToast } from '../components/Toast.vue'
import { API_BASE_URL } from '../config/env.js'

export default {
    name: 'PhotoGallery',
    setup() {
        const toast = useToast()
        return { toast }
    },
    data() {
        return {
            authStore,
            API_BASE_URL,
            activeCategory: 'all',
            showUploadForm: false,
            newPhoto: {
                title: '',
                description: '',
                categoryId: ''
            },
            selectedFiles: [],
            draggedIndex: null,
            categories: [
                { id: 'all', name: '전체', count: 24 },
                { id: 'cruise-education', name: '크루즈 요트 교육', count: 8 },
                { id: 'cruise-experience', name: '크루즈 요트 체험', count: 6 },
                { id: 'dinghy-education', name: '딩기 요트 교육', count: 5 },
                { id: 'dinghy-experience', name: '딩기 요트 체험', count: 3 },
                { id: 'paddleboard', name: '패들보드 체험', count: 2 }
            ],
            photos: [],
            selectedGallery: null,
            currentImageIndex: 0,
            showModal: false
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
        async openModal(gallery) {
            try {
                // 갤러리 상세 정보 (사진들 포함) 로드
                const response = await axios.get(`${API_BASE_URL}/api/photos/${gallery.id}`);
                this.selectedGallery = response.data;
                this.currentImageIndex = 0;
                this.showModal = true;
            } catch (error) {
                console.error('Failed to load gallery details:', error);
                this.toast.error('갤러리를 불러오는데 실패했습니다.', '❌ 로드 실패');
            }
        },
        closeModal() {
            this.selectedGallery = null;
            this.currentImageIndex = 0;
            this.showModal = false;
        },
        prevImage() {
            if (this.currentImageIndex > 0) {
                this.currentImageIndex--;
            }
        },
        nextImage() {
            if (this.selectedGallery && this.currentImageIndex < this.selectedGallery.photos.length - 1) {
                this.currentImageIndex++;
            }
        },
        setCurrentImage(index) {
            this.currentImageIndex = index;
        },
        handleFileSelection(event) {
            const files = Array.from(event.target.files);

            if (files.length > 20) {
                this.toast.warning('최대 20개의 파일만 선택할 수 있습니다.', '📁 파일 수 제한');
                return;
            }

            this.selectedFiles = [];

            files.forEach(file => {
                // 파일 크기 체크 (100MB)
                if (file.size > 100 * 1024 * 1024) {
                    this.toast.error(`${file.name}은(는) 파일 크기가 100MB를 초과합니다.`, '⚠️ 파일 크기 초과');
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
        moveFile(index, direction) {
            if (direction === 'up' && index > 0) {
                const temp = this.selectedFiles[index];
                this.selectedFiles.splice(index, 1);
                this.selectedFiles.splice(index - 1, 0, temp);
            } else if (direction === 'down' && index < this.selectedFiles.length - 1) {
                const temp = this.selectedFiles[index];
                this.selectedFiles.splice(index, 1);
                this.selectedFiles.splice(index + 1, 0, temp);
            }
        },
        onDragStart(index, event) {
            this.draggedIndex = index;
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', index.toString());
        },
        onDragEnter(event) {
            event.preventDefault();
        },
        onDragOver(event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        },
        onDragLeave(event) {
            event.preventDefault();
        },
        onDrop(targetIndex, event) {
            event.preventDefault();

            if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
                const draggedFile = this.selectedFiles[this.draggedIndex];
                this.selectedFiles.splice(this.draggedIndex, 1);
                this.selectedFiles.splice(targetIndex, 0, draggedFile);
            }
        },
        onDragEnd() {
            this.draggedIndex = null;
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
        truncateDescription(text) {
            if (!text) return '';

            // 줄바꿈으로 분리
            const lines = text.split('\n');

            // 상위 2줄만 가져오기
            const firstTwoLines = lines.slice(0, 2).join('\n');

            // 2줄보다 많으면 ... 추가
            if (lines.length > 2) {
                return firstTwoLines + '...';
            }

            // 2줄 이하지만 길이가 긴 경우도 처리 (100자 제한)
            if (firstTwoLines.length > 100) {
                return firstTwoLines.substring(0, 100) + '...';
            }

            return firstTwoLines;
        },
        async editGallery(gallery) {
            // 편집 모달 또는 페이지로 이동
            this.$router.push(`/community/photo-gallery/edit/${gallery.id}`);
        },
        async deleteGallery(gallery) {
            if (!confirm(`"${gallery.title}" 갤러리를 삭제하시겠습니까?\n포함된 모든 사진이 함께 삭제됩니다.`)) {
                return;
            }

            try {
                await axios.delete(`${API_BASE_URL}/api/photos/${gallery.id}`, {
                    headers: {
                        'Authorization': `Bearer ${this.authStore.state.token}`
                    }
                });

                this.toast.success('갤러리가 삭제되었습니다.', '🗑️ 삭제 완료');
                await this.loadPhotos();
            } catch (error) {
                console.error('갤러리 삭제 실패:', error);
                if (error.response?.status === 401) {
                    this.toast.urgent('로그인이 필요합니다.', '🔐 로그인 필요');
                } else if (error.response?.status === 403) {
                    this.toast.urgent('권한이 없습니다.', '⚠️ 권한 없음');
                } else {
                    this.toast.error('갤러리 삭제에 실패했습니다.', '❌ 삭제 실패');
                }
            }
        },
        goBack() {
            this.$router.push('/community');
        },

        async loadPhotos() {
            try {
                console.log('Loading photos from:', `${API_BASE_URL}/api/photos`);
                const response = await axios.get(`${API_BASE_URL}/api/photos`);
                console.log('Photos response:', response.data);

                // API 데이터를 프론트엔드 형식으로 변환
                this.photos = (response.data || []).map(gallery => ({
                    id: gallery.id,
                    title: gallery.title,
                    description: gallery.description,
                    categoryId: gallery.category_id,
                    date: gallery.created_at ? gallery.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
                    url: gallery.url,
                    photo_count: gallery.photo_count || 0
                }));
                this.updateCategoryCounts();
                console.log('Photos loaded:', this.photos.length);
            } catch (error) {
                console.error('Failed to load photos:', error);
                // 일단 API 연결 실패 시에도 페이지가 로드되도록 함
                this.photos = [];
                this.updateCategoryCounts();
                // Toast 에러는 API 서버가 꺼져있을 때 너무 방해가 될 수 있으므로 콘솔로만
                console.warn('API server may not be running. Photos will be empty.');
            }
        },

        async uploadPhoto() {
            if (this.selectedFiles.length === 0) {
                this.toast.warning('사진을 선택해주세요.', '📷 사진 선택 필요');
                return;
            }

            if (!this.newPhoto.title || !this.newPhoto.categoryId) {
                this.toast.warning('제목과 카테고리를 입력해주세요.', '✏️ 정보 입력 필요');
                return;
            }

            try {
                console.log('Starting photo upload...');
                console.log('Selected files:', this.selectedFiles);
                console.log('Form data:', this.newPhoto);

                const formData = new FormData();
                formData.append('title', this.newPhoto.title);
                formData.append('description', this.newPhoto.description);
                formData.append('category_id', this.newPhoto.categoryId);

                this.selectedFiles.forEach(fileWrapper => {
                    console.log('Adding file:', fileWrapper.name, fileWrapper.size, fileWrapper.file.type);
                    formData.append('photos', fileWrapper.file);
                });

                // FormData 내용 확인
                console.log('FormData entries:');
                for (let [key, value] of formData.entries()) {
                    console.log(key, ':', value);
                }

                const token = localStorage.getItem('token');
                console.log('Token exists:', !!token);
                console.log('Upload URL:', `${API_BASE_URL}/api/photos`);

                const response = await axios.post(`${API_BASE_URL}/api/photos`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('Upload response:', response.data);

                // 업로드 후 사진 목록 새로고침
                await this.loadPhotos();

                // 성공 메시지 (초기화 전에)
                const uploadedCount = this.selectedFiles.length;
                this.toast.celebrate(`${uploadedCount > 1 ? uploadedCount + '개의 ' : ''}사진이 업로드되었습니다.`, '📸 사진 업로드 완료');

                // 폼 초기화
                this.showUploadForm = false;
                this.newPhoto = { title: '', description: '', categoryId: '' };
                this.selectedFiles = [];
                this.$refs.photoFileInput.value = '';
            } catch (error) {
                console.error('Upload error details:', error);
                console.error('Error response:', error.response?.data);
                console.error('Error status:', error.response?.status);

                let errorMessage = '사진 업로드에 실패했습니다.';
                if (error.response?.status === 401) {
                    errorMessage = '로그인이 필요합니다.';
                } else if (error.response?.status === 403) {
                    errorMessage = '관리자 권한이 필요합니다.';
                } else if (error.response?.status === 413) {
                    errorMessage = '파일 크기가 너무 큽니다.';
                } else if (error.response?.data?.error) {
                    errorMessage = error.response.data.error;
                }

                this.toast.error(errorMessage, '❌ 업로드 실패');
            }
        }
    },

    mounted() {
        this.loadPhotos();
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
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
    height: 450px;
    overflow: hidden;
    border-radius: 12px;
    position: relative;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
}

.photo-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.photo-card:hover .photo-image {
    transform: scale(1.05);
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

.description-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.5;
    max-height: 3em;
}

.admin-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
}

.admin-actions button {
    flex: 1;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.edit-btn {
    background: #2c5aa0;
    color: white;
}

.edit-btn:hover {
    background: #1e3d6f;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(44, 90, 160, 0.3);
}

.delete-btn {
    background: #dc3545;
    color: white;
}

.delete-btn:hover {
    background: #c82333;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
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
    position: relative;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    transition: all 0.2s ease;
    cursor: grab;
}

.file-item:hover {
    border-color: #2c5aa0;
    box-shadow: 0 2px 8px rgba(44, 90, 160, 0.1);
}

.file-item.dragging {
    opacity: 0.6;
    cursor: grabbing;
}

.drag-handle {
    color: #999;
    font-size: 1.2rem;
    cursor: grab;
    padding: 5px;
    border-radius: 4px;
    transition: all 0.2s ease;
    user-select: none;
}

.drag-handle:hover {
    background: #f0f0f0;
    color: #2c5aa0;
}

.file-item.dragging .drag-handle {
    cursor: grabbing;
}

.file-order {
    background: #2c5aa0;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
    flex-shrink: 0;
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

.file-controls {
    display: flex;
    gap: 5px;
    align-items: center;
}

.move-btn {
    background: #f8f9fa;
    color: #2c5aa0;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.move-btn:hover:not(:disabled) {
    background: #2c5aa0;
    color: white;
    border-color: #2c5aa0;
}

.move-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
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
    transition: all 0.3s;
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

/* 모달 스타일 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 10px;
}

.modal-content {
    position: relative;
    background: white;
    border-radius: 15px;
    width: 60vw;
    height: 95vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
}

.modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 24px;
    cursor: pointer;
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
}

.modal-close:hover {
    background: rgba(0, 0, 0, 0.7);
}

.modal-image-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    padding: 10px;
    background: #f8f9fa;
}

.modal-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 8px;
}

.modal-info {
    padding: 20px;
    flex-shrink: 0;
    border-top: 1px solid #f0f0f0;
    background: white;
    height: auto;
    min-height: 120px;
}

.modal-info h3 {
    color: #2c5aa0;
    margin-bottom: 10px;
    font-size: 1.5rem;
}

.modal-info p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 15px;
}

.modal-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    color: #999;
}

.modal-category {
    background: #f0f0f0;
    padding: 5px 12px;
    border-radius: 15px;
    color: #666;
}

.modal-count {
    background: #2c5aa0;
    color: white;
    padding: 5px 12px;
    border-radius: 15px;
    font-size: 0.8rem;
}

/* 갤러리 카운트 배지 */
.photo-count-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(44, 90, 160, 0.9);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    z-index: 2;
}

/* 갤러리 슬라이더 스타일 */
.gallery-slider {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.slider-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    font-size: 24px;
    cursor: pointer;
    z-index: 10;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.slider-btn:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.8);
    transform: translateY(-50%) scale(1.1);
}

.slider-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.prev-btn {
    left: 20px;
}

.next-btn {
    right: 20px;
}

.image-counter {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}

/* 썸네일 스타일 */
.modal-thumbnails {
    flex-shrink: 0;
    padding: 20px;
    border-top: 1px solid #f0f0f0;
    background: white;
    max-height: 120px;
    overflow-y: auto;
}

.thumbnails-container {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
}

.thumbnail {
    width: 80px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.3s;
}

.thumbnail:hover {
    border-color: #2c5aa0;
    transform: scale(1.05);
}

.thumbnail.active {
    border-color: #2c5aa0;
    box-shadow: 0 0 10px rgba(44, 90, 160, 0.3);
}

.thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 이미지 없음 상태 */
.no-images {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
}

.no-images-icon {
    font-size: 4rem;
    margin-bottom: 20px;
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

    .photo-container {
        height: 380px;
    }

    .admin-buttons {
        flex-direction: column;
    }

    .form-actions {
        flex-direction: column;
    }

    .modal-content {
        width: 80vw;
        height: 98vh;
    }

    .modal-image-container {
        padding: 5px;
    }

    .modal-info {
        padding: 15px;
        min-height: 100px;
    }

    .modal-info h3 {
        font-size: 1.3rem;
    }
}
</style>