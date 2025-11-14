<template>
    <div class="notice-others">
        <section class="hero-section">
            <div class="hero-background"></div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">기타 공지사항</h1>
                <p class="hero-subtitle">통영요트학교의 기타 일반 공지사항을 확인하세요</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="notice-header">
                    <div class="breadcrumb">
                        <router-link to="/notice">공지사항</router-link>
                        <span class="separator">></span>
                        <span class="current">기타</span>
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

                    <router-link v-for="notice in paginatedNotices" :key="notice.id" :to="`/notice/others/${notice.id}`" class="table-row title-link">
                        <div class="col-number">{{ notice.id }}</div>
                        <div class="col-title">
                            <span class="title-text">{{ notice.title }}</span>
                            <span v-if="isNewNotice(notice.date)" class="new-badge">NEW</span>
                            <span v-if="notice.important" class="important-badge">중요</span>
                        </div>
                        <div class="col-date">{{ formatDate(notice.date) }}</div>
                        <div class="col-views">{{ notice.views }}</div>
                    </router-link>
                </div>

                <!-- 관리자 작성 폼 -->
                <div v-if="showWriteForm && isAdmin" class="write-form">
                    <div class="form-header">
                        <h3>기타 공지사항 작성</h3>
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
                        
                        <!-- 이미지 업로드 섹션 -->
                        <div class="form-group">
                            <label>이미지 첨부 (최대 3개, 각각 5MB 이하)</label>
                            <div class="image-upload-container">
                                <input 
                                    type="file" 
                                    ref="imageInput" 
                                    @change="handleImageSelection" 
                                    accept="image/*" 
                                    multiple 
                                    class="image-input"
                                    id="image-upload"
                                />
                                <label for="image-upload" class="upload-btn">
                                    📷 이미지 선택
                                </label>
                                
                                <!-- 선택된 이미지 미리보기 -->
                                <div v-if="selectedImages.length > 0" class="image-preview-container">
                                    <div v-for="(image, index) in selectedImages" :key="index" class="image-preview">
                                        <img :src="image.preview" :alt="image.name" />
                                        <div class="image-info">
                                            <span class="image-name">{{ image.name }}</span>
                                            <span class="image-size">({{ formatFileSize(image.size) }})</span>
                                        </div>
                                        <button 
                                            type="button" 
                                            class="remove-image-btn" 
                                            @click="removeImage(index)"
                                        >✕</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="cancel-btn" @click="showWriteForm = false">취소</button>
                            <button type="submit" class="submit-btn">등록</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>

        <!-- 뒤로가기 -->
        <div class="back-button">
            <button @click="goBack" class="back-btn">← 공지사항으로 돌아가기</button>
        </div>

        <!-- 공지사항 상세 모달 -->
        <div v-if="showModal && selectedNotice" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h2>{{ selectedNotice.title }}</h2>
                    <button class="close-btn" @click="closeModal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="notice-meta">
                        <span class="date">{{ formatDate(selectedNotice.created_at || selectedNotice.date) }}</span>
                        <span class="views">조회 {{ selectedNotice.views }}</span>
                    </div>
                    <div class="detail-content">
                        <div class="content-text">{{ selectedNotice.content }}</div>
                        <div v-if="selectedNotice.images && selectedNotice.images.length > 0" class="content-images">
                            <div class="images-gallery">
                                <div v-for="image in selectedNotice.images" :key="image.id" class="image-item">
                                    <img :src="`${API_BASE_URL}${image.url}`" :alt="image.original_name" @click="openImageModal(image)" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import authStore from '../stores/auth.js';
import { useToast } from '../components/Toast.vue';
import { API_BASE_URL } from '../config/env.js';
import axios from 'axios';

export default {
    name: 'NoticeOthers',
    setup() {
        const toast = useToast();
        return { toast };
    },
    data() {
        return {
            authStore,
            showWriteForm: false,
            searchType: 'title',
            searchKeyword: '',
            newNotice: { title: '', content: '', images: [] },
            selectedImages: [],
            selectedNotice: null,
            showModal: false,
            API_BASE_URL,
            notices: []
        };
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
            return this.filteredNotices;
        }
    },
    async mounted() {
        await this.loadNotices();
    },
    methods: {
        viewNotice(notice) {
            this.selectedNotice = notice;
            this.showModal = true;
        },
        async loadNotices() {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/notices`, {
                    params: {
                        category: 'others',
                        limit: 100
                    }
                });
                this.notices = response.data.map(notice => ({
                    ...notice,
                    date: notice.created_at.split('T')[0]
                }));
            } catch (error) {
                console.error('기타 공지사항 로드 실패:', error);
                this.toast.error('공지사항을 불러오는데 실패했습니다.', '⚠️ 로드 오류');
            }
        },
        searchNotices() {
            // 필터링은 computed에서 자동으로 처리됨
        },
        handleImageSelection(event) {
            const files = Array.from(event.target.files);
            const maxFiles = 3;
            const maxSize = 5 * 1024 * 1024; // 5MB
            
            if (this.selectedImages.length + files.length > maxFiles) {
                alert(`최대 ${maxFiles}개의 이미지만 업로드할 수 있습니다.`);
                return;
            }
            
            files.forEach(file => {
                if (file.size > maxSize) {
                    alert(`${file.name} 파일이 너무 큽니다. (최대 5MB)`);
                    return;
                }
                
                if (!file.type.startsWith('image/')) {
                    alert(`${file.name}은 이미지 파일이 아닙니다.`);
                    return;
                }
                
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
        
        async submitNotice() {
            if (!this.newNotice.title || !this.newNotice.content) {
                this.toast.warning('제목과 내용을 모두 입력해주세요.', '✏️ 입력 확인');
                return;
            }

            try {
                const formData = new FormData();
                formData.append('title', this.newNotice.title);
                formData.append('content', this.newNotice.content);
                formData.append('category_id', 'others');
                formData.append('important', 'false');

                // 이미지 파일 추가
                this.selectedImages.forEach(image => {
                    formData.append('images', image.file);
                });

                const response = await axios.post(`${API_BASE_URL}/api/notices`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${this.authStore.state.token}`
                    }
                });

                // 폼 초기화
                this.showWriteForm = false;
                this.newNotice = { title: '', content: '', images: [] };
                this.selectedImages = [];
                if (this.$refs.imageInput) {
                    this.$refs.imageInput.value = '';
                }

                // 데이터 새로고침
                await this.loadNotices();

                this.toast.success('공지사항이 등록되었습니다.', '등록 완료');
            } catch (error) {
                console.error('공지사항 등록 실패:', error);
                if (error.response?.status === 401) {
                    this.toast.urgent('로그인이 필요합니다.', '🔐 로그인 필요');
                    this.$router.push('/login');
                } else if (error.response?.status === 403) {
                    this.toast.urgent('관리자만 공지사항을 작성할 수 있습니다.', '⚠️ 권한 없음');
                } else {
                    this.toast.error('공지사항 등록에 실패했습니다.', '❌ 등록 실패');
                }
            }
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            const today = new Date();
            const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
            return diffDays === 0 ? '오늘' : diffDays === 1 ? '어제' : date.toLocaleDateString('ko-KR');
        },
        isNewNotice(dateString) {
            return Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24)) <= 3;
        },
        goBack() { this.$router.push('/notice'); },
        openImageModal(image) {
            window.open(`${this.API_BASE_URL}${image.url}`, '_blank');
        },
        closeModal() {
            this.showModal = false;
            this.selectedNotice = null;
        },
        async createNewPage() {
            try {
                const response = await axios.post(`${API_BASE_URL}/api/notices/draft`, {
                    category_id: 'others'
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.authStore.state.token}`
                    }
                });

                const draftId = response.data.id;
                this.$router.push(`/notice/others/edit/${draftId}`);
            } catch (error) {
                console.error('드래프트 생성 실패:', error);
                this.toast.error('새 공지사항을 생성할 수 없습니다.', '❌ 오류');
            }
        }
    }
};
</script>

<style scoped>
.notice-others { padding-top: 70px; }

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
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}
.content-section { padding: 60px 0; background: white; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.notice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0; }
.breadcrumb a { color: #2c5aa0; text-decoration: none; }
.current { color: #6c757d; font-weight: 600; }
.total-count { color: #6c757d; font-weight: 600; }
.notices-table { background: white; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden; margin-bottom: 30px; }
.table-header { display: grid; grid-template-columns: 80px 1fr 120px 80px; background: #f8f9fa; padding: 15px; font-weight: 600; }
.table-row { display: grid; grid-template-columns: 80px 1fr 120px 80px; padding: 15px; border-bottom: 1px solid #f9f9f9; cursor: pointer; }
.table-row:hover { background: #f8f9fa; }
.title-link { color: inherit; text-decoration: none; }
.title-link:hover { color: inherit; }
.new-badge { background: #dc3545; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; }
.important-badge { background: #ffc107; color: #333; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; }
.admin-controls { text-align: center; margin: 20px 0; }
.write-btn { padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; }
.write-form { background: white; border: 2px solid #6c757d; border-radius: 15px; padding: 30px; margin-top: 30px; }
.form-header { display: flex; justify-content: space-between; margin-bottom: 25px; }
.form-header h3 { color: #6c757d; margin: 0; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
.form-group input, .form-group textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-family: inherit; }
.form-actions { display: flex; justify-content: flex-end; gap: 15px; }
.cancel-btn { padding: 12px 24px; border: 2px solid #ddd; background: white; color: #666; border-radius: 25px; cursor: pointer; }
.submit-btn { padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 25px; cursor: pointer; }
.back-button { text-align: center; padding: 20px; }
.back-btn { padding: 12px 24px; background: #f8f9fa; border: 2px solid #ddd; color: #666; border-radius: 25px; cursor: pointer; }
.back-btn:hover { background: #6c757d; color: white; border-color: #6c757d; }

/* 이미지 업로드 스타일 */
.image-upload-container {
    border: 2px dashed #ddd;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    transition: border-color 0.3s;
}

.image-upload-container:hover {
    border-color: #6c757d;
}

.image-input {
    display: none;
}

.upload-btn {
    display: inline-block;
    padding: 12px 24px;
    background: #f8f9fa;
    border: 2px solid #6c757d;
    color: #6c757d;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 600;
}

.upload-btn:hover {
    background: #6c757d;
    color: white;
}

.image-preview-container {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-top: 20px;
    justify-content: center;
}

.image-preview {
    position: relative;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    width: 150px;
}

.image-preview img {
    width: 100%;
    height: 100px;
    object-fit: cover;
}

.image-info {
    padding: 8px;
    text-align: left;
}

.image-name {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.image-size {
    display: block;
    font-size: 0.7rem;
    color: #666;
    margin-top: 2px;
}

.remove-image-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(220, 53, 69, 0.8);
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    cursor: pointer;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
}

.remove-image-btn:hover {
    background: rgba(220, 53, 69, 1);
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
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
}

.write-btn {
    padding: 10px 20px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    white-space: nowrap;
}

.search-btn:hover,
.write-btn:hover {
    background: #545b62;
}

/* 모달 스타일 */
.modal-overlay {
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
    padding: 20px;
}

.modal-content {
    background: white;
    border-radius: 15px;
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25px 30px;
    border-bottom: 1px solid #f0f0f0;
    background: linear-gradient(135deg, #6c757d, #545b62);
    color: white;
    border-radius: 15px 15px 0 0;
}

.modal-header h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
}

.modal-header .close-btn {
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: white;
    opacity: 0.8;
    transition: opacity 0.3s;
}

.modal-header .close-btn:hover {
    opacity: 1;
}

.modal-body {
    padding: 30px;
}

.notice-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
    color: #666;
    font-size: 0.9rem;
}

.detail-content {
    line-height: 1.8;
    color: #333;
}

.content-text {
    margin-bottom: 25px;
    white-space: pre-line;
    font-size: 1rem;
}

.content-images {
    margin-top: 25px;
}

.images-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-top: 15px;
}

.image-item {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
}

.image-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.image-item img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    cursor: pointer;
    transition: transform 0.3s;
}

.image-item img:hover {
    transform: scale(1.05);
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 2rem;
    }

    .hero-subtitle {
        font-size: 1rem;
    }

    .search-section {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
    }

    .search-controls {
        flex-direction: column;
        gap: 10px;
    }

    .modal-content {
        margin: 10px;
        max-height: 95vh;
    }

    .modal-header,
    .modal-body {
        padding: 20px;
    }

    .images-gallery {
        grid-template-columns: 1fr;
    }
}
</style>