<template>
    <div class="review-board">
        <section class="hero-section">
            <div class="hero-background">
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <h1 class="hero-title">후기게시판</h1>
                <p class="hero-subtitle">교육 및 체험 후기를 공유하는 공간</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="board-header">
                    <div class="category-tabs">
                        <button
                            v-for="category in categories"
                            :key="category.id"
                            :class="['tab-button', { active: selectedCategory === category.id }]"
                            @click="selectCategory(category.id)"
                        >
                            {{ category.icon }} {{ category.name }}
                            <span class="count">({{ category.count }})</span>
                        </button>
                    </div>
                    <button class="write-btn" @click="showWriteModal = true">
                        ✍️ 후기 작성
                    </button>
                </div>

                <div class="posts-list">
                    <div v-if="filteredPosts.length === 0" class="no-posts">
                        <div class="no-posts-icon">📝</div>
                        <h3>아직 등록된 후기가 없습니다</h3>
                        <p>첫 번째 후기를 작성해보세요!</p>
                    </div>
                    <div v-else class="posts-grid">
                        <div
                            v-for="post in filteredPosts"
                            :key="post.id"
                            class="post-card"
                            @click="openPost(post)"
                        >
                            <div class="post-header">
                                <span class="category-badge" :class="getCategoryClass(post.category_id)">
                                    {{ getCategoryName(post.category_id) }}
                                </span>
                                <span class="post-date">{{ formatDate(post.created_at) }}</span>
                            </div>
                            <h3 class="post-title">{{ post.title }}</h3>
                            <p class="post-preview">{{ post.preview }}</p>
                            <div class="post-footer">
                                <span class="author">👤 {{ post.author_name }}</span>
                                <div class="post-stats">
                                    <span class="views">👁️ {{ post.views }}</span>
                                    <span class="rating">⭐ {{ post.rating }}/5</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 후기 작성 모달 -->
        <div v-if="showWriteModal" class="modal" @click="showWriteModal = false">
            <div class="modal-content" @click.stop>
                <div class="form-header">
                    <h3>후기 작성</h3>
                    <button class="close-btn" @click="showWriteModal = false">&times;</button>
                </div>
                <form @submit.prevent="submitReview">
                    <div class="form-group">
                        <label>카테고리</label>
                        <select v-model="newReview.category_id" required>
                            <option value="">카테고리를 선택하세요</option>
                            <option value="exemption">면제교육</option>
                            <option value="cruise">크루즈요트</option>
                            <option value="dinghy">딩기요트</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>제목</label>
                        <input
                            type="text"
                            v-model="newReview.title"
                            placeholder="후기 제목을 입력하세요"
                            required
                        >
                    </div>
                    <div class="form-group">
                        <label>평점</label>
                        <div class="rating-input">
                            <span
                                v-for="star in 5"
                                :key="star"
                                :class="['star', { active: star <= newReview.rating }]"
                                @click="newReview.rating = star"
                            >
                                ⭐
                            </span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>후기 내용</label>
                        <textarea
                            v-model="newReview.content"
                            rows="8"
                            placeholder="후기 내용을 작성해주세요"
                            required
                        ></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="cancel-btn" @click="showWriteModal = false">취소</button>
                        <button type="submit" class="submit-btn">작성 완료</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- 후기 상세보기 모달 -->
        <div v-if="showDetailModal" class="modal" @click="showDetailModal = false">
            <div class="modal-content large" @click.stop>
                <div class="form-header">
                    <h3>{{ selectedPost.title }}</h3>
                    <button class="close-btn" @click="showDetailModal = false">&times;</button>
                </div>
                <div class="post-detail">
                    <div class="detail-header">
                        <span class="category-badge" :class="getCategoryClass(selectedPost.category_id)">
                            {{ getCategoryName(selectedPost.category_id) }}
                        </span>
                        <div class="post-info">
                            <span class="author">작성자: {{ selectedPost.author_name }}</span>
                            <span class="date">{{ formatDate(selectedPost.created_at) }}</span>
                            <span class="rating">평점: ⭐ {{ selectedPost.rating }}/5</span>
                        </div>
                    </div>
                    <div class="detail-content">
                        <p>{{ selectedPost.content }}</p>
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
    name: 'ReviewBoard',
    data() {
        return {
            selectedCategory: 'all',
            categories: [
                { id: 'all', name: '전체', icon: '📋', count: 0 },
                { id: 'exemption', name: '면제교육', icon: '📚', count: 0 },
                { id: 'cruise', name: '크루즈요트', icon: '🛥️', count: 0 },
                { id: 'dinghy', name: '딩기요트', icon: '⛵', count: 0 }
            ],
            posts: [],
            showWriteModal: false,
            showDetailModal: false,
            selectedPost: null,
            newReview: {
                title: '',
                content: '',
                category_id: '',
                rating: 5
            }
        };
    },
    computed: {
        filteredPosts() {
            if (this.selectedCategory === 'all') {
                return this.posts;
            }
            return this.posts.filter(post => post.category_id === this.selectedCategory);
        }
    },
    async mounted() {
        await this.loadPosts();
    },
    methods: {
        async loadPosts() {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/reviews`);
                this.posts = response.data.map(post => ({
                    ...post,
                    preview: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')
                }));
                this.updateCategoryCounts();
            } catch (error) {
                console.error('Failed to load posts:', error);
                this.posts = [];
            }
        },
        updateCategoryCounts() {
            this.categories[0].count = this.posts.length; // 전체
            this.categories[1].count = this.posts.filter(p => p.category_id === 'exemption').length;
            this.categories[2].count = this.posts.filter(p => p.category_id === 'cruise').length;
            this.categories[3].count = this.posts.filter(p => p.category_id === 'dinghy').length;
        },
        selectCategory(categoryId) {
            this.selectedCategory = categoryId;
        },
        getCategoryName(categoryId) {
            const category = this.categories.find(c => c.id === categoryId);
            return category ? category.name : '기타';
        },
        getCategoryClass(categoryId) {
            return `category-${categoryId}`;
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('ko-KR');
        },
        openPost(post) {
            this.selectedPost = post;
            this.showDetailModal = true;
        },
        async submitReview() {
            try {
                const response = await axios.post(`${API_BASE_URL}/api/reviews`, this.newReview);

                // 목록 새로고침
                await this.loadPosts();
                this.showWriteModal = false;
                this.resetForm();

                alert('후기가 성공적으로 등록되었습니다!');
            } catch (error) {
                console.error('Failed to submit review:', error);
                alert('후기 등록에 실패했습니다.');
            }
        },
        resetForm() {
            this.newReview = {
                title: '',
                content: '',
                category_id: '',
                rating: 5
            };
        }
    }
};
</script>

<style scoped>
.review-board {
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

.category-tabs {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.tab-button {
    padding: 10px 20px;
    border: 2px solid #e0e0e0;
    background: white;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 5px;
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

.count {
    font-size: 0.8rem;
    opacity: 0.8;
}

.write-btn {
    background: #2c5aa0;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
}

.write-btn:hover {
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
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 25px;
}

.post-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 15px;
    padding: 25px;
    cursor: pointer;
    transition: all 0.3s;
}

.post-card:hover {
    border-color: #2c5aa0;
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(44, 90, 160, 0.1);
}

.post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.category-badge {
    padding: 5px 12px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
}

.category-exemption { background: #e3f2fd; color: #1976d2; }
.category-cruise { background: #f3e5f5; color: #7b1fa2; }
.category-dinghy { background: #e8f5e8; color: #388e3c; }

.post-date {
    color: #999;
    font-size: 0.9rem;
}

.post-title {
    color: #2c5aa0;
    font-size: 1.3rem;
    margin-bottom: 10px;
    line-height: 1.4;
}

.post-preview {
    color: #666;
    line-height: 1.6;
    margin-bottom: 15px;
}

.post-footer {
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

.post-stats {
    display: flex;
    gap: 15px;
    font-size: 0.9rem;
    color: #999;
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

.rating-input {
    display: flex;
    gap: 5px;
}

.star {
    cursor: pointer;
    font-size: 1.5rem;
    opacity: 0.3;
    transition: opacity 0.2s;
}

.star.active {
    opacity: 1;
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

.post-detail {
    padding: 20px;
}

.detail-header {
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
}

.post-info {
    display: flex;
    gap: 20px;
    margin-top: 10px;
    font-size: 0.9rem;
    color: #666;
}

.detail-content {
    line-height: 1.8;
    color: #444;
}

@media (max-width: 768px) {
    .board-header {
        flex-direction: column;
        align-items: stretch;
    }

    .category-tabs {
        justify-content: center;
    }

    .posts-grid {
        grid-template-columns: 1fr;
    }

    .post-footer {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
    }

    .post-stats {
        gap: 10px;
    }
}
</style>