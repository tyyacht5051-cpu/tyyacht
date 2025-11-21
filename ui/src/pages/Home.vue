<template>
    <div class="home">
        <!-- 메인 히어로 섹션 -->
        <section class="hero-section">
            <div class="hero-background">
                <img src="/images/yacht-hero.jpg" alt="요트 배경" class="hero-image" />
                <div class="hero-overlay"></div>
            </div>

            <div class="hero-content">
                <h1 class="hero-title"></h1>
                <p class="hero-subtitle"></p>
            </div>

            <!-- 스크롤 유도 화살표 -->
            <div class="scroll-indicator" @click="scrollToContent">
                <div class="arrow-down"></div>
                <div class="arrow-down"></div>
            </div>
        </section>

        <!-- 메인 컨텐츠 섹션 -->
        <section class="main-content" id="main-content">
            <div class="container">
                <!-- 캘린더와 공지사항 섹션 -->
                <div class="content-grid">
                    <!-- 캘린더 (왼쪽 절반) -->
                    <div class="calendar-section">
                        <h2 class="section-title">면제교육 일정</h2>
                        <Calendar :events="calendarEvents" @event-click="handleEventClick" />
                    </div>

                    <!-- 공지사항 (오른쪽 절반) -->
                    <div class="notice-section">
                        <h2 class="section-title">공지사항</h2>
                        <NoticeList :notices="notices" @notice-click="handleNoticeClick" />
                    </div>
                </div>

                <!-- 후기게시판 섹션 -->
                <div class="reviews-section">
                    <div class="section-header">
                        <h2 class="section-title">후기게시판</h2>
                        <router-link to="/community/reviews" class="more-link">
                            <span>더보기</span>
                            <i class="fas fa-chevron-right"></i>
                        </router-link>
                    </div>
                    <div class="reviews-grid">
                        <div
                            v-for="review in reviews"
                            :key="review.id"
                            class="review-card"
                            @click="$router.push(`/community/reviews/${review.id}`)"
                        >
                            <div class="review-header">
                                <div class="review-rating">
                                    <i v-for="star in 5" :key="star"
                                       :class="['fas fa-star', { active: star <= review.rating }]">
                                    </i>
                                </div>
                                <span class="review-course">{{ review.course }}</span>
                            </div>
                            <h3 class="review-title">{{ review.title }}</h3>
                            <p class="review-excerpt">{{ review.excerpt }}</p>
                            <div class="review-meta">
                                <span class="review-author">{{ review.author }}</span>
                                <span class="review-date">{{ formatDate(review.date) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 관련 기관 슬라이더 섹션 -->
                <div class="related-sites-section">
                    <h2 class="section-title">관련 기관</h2>
                    <div class="sites-slider-container"
                         @mouseenter="pauseSlider"
                         @mouseleave="resumeSlider">
                        <div class="sites-slider" ref="sitesSlider">
                            <div
                                v-for="(site, index) in duplicatedSites"
                                :key="`${site.name}-${index}`"
                                class="site-card"
                                @click="openSite(site.url)"
                                :title="site.name"
                            >
                                <img :src="site.logo" :alt="site.name" class="site-logo" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import Calendar from '../components/Calendar.vue';
import NoticeList from '../components/Notice.vue';
import { API_BASE_URL } from '../config/env.js';
import axios from 'axios';
import { useToast } from '../components/Toast.vue';

export default {
    name: 'Home',
    setup() {
        const toast = useToast()
        return { toast }
    },
    components: {
        Calendar,
        NoticeList,
    },
    data() {
        return {
            calendarEvents: [],
            notices: [],
            reviews: [], // 초기에는 비어있다가 로드 후 채워짐
            sliderInterval: null,
            isSliderPaused: false,
            relatedSites: [
                {
                    name: '통영시청',
                    logo: '/images/ty-logo.png',
                    url: 'https://www.tongyeong.go.kr/main.web',
                },
                {
                    name: 'TY요트',
                    logo: '/images/tyyacht-logo.png',
                    url: '#',
                },
                {
                    name: '경상남도청',
                    logo: '/images/gn-logo.png',
                    url: 'https://www.gyeongnam.go.kr/index.gyeong',
                },
                {
                    name: '한국세일링연맹',
                    logo: '/images/ksaf-logo.png',
                    url: 'https://www.ksaf.org/',
                },
                {
                    name: '해양경찰청',
                    logo: '/images/kcg-logo.png',
                    url: 'https://www.kcg.go.kr/kcg/main.do',
                },
                {
                    name: '경남요트협회',
                    logo: '/images/gnsf-logo.png',
                    url: 'http://www.gnyf.co.kr/',
                },
                {
                    name: '러브씨통영',
                    logo: '/images/lovesea-logo.png',
                    url: 'https://www.instagram.com/love_sea.tongyeong',
                },
            ],
            companyInfo: {},
            categories: [
                {
                    id: 'exemption',
                    title: '면제교육',
                },
                {
                    id: 'cruise',
                    title: '크루저요트',
                },
                {
                    id: 'dinghy',
                    title: '딩기요트',
                },
                {
                    id: 'recruitment',
                    title: '채용',
                },
                {
                    id: 'others',
                    title: '기타',
                }
            ],
        };
    },
    computed: {
        duplicatedSites() {
            // 무한 슬라이더를 위해 사이트 목록을 3배로 복제 (더 부드러운 전환을 위해)
            return [...this.relatedSites, ...this.relatedSites, ...this.relatedSites];
        }
    },
    created() {
        // 컴포넌트 생성 시 빈 배열로 초기화
        this.reviews = [];
    },
    async mounted() {
        console.log('Home 컴포넌트 마운트됨');
        await this.loadData();

        // DOM이 완전히 렌더링된 후 슬라이더 시작
        this.$nextTick(() => {
            this.startSlider();
        });
    },
    beforeUnmount() {
        this.stopSlider();
    },
    methods: {
        async loadData() {
            try {
                // 각각을 개별적으로 로드하여 오류가 발생해도 다른 것들은 정상 작동하도록
                await this.loadScheduleEvents().then(res => {
                    this.calendarEvents = res;
                }).catch(err => {
                    console.error('스케줄 로드 실패:', err);
                    this.calendarEvents = [];
                });

                await axios.get(`${API_BASE_URL}/api/notices`, { params: { limit: 10 } })
                    .then(res => {
                        this.notices = res.data.map(notice => ({
                            ...notice,
                            category: this.getCategoryTitle(notice.category_id),
                            categoryClass: notice.category_id,
                            date: notice.created_at.split('T')[0]
                        }));
                    })
                    .catch(err => {
                        console.error('공지사항 로드 실패:', err);
                        this.notices = [];
                    });

                await this.loadReviews().then(res => {
                    this.reviews = res;
                }).catch(err => {
                    console.error('후기 로드 실패:', err);
                    this.reviews = [];
                });

                await axios.get(`${API_BASE_URL}/api/company-info`)
                    .then(res => {
                        this.companyInfo = res.data;
                    })
                    .catch(err => {
                        console.error('회사 정보 로드 실패:', err);
                        this.companyInfo = {};
                    });

            } catch (error) {
                console.error('전체 데이터 로드 중 오류:', error);
                // 모든 것이 실패해도 빈 배열로 설정
                if (!this.reviews) {
                    this.reviews = [];
                }
            }
        },

        async loadReviews() {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/reviews`, {
                    params: { limit: 6 }
                });

                return response.data.map(review => ({
                    ...review,
                    id: review.id,
                    title: review.title,
                    content: review.content,
                    excerpt: this.truncateText(review.content, 80),
                    rating: review.rating || 5,
                    course: this.getCourseLabel(review.category),
                    author: this.maskName(review.author_name || '익명'),
                    date: review.created_at.split('T')[0]
                }));
            } catch (error) {
                console.error('후기 로드 실패:', error);
                return [];
            }
        },

        getCourseLabel(category) {
            const courseMap = {
                'cruise': '크루저요트',
                'dinghy': '딩기요트',
                'exemption': '면제교육',
                'paddleboard': '패들보드',
                'license': '면허교육'
            };
            return courseMap[category] || '교육과정';
        },

        maskName(name) {
            if (!name || name.length <= 1) return '익명';
            if (name.length === 2) return name[0] + '*';
            return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
        },


        async loadScheduleEvents() {
            try {
                // 현재 월과 다음 몇 개월의 스케줄을 가져와서 이벤트로 변환
                const events = [];
                const today = new Date();
                
                for (let i = 0; i < 6; i++) { // 현재월부터 6개월간
                    const targetMonth = new Date(today.getFullYear(), today.getMonth() + i, 1);
                    const monthKey = `${targetMonth.getFullYear()}-${String(targetMonth.getMonth() + 1).padStart(2, '0')}`;
                    
                    try {
                        // 전체 스케줄 정보를 가져오기 (월별 마감 상태 포함)
                        const scheduleResponse = await axios.get(`${API_BASE_URL}/api/schedules/${monthKey}`);
                        const allDates = scheduleResponse.data.dates || [];
                        const isMonthClosed = scheduleResponse.data.isClosed || false;

                        // 각 날짜별 신청자 수도 함께 가져오기
                        const countsResponse = await axios.get(`${API_BASE_URL}/api/applications/exemption/counts/${monthKey}`);
                        const dateCounts = countsResponse.data.counts || {};

                        const todayStr = new Date().toISOString().split('T')[0];

                        allDates.forEach(date => {
                            // 모든 날짜 표시 (과거, 현재, 미래 모두 포함)
                            const applicantCount = dateCounts[date] || 0;
                            const maxCapacity = 14; // 면제교육 정원
                            const isFullyBooked = applicantCount >= maxCapacity;
                            const isPastDate = date < todayStr;
                            const isClosed = isFullyBooked || isMonthClosed;

                            let title, description;
                            if (isPastDate) {
                                title = '신청마감';
                                description = `요트면허 면제교육 - 교육 완료\\n참가현황: ${applicantCount}/${maxCapacity}명`;
                            } else if (isMonthClosed) {
                                title = '신청마감';
                                description = `요트면허 면제교육 - 관리자에 의해 마감됨\\n참가현황: ${applicantCount}/${maxCapacity}명`;
                            } else if (isFullyBooked) {
                                title = '신청마감';
                                description = `요트면허 면제교육 - 정원 마감\\n참가현황: ${applicantCount}명 (마감)`;
                            } else {
                                title = '면제교육 신청가능';
                                description = `요트면허 면제교육\\n참가현황: ${applicantCount}/${maxCapacity}명`;
                            }

                            events.push({
                                id: `exemption-${date}`,
                                title: title,
                                date: date,
                                type: 'education',
                                description: description,
                                applicantCount: applicantCount,
                                maxCapacity: maxCapacity,
                                isFullyBooked: isFullyBooked,
                                isClosedByAdmin: isMonthClosed,
                                isClosed: isClosed,
                                isPastDate: isPastDate
                            });
                        });
                    } catch (error) {
                        console.error(`Failed to load schedule for ${monthKey}:`, error);
                    }
                }
                
                return events;
            } catch (error) {
                console.error('Failed to load schedule events:', error);
                return [];
            }
        },
        scrollToContent() {
            document.getElementById('main-content').scrollIntoView({
                behavior: 'smooth',
            });
        },
        handleEventClick(event) {
            // 캘린더 이벤트 클릭 시 상세 정보 표시
            if (event.title.includes('면제교육')) {
                this.toast.celebrate(event.description, `🎓 ${event.title}`);
            } else {
                this.toast.info(event.description, event.title);
            }
        },
        handleNoticeClick(notice) {
            // 카테고리별 개별 페이지로 직접 이동
            this.$router.push(`/notice/${notice.category_id}/${notice.id}`);
        },
        getCategoryTitle(categoryId) {
            const category = this.categories.find(c => c.id === categoryId);
            return category ? category.title : '기타';
        },

        openSite(url) {
            window.open(url, '_blank');
        },

        // 슬라이더 관련 메서드
        startSlider() {
            // 먼저 기존 인터벌 정리
            this.stopSlider();

            // DOM이 렌더링된 후 슬라이더 시작
            this.$nextTick(() => {
                console.log('슬라이더 시작:', this.$refs.sitesSlider ? '참조 존재' : '참조 없음');

                // 슬라이더를 첫 번째 세트 시작점으로 초기화 (원본 데이터가 보이도록)
                const slider = this.$refs.sitesSlider;
                if (slider) {
                    const singleSetWidth = this.relatedSites.length * 220;
                    slider.style.transform = `translateX(-${singleSetWidth}px)`;
                }

                this.sliderInterval = setInterval(() => {
                    if (!this.isSliderPaused && this.$refs.sitesSlider) {
                        this.moveSlider();
                    }
                }, 3000); // 3초마다 이동
            });
        },

        stopSlider() {
            if (this.sliderInterval) {
                clearInterval(this.sliderInterval);
                this.sliderInterval = null;
            }
        },

        pauseSlider() {
            this.isSliderPaused = true;
        },

        resumeSlider() {
            this.isSliderPaused = false;
        },

        moveSlider() {
            const slider = this.$refs.sitesSlider;
            if (!slider) {
                console.warn('슬라이더 참조를 찾을 수 없습니다');
                return;
            }

            const cardWidth = 220; // 카드 너비 + 간격
            const currentTransform = slider.style.transform || 'translateX(0px)';
            let currentX = 0;

            if (currentTransform.includes('translateX')) {
                const match = currentTransform.match(/translateX\((-?\d+)px\)/);
                if (match) {
                    currentX = parseInt(match[1]);
                }
            }

            const newX = currentX - cardWidth;
            const singleSetWidth = this.relatedSites.length * cardWidth;

            // 세 번째 세트에 도달하면 첫 번째 세트로 리셋 (무한루프)
            if (Math.abs(newX) >= singleSetWidth * 2) {
                // 애니메이션 없이 첫 번째 세트 시작점으로 점프
                slider.style.transition = 'none';
                slider.style.transform = `translateX(-${singleSetWidth}px)`;

                // 다음 프레임에서 애니메이션 재개하고 한 칸 이동
                requestAnimationFrame(() => {
                    slider.style.transition = 'transform 0.5s ease';
                    requestAnimationFrame(() => {
                        slider.style.transform = `translateX(-${singleSetWidth + 220}px)`;
                    });
                });
            } else {
                // 정상적으로 이동
                slider.style.transform = `translateX(${newX}px)`;
            }
        },

        // 유틸리티 메서드
        truncateText(text, maxLength) {
            if (!text) return '';
            return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        },

        formatDate(dateString) {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}.${month}.${day}`;
        },



    },
};
</script>

<style scoped>
/* 히어로 섹션 */
.hero-section {
    position: relative;
    height: 100vh;
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
    z-index: -2;
}

.hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    z-index: -1;
}

.hero-content {
    text-align: center;
    color: white;
    z-index: 1;
}

.hero-title {
    font-size: 4rem;
    font-weight: bold;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-subtitle {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.cta-button {
    background: #2c5aa0;
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 1.2rem;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s;
}

.cta-button:hover {
    background: #1e3d6f;
    transform: translateY(-2px);
}


/* 스크롤 화살표 */
.scroll-indicator {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    cursor: pointer;
    animation: bounce 2s infinite;
}

.arrow-down {
    width: 20px;
    height: 20px;
    border-right: 3px solid white;
    border-bottom: 3px solid white;
    transform: rotate(45deg);
    margin: -5px;
    animation: arrow-pulse 2s infinite;
}

@keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateX(-50%) translateY(0);
    }
    40% {
        transform: translateX(-50%) translateY(-10px);
    }
    60% {
        transform: translateX(-50%) translateY(-5px);
    }
}

@keyframes arrow-pulse {
    0%,
    100% {
        opacity: 0.3;
    }
    50% {
        opacity: 1;
    }
}

/* 메인 컨텐츠 */
.main-content {
    padding: 80px 0;
    background: #f8f9fa;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.section-title {
    font-size: 2rem;
    color: #2c5aa0;
    margin-bottom: 2rem;
    text-align: center;
}

/* 컨텐츠 그리드 */
.content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-bottom: 60px;
}

.calendar-section,
.notice-section {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}


/* 후기게시판 섹션 */
.reviews-section {
    margin-bottom: 60px;
    background: #f8f9fa;
    padding: 40px 0;
    border-radius: 15px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 0 20px;
}

.more-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #2c5aa0;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s;
    font-size: 1rem;
}

.more-link:hover {
    color: #1e3d6f;
    transform: translateX(5px);
}

.reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 25px;
    padding: 0 20px;
}

.review-card {
    background: white;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid #e9ecef;
}

.review-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(44, 90, 160, 0.15);
    border-color: #2c5aa0;
}

.review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.review-rating {
    display: flex;
    gap: 2px;
}

.review-rating .fa-star {
    font-size: 14px;
    color: #ddd;
    transition: color 0.2s;
}

.review-rating .fa-star.active {
    color: #ffd700;
}

.review-course {
    background: #e3f2fd;
    color: #1976d2;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.review-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
    line-height: 1.4;
}

.review-excerpt {
    color: #666;
    line-height: 1.5;
    margin-bottom: 15px;
    font-size: 0.95rem;
}

.review-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: #999;
    border-top: 1px solid #f0f0f0;
    padding-top: 15px;
}

.review-author {
    font-weight: 500;
}

/* 관련 기관 슬라이더 섹션 */
.related-sites-section {
    margin-bottom: 60px;
}

.sites-slider-container {
    position: relative;
    overflow: hidden;
    width: 100%;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    padding: 20px 0;
}

.sites-slider {
    display: flex;
    transition: transform 0.5s ease;
    width: max-content; /* 자동 폭 계산 */
}

.site-card {
    flex: 0 0 200px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    padding: 20px 10px;
    margin: 0 10px;
    border-radius: 8px;
}

.site-card:hover {
    transform: translateY(-5px);
    background: #f8f9fa;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.site-logo {
    height: 80px;
    width: auto;
    margin: 0;
    object-fit: contain;
    transition: transform 0.3s;
}

.site-card:hover .site-logo {
    transform: scale(1.1);
}

.site-name {
    display: none; /* 글자 완전 숨김 */
}

/* 회사 정보 섹션 */
.company-info-section {
    background: white;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.company-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 40px;
}

.company-detail h3 {
    color: #2c5aa0;
    font-size: 1.5rem;
    margin-bottom: 20px;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.info-item {
    padding: 10px 0;
    border-bottom: 1px solid #eee;
}

.services-list {
    list-style: none;
    padding: 0;
}

.services-list li {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}

.services-list li:before {
    content: '▶';
    color: #2c5aa0;
    margin-right: 10px;
}

/* 반응형 디자인 */

@media (max-width: 768px) {
    .hero-title {
        font-size: 2.5rem;
    }

    .content-grid,
    .company-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    /* 후기게시판 모바일 스타일 */
    .reviews-section {
        margin-bottom: 40px;
        padding: 30px 0;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
        padding: 0 15px;
    }

    .more-link {
        align-self: flex-end;
        font-size: 0.9rem;
    }

    .reviews-grid {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 0 15px;
    }

    .review-card {
        padding: 20px;
    }

    .review-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .review-rating {
        order: 2;
    }

    .review-course {
        order: 1;
        align-self: flex-start;
    }

    .review-title {
        font-size: 1rem;
        margin-bottom: 8px;
    }

    .review-excerpt {
        font-size: 0.9rem;
        margin-bottom: 12px;
    }

    .review-meta {
        font-size: 0.8rem;
        padding-top: 12px;
    }

    /* 관련기관 슬라이더 모바일 스타일 */
    .sites-slider-container {
        padding: 15px 0;
    }

    .sites-slider {
        width: calc(180px * 14); /* 모바일에서 카드 크기 조정 */
    }

    .site-card {
        flex: 0 0 160px;
        padding: 15px 8px;
        margin: 0 5px;
    }

    .site-logo {
        height: 60px;
        margin: 0;
    }

    .site-name {
        display: none; /* 모바일에서도 글자 숨김 */
    }
}
</style>
