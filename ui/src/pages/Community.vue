<template>
    <div class="community">
        <section class="hero-section">
            <div class="hero-background">
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <h1 class="hero-title">커뮤니티</h1>
                <p class="hero-subtitle">통영요트학교 구성원들과 함께하는 소통 공간</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="community-overview">
                    <h2>커뮤니티 소개</h2>
                    <p>
                        통영요트학교의 다양한 활동과 소식을 공유하고, 
                        구성원들과 소통할 수 있는 공간입니다.
                    </p>
                </div>

                <div class="community-sections">
                    <div class="sections-grid">
                        <div class="section-card" v-for="section in sections" :key="section.id" @click="goToSection(section.path)">
                            <div class="section-icon">{{ section.icon }}</div>
                            <h3>{{ section.title }}</h3>
                            <p>{{ section.description }}</p>
                            <div class="section-info">
                                <span class="access-type" :class="section.accessClass">{{ section.access }}</span>
                                <span class="post-count">{{ section.count }}개 게시물</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="recent-activity">
                    <h2>최근 활동</h2>
                    <div class="activity-grid">
                        <div class="activity-card">
                            <h4>📸 포토갤러리</h4>
                            <p>최근 딩기 요트 교육 현장 사진이 업데이트되었습니다.</p>
                            <span class="activity-date">2024-03-15</span>
                        </div>
                        <div class="activity-card">
                            <h4>🎥 동영상갤러리</h4>
                            <p>크루즈 요트 체험 영상이 새로 추가되었습니다.</p>
                            <span class="activity-date">2024-03-14</span>
                        </div>
                        <div class="activity-card">
                            <h4>💬 자유게시판</h4>
                            <p>요트 교육 후기 글이 새로 등록되었습니다.</p>
                            <span class="activity-date">2024-03-13</span>
                        </div>
                    </div>
                </div>

                <div class="community-rules">
                    <h2>커뮤니티 이용 안내</h2>
                    <div class="rules-grid">
                        <div class="rule-item">
                            <div class="rule-icon">📋</div>
                            <h4>게시글 작성</h4>
                            <p>자유게시판은 누구나 이용 가능합니다</p>
                        </div>
                        <div class="rule-item">
                            <div class="rule-icon">🔒</div>
                            <h4>관리자 전용</h4>
                            <p>포토/동영상갤러리는 관리자만 업로드 가능합니다</p>
                        </div>
                        <div class="rule-item">
                            <div class="rule-icon">🚫</div>
                            <h4>금지사항</h4>
                            <p>광고, 욕설, 무관한 내용은 삭제될 수 있습니다</p>
                        </div>
                        <div class="rule-item">
                            <div class="rule-icon">📞</div>
                            <h4>문의</h4>
                            <p>궁금한 사항은 055-641-5051~2로 연락주세요</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
export default {
    name: 'Community',
    data() {
        return {
            sections: [
                {
                    id: 1,
                    title: '포토갤러리',
                    description: '통영요트학교의 다양한 활동 사진을 감상해보세요',
                    icon: '📸',
                    access: '관리자 전용',
                    accessClass: 'admin-only',
                    count: 24,
                    path: '/community/photo-gallery'
                },
                {
                    id: 2,
                    title: '동영상갤러리',
                    description: '요트 교육과 체험의 생생한 영상을 만나보세요',
                    icon: '🎥',
                    access: '관리자 전용',
                    accessClass: 'admin-only',
                    count: 12,
                    path: '/community/video-gallery'
                },
                {
                    id: 3,
                    title: '자유게시판',
                    description: '자유롭게 의견을 나누고 소통하는 공간입니다',
                    icon: '💬',
                    access: '모든 사용자',
                    accessClass: 'public',
                    count: 156,
                    path: '/community/free-board'
                }
            ]
        };
    },
    methods: {
        goToSection(path) {
            this.$router.push(path);
        }
    }
};
</script>

<style scoped>
.community {
    padding-top: 70px;
}

.hero-section {
    position: relative;
    height: 300px;
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
    font-size: 3rem;
    font-weight: bold;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
    font-size: 1.3rem;
    opacity: 0.9;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.content-section {
    padding: 80px 0;
    background: white;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.container > div {
    margin-bottom: 80px;
}

.container h2 {
    color: #2c5aa0;
    font-size: 2rem;
    text-align: center;
    margin-bottom: 40px;
}

.community-overview p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #666;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
}

.sections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.section-card {
    background: white;
    border: 2px solid #f0f0f0;
    border-radius: 20px;
    padding: 30px;
    text-align: center;
    transition: all 0.3s;
    cursor: pointer;
}

.section-card:hover {
    border-color: #2c5aa0;
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(44, 90, 160, 0.1);
}

.section-icon {
    font-size: 4rem;
    margin-bottom: 20px;
}

.section-card h3 {
    color: #2c5aa0;
    font-size: 1.5rem;
    margin-bottom: 15px;
}

.section-card p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
}

.section-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #f0f0f0;
}

.access-type {
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
}

.access-type.admin-only {
    background: #ffebee;
    color: #c62828;
}

.access-type.public {
    background: #e8f5e8;
    color: #2e7d32;
}

.post-count {
    color: #999;
    font-size: 0.9rem;
}

.activity-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 25px;
}

.activity-card {
    background: #f8f9fa;
    padding: 25px;
    border-radius: 15px;
    border-left: 4px solid #2c5aa0;
}

.activity-card h4 {
    color: #2c5aa0;
    margin-bottom: 10px;
    font-size: 1.1rem;
}

.activity-card p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 15px;
}

.activity-date {
    color: #999;
    font-size: 0.9rem;
}

.rules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 25px;
}

.rule-item {
    text-align: center;
    padding: 25px;
    background: #f8f9fa;
    border-radius: 15px;
}

.rule-icon {
    font-size: 3rem;
    margin-bottom: 15px;
}

.rule-item h4 {
    color: #2c5aa0;
    margin-bottom: 15px;
    font-size: 1.2rem;
}

.rule-item p {
    color: #666;
    line-height: 1.6;
    margin: 0;
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 2.2rem;
    }
    
    .hero-subtitle {
        font-size: 1.1rem;
    }

    .sections-grid,
    .activity-grid,
    .rules-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .section-info {
        flex-direction: column;
        gap: 10px;
    }
}
</style>
