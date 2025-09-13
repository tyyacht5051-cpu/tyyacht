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
                <button class="cta-button" @click="scrollToContent">시작하기</button>
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


                <!-- 관련 사이트 섹션 -->
                <div class="related-sites-section">
                    <h2 class="section-title">관련 기관</h2>
                    <div class="sites-grid">
                        <div
                            v-for="site in relatedSites"
                            :key="site.name"
                            class="site-card"
                            @click="openSite(site.url)"
                        >
                            <img :src="site.logo" :alt="site.name" class="site-logo" />
                            <span class="site-name">{{ site.name }}</span>
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
import noticeStore from '../services/noticeStore.js';
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
        };
    },
    async mounted() {
        await this.loadData();
        // 공지사항 실시간 업데이트 감지
        this.updateNoticesFromStore();
        
        // noticeStore 변경 감지를 위한 interval 설정
        this.noticeUpdateInterval = setInterval(() => {
            this.updateNoticesFromStore();
        }, 1000);
    },
    
    beforeUnmount() {
        if (this.noticeUpdateInterval) {
            clearInterval(this.noticeUpdateInterval);
        }
    },
    methods: {
        async loadData() {
            try {
                // API에서 데이터 로드 (관련사이트는 하드코딩된 데이터 사용)
                const [schedulesRes, noticesRes, companyRes] = await Promise.all([
                    this.loadScheduleEvents(),
                    axios.get(`${API_BASE_URL}/api/notices`),
                    axios.get(`${API_BASE_URL}/api/company-info`),
                ]);

                this.calendarEvents = schedulesRes;
                this.notices = noticesRes.data;
                this.companyInfo = companyRes.data;
            } catch (error) {
                console.error('데이터 로드 중 오류:', error);
            }
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
                        const response = await axios.get(`${API_BASE_URL}/api/schedules/available/${monthKey}`);
                        const availableDates = response.data.dates || [];
                        
                        // 각 날짜별 신청자 수도 함께 가져오기
                        const countsResponse = await axios.get(`${API_BASE_URL}/api/applications/exemption/counts/${monthKey}`);
                        const dateCounts = countsResponse.data.counts || {};
                        
                        availableDates.forEach(date => {
                            const applicantCount = dateCounts[date] || 0;
                            const maxCapacity = 14; // 면제교육 정원
                            const isFullyBooked = applicantCount >= maxCapacity;
                            
                            events.push({
                                id: `exemption-${date}`,
                                title: isFullyBooked ? '면제교육 (마감)' : '면제교육 신청가능',
                                date: date,
                                type: 'education',
                                description: `요트면허 면제교육${isFullyBooked ? ' - 정원 마감' : ''}\\n참가현황: ${applicantCount}명${isFullyBooked ? ' (마감)' : `/${maxCapacity}명`}`,
                                applicantCount: applicantCount,
                                maxCapacity: maxCapacity,
                                isFullyBooked: isFullyBooked
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
            // 공지사항 클릭 시 상세 페이지로 이동
            this.$router.push(`/notice/${notice.id}`);
        },
        updateNoticesFromStore() {
            // 공지사항 저장소에서 최신 데이터 가져오기
            this.notices = noticeStore.getRecentNotices(5);
        },
        
        openSite(url) {
            window.open(url, '_blank');
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


/* 관련 사이트 섹션 */
.related-sites-section {
    margin-bottom: 60px;
}

.sites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.site-card {
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    padding: 20px;
}

.site-card:hover {
    transform: scale(1.1);
}

.site-logo {
    height: 80px;
    margin-bottom: 0;
    object-fit: contain;
}

.site-name {
    display: none;
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

    .sites-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
}
</style>
