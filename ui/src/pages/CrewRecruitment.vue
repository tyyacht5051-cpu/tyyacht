<template>
    <div class="crew-recruitment">
        <section class="hero-section">
            <div class="hero-background">
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <h1 class="hero-title">크루모집게시판</h1>
                <p class="hero-subtitle">함께 바다로 나갈 크루원을 찾아보세요</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="board-header">
                    <div class="filter-options">
                        <select v-model="selectedType" @change="filterPosts">
                            <option value="all">전체 타입</option>
                            <option value="crew_wanted">크루 구해요</option>
                            <option value="yacht_wanted">요트 구해요</option>
                        </select>
                        <select v-model="selectedStatus" @change="filterPosts">
                            <option value="all">전체 상태</option>
                            <option value="active">모집중</option>
                            <option value="completed">모집완료</option>
                        </select>
                    </div>
                    <button class="recruit-btn" @click="showWriteModal = true">
                        크루 모집하기
                    </button>
                </div>

                <div class="posts-list">
                    <div v-if="filteredPosts.length === 0" class="no-posts">
                        <div class="no-posts-icon"></div>
                        <h3>모집중인 크루가 없습니다</h3>
                        <p>첫 번째 크루 모집글을 작성해보세요!</p>
                    </div>
                    <div v-else class="posts-grid">
                        <div
                            v-for="post in filteredPosts"
                            :key="post.id"
                            class="recruitment-card"
                            @click="openPost(post)"
                        >
                            <div class="card-header">
                                <span class="status-badge" :class="getStatusClass(post.status)">
                                    {{ getStatusText(post.status) }}
                                </span>
                                <span class="post-date">{{ formatDate(post.created_at) }}</span>
                            </div>

                            <h3 class="post-title">{{ post.title }}</h3>

                            <div class="recruitment-info">
                                <div class="info-item">
                                    <span class="label">타입</span>
                                    <span class="value">{{ getRecruitmentTypeText(post.recruitment_type) }}</span>
                                </div>

                                <!-- 크루 구해요 전용 정보 -->
                                <div v-if="post.recruitment_type === 'crew_wanted'">
                                    <div class="info-item" v-if="post.vessel_name">
                                        <span class="label">선명</span>
                                        <span class="value">{{ post.vessel_name }}</span>
                                    </div>
                                    <div class="info-item" v-if="post.vessel_model">
                                        <span class="label">모델명</span>
                                        <span class="value">{{ post.vessel_model }}</span>
                                    </div>
                                </div>

                                <!-- 요트 구해요 전용 정보 -->
                                <div v-if="post.recruitment_type === 'yacht_wanted'">
                                    <div class="info-item" v-if="post.yacht_license">
                                        <span class="label">요트면허</span>
                                        <span class="value">{{ post.yacht_license === 'yes' ? '보유' : '미보유' }}</span>
                                    </div>
                                    <div class="info-item" v-if="post.target_competition">
                                        <span class="label">목적대회</span>
                                        <span class="value">{{ post.target_competition }}</span>
                                    </div>
                                </div>
                            </div>

                            <p class="post-preview">{{ post.preview }}</p>

                            <div class="card-footer">
                                <span class="author">{{ post.author_name }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 크루 모집 작성 모달 -->
        <div v-if="showWriteModal" class="modal" @click="showWriteModal = false">
            <div class="modal-content" @click.stop>
                <div class="form-header">
                    <h3>{{ editingPostId ? '크루 모집글 수정' : '크루 모집하기' }}</h3>
                    <button class="close-btn" @click="showWriteModal = false">&times;</button>
                </div>
                <form @submit.prevent="editingPostId ? updateRecruitment() : submitRecruitment()">
                    <div class="form-group">
                        <label>모집 타입</label>
                        <select v-model="newRecruitment.recruitment_type" required @change="onRecruitmentTypeChange">
                            <option value="">타입을 선택하세요</option>
                            <option value="crew_wanted">크루 구해요</option>
                            <option value="yacht_wanted">요트 구해요</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>제목</label>
                        <input
                            type="text"
                            v-model="newRecruitment.title"
                            placeholder="모집 제목을 입력하세요"
                            required
                        >
                    </div>

                    <!-- 크루 구해요 전용 필드 -->
                    <div v-if="newRecruitment.recruitment_type === 'crew_wanted'" class="crew-wanted-fields">
                        <div class="form-group">
                            <label>선명 (필수)</label>
                            <input
                                type="text"
                                v-model="newRecruitment.vessel_name"
                                placeholder="요트 선박의 이름을 입력하세요"
                                required
                            >
                        </div>
                        <div class="form-group">
                            <label>선박 모델명</label>
                            <input
                                type="text"
                                v-model="newRecruitment.vessel_model"
                                placeholder="예: Bavaria 46, Jeanneau Sun Odyssey 349 등 (선택사항)"
                            >
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>성별</label>
                                <select v-model="newRecruitment.preferred_gender">
                                    <option value="">성별 무관</option>
                                    <option value="male">남성</option>
                                    <option value="female">여성</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>나이</label>
                                <input
                                    type="text"
                                    v-model="newRecruitment.preferred_age"
                                    placeholder="예: 20-30대, 30세 이상 등"
                                >
                            </div>
                        </div>
                    </div>

                    <!-- 요트 구해요 전용 필드 -->
                    <div v-if="newRecruitment.recruitment_type === 'yacht_wanted'" class="yacht-wanted-fields">
                        <div class="form-group">
                            <label>요트면허 보유 유무</label>
                            <select v-model="newRecruitment.yacht_license">
                                <option value="">선택하세요</option>
                                <option value="yes">보유</option>
                                <option value="no">미보유</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>대회참여이력</label>
                            <textarea
                                v-model="newRecruitment.competition_history"
                                rows="3"
                                placeholder="참여하신 요트 대회나 경기 이력을 입력하세요 (예: 2023년 부산요트대회 참가, 2022년 전국세일링대회 입상 등)"
                            ></textarea>
                        </div>

                        <div class="form-group">
                            <label>목적대회</label>
                            <input
                                type="text"
                                v-model="newRecruitment.target_competition"
                                placeholder="참가하고자 하는 대회명을 입력하세요"
                            >
                        </div>
                    </div>

                    <div class="form-group" v-if="newRecruitment.recruitment_type === 'crew_wanted'">
                        <label>최대 모집인원</label>
                        <select v-model="newRecruitment.max_crew" required>
                            <option value="2">2명</option>
                            <option value="3">3명</option>
                            <option value="4">4명</option>
                            <option value="5">5명</option>
                            <option value="6">6명</option>
                            <option value="8">8명</option>
                            <option value="10">10명</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>상세 내용</label>
                        <textarea
                            v-model="newRecruitment.content"
                            rows="8"
                            :placeholder="getContentPlaceholder()"
                            required
                        ></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="cancel-btn" @click="showWriteModal = false">취소</button>
                        <button type="submit" class="submit-btn">{{ editingPostId ? '수정 완료' : '모집 등록' }}</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- 크루 모집 상세보기 모달 -->
        <div v-if="showDetailModal" class="modal" @click="showDetailModal = false">
            <div class="modal-content large" @click.stop>
                <div class="form-header">
                    <h3>{{ selectedPost.title }}</h3>
                    <button class="close-btn" @click="showDetailModal = false">&times;</button>
                </div>
                <div class="recruitment-detail">
                    <div class="detail-header">
                        <span class="status-badge" :class="getStatusClass(selectedPost.status)">
                            {{ getStatusText(selectedPost.status) }}
                        </span>
                        <div class="author-info">
                            <span class="author">작성자: {{ selectedPost.author_name }}</span>
                            <span class="contact">연락처: {{ selectedPost.contact }}</span>
                            <span class="date">{{ formatDate(selectedPost.created_at) }}</span>
                        </div>
                    </div>

                    <div class="recruitment-details">
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="label">모집 타입</span>
                                <span class="value">{{ getRecruitmentTypeText(selectedPost.recruitment_type) }}</span>
                            </div>

                            <!-- 크루 구해요 전용 상세 정보 -->
                            <template v-if="selectedPost.recruitment_type === 'crew_wanted'">
                                <div class="detail-item" v-if="selectedPost.vessel_name">
                                    <span class="label">선명</span>
                                    <span class="value">{{ selectedPost.vessel_name }}</span>
                                </div>
                                <div class="detail-item" v-if="selectedPost.vessel_model">
                                    <span class="label">선박 모델명</span>
                                    <span class="value">{{ selectedPost.vessel_model }}</span>
                                </div>
                                <div class="detail-item" v-if="selectedPost.preferred_gender">
                                    <span class="label">선호 성별</span>
                                    <span class="value">{{ getGenderText(selectedPost.preferred_gender) }}</span>
                                </div>
                                <div class="detail-item" v-if="selectedPost.preferred_age">
                                    <span class="label">선호 나이</span>
                                    <span class="value">{{ selectedPost.preferred_age }}</span>
                                </div>
                            </template>

                            <!-- 요트 구해요 전용 상세 정보 -->
                            <template v-if="selectedPost.recruitment_type === 'yacht_wanted'">
                                <div class="detail-item" v-if="selectedPost.yacht_license">
                                    <span class="label">요트면허 보유</span>
                                    <span class="value">{{ selectedPost.yacht_license === 'yes' ? '보유' : '미보유' }}</span>
                                </div>
                                <div class="detail-item full-width" v-if="selectedPost.competition_history">
                                    <span class="label">대회참여이력</span>
                                    <span class="value">{{ selectedPost.competition_history }}</span>
                                </div>
                                <div class="detail-item" v-if="selectedPost.target_competition">
                                    <span class="label">목적대회</span>
                                    <span class="value">{{ selectedPost.target_competition }}</span>
                                </div>
                            </template>
                        </div>
                    </div>

                    <div class="detail-content">
                        <h4>상세 내용</h4>
                        <p>{{ selectedPost.content }}</p>
                    </div>

                    <!-- 작성자 컨트롤 -->
                    <div class="author-controls" v-if="isAuthor(selectedPost)">
                        <div class="control-group">
                            <label>모집 상태</label>
                            <select v-model="selectedPost.status" @change="updateRecruitmentStatus">
                                <option value="recruiting">모집중</option>
                                <option value="completed">모집마감</option>
                            </select>
                        </div>
                        <div class="control-actions">
                            <button class="edit-btn" @click="editRecruitment">편집</button>
                            <button class="delete-btn" @click="deleteRecruitment">삭제</button>
                        </div>
                    </div>

                    <!-- 비작성자 액션 -->
                    <div class="action-buttons" v-else-if="selectedPost.status === 'recruiting'">
                        <button class="join-btn" @click="showJoinModal = true">크루 참가 신청</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 크루 참가 신청 모달 -->
        <div v-if="showJoinModal" class="modal" @click="showJoinModal = false">
            <div class="modal-content" @click.stop>
                <div class="form-header">
                    <h3>크루 참가 신청</h3>
                    <button class="close-btn" @click="showJoinModal = false">&times;</button>
                </div>
                <div class="join-confirmation">
                    <div class="warning-message">
                        <div class="warning-icon">⚠️</div>
                        <p><strong>작성자에게 연락처가 공유됩니다.</strong></p>
                        <p>신청하시겠습니까?</p>
                    </div>

                    <!-- 연락처 입력 -->
                    <div class="contact-form">
                        <div class="form-group">
                            <label>이름</label>
                            <input
                                type="text"
                                v-model="contactInfo.name"
                                placeholder="이름을 입력하세요"
                                required
                            >
                        </div>
                        <div class="form-group">
                            <label>연락처</label>
                            <input
                                type="tel"
                                v-model="contactInfo.phone"
                                placeholder="연락처를 입력하세요"
                                required
                            >
                        </div>
                    </div>

                    <div class="join-actions">
                        <button class="cancel-btn" @click="showJoinModal = false">취소</button>
                        <button class="confirm-btn" @click="confirmJoinCrew" :disabled="!canSubmitJoin">확인</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { API_BASE_URL } from '../config/env.js';

export default {
    name: 'CrewRecruitment',
    data() {
        return {
            selectedType: 'all',
            selectedStatus: 'all',
            posts: [],
            filteredPosts: [],
            showWriteModal: false,
            showDetailModal: false,
            showJoinModal: false,
            selectedPost: null,
            currentUser: null,
            editingPostId: null,
            contactInfo: {
                name: '',
                phone: ''
            },
            newRecruitment: {
                title: '',
                recruitment_type: '',
                vessel_name: '',
                vessel_model: '',
                preferred_gender: '',
                preferred_age: '',
                yacht_license: '',
                competition_history: '',
                target_competition: '',
                content: '',
                max_crew: 4
            }
        };
    },
    computed: {
        canSubmitJoin() {
            return this.contactInfo.name && this.contactInfo.phone;
        }
    },
    async mounted() {
        await this.loadCurrentUser();
        await this.loadPosts();

        // URL 파라미터에서 edit ID 확인
        const editId = this.$route.query.edit;
        if (editId) {
            await this.loadPostForEdit(editId);
        }
    },
    methods: {
        async loadPosts() {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/crews`);
                this.posts = response.data.map(post => ({
                    ...post,
                    preview: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')
                }));
                this.filteredPosts = this.posts;
            } catch (error) {
                console.error('Failed to load posts:', error);
                this.posts = [];
                this.filteredPosts = [];
            }
        },
        filterPosts() {
            this.filteredPosts = this.posts.filter(post => {
                const typeMatch = this.selectedType === 'all' || post.recruitment_type === this.selectedType;
                const statusMatch = this.selectedStatus === 'all' ||
                    (this.selectedStatus === 'active' && post.status === 'recruiting') ||
                    (this.selectedStatus === 'completed' && post.status === 'completed');
                return typeMatch && statusMatch;
            });
        },
        getStatusClass(status) {
            return status === 'recruiting' ? 'status-recruiting' : 'status-completed';
        },
        getStatusText(status) {
            return status === 'recruiting' ? '모집중' : '모집완료';
        },
        getProgressPercent(current, max) {
            return Math.round((current / max) * 100);
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('ko-KR');
        },
        formatDateRange(start, end) {
            const startDate = new Date(start).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
            const endDate = new Date(end).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
            return `${startDate} ~ ${endDate}`;
        },
        getRecruitmentTypeText(type) {
            const types = {
                'crew_wanted': '크루 구해요',
                'yacht_wanted': '요트 구해요'
            };
            return types[type] || type;
        },
        getGenderText(gender) {
            const genders = {
                'male': '남성',
                'female': '여성',
                '': '성별 무관'
            };
            return genders[gender] || '성별 무관';
        },
        formatLicenses(licenses) {
            if (!licenses || licenses.length === 0) return '없음';
            return licenses.join(', ');
        },
        openPost(post) {
            this.selectedPost = post;
            this.showDetailModal = true;
        },
        async submitRecruitment() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(`${API_BASE_URL}/api/crews`, this.newRecruitment, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 목록 새로고침
                await this.loadPosts();
                this.showWriteModal = false;
                this.resetForm();

                alert('크루 모집이 성공적으로 등록되었습니다!');
            } catch (error) {
                console.error('Failed to submit recruitment:', error);
                alert('크루 모집 등록에 실패했습니다.');
            }
        },
        async loadPostForEdit(postId) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/api/crews/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const post = response.data;

                // 수정 모드로 설정
                this.editingPostId = postId;
                this.newRecruitment = {
                    title: post.title,
                    recruitment_type: post.recruitment_type,
                    vessel_name: post.vessel_name || '',
                    vessel_model: post.vessel_model || '',
                    preferred_gender: post.preferred_gender || '',
                    preferred_age: post.preferred_age || '',
                    yacht_license: post.yacht_license || '',
                    competition_history: post.competition_history || '',
                    target_competition: post.target_competition || '',
                    max_crew: post.max_crew,
                    content: post.content
                };

                // 작성 모달 열기
                this.showWriteModal = true;
            } catch (error) {
                console.error('Failed to load post for edit:', error);
                alert('게시글을 불러오는데 실패했습니다.');
            }
        },
        async updateRecruitment() {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`${API_BASE_URL}/api/crews/${this.editingPostId}`, this.newRecruitment, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 목록 새로고침
                await this.loadPosts();
                this.showWriteModal = false;
                this.resetForm();
                this.editingPostId = null;

                alert('크루 모집글이 성공적으로 수정되었습니다!');
            } catch (error) {
                console.error('Failed to update recruitment:', error);
                alert('크루 모집글 수정에 실패했습니다.');
            }
        },
        resetForm() {
            this.editingPostId = null;
            this.newRecruitment = {
                title: '',
                recruitment_type: '',
                vessel_name: '',
                vessel_model: '',
                preferred_gender: '',
                preferred_age: '',
                yacht_license: '',
                competition_history: '',
                target_competition: '',
                content: '',
                max_crew: 4
            };
        },
        onRecruitmentTypeChange() {
            // 타입 변경 시 관련 필드 초기화
            this.newRecruitment.vessel_name = '';
            this.newRecruitment.vessel_model = '';
            this.newRecruitment.preferred_gender = '';
            this.newRecruitment.preferred_age = '';
            this.newRecruitment.yacht_license = '';
            this.newRecruitment.competition_history = '';
            this.newRecruitment.target_competition = '';
        },
        getContentPlaceholder() {
            if (this.newRecruitment.recruitment_type === 'crew_wanted') {
                return '크루 모집에 대한 상세 정보를 입력하세요';
            } else if (this.newRecruitment.recruitment_type === 'yacht_wanted') {
                return '요트 이용에 대한 상세 정보를 입력하세요';
            }
            return '상세 내용을 입력하세요';
        },
        async confirmJoinCrew() {
            try {
                await axios.post(`${API_BASE_URL}/api/crews/${this.selectedPost.id}/join`, this.contactInfo);

                // 목록 새로고침
                await this.loadPosts();
                this.showJoinModal = false;
                this.showDetailModal = false;

                // 연락처 정보 초기화
                this.contactInfo = { name: '', phone: '' };

                alert('크루 참가 신청이 완료되었습니다! 작성자가 연락드릴 예정입니다.');
            } catch (error) {
                console.error('Failed to join crew:', error);
                const message = error.response?.data?.error || '크루 참가 신청에 실패했습니다.';
                alert(message);
            }
        },
        async loadCurrentUser() {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    this.currentUser = response.data;
                }
            } catch (error) {
                console.error('Failed to load current user:', error);
                this.currentUser = null;
            }
        },
        isAuthor(post) {
            return this.currentUser && post && this.currentUser.id === post.author_id;
        },
        async updateRecruitmentStatus() {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`${API_BASE_URL}/api/crews/${this.selectedPost.id}`, {
                    title: this.selectedPost.title,
                    content: this.selectedPost.content,
                    recruitment_type: this.selectedPost.recruitment_type,
                    preferred_gender: this.selectedPost.preferred_gender,
                    preferred_age: this.selectedPost.preferred_age,
                    yacht_license: this.selectedPost.yacht_license,
                    competition_history: this.selectedPost.competition_history,
                    target_competition: this.selectedPost.target_competition,
                    max_crew: this.selectedPost.max_crew,
                    status: this.selectedPost.status
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                await this.loadPosts();
                alert('모집 상태가 업데이트되었습니다.');
            } catch (error) {
                console.error('Failed to update status:', error);
                alert('상태 업데이트에 실패했습니다.');
            }
        },
        editRecruitment() {
            // TODO: 편집 모달 구현
            alert('편집 기능을 거합니다.');
        },
        async deleteRecruitment() {
            if (confirm('정말로 삭제하시겠습니까?')) {
                try {
                    const token = localStorage.getItem('token');
                    await axios.delete(`${API_BASE_URL}/api/crews/${this.selectedPost.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    await this.loadPosts();
                    this.showDetailModal = false;
                    alert('모집글이 삭제되었습니다.');
                } catch (error) {
                    console.error('Failed to delete recruitment:', error);
                    alert('삭제에 실패했습니다.');
                }
            }
        }
    }
};
</script>

<style scoped>
.crew-recruitment {
    padding-top: 70px;
}

.hero-section {
    position: relative;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2c5aa0, #1e3d6f);
    color: white;
    overflow: hidden;
}

.hero-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('/images/yacht-hero.jpg');
    background-size: cover;
    background-position: center;
    opacity: 0.3;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(44, 90, 160, 0.7);
}

.hero-content {
    position: relative;
    text-align: center;
    z-index: 2;
}

.hero-title {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.content-section {
    padding: 40px 0;
    background: white;
    min-height: 70vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.board-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 20px;
}

.filter-options {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}

.filter-options select {
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    cursor: pointer;
}

.recruit-btn {
    background: #2c5aa0;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
}

.recruit-btn:hover {
    background: #1e3d6f;
    transform: translateY(-2px);
}

.no-posts {
    text-align: center;
    padding: 80px 20px;
    color: #666;
}

.no-posts-icon {
    font-size: 4rem;
    margin-bottom: 20px;
}

.no-posts h3 {
    color: #2c5aa0;
    margin-bottom: 10px;
}

.posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 25px;
}

.recruitment-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 15px;
    padding: 25px;
    cursor: pointer;
    transition: all 0.3s;
}

.recruitment-card:hover {
    border-color: #2c5aa0;
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(44, 90, 160, 0.1);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.status-badge {
    padding: 5px 12px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
}

.status-recruiting {
    background: #e8f5e8;
    color: #388e3c;
}

.status-completed {
    background: #ffebee;
    color: #c62828;
}

.post-date {
    color: #999;
    font-size: 0.9rem;
}

.post-title {
    color: #2c5aa0;
    font-size: 1.3rem;
    margin-bottom: 15px;
    line-height: 1.4;
}

.recruitment-info {
    margin-bottom: 15px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    padding: 5px 0;
}

.label {
    font-size: 0.9rem;
    color: #666;
}

.value {
    font-weight: 600;
    color: #333;
}

.post-preview {
    color: #666;
    line-height: 1.6;
    margin-bottom: 15px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #f0f0f0;
}

.author {
    color: #666;
    font-size: 0.9rem;
}

.progress-bar {
    width: 100px;
    height: 8px;
    background: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: #2c5aa0;
    border-radius: 4px;
    transition: width 0.3s;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
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
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-content.large {
    max-width: 800px;
}

.form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: #2c5aa0;
    color: white;
}

.form-header h3 {
    margin: 0;
    font-size: 1.2rem;
}

.close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
}

.form-group {
    padding: 0 20px;
    margin-bottom: 20px;
}

.form-row {
    display: flex;
    gap: 20px;
    padding: 0 20px;
    margin-bottom: 20px;
}

.form-row .form-group {
    flex: 1;
    padding: 0;
    margin-bottom: 0;
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

.license-checkboxes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: background-color 0.2s;
}

.checkbox-item:hover {
    background: #f8f9fa;
}

.checkbox-item input[type="checkbox"] {
    width: auto;
    margin: 0;
}

.licenses-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 5px;
}

.license-badge {
    background: #e3f2fd;
    color: #1976d2;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 500;
}

.detail-item.full-width {
    grid-column: 1 / -1;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    padding: 20px;
    border-top: 1px solid #f0f0f0;
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
    background: #2c5aa0;
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
}

.recruitment-detail {
    padding: 20px;
}

.detail-header {
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
}

.author-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 10px;
    font-size: 0.9rem;
    color: #666;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 25px;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
}

.detail-item .label {
    font-size: 0.9rem;
    color: #666;
}

.detail-item .value {
    font-weight: 600;
    color: #333;
}

.detail-content h4 {
    color: #2c5aa0;
    margin-bottom: 15px;
}

.detail-content {
    line-height: 1.8;
    color: #444;
    margin-bottom: 25px;
}

.action-buttons {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
}

.join-btn {
    padding: 15px 30px;
    background: #2c5aa0;
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s;
}

.join-btn:hover {
    background: #1e3d6f;
    transform: translateY(-2px);
}

.author-controls {
    padding: 20px;
    border-top: 1px solid #f0f0f0;
    background: #f8f9fa;
    border-radius: 0 0 15px 15px;
}

.control-group {
    margin-bottom: 15px;
}

.control-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
}

.control-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
}

.control-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.edit-btn {
    padding: 10px 20px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
}

.edit-btn:hover {
    background: #218838;
    transform: translateY(-1px);
}

.delete-btn {
    padding: 10px 20px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
}

.delete-btn:hover {
    background: #c82333;
    transform: translateY(-1px);
}

/* 크루 참가 신청 모달 스타일 */
.join-confirmation {
    padding: 20px;
}

.warning-message {
    text-align: center;
    margin-bottom: 25px;
    padding: 20px;
    background: #fff3cd;
    border-radius: 10px;
    border-left: 4px solid #ffc107;
}

.warning-icon {
    font-size: 2rem;
    margin-bottom: 10px;
}

.warning-message p {
    margin: 5px 0;
    color: #856404;
}

.contact-form {
    margin-bottom: 25px;
}

.join-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
}

.confirm-btn {
    padding: 12px 24px;
    background: #2c5aa0;
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
}

.confirm-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.confirm-btn:not(:disabled):hover {
    background: #1e3d6f;
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .board-header {
        flex-direction: column;
        align-items: stretch;
    }

    .filter-options {
        justify-content: center;
    }

    .posts-grid {
        grid-template-columns: 1fr;
    }

    .form-row {
        flex-direction: column;
        gap: 0;
    }

    .detail-grid {
        grid-template-columns: 1fr;
    }

    .author-info {
        gap: 2px;
    }

    .join-actions {
        flex-direction: column;
    }
}
</style>