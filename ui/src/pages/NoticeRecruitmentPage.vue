<template>
    <div class="notice-page">
        <section class="hero-section">
            <div class="hero-background"></div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">{{ notice.title || '채용 공지사항' }}</h1>
                <p class="hero-subtitle">채용 관련 중요 공지사항입니다</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="breadcrumb">
                    <router-link to="/">홈</router-link>
                    <span class="separator">></span>
                    <router-link to="/notice">공지사항</router-link>
                    <span class="separator">></span>
                    <router-link to="/notice/recruitment">채용</router-link>
                    <span class="separator">></span>
                    <span class="current">{{ notice.title || '공지사항' }}</span>
                </div>

                <!-- 편집 모드 -->
                <div v-if="isEditMode" class="edit-mode">
                    <div class="edit-header">
                        <div class="header-info">
                            <h2>📝 공지사항 편집</h2>
                            <div class="edit-status">
                                <span v-if="isLoading" class="status-loading">불러오는 중...</span>
                                <span v-else-if="isSaving" class="status-saving">저장 중...</span>
                                <span v-else class="status-ready">편집 가능</span>
                            </div>
                        </div>
                        <div class="action-buttons">
                            <button @click="previewNotice" class="preview-btn">👁️ 미리보기</button>
                            <button @click="saveNotice" class="save-btn" :disabled="isSaving">
                                {{ isSaving ? '저장 중...' : '💾 저장' }}
                            </button>
                        </div>
                    </div>

                    <div class="edit-form">
                        <div class="form-section">
                            <label class="form-label">제목</label>
                            <input
                                v-model="notice.title"
                                type="text"
                                class="title-input"
                                placeholder="공지사항 제목을 입력하세요"
                                @input="onContentChange"
                                @focus="clearDefaultTitle"
                            />
                        </div>

                        <div class="form-section">
                            <label class="form-label">내용</label>
                            <textarea
                                v-model="notice.content"
                                class="content-textarea"
                                placeholder="공지사항 내용을 입력하세요"
                                rows="20"
                                @input="onContentChange"
                                @focus="clearDefaultContent"
                            ></textarea>
                        </div>

                        <div class="form-section">
                            <label class="form-label">이미지 첨부</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                @change="handleImageSelection"
                                ref="imageFileInput"
                                class="file-input"
                            />
                            <div class="file-info">지원 형식: JPG, PNG, GIF (최대 5MB, 최대 3개 파일)</div>
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

                        <div class="form-section">
                            <label class="form-label">파일 첨부</label>
                            <!-- 기존 업로드된 파일 목록 -->
                            <div v-if="notice.files && notice.files.length > 0" class="existing-files">
                                <h4>기존 파일:</h4>
                                <div class="file-list">
                                    <div v-for="(file, index) in notice.files" :key="'existing-' + file.id" class="file-item">
                                        <div class="file-icon">
                                            <span>{{ getFileIcon(file.original_name) }}</span>
                                        </div>
                                        <div class="file-info-detail">
                                            <span class="file-name">{{ file.original_name }}</span>
                                            <span class="file-size">{{ formatFileSize(file.file_size) }}</span>
                                        </div>
                                        <button type="button" @click="deleteExistingFile(file.id)" class="remove-file">🗑️ 삭제</button>
                                    </div>
                                </div>
                            </div>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.hwp,.hwpx"
                                multiple
                                @change="handleFileSelection"
                                ref="fileInput"
                                class="file-input"
                            />
                            <div class="file-info">지원 형식: PDF, DOC, DOCX, XLS, XLSX, ZIP, HWP, HWPX (최대 10MB, 최대 5개 파일)</div>
                        </div>

                        <div v-if="selectedFiles.length > 0" class="selected-files">
                            <h4>선택된 파일:</h4>
                            <div class="file-list">
                                <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                                    <div class="file-icon">
                                        <span>{{ getFileIcon(file.name) }}</span>
                                    </div>
                                    <div class="file-info-detail">
                                        <span class="file-name">{{ file.name }}</span>
                                        <span class="file-size">{{ formatFileSize(file.size) }}</span>
                                    </div>
                                    <button type="button" @click="removeFile(index)" class="remove-file">✕</button>
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <label class="checkbox-label">
                                <input
                                    type="checkbox"
                                    v-model="notice.important"
                                    @change="onContentChange"
                                />
                                <span class="checkmark"></span>
                                중요 공지사항으로 설정
                            </label>
                        </div>
                    </div>

                    <div class="edit-actions">
                        <button @click="goBack" class="cancel-btn">취소</button>
                        <button @click="deleteNotice" class="delete-btn" v-if="noticeId">🗑️ 삭제</button>
                    </div>
                </div>

                <!-- 공개 모드 -->
                <div v-else class="public-mode">
                    <div v-if="isLoading" class="loading-state">
                        <div class="loading-spinner"></div>
                        <p>공지사항을 불러오는 중...</p>
                    </div>

                    <div v-else-if="notice.title" class="notice-content">
                        <div class="notice-header">
                            <div class="category-badge recruitment">💼 채용</div>
                            <h1 class="notice-title">{{ notice.title }}</h1>
                            <div class="notice-meta">
                                <span class="author">작성자: {{ notice.author_name || '관리자' }}</span>
                                <span class="date">{{ formatDate(notice.created_at) }}</span>
                                <span class="views">조회 {{ notice.views || 0 }}</span>
                                <span v-if="notice.important" class="important-badge">중요</span>
                            </div>
                        </div>

                        <div class="notice-body">
                            <div class="content-text">
                                {{ notice.content }}
                            </div>

                            <div v-if="notice.images && notice.images.length > 0" class="content-images">
                                <div v-for="(image, index) in notice.images" :key="index" class="image-wrapper">
                                    <img :src="`${API_BASE_URL}${image.url}`" :alt="image.original_name" />
                                </div>
                            </div>

                            <div v-if="notice.files && notice.files.length > 0" class="content-files">
                                <h3>📎 첨부 파일</h3>
                                <div class="files-list">
                                    <a
                                        v-for="(file, index) in notice.files"
                                        :key="index"
                                        :href="`${API_BASE_URL}${file.file_path}`"
                                        :download="file.original_name"
                                        class="file-download-item"
                                        target="_blank"
                                    >
                                        <span class="file-icon-large">{{ getFileIcon(file.original_name) }}</span>
                                        <div class="file-download-info">
                                            <span class="file-download-name">{{ file.original_name }}</span>
                                            <span class="file-download-size">{{ formatFileSize(file.file_size) }}</span>
                                        </div>
                                        <span class="download-icon">⬇️</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div class="notice-actions">
                            <button @click="goBack" class="back-btn">💼 목록으로</button>
                            <button v-if="canEdit" @click="enterEditMode" class="edit-btn">✏️ 편집</button>
                        </div>
                    </div>

                    <div v-else class="empty-state">
                        <div class="empty-icon">📝</div>
                        <h3>공지사항을 찾을 수 없습니다</h3>
                        <p>해당 공지사항이 존재하지 않거나 삭제되었습니다.</p>
                        <button @click="goBack" class="back-btn">목록으로 돌아가기</button>
                    </div>
                </div>

                <!-- 미리보기 모달 -->
                <div v-if="showPreview" class="preview-modal" @click="closePreview">
                    <div class="preview-content" @click.stop>
                        <div class="preview-header">
                            <h3>미리보기</h3>
                            <button @click="closePreview" class="close-btn">✕</button>
                        </div>
                        <div class="preview-body">
                            <div class="preview-notice">
                                <div class="notice-header">
                                    <div class="category-badge recruitment">💼 채용</div>
                                    <h1>{{ notice.title || '제목을 입력하세요' }}</h1>
                                    <div class="notice-meta">
                                        <span>{{ new Date().toLocaleDateString('ko-KR') }}</span>
                                        <span v-if="notice.important" class="important-badge">중요</span>
                                    </div>
                                </div>
                                <div class="notice-content">
                                    <div class="content-text">
                                        {{ notice.content || '내용을 입력하세요' }}
                                    </div>
                                    <div v-if="selectedImages.length > 0" class="content-images">
                                        <div v-for="(image, index) in selectedImages" :key="index" class="image-wrapper">
                                            <img :src="image.preview" :alt="image.name" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
    name: 'NoticeRecruitmentPage',
    setup() {
        const toast = useToast()
        return { toast }
    },
    data() {
        return {
            authStore,
            noticeId: null,
            isLoading: true,
            isSaving: false,
            showPreview: false,
            hasUnsavedChanges: false,
            notice: {
                title: '',
                content: '',
                important: false,
                author_name: '',
                created_at: '',
                views: 0,
                images: [],
                files: []
            },
            selectedImages: [],
            selectedFiles: [],
            API_BASE_URL
        };
    },
    computed: {
        isEditMode() {
            return this.$route.name === 'NoticeRecruitmentEdit';
        },
        canEdit() {
            return this.authStore.state.isAuthenticated && this.authStore.state.user?.role === 'admin';
        }
    },
    async mounted() {
        this.noticeId = parseInt(this.$route.params.id);

        if (this.isEditMode) {
            if (!this.canEdit) {
                this.toast.urgent('관리자만 접근할 수 있습니다.', '🔐 접근 권한 없음');
                this.$router.push('/notice/recruitment');
                return;
            }
        }

        await this.loadNotice();
    },
    beforeUnmount() {
        if (this.isEditMode && this.hasUnsavedChanges) {
            const shouldSave = confirm('저장하지 않은 변경사항이 있습니다. 저장하시겠습니까?');
            if (shouldSave) {
                this.saveNotice();
            }
        }
    },
    methods: {
        async loadNotice() {
            try {
                this.isLoading = true;
                const response = await axios.get(`${API_BASE_URL}/api/notices/${this.noticeId}`);
                const noticeData = response.data;

                this.notice = {
                    title: noticeData.title,
                    content: noticeData.content,
                    important: Boolean(noticeData.important),
                    author_name: noticeData.author_name,
                    created_at: noticeData.created_at,
                    views: noticeData.views,
                    images: noticeData.images || [],
                    files: noticeData.files || []
                };
            } catch (error) {
                console.error('공지사항 로드 실패:', error);
                if (!this.isEditMode) {
                    this.notice = { title: '', content: '', important: false };
                } else {
                    this.toast.error('공지사항을 불러올 수 없습니다.', '❌ 로드 실패');
                    this.$router.push('/notice/recruitment');
                }
            } finally {
                this.isLoading = false;
            }
        },
        onContentChange() {
            this.hasUnsavedChanges = true;
        },
        clearDefaultTitle() {
            if (this.notice.title === '새 공지사항') {
                this.notice.title = '';
            }
        },
        clearDefaultContent() {
            if (this.notice.content === '내용을 입력하세요...') {
                this.notice.content = '';
            }
        },
        async saveNotice() {
            try {
                this.isSaving = true;

                const formData = new FormData();
                formData.append('title', this.notice.title);
                formData.append('content', this.notice.content);
                formData.append('category_id', 'recruitment');
                formData.append('important', this.notice.important.toString());

                this.selectedImages.forEach(image => {
                    formData.append('images', image.file);
                });

                this.selectedFiles.forEach(file => {
                    formData.append('images', file.file);
                });

                await axios.put(`${API_BASE_URL}/api/notices/${this.noticeId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${this.authStore.state.token}`
                    }
                });

                this.hasUnsavedChanges = false;
                this.toast.success('저장되었습니다.', '💾 저장 완료');

                this.$router.push(`/notice/recruitment/${this.noticeId}`);
            } catch (error) {
                console.error('저장 실패:', error);
                this.toast.error('저장에 실패했습니다.', '❌ 저장 실패');
            } finally {
                this.isSaving = false;
            }
        },
        async deleteNotice() {
            if (!confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
                return;
            }

            try {
                await axios.delete(`${API_BASE_URL}/api/notices/${this.noticeId}`, {
                    headers: {
                        'Authorization': `Bearer ${this.authStore.state.token}`
                    }
                });

                this.toast.success('공지사항이 삭제되었습니다.', '🗑️ 삭제 완료');
                this.$router.push('/notice/recruitment');
            } catch (error) {
                console.error('삭제 실패:', error);
                this.toast.error('삭제에 실패했습니다.', '❌ 삭제 실패');
            }
        },
        enterEditMode() {
            this.$router.push(`/notice/recruitment/edit/${this.noticeId}`);
        },
        handleImageSelection(event) {
            const files = Array.from(event.target.files);

            if (files.length > 3) {
                this.toast.warning('최대 3개의 이미지만 선택할 수 있습니다.', '🖼️ 이미지 제한');
                return;
            }

            this.selectedImages = [];

            files.forEach(file => {
                if (file.size > 5 * 1024 * 1024) {
                    this.toast.error(`${file.name}은(는) 파일 크기가 5MB를 초과합니다.`, '⚠️ 파일 크기 초과');
                    return;
                }

                if (!file.type.startsWith('image/')) {
                    this.toast.error(`${file.name}은(는) 이미지 파일이 아닙니다.`, '⚠️ 파일 형식 오류');
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

            this.onContentChange();
        },
        removeImage(index) {
            this.selectedImages.splice(index, 1);
            this.onContentChange();
        },
        handleFileSelection(event) {
            const files = Array.from(event.target.files);

            if (files.length > 5) {
                this.toast.warning('최대 5개의 파일만 선택할 수 있습니다.', '📎 파일 제한');
                return;
            }

            this.selectedFiles = [];

            files.forEach(file => {
                if (file.size > 10 * 1024 * 1024) {
                    this.toast.error(`${file.name}은(는) 파일 크기가 10MB를 초과합니다.`, '⚠️ 파일 크기 초과');
                    return;
                }

                const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.hwp', '.hwpx'];
                const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

                if (!allowedExtensions.includes(fileExtension)) {
                    this.toast.error(`${file.name}은(는) 지원하지 않는 파일 형식입니다.`, '⚠️ 파일 형식 오류');
                    return;
                }

                this.selectedFiles.push({
                    file: file,
                    name: file.name,
                    size: file.size
                });
            });

            this.onContentChange();
        },
        removeFile(index) {
            this.selectedFiles.splice(index, 1);
            this.onContentChange();
        },
        async deleteExistingFile(fileId) {
            if (!confirm('이 파일을 삭제하시겠습니까?')) {
                return;
            }

            try {
                await axios.delete(`${API_BASE_URL}/api/notices/${this.noticeId}/files/${fileId}`, {
                    headers: {
                        'Authorization': `Bearer ${this.authStore.state.token}`
                    }
                });

                // 삭제 성공 시 로컬 상태 업데이트
                this.notice.files = this.notice.files.filter(f => f.id !== fileId);
                this.toast.success('파일이 삭제되었습니다.', '삭제 완료');
            } catch (error) {
                console.error('파일 삭제 실패:', error);
                this.toast.error('파일 삭제에 실패했습니다.', '삭제 실패');
            }
        },
        getFileIcon(filename) {
            const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
            const icons = {
                '.pdf': '📄',
                '.doc': '📝',
                '.docx': '📝',
                '.xls': '📊',
                '.xlsx': '📊',
                '.zip': '🗜️',
                '.hwp': '📘',
                '.hwpx': '📘'
            };
            return icons[extension] || '📎';
        },
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        formatDate(dateString) {
            if (!dateString) return '';
            return new Date(dateString).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        previewNotice() {
            this.showPreview = true;
        },
        closePreview() {
            this.showPreview = false;
        },
        goBack() {
            if (this.isEditMode && this.hasUnsavedChanges) {
                if (!confirm('저장하지 않은 변경사항이 있습니다. 정말 나가시겠습니까?')) {
                    return;
                }
            }
            this.$router.push('/notice/recruitment');
        }
    }
};
</script>

<style scoped>
.notice-page {
    padding-top: 70px;
    min-height: 100vh;
    background: #f8f9fa;
}

.hero-section {
    position: relative;
    height: 200px;
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
    background: linear-gradient(135deg, #6f42c1, #5a2d91);
    z-index: 1;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(111, 66, 193, 0.7);
    z-index: 3;
}

.hero-content {
    position: relative;
    z-index: 4;
    text-align: center;
    color: white;
}

.hero-title {
    font-size: 2.2rem;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.hero-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
}

.content-section {
    padding: 40px 0 80px;
}

.container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 30px;
    font-size: 0.9rem;
}

.breadcrumb a {
    color: #6f42c1;
    text-decoration: none;
}

.breadcrumb a:hover {
    text-decoration: underline;
}

.separator {
    color: #999;
}

.current {
    color: #333;
    font-weight: 600;
}

/* 편집 모드 스타일 */
.edit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 20px;
    background: white;
    border-radius: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-info h2 {
    color: #6f42c1;
    margin: 0 0 5px 0;
}

.edit-status {
    font-size: 0.9rem;
}

.status-loading {
    color: #ffc107;
}

.status-saving {
    color: #007bff;
}

.status-ready {
    color: #28a745;
}

.action-buttons {
    display: flex;
    gap: 10px;
}

.preview-btn,
.save-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.preview-btn {
    background: #6c757d;
    color: white;
}

.save-btn {
    background: #6f42c1;
    color: white;
}

.preview-btn:hover {
    background: #5a6268;
}

.save-btn:hover:not(:disabled) {
    background: #5a2d91;
}

.edit-form {
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
}

.form-section {
    margin-bottom: 25px;
}

.form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
}

.title-input {
    width: 100%;
    padding: 15px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1.2rem;
    font-weight: 600;
    transition: border-color 0.3s;
}

.title-input:focus {
    outline: none;
    border-color: #6f42c1;
}

.content-textarea {
    width: 100%;
    padding: 15px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    line-height: 1.6;
    resize: vertical;
    min-height: 300px;
    font-family: inherit;
    transition: border-color 0.3s;
}

.content-textarea:focus {
    outline: none;
    border-color: #6f42c1;
}

.file-input {
    width: 100%;
    padding: 10px;
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
}

.file-info {
    font-size: 0.9rem;
    color: #666;
    margin-top: 5px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
    margin-right: 10px;
}

.selected-images {
    margin-top: 20px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 2px solid #e0e0e0;
}

.selected-images h4 {
    color: #6f42c1;
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

.selected-files {
    margin-top: 20px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 2px solid #e0e0e0;
}

.selected-files h4 {
    color: #6f42c1;
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

.file-icon {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    flex-shrink: 0;
}

.file-info-detail {
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

.existing-files {
    margin-bottom: 20px;
    padding: 20px;
    background: #fff3cd;
    border-radius: 8px;
    border: 2px solid #ffc107;
}

.existing-files h4 {
    color: #856404;
    margin-bottom: 15px;
    font-size: 1rem;
}

.content-files {
    margin-top: 40px;
    padding-top: 30px;
    border-top: 2px solid #f0f0f0;
}

.content-files h3 {
    color: #6f42c1;
    margin-bottom: 20px;
    font-size: 1.3rem;
    font-weight: 600;
}

.files-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.file-download-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: #f8f9fa;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.3s;
}

.file-download-item:hover {
    background: #e9ecef;
    border-color: #6f42c1;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(111, 66, 193, 0.2);
}

.file-icon-large {
    font-size: 2.5rem;
    flex-shrink: 0;
}

.file-download-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.file-download-name {
    color: #333;
    font-weight: 600;
    font-size: 1rem;
    word-break: break-all;
}

.file-download-size {
    color: #666;
    font-size: 0.9rem;
}

.download-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.edit-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.cancel-btn,
.delete-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.cancel-btn {
    background: #6c757d;
    color: white;
}

.delete-btn {
    background: #dc3545;
    color: white;
}

.cancel-btn:hover {
    background: #5a6268;
}

.delete-btn:hover {
    background: #c82333;
}

/* 공개 모드 스타일 */
.loading-state {
    text-align: center;
    padding: 60px 20px;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e0e0e0;
    border-top: 4px solid #6f42c1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.notice-content {
    background: white;
    border-radius: 15px;
    padding: 40px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
}

.notice-header {
    margin-bottom: 40px;
    text-align: center;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 30px;
}

.category-badge {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    color: white;
    margin-bottom: 20px;
}

.category-badge.recruitment {
    background: #6f42c1;
}

.notice-title {
    color: #333;
    font-size: 2.2rem;
    margin-bottom: 20px;
    font-weight: bold;
    line-height: 1.3;
}

.notice-meta {
    display: flex;
    justify-content: center;
    gap: 20px;
    color: #666;
    font-size: 0.95rem;
    flex-wrap: wrap;
}

.notice-meta span {
    display: flex;
    align-items: center;
}

.important-badge {
    background: #ffc107;
    color: #333;
    padding: 4px 12px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.8rem;
}

.notice-body {
    line-height: 1.8;
}

.content-text {
    color: #333;
    white-space: pre-wrap;
    margin-bottom: 30px;
    font-size: 1.1rem;
    line-height: 1.8;
}

.content-images {
    display: grid;
    gap: 20px;
    margin-top: 30px;
}

.image-wrapper {
    text-align: center;
}

.image-wrapper img {
    max-width: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.notice-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
}

.back-btn,
.edit-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.back-btn {
    background: #6c757d;
    color: white;
}

.edit-btn {
    background: #6f42c1;
    color: white;
}

.back-btn:hover {
    background: #5a6268;
}

.edit-btn:hover {
    background: #5a2d91;
}

.empty-state {
    text-align: center;
    padding: 80px 20px;
    background: white;
    border-radius: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
}

.empty-state h3 {
    color: #333;
    margin-bottom: 10px;
}

.empty-state p {
    color: #666;
    margin-bottom: 30px;
}

/* 미리보기 모달 */
.preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.preview-content {
    background: white;
    border-radius: 15px;
    max-width: 80%;
    max-height: 80%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
}

.preview-header h3 {
    color: #6f42c1;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
}

.preview-body {
    padding: 20px;
    overflow-y: auto;
}

.preview-notice {
    max-width: 600px;
}

@media (max-width: 768px) {
    .container {
        padding: 0 15px;
    }

    .edit-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
    }

    .action-buttons {
        justify-content: center;
    }

    .edit-form,
    .notice-content {
        padding: 20px;
    }

    .edit-actions,
    .notice-actions {
        flex-direction: column;
        gap: 15px;
    }

    .notice-meta {
        flex-direction: column;
        gap: 10px;
    }

    .preview-content {
        max-width: 95%;
        max-height: 95%;
    }

    .hero-title {
        font-size: 1.8rem;
    }

    .notice-title {
        font-size: 1.8rem;
    }
}
</style>