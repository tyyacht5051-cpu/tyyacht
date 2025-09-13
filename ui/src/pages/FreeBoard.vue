<template>
    <div class="free-board">
        <section class="hero-section">
            <div class="hero-background"></div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">자유게시판</h1>
                <p class="hero-subtitle">자유롭게 의견을 나누고 소통하는 공간입니다</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="board-header">
                    <div class="header-info">
                        <h2>자유게시판</h2>
                        <p>통영요트학교와 관련된 모든 이야기를 자유롭게 나누어 보세요.</p>
                    </div>
                    <div class="user-notice">
                        <div class="notice-icon">👥</div>
                        <span>모든 사용자</span>
                    </div>
                </div>

                <div class="board-stats">
                    <div class="stat-item">
                        <div class="stat-number">{{ posts.length }}</div>
                        <div class="stat-label">총 게시물</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">{{ totalComments }}</div>
                        <div class="stat-label">총 댓글</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">{{ todayPosts }}</div>
                        <div class="stat-label">오늘 게시물</div>
                    </div>
                </div>

                <div class="board-controls">
                    <div class="search-area">
                        <select v-model="searchType" class="search-select">
                            <option value="title">제목</option>
                            <option value="content">내용</option>
                            <option value="author">작성자</option>
                            <option value="all">전체</option>
                        </select>
                        <input 
                            v-model="searchKeyword" 
                            type="text" 
                            placeholder="검색어를 입력하세요"
                            class="search-input"
                            @keyup.enter="searchPosts"
                        />
                        <button @click="searchPosts" class="search-btn">검색</button>
                    </div>
                    <button @click="showWriteForm = true" class="write-btn">✏️ 글쓰기</button>
                </div>

                <div class="posts-table">
                    <div class="table-header">
                        <div class="col-number">번호</div>
                        <div class="col-title">제목</div>
                        <div class="col-author">작성자</div>
                        <div class="col-date">작성일</div>
                        <div class="col-views">조회</div>
                        <div class="col-likes">좋아요</div>
                    </div>

                    <div v-for="post in paginatedPosts" :key="post.id" class="table-row" @click="viewPost(post)">
                        <div class="col-number">{{ post.id }}</div>
                        <div class="col-title">
                            <span class="title-text">{{ post.title }}</span>
                            <span v-if="post.comments > 0" class="comment-count">[{{ post.comments }}]</span>
                            <span v-if="isNewPost(post.date)" class="new-badge">NEW</span>
                        </div>
                        <div class="col-author">{{ post.author }}</div>
                        <div class="col-date">{{ formatDate(post.date) }}</div>
                        <div class="col-views">{{ post.views }}</div>
                        <div class="col-likes">{{ post.likes }}</div>
                    </div>
                </div>

                <div class="empty-state" v-if="filteredPosts.length === 0">
                    <div class="empty-icon">📝</div>
                    <h3>게시물이 없습니다</h3>
                    <p>첫 번째 게시물을 작성해보세요!</p>
                </div>

                <!-- 페이지네이션 -->
                <div class="pagination" v-if="totalPages > 1">
                    <button 
                        @click="changePage(page)" 
                        v-for="page in visiblePages" 
                        :key="page"
                        :class="['page-btn', { active: currentPage === page }]"
                    >
                        {{ page }}
                    </button>
                </div>

                <!-- 글쓰기 폼 -->
                <div v-if="showWriteForm" class="write-form">
                    <div class="form-header">
                        <h3>게시글 작성</h3>
                        <button class="close-btn" @click="showWriteForm = false">✕</button>
                    </div>
                    <form @submit.prevent="submitPost">
                        <div class="form-group">
                            <label>작성자</label>
                            <input v-model="newPost.author" type="text" required />
                        </div>
                        <div class="form-group">
                            <label>제목</label>
                            <input v-model="newPost.title" type="text" required />
                        </div>
                        <div class="form-group">
                            <label>내용</label>
                            <textarea v-model="newPost.content" rows="10" required></textarea>
                        </div>
                        <div class="form-group">
                            <label>비밀번호</label>
                            <input v-model="newPost.password" type="password" required />
                            <small>게시글 수정/삭제 시 사용됩니다</small>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="cancel-btn" @click="showWriteForm = false">
                                취소
                            </button>
                            <button type="submit" class="submit-btn">등록</button>
                        </div>
                    </form>
                </div>

                <!-- 게시글 상세보기 -->
                <div v-if="selectedPost" class="post-detail">
                    <div class="detail-header">
                        <h3>{{ selectedPost.title }}</h3>
                        <button class="close-btn" @click="selectedPost = null">✕</button>
                    </div>
                    <div class="detail-meta">
                        <span>작성자: {{ selectedPost.author }}</span>
                        <span>작성일: {{ formatDate(selectedPost.date) }}</span>
                        <span>조회수: {{ selectedPost.views }}</span>
                        <span>좋아요: {{ selectedPost.likes }}</span>
                    </div>
                    <div class="detail-content">
                        {{ selectedPost.content }}
                    </div>
                    <div class="detail-actions">
                        <button @click="likePost(selectedPost)" class="like-btn">
                            👍 좋아요 ({{ selectedPost.likes }})
                        </button>
                        <button @click="showCommentForm = !showCommentForm" class="comment-btn">
                            💬 댓글 ({{ selectedPost.comments }})
                        </button>
                    </div>

                    <!-- 댓글 작성 -->
                    <div v-if="showCommentForm" class="comment-form">
                        <form @submit.prevent="submitComment">
                            <div class="comment-input-group">
                                <input v-model="newComment.author" placeholder="작성자" required />
                                <input v-model="newComment.password" type="password" placeholder="비밀번호" required />
                            </div>
                            <textarea v-model="newComment.content" placeholder="댓글을 입력하세요" rows="3" required></textarea>
                            <div class="comment-actions">
                                <button type="submit" class="comment-submit">댓글 등록</button>
                            </div>
                        </form>
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
export default {
    name: 'FreeBoard',
    data() {
        return {
            showWriteForm: false,
            selectedPost: null,
            showCommentForm: false,
            searchType: 'title',
            searchKeyword: '',
            currentPage: 1,
            postsPerPage: 10,
            newPost: {
                author: '',
                title: '',
                content: '',
                password: ''
            },
            newComment: {
                author: '',
                content: '',
                password: ''
            },
            posts: [
                {
                    id: 15,
                    title: '크루즈 요트 교육 후기',
                    content: '지난 주에 크루즈 요트 교육을 받았는데 정말 유익했습니다. 강사님의 친절한 설명과 실습 덕분에 많은 것을 배울 수 있었어요.',
                    author: '김요트',
                    date: '2024-03-15',
                    views: 45,
                    likes: 8,
                    comments: 3
                },
                {
                    id: 14,
                    title: '딩기 요트 체험 문의',
                    content: '딩기 요트 체험 프로그램에 참여하고 싶은데, 초보자도 가능한가요? 준비물은 따로 있나요?',
                    author: '바다사랑',
                    date: '2024-03-14',
                    views: 32,
                    likes: 2,
                    comments: 5
                },
                {
                    id: 13,
                    title: '가족과 함께한 요트 체험',
                    content: '아이들과 함께 요트 체험을 했는데 너무 즐거웠습니다. 안전 교육도 철저히 해주시고, 아이들이 무척 좋아했어요.',
                    author: '행복가족',
                    date: '2024-03-13',
                    views: 67,
                    likes: 12,
                    comments: 7
                },
                {
                    id: 12,
                    title: '패들보드 체험 추천해요!',
                    content: '패들보드 체험 정말 재미있어요! 생각보다 어렵지 않고 바다 위에서 보는 풍경이 환상적입니다.',
                    author: '파도타기',
                    date: '2024-03-12',
                    views: 28,
                    likes: 6,
                    comments: 2
                },
                {
                    id: 11,
                    title: '요트 면허 취득 과정 질문',
                    content: '요트 면허 취득 과정에 관심이 있는데, 교육 기간이나 비용에 대해 자세히 알고 싶습니다.',
                    author: '미래선장',
                    date: '2024-03-11',
                    views: 89,
                    likes: 4,
                    comments: 8
                }
            ]
        };
    },
    computed: {
        filteredPosts() {
            if (!this.searchKeyword) return this.posts;
            
            return this.posts.filter(post => {
                switch (this.searchType) {
                    case 'title':
                        return post.title.includes(this.searchKeyword);
                    case 'content':
                        return post.content.includes(this.searchKeyword);
                    case 'author':
                        return post.author.includes(this.searchKeyword);
                    case 'all':
                        return post.title.includes(this.searchKeyword) || 
                               post.content.includes(this.searchKeyword) || 
                               post.author.includes(this.searchKeyword);
                    default:
                        return true;
                }
            });
        },
        paginatedPosts() {
            const start = (this.currentPage - 1) * this.postsPerPage;
            const end = start + this.postsPerPage;
            return this.filteredPosts.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredPosts.length / this.postsPerPage);
        },
        visiblePages() {
            const pages = [];
            const maxVisible = 5;
            let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
            let end = Math.min(this.totalPages, start + maxVisible - 1);
            
            if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1);
            }
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            return pages;
        },
        totalComments() {
            return this.posts.reduce((sum, post) => sum + post.comments, 0);
        },
        todayPosts() {
            const today = new Date().toISOString().split('T')[0];
            return this.posts.filter(post => post.date === today).length;
        }
    },
    methods: {
        searchPosts() {
            this.currentPage = 1;
        },
        changePage(page) {
            this.currentPage = page;
        },
        viewPost(post) {
            post.views++;
            this.selectedPost = post;
            this.showCommentForm = false;
        },
        likePost(post) {
            post.likes++;
        },
        submitPost() {
            const newPost = {
                id: Math.max(...this.posts.map(p => p.id)) + 1,
                title: this.newPost.title,
                content: this.newPost.content,
                author: this.newPost.author,
                date: new Date().toISOString().split('T')[0],
                views: 0,
                likes: 0,
                comments: 0
            };
            
            this.posts.unshift(newPost);
            this.showWriteForm = false;
            this.newPost = { author: '', title: '', content: '', password: '' };
        },
        submitComment() {
            if (this.selectedPost) {
                this.selectedPost.comments++;
                this.showCommentForm = false;
                this.newComment = { author: '', content: '', password: '' };
            }
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
        isNewPost(dateString) {
            const postDate = new Date(dateString);
            const today = new Date();
            const diffTime = today - postDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            return diffDays <= 1;
        },
        goBack() {
            this.$router.push('/community');
        }
    }
};
</script>

<style scoped>
.free-board {
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

.board-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
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

.user-notice {
    display: flex;
    align-items: center;
    background: #e8f5e8;
    color: #2e7d32;
    padding: 8px 15px;
    border-radius: 20px;
    font-weight: 600;
}

.notice-icon {
    margin-right: 8px;
}

.board-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 40px;
    padding: 30px;
    background: #f8f9fa;
    border-radius: 15px;
}

.stat-item {
    text-align: center;
}

.stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: #2c5aa0;
    margin-bottom: 5px;
}

.stat-label {
    color: #666;
    font-size: 0.9rem;
}

.board-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    gap: 20px;
}

.search-area {
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
    background: #2c5aa0;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
}

.write-btn {
    padding: 10px 20px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    white-space: nowrap;
}

.posts-table {
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 30px;
}

.table-header {
    display: grid;
    grid-template-columns: 80px 1fr 120px 100px 80px 80px;
    background: #f8f9fa;
    padding: 15px;
    font-weight: 600;
    color: #333;
    border-bottom: 1px solid #f0f0f0;
}

.table-row {
    display: grid;
    grid-template-columns: 80px 1fr 120px 100px 80px 80px;
    padding: 15px;
    border-bottom: 1px solid #f9f9f9;
    cursor: pointer;
    transition: background 0.3s;
}

.table-row:hover {
    background: #f8f9fa;
}

.col-title {
    display: flex;
    align-items: center;
    gap: 8px;
}

.title-text {
    color: #333;
    text-decoration: none;
}

.comment-count {
    color: #2c5aa0;
    font-weight: 600;
    font-size: 0.9rem;
}

.new-badge {
    background: #dc3545;
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 600;
}

.col-author,
.col-date,
.col-views,
.col-likes {
    display: flex;
    align-items: center;
    color: #666;
    font-size: 0.9rem;
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

.pagination {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-bottom: 40px;
}

.page-btn {
    padding: 10px 15px;
    border: 1px solid #ddd;
    background: white;
    color: #666;
    cursor: pointer;
    border-radius: 5px;
    transition: all 0.3s;
}

.page-btn:hover {
    background: #f8f9fa;
    border-color: #2c5aa0;
}

.page-btn.active {
    background: #2c5aa0;
    color: white;
    border-color: #2c5aa0;
}

.write-form,
.post-detail {
    background: white;
    border: 2px solid #2c5aa0;
    border-radius: 15px;
    padding: 30px;
    margin-bottom: 30px;
    position: relative;
    z-index: 10;
}

.form-header,
.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
}

.form-header h3,
.detail-header h3 {
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
.form-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
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

.submit-btn {
    padding: 12px 24px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
}

.detail-meta {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #666;
    flex-wrap: wrap;
}

.detail-content {
    line-height: 1.8;
    color: #333;
    margin-bottom: 30px;
    min-height: 200px;
    padding: 20px;
    background: #fafafa;
    border-radius: 8px;
    white-space: pre-wrap;
}

.detail-actions {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
}

.like-btn,
.comment-btn {
    padding: 10px 20px;
    border: 2px solid #2c5aa0;
    background: white;
    color: #2c5aa0;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;
}

.like-btn:hover,
.comment-btn:hover {
    background: #2c5aa0;
    color: white;
}

.comment-form {
    border-top: 1px solid #f0f0f0;
    padding-top: 20px;
    margin-top: 20px;
}

.comment-input-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 15px;
}

.comment-input-group input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
}

.comment-form textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 15px;
    font-family: inherit;
}

.comment-actions {
    display: flex;
    justify-content: flex-end;
}

.comment-submit {
    padding: 10px 20px;
    background: #2c5aa0;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
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

    .board-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .board-stats {
        flex-direction: column;
        gap: 20px;
    }

    .board-controls {
        flex-direction: column;
        align-items: stretch;
    }

    .search-area {
        flex-direction: column;
    }

    .table-header,
    .table-row {
        grid-template-columns: 60px 1fr 80px 70px 50px 50px;
        font-size: 0.8rem;
        padding: 10px;
    }

    .pagination {
        flex-wrap: wrap;
    }

    .detail-meta {
        flex-direction: column;
        gap: 8px;
    }

    .detail-actions {
        flex-direction: column;
    }

    .comment-input-group {
        grid-template-columns: 1fr;
    }
}
</style>