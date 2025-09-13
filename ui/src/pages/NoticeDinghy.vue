<template>
    <div class="notice-dinghy">
        <section class="hero-section">
            <div class="hero-background"></div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">딩기요트 공지사항</h1>
                <p class="hero-subtitle">딩기요트 교육 및 체험 관련 공지사항을 확인하세요</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="notice-header">
                    <div class="breadcrumb">
                        <router-link to="/notice">공지사항</router-link>
                        <span class="separator">></span>
                        <span class="current">딩기요트</span>
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

                    <div v-for="notice in filteredNotices" :key="notice.id" class="table-row" @click="viewNotice(notice)">
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

                <!-- 관리자 작성 폼 -->
                <div v-if="showWriteForm && isAdmin" class="write-form">
                    <div class="form-header">
                        <h3>딩기요트 공지사항 작성</h3>
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
    </div>
</template>

<script>
import noticeStore from '../services/noticeStore.js';
import authStore from '../stores/auth.js';

export default {
    name: 'NoticeDinghy',
    data() {
        return {
            authStore,
            showWriteForm: false,
            searchType: 'title',
            searchKeyword: '',
            newNotice: { title: '', content: '', images: [] },
            selectedImages: [],
            notices: [
                {
                    id: 6,
                    title: '딩기요트 교육 안전수칙 업데이트',
                    content: '딩기요트 교육 시 준수해야 할 안전수칙이 업데이트되었습니다.',
                    date: '2024-03-14',
                    views: 67,
                    important: true
                },
                {
                    id: 5,
                    title: '딩기요트 체험 일정 변경 안내',
                    content: '3월 딩기요트 체험 일정이 기상 사정으로 인해 변경됩니다.',
                    date: '2024-03-10',
                    views: 42,
                    important: false
                }
            ]
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
        }
    },
    mounted() {
        // 기존 데이터를 noticeStore에 로드
        noticeStore.loadCategoryNotices('dinghy', this.notices);
    },
    methods: {
        viewNotice(notice) { notice.views++; },
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
        
        searchNotices() {
            // 필터링은 computed에서 자동으로 처리됨
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
        
        submitNotice() {
            if (!this.newNotice.title || !this.newNotice.content) return;
            
            const noticeData = {
                id: Math.max(...this.notices.map(n => n.id)) + 1,
                title: this.newNotice.title,
                content: this.newNotice.content,
                date: new Date().toISOString().split('T')[0],
                views: 0,
                important: false,
                images: this.selectedImages.map(img => ({
                    name: img.name,
                    size: img.size,
                    preview: img.preview
                }))
            };
            
            this.notices.unshift(noticeData);
            
            // noticeStore에 새 공지사항 추가
            noticeStore.addNotice(noticeData, 'dinghy');
            
            this.showWriteForm = false;
            this.newNotice = { title: '', content: '', images: [] };
            this.selectedImages = [];
            
            if (this.$refs.imageInput) {
                this.$refs.imageInput.value = '';
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
        goBack() { this.$router.push('/notice'); }
    }
};
</script>

<style scoped>
.notice-dinghy { padding-top: 70px; }

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
.current { color: #17a2b8; font-weight: 600; }
.total-count { color: #17a2b8; font-weight: 600; }
.notices-table { background: white; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden; margin-bottom: 30px; }
.table-header { display: grid; grid-template-columns: 80px 1fr 120px 80px; background: #f8f9fa; padding: 15px; font-weight: 600; }
.table-row { display: grid; grid-template-columns: 80px 1fr 120px 80px; padding: 15px; border-bottom: 1px solid #f9f9f9; cursor: pointer; }
.table-row:hover { background: #f8f9fa; }
.new-badge { background: #dc3545; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; }
.important-badge { background: #ffc107; color: #333; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; }
.admin-controls { text-align: center; margin: 20px 0; }
.write-btn { padding: 10px 20px; background: #17a2b8; color: white; border: none; border-radius: 8px; cursor: pointer; }
.write-form { background: white; border: 2px solid #17a2b8; border-radius: 15px; padding: 30px; margin-top: 30px; }
.form-header { display: flex; justify-content: space-between; margin-bottom: 25px; }
.form-header h3 { color: #17a2b8; margin: 0; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
.form-group input, .form-group textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-family: inherit; }
.form-actions { display: flex; justify-content: flex-end; gap: 15px; }
.cancel-btn { padding: 12px 24px; border: 2px solid #ddd; background: white; color: #666; border-radius: 25px; cursor: pointer; }
.submit-btn { padding: 12px 24px; background: #17a2b8; color: white; border: none; border-radius: 25px; cursor: pointer; }
.back-button { text-align: center; padding: 20px; }
.back-btn { padding: 12px 24px; background: #f8f9fa; border: 2px solid #ddd; color: #666; border-radius: 25px; cursor: pointer; }
.back-btn:hover { background: #17a2b8; color: white; border-color: #17a2b8; }

/* 이미지 업로드 스타일 */
.image-upload-container {
    border: 2px dashed #ddd;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    transition: border-color 0.3s;
}

.image-upload-container:hover {
    border-color: #17a2b8;
}

.image-input {
    display: none;
}

.upload-btn {
    display: inline-block;
    padding: 12px 24px;
    background: #f8f9fa;
    border: 2px solid #17a2b8;
    color: #17a2b8;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 600;
}

.upload-btn:hover {
    background: #17a2b8;
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
    background: #17a2b8;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
}

.write-btn {
    padding: 10px 20px;
    background: #17a2b8;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    white-space: nowrap;
}

.search-btn:hover,
.write-btn:hover {
    background: #117a8b;
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
}
</style>