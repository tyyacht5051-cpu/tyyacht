<template>
    <div class="video-gallery">
        <section class="hero-section">
            <div class="hero-background"></div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">동영상갤러리</h1>
                <p class="hero-subtitle">통영요트학교의 생생한 영상으로 현장감을 느껴보세요</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="gallery-header">
                    <div class="header-info">
                        <h2>동영상 갤러리</h2>
                        <p>관리자 전용 공간입니다. 요트 교육과 체험 활동의 영상을 시청하실 수 있습니다.</p>
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

                <div class="video-grid">
                    <div 
                        v-for="video in filteredVideos" 
                        :key="video.id"
                        class="video-card"
                        @click="playVideo(video)"
                    >
                        <div class="video-container">
                            <div class="video-thumbnail">
                                <img v-if="video.thumbnail_url" :src="`${API_BASE_URL}${video.thumbnail_url}`" :alt="video.title" class="thumbnail-image" />
                                <div v-else class="thumbnail-placeholder">
                                    <div class="play-icon">▶</div>
                                </div>
                                <div class="play-overlay">
                                    <div class="play-icon">▶</div>
                                </div>
                                <div class="duration-badge">{{ video.duration }}</div>
                            </div>
                        </div>
                        <div class="video-info">
                            <h4>{{ video.title }}</h4>
                            <p>{{ video.description }}</p>
                            <div class="video-meta">
                                <span class="date">{{ video.date }}</span>
                                <span class="views">조회수 {{ video.views }}회</span>
                                <span class="category">{{ getCategoryName(video.categoryId) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="empty-state" v-if="filteredVideos.length === 0">
                    <div class="empty-icon">🎥</div>
                    <h3>아직 동영상이 없습니다</h3>
                    <p>관리자가 곧 흥미로운 영상들을 업로드할 예정입니다.</p>
                </div>

                <div class="admin-section" v-if="isAdmin">
                    <h3>관리자 기능</h3>
                    <div class="admin-buttons">
                        <button class="admin-btn upload-btn" @click="showUploadForm = true">
                            🎥 동영상 업로드
                        </button>
                        <button class="admin-btn manage-btn" @click="manageVideos">
                            🗂️ 동영상 관리
                        </button>
                    </div>
                </div>

                <!-- 업로드 폼 (관리자 전용) -->
                <div v-if="showUploadForm && isAdmin" class="upload-form">
                    <div class="form-header">
                        <h3>동영상 업로드</h3>
                        <button class="close-btn" @click="showUploadForm = false">✕</button>
                    </div>
                    <form @submit.prevent="uploadVideo">
                        <div class="form-group">
                            <label>제목</label>
                            <input v-model="newVideo.title" type="text" required />
                        </div>
                        <div class="form-group">
                            <label>설명</label>
                            <textarea v-model="newVideo.description" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label>카테고리</label>
                            <select v-model="newVideo.categoryId" required>
                                <option value="">카테고리 선택</option>
                                <option v-for="category in categories.filter(c => c.id !== 'all')" 
                                        :key="category.id" :value="category.id">
                                    {{ category.name }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>재생 시간 (선택사항)</label>
                            <input v-model="newVideo.duration" type="text" placeholder="예: 5:30" />
                            <small>형식: MM:SS 또는 HH:MM:SS</small>
                        </div>
                        <div class="form-group">
                            <label>동영상 파일</label>
                            <input type="file" accept="video/*" @change="handleVideoSelection" ref="videoFileInput" />
                            <small>지원 형식: MP4, AVI, MOV (최대 1GB)</small>
                        </div>
                        <div class="form-group">
                            <label>썸네일 이미지</label>
                            <input type="file" accept="image/*" @change="handleThumbnailSelection" ref="thumbnailFileInput" />
                            <small>동영상 미리보기 이미지 (선택사항)</small>
                        </div>
                        <div v-if="selectedVideoFile" class="selected-video">
                            <h4>선택된 동영상:</h4>
                            <div class="video-item">
                                <div class="video-preview">
                                    <img v-if="thumbnailPreview" :src="thumbnailPreview" alt="썸네일" />
                                    <div v-else class="no-preview">🎥</div>
                                </div>
                                <div class="video-info">
                                    <span class="video-name">{{ selectedVideoFile.name }}</span>
                                    <span class="video-size">{{ formatFileSize(selectedVideoFile.size) }}</span>
                                </div>
                                <button type="button" @click="removeVideoFile" class="remove-file">✕</button>
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

                <!-- 동영상 재생 모달 -->
                <div v-if="selectedVideo" class="video-modal" @click="closeModal">
                    <div class="modal-content" @click.stop>
                        <div class="modal-header">
                            <h3>{{ selectedVideo.title }}</h3>
                            <button class="close-btn" @click="closeModal">✕</button>
                        </div>
                        <div class="video-player">
                            <video
                                v-if="selectedVideo.url"
                                :src="`${API_BASE_URL}${selectedVideo.url}`"
                                controls
                                autoplay
                                class="video-element"
                                @error="onVideoError"
                            >
                                브라우저가 동영상 재생을 지원하지 않습니다.
                            </video>
                            <div v-else class="player-placeholder">
                                <div class="play-icon large">▶</div>
                                <p>{{ selectedVideo.title }}</p>
                                <small>동영상을 찾을 수 없습니다</small>
                            </div>
                        </div>
                        <div class="modal-info">
                            <p>{{ selectedVideo.description }}</p>
                            <div class="modal-meta">
                                <span>업로드: {{ selectedVideo.date }}</span>
                                <span>조회수: {{ selectedVideo.views }}회</span>
                                <span>카테고리: {{ getCategoryName(selectedVideo.categoryId) }}</span>
                            </div>
                        </div>
                    </div>
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
import axios from 'axios'
import { useToast } from '../components/Toast.vue'
import { API_BASE_URL } from '../config/env.js'

export default {
    name: 'VideoGallery',
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
            selectedVideo: null,
            newVideo: {
                title: '',
                description: '',
                categoryId: '',
                duration: ''
            },
            selectedVideoFile: null,
            selectedThumbnail: null,
            thumbnailPreview: null,
            categories: [
                { id: 'all', name: '전체', count: 0 },
                { id: 'cruise-education', name: '크루져 요트 교육', count: 0 },
                { id: 'cruise-experience', name: '크루져 요트 체험', count: 0 },
                { id: 'dinghy-education', name: '딩기 요트 교육', count: 0 },
                { id: 'dinghy-experience', name: '딩기 요트 체험', count: 0 },
                { id: 'paddleboard', name: '패들보드 체험', count: 0 }
            ],
            videos: []
        };
    },
    computed: {
        filteredVideos() {
            if (this.activeCategory === 'all') {
                return this.videos;
            }
            return this.videos.filter(video => video.categoryId === this.activeCategory);
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
        playVideo(video) {
            this.selectedVideo = video;
            // 조회수 증가 API 호출
            this.incrementViews(video.id);
        },
        closeModal() {
            this.selectedVideo = null;
        },
        async incrementViews(videoId) {
            try {
                await axios.get(`${API_BASE_URL}/api/videos/${videoId}`);
            } catch (error) {
                console.error('Failed to increment views:', error);
            }
        },
        async loadVideos() {
            try {
                console.log('Loading videos from:', `${API_BASE_URL}/api/videos`);
                const response = await axios.get(`${API_BASE_URL}/api/videos`);
                console.log('Videos response:', response.data);

                // API 데이터를 프론트엔드 형식으로 변환
                this.videos = (response.data || []).map(video => ({
                    id: video.id,
                    title: video.title,
                    description: video.description,
                    categoryId: video.category_id,
                    date: video.created_at ? video.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
                    duration: video.duration || '0:00',
                    views: video.views || 0,
                    url: video.url,
                    thumbnail_url: video.thumbnail_url,
                    filename: video.filename,
                    author: video.author_name || '관리자'
                }));
                this.updateCategoryCounts();
                console.log('Videos loaded:', this.videos.length);
            } catch (error) {
                console.error('Failed to load videos:', error);
                this.videos = [];
                this.updateCategoryCounts();
                console.warn('API server may not be running. Videos will be empty.');
            }
        },
        updateCategoryCounts() {
            this.categories.forEach(category => {
                if (category.id === 'all') {
                    category.count = this.videos.length;
                } else {
                    category.count = this.videos.filter(video => video.categoryId === category.id).length;
                }
            });
        },
        handleVideoSelection(event) {
            const file = event.target.files[0];
            if (file) {
                this.selectedVideoFile = file;
                console.log('Video selected:', file.name, file.size, file.type);
            }
        },
        handleThumbnailSelection(event) {
            const file = event.target.files[0];
            if (file) {
                this.selectedThumbnail = file;

                // 썸네일 미리보기 생성
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.thumbnailPreview = e.target.result;
                };
                reader.readAsDataURL(file);

                console.log('Thumbnail selected:', file.name, file.size, file.type);
            }
        },
        removeVideoFile() {
            this.selectedVideoFile = null;
            this.selectedThumbnail = null;
            this.thumbnailPreview = null;
            this.$refs.videoFileInput.value = '';
            this.$refs.thumbnailFileInput.value = '';
        },
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        async uploadVideo() {
            if (!this.selectedVideoFile) {
                this.toast.warning('동영상을 선택해주세요.', '🎥 동영상 선택 필요');
                return;
            }

            if (!this.newVideo.title || !this.newVideo.categoryId) {
                this.toast.warning('제목과 카테고리를 입력해주세요.', '✏️ 정보 입력 필요');
                return;
            }

            try {
                console.log('Starting video upload...');
                console.log('Selected video:', this.selectedVideoFile.name, this.selectedVideoFile.size);
                console.log('Form data:', this.newVideo);

                const formData = new FormData();
                formData.append('title', this.newVideo.title);
                formData.append('description', this.newVideo.description);
                formData.append('category_id', this.newVideo.categoryId);
                formData.append('duration', this.newVideo.duration);
                formData.append('video', this.selectedVideoFile);

                if (this.selectedThumbnail) {
                    formData.append('thumbnail', this.selectedThumbnail);
                }

                const token = localStorage.getItem('token');
                console.log('Token exists:', !!token);
                console.log('Upload URL:', `${API_BASE_URL}/api/videos`);

                this.toast.info('동영상 업로드 중... 잠시만 기다려주세요.', '⏳ 업로드 진행중');

                const response = await axios.post(`${API_BASE_URL}/api/videos`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                console.log('Upload response:', response.data);

                // 업로드 후 동영상 목록 새로고침
                await this.loadVideos();

                // 성공 메시지
                this.toast.celebrate('동영상이 업로드되었습니다.', '🎥 동영상 업로드 완료');

                // 폼 초기화
                this.showUploadForm = false;
                this.newVideo = { title: '', description: '', categoryId: '', duration: '' };
                this.selectedVideoFile = null;
                this.selectedThumbnail = null;
                this.thumbnailPreview = null;
                this.$refs.videoFileInput.value = '';
                this.$refs.thumbnailFileInput.value = '';
            } catch (error) {
                console.error('Upload error details:', error);
                console.error('Error response:', error.response?.data);
                console.error('Error status:', error.response?.status);

                let errorMessage = '동영상 업로드에 실패했습니다.';
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
        },
        manageVideos() {
            // 동영상 관리 페이지로 이동
            console.log('Manage videos');
        },
        goBack() {
            this.$router.push('/community');
        },
        onVideoError(error) {
            console.error('Video playback error:', error);
            this.toast.error('동영상 재생 중 오류가 발생했습니다.', '❌ 재생 오류');
        }
    },

    mounted() {
        this.loadVideos();

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.selectedVideo) {
                this.closeModal();
            }
        });
    }
};
</script>

<style scoped>
.video-gallery {
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

.video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 25px;
    margin-bottom: 40px;
}

.video-card {
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 15px;
    overflow: hidden;
    transition: all 0.3s;
    cursor: pointer;
}

.video-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border-color: #2c5aa0;
}

.video-container {
    position: relative;
}

.video-thumbnail {
    height: 200px;
    background: #f8f9fa;
    position: relative;
    overflow: hidden;
}

.thumbnail-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.video-card:hover .thumbnail-image {
    transform: scale(1.05);
}

.play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.video-card:hover .play-overlay {
    opacity: 1;
}

.play-overlay .play-icon {
    font-size: 3rem;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.thumbnail-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
}

.play-icon {
    font-size: 3rem;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.play-icon.large {
    font-size: 4rem;
}

.duration-badge {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
}

.video-info {
    padding: 20px;
}

.video-info h4 {
    color: #2c5aa0;
    margin-bottom: 8px;
    font-size: 1.1rem;
    line-height: 1.4;
}

.video-info p {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 15px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.video-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: #999;
    flex-wrap: wrap;
    gap: 8px;
}

.views {
    color: #2c5aa0;
    font-weight: 500;
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

.form-group small {
    color: #999;
    font-size: 0.8rem;
    margin-top: 5px;
    display: block;
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

.selected-video {
    margin-top: 20px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.selected-video h4 {
    color: #2c5aa0;
    margin-bottom: 15px;
    font-size: 1rem;
}

.video-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
}

.video-preview {
    width: 80px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.video-preview img {
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

.video-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.video-name {
    font-weight: 500;
    color: #333;
    word-break: break-all;
}

.video-size {
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

/* 동영상 재생 모달 */
.video-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
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
    max-width: 1440px;
    width: 98vw;
    max-height: 98vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
    background: #2c5aa0;
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.2rem;
}

.video-player {
    height: 84vh;
    min-height: 600px;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: white;
    text-align: center;
}

.video-element {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.player-placeholder {
    padding: 20px;
}

.player-placeholder p {
    font-size: 1.1rem;
    margin: 10px 0;
}

.player-placeholder small {
    color: #ccc;
}

.modal-info {
    padding: 20px;
}

.modal-info p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 15px;
}

.modal-meta {
    display: flex;
    gap: 20px;
    font-size: 0.9rem;
    color: #999;
    flex-wrap: wrap;
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

@media (min-width: 769px) and (max-width: 1024px) {
    .modal-content {
        max-width: 900px;
        width: 90vw;
    }

    .video-player {
        height: 60vh;
        min-height: 400px;
    }
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

    .video-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .admin-buttons {
        flex-direction: column;
    }

    .form-actions {
        flex-direction: column;
    }

    .video-modal {
        padding: 10px;
    }

    .modal-content {
        width: 98vw;
        max-height: 98vh;
    }

    .video-player {
        height: 40vh;
        min-height: 250px;
    }

    .modal-meta {
        flex-direction: column;
        gap: 8px;
    }
}
</style>