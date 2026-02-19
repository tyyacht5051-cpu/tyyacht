<template>
    <div class="photo-gallery-edit">
        <section class="hero-section">
            <div class="hero-background"></div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">포토갤러리 편집</h1>
                <p class="hero-subtitle">갤러리 정보 및 사진을 수정할 수 있습니다</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="edit-form">
                    <div class="form-header">
                        <h2>갤러리 편집</h2>
                        <div class="header-buttons">
                            <button @click="saveGallery" class="save-btn" :disabled="isSaving">
                                💾 {{ isSaving ? '저장 중...' : '저장' }}
                            </button>
                            <button @click="cancel" class="cancel-btn">취소</button>
                        </div>
                    </div>

                    <div class="form-body">
                        <div class="form-group">
                            <label>제목 *</label>
                            <input v-model="gallery.title" type="text" required placeholder="갤러리 제목을 입력하세요" />
                        </div>

                        <div class="form-group">
                            <label>설명</label>
                            <textarea v-model="gallery.description" rows="4" placeholder="갤러리 설명을 입력하세요"></textarea>
                        </div>

                        <div class="form-group">
                            <label>카테고리 *</label>
                            <select v-model="gallery.category_id" required>
                                <option value="">카테고리를 선택하세요</option>
                                <option value="cruise-education">크루저 요트 교육</option>
                                <option value="cruise-experience">크루저 요트 체험</option>
                                <option value="dinghy-education">딩기 요트 교육</option>
                                <option value="dinghy-experience">딩기 요트 체험</option>
                                <option value="exemption-education">면제교육</option>
                                <option value="paddleboard">패들보드</option>
                                <option value="related-events">관련행사</option>
                                <option value="external-activities">대외활동</option>
                                <option value="events">이벤트</option>
                                <option value="others">기타</option>
                            </select>
                        </div>

                        <!-- 기존 사진 목록 -->
                        <div v-if="gallery.photos && gallery.photos.length > 0" class="existing-photos">
                            <h3>기존 사진 ({{ gallery.photos.length }}장)</h3>
                            <div class="photos-grid">
                                <div v-for="(photo, index) in gallery.photos" :key="photo.id" class="photo-item">
                                    <img :src="`${API_BASE_URL}${photo.url}`" :alt="`사진 ${index + 1}`" />
                                    <div class="photo-overlay">
                                        <button @click="deletePhoto(photo.id)" class="delete-photo-btn" title="사진 삭제">
                                            🗑️
                                        </button>
                                    </div>
                                    <div class="photo-info-small">
                                        {{ formatFileSize(photo.file_size) }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 새 사진 추가 -->
                        <div class="form-group">
                            <label>새 사진 추가 (최대 20장)</label>
                            <input
                                type="file"
                                ref="photoInput"
                                @change="handlePhotoSelection"
                                accept="image/*"
                                multiple
                                class="file-input"
                            />
                            <label for="photo-upload" class="upload-label">
                                📷 사진 선택
                            </label>
                        </div>

                        <!-- 선택된 새 사진 미리보기 -->
                        <div v-if="selectedPhotos.length > 0" class="selected-photos">
                            <h3>새로 추가할 사진 ({{ selectedPhotos.length }}장)</h3>
                            <div class="photos-grid">
                                <div v-for="(photo, index) in selectedPhotos" :key="index" class="photo-item">
                                    <img :src="photo.preview" :alt="`새 사진 ${index + 1}`" />
                                    <div class="photo-overlay">
                                        <button @click="removeNewPhoto(index)" class="delete-photo-btn" title="제거">
                                            ✕
                                        </button>
                                    </div>
                                    <div class="photo-info-small">
                                        {{ formatFileSize(photo.file.size) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 뒤로가기 버튼 -->
        <div class="back-button">
            <button @click="goBack" class="back-btn">
                ← 갤러리로 돌아가기
            </button>
        </div>
    </div>
</template>

<script>
import authStore from '../stores/auth.js';
import axios from 'axios';
import { useToast } from '../components/Toast.vue';
import { API_BASE_URL } from '../config/env.js';

export default {
    name: 'PhotoGalleryEdit',
    setup() {
        const toast = useToast();
        return { toast };
    },
    data() {
        return {
            authStore,
            API_BASE_URL,
            galleryId: null,
            isSaving: false,
            gallery: {
                title: '',
                description: '',
                category_id: '',
                photos: []
            },
            selectedPhotos: []
        };
    },
    async mounted() {
        this.galleryId = parseInt(this.$route.params.id);

        // 관리자 권한 체크
        if (!this.authStore.state.isAuthenticated || this.authStore.state.user?.role !== 'admin') {
            this.toast.urgent('관리자만 접근할 수 있습니다.', '⚠️ 권한 없음');
            this.$router.push('/community/photo-gallery');
            return;
        }

        await this.loadGallery();
    },
    methods: {
        async loadGallery() {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/photos/${this.galleryId}`);
                this.gallery = {
                    title: response.data.title,
                    description: response.data.description,
                    category_id: response.data.category_id,
                    photos: response.data.photos || []
                };
            } catch (error) {
                console.error('갤러리 로드 실패:', error);
                this.toast.error('갤러리를 불러올 수 없습니다.', '❌ 로드 실패');
                this.$router.push('/community/photo-gallery');
            }
        },
        handlePhotoSelection(event) {
            const files = Array.from(event.target.files);

            if (files.length + this.selectedPhotos.length + this.gallery.photos.length > 20) {
                this.toast.error('최대 20장까지만 추가할 수 있습니다.', '⚠️ 제한 초과');
                return;
            }

            files.forEach(file => {
                if (file.size > 100 * 1024 * 1024) {
                    this.toast.error(`${file.name}은(는) 100MB를 초과합니다.`, '⚠️ 파일 크기 초과');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    this.selectedPhotos.push({
                        file: file,
                        preview: e.target.result
                    });
                };
                reader.readAsDataURL(file);
            });

            event.target.value = '';
        },
        removeNewPhoto(index) {
            this.selectedPhotos.splice(index, 1);
        },
        async deletePhoto(photoId) {
            if (!confirm('이 사진을 삭제하시겠습니까?')) {
                return;
            }

            try {
                await axios.delete(`${API_BASE_URL}/api/photos/${this.galleryId}/photos/${photoId}`, {
                    headers: {
                        'Authorization': `Bearer ${this.authStore.state.token}`
                    }
                });

                this.gallery.photos = this.gallery.photos.filter(p => p.id !== photoId);
                this.toast.success('사진이 삭제되었습니다.', '🗑️ 삭제 완료');
            } catch (error) {
                console.error('사진 삭제 실패:', error);
                this.toast.error('사진 삭제에 실패했습니다.', '❌ 삭제 실패');
            }
        },
        async saveGallery() {
            if (!this.gallery.title || !this.gallery.category_id) {
                this.toast.error('제목과 카테고리는 필수입니다.', '⚠️ 입력 오류');
                return;
            }

            this.isSaving = true;

            try {
                const formData = new FormData();
                formData.append('title', this.gallery.title);
                formData.append('description', this.gallery.description || '');
                formData.append('category_id', this.gallery.category_id);

                // 새 사진 추가
                this.selectedPhotos.forEach(photo => {
                    formData.append('photos', photo.file);
                });

                await axios.put(`${API_BASE_URL}/api/photos/${this.galleryId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${this.authStore.state.token}`
                    }
                });

                this.toast.success('갤러리가 수정되었습니다.', '💾 저장 완료');
                this.$router.push('/community/photo-gallery');
            } catch (error) {
                console.error('갤러리 저장 실패:', error);
                this.toast.error('갤러리 저장에 실패했습니다.', '❌ 저장 실패');
            } finally {
                this.isSaving = false;
            }
        },
        cancel() {
            if (confirm('변경사항을 저장하지 않고 나가시겠습니까?')) {
                this.$router.push('/community/photo-gallery');
            }
        },
        goBack() {
            this.cancel();
        },
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    }
};
</script>

<style scoped>
.photo-gallery-edit {
    padding-top: 70px;
}

.hero-section {
    position: relative;
    height: 250px;
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

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 2;
}

.hero-content {
    position: relative;
    z-index: 3;
    text-align: center;
    color: white;
}

.hero-title {
    font-size: 2.5rem;
    margin-bottom: 10px;
}

.hero-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
}

.content-section {
    padding: 60px 0;
    background: #f8f9fa;
}

.container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
}

.edit-form {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.form-header {
    padding: 25px 30px;
    background: linear-gradient(135deg, #2c5aa0, #1e3d6f);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.form-header h2 {
    margin: 0;
    font-size: 1.5rem;
}

.header-buttons {
    display: flex;
    gap: 10px;
}

.save-btn {
    background: #28a745;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.save-btn:hover:not(:disabled) {
    background: #218838;
    transform: translateY(-1px);
}

.save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.cancel-btn {
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.cancel-btn:hover {
    background: #5a6268;
}

.form-body {
    padding: 30px;
}

.form-group {
    margin-bottom: 25px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus,
.form-group select:focus {
    outline: none;
    border-color: #2c5aa0;
}

.file-input {
    display: none;
}

.upload-label {
    display: inline-block;
    padding: 12px 24px;
    background: #2c5aa0;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
}

.upload-label:hover {
    background: #1e3d6f;
    transform: translateY(-1px);
}

.existing-photos,
.selected-photos {
    margin-top: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.existing-photos h3,
.selected-photos h3 {
    margin-bottom: 15px;
    color: #2c5aa0;
}

.photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
}

.photo-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.photo-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.photo-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.photo-item:hover .photo-overlay {
    opacity: 1;
}

.delete-photo-btn {
    background: #dc3545;
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.3s;
}

.delete-photo-btn:hover {
    background: #c82333;
    transform: scale(1.1);
}

.photo-info-small {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px;
    font-size: 0.7rem;
    text-align: center;
}

.back-button {
    padding: 20px 0;
    text-align: center;
}

.back-btn {
    padding: 12px 24px;
    background: white;
    color: #2c5aa0;
    border: 2px solid #2c5aa0;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.3s;
}

.back-btn:hover {
    background: #2c5aa0;
    color: white;
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 2rem;
    }

    .form-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
    }

    .header-buttons {
        justify-content: stretch;
    }

    .header-buttons button {
        flex: 1;
    }

    .photos-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }
}
</style>
