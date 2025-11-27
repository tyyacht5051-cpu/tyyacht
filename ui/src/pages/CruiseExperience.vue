<template>
    <div class="cruise-experience">
        <section class="hero-section">
            <div class="hero-background">
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <h1 class="hero-title">크루저 요트 체험</h1>
                <p class="hero-subtitle">가족, 친구와 함께하는 즐거운 크루저 요트 체험</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="experience-programs">
                    <h2>체험 프로그램</h2>
                    <div class="programs-grid">
                        <div class="program-card" v-for="program in programs" :key="program.id">
                            <div class="program-header">
                                <h3>{{ program.name }}</h3>
                                <span class="duration">{{ program.duration }}</span>
                            </div>
                            <div class="program-content">
                                <p>{{ program.description }}</p>
                                <div class="program-highlights">
                                    <div
                                        class="highlight"
                                        v-for="highlight in program.highlights"
                                        :key="highlight"
                                    >
                                        <span class="icon">✓</span>
                                        <span>{{ highlight }}</span>
                                    </div>
                                </div>
                                <div class="pricing">
                                    <span class="price">{{ program.price }}</span>
                                    <span class="note">{{ program.note }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="fleet-info">
                    <h2>보유 요트</h2>
                    <div class="fleet-grid">
                        <div class="yacht-card" v-for="yacht in yachts" :key="yacht.name">
                            <h4>{{ yacht.name }}</h4>
                            <p class="capacity">{{ yacht.capacity }}</p>
                            <ul class="features">
                                <li v-for="feature in yacht.features" :key="feature">
                                    {{ feature }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="booking-info">
                    <h2>예약 안내</h2>
                    <div class="booking-details">
                        <div class="booking-item">
                            <h4>🕒 운영 시간</h4>
                            <p>09:00 ~ 18:00 (일몰 체험 시 연장 운영)</p>
                        </div>
                        <div class="booking-item">
                            <h4>📞 예약 방법</h4>
                            <p>전화 예약: 055-641-5051~2 (사전 예약 필수)</p>
                        </div>
                        <div class="booking-item">
                            <h4>🌊 운항 조건</h4>
                            <p>날씨 상황에 따라 운항이 취소될 수 있습니다</p>
                        </div>
                        <div class="booking-item">
                            <h4>🎒 준비물</h4>
                            <p>편한 복장, 운동화, 모자, 선크림, 멀미약</p>
                        </div>
                    </div>
                </div>

                <div class="action-section">
                    <button class="apply-btn" @click="goToApplication">체험 신청하기</button>
                    <button class="contact-btn" @click="contactUs">문의하기</button>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { useToast } from '../components/Toast.vue';
import { useRouter } from 'vue-router';

export default {
    name: 'CruiseExperience',
    setup() {
        const toast = useToast();
        const router = useRouter();

        const goToApplication = () => {
            router.push({ path: '/experience-apply', query: { type: '크루저요트체험' } });
        };

        const contactUs = () => {
            toast.tip('전화: 055-641-5051~2\n운영시간: 09:00~18:00', '🚢 크루저 체험 문의');
        };

        return {
            goToApplication,
            contactUs,
        };
    },
    data() {
        return {
            programs: [
                {
                    id: 1,
                    name: '한산대첩 승전항로',
                    duration: '1시간',
                    description: '이순신 장군의 한산대첩 승전 루트를 따라가는 역사 체험',
                    highlights: ['한산대첩 역사 해설', '승전지 관광'],
                    price: '25,000원',
                    note: '1인 기준',
                },
                {
                    id: 1.5,
                    name: '한산대첩 승전항로 (연장)',
                    duration: '1시간 30분',
                    description:
                        '이순신 장군의 한산대첩 승전 루트를 따라가는 역사 체험 (심화 코스)',
                    highlights: ['한산대첩 역사 해설', '승전지 관광', '추가 역사 탐방'],
                    price: '30,000원',
                    note: '1인 기준',
                },
                {
                    id: 2,
                    name: '이순신 역사 탐방',
                    duration: '2시간',
                    description: '한산도에 입성해 수루까지 직접 갔다 올수 있는 유적지 탐방',
                    highlights: ['한산태첩 역사 해설', '유적지 관람'],
                    price: '35,000원',
                    note: '1인 기준',
                },
                {
                    id: 3,
                    name: '힐링 섬 탐방',
                    duration: '4시간',
                    description: '아름다운 한려수도의 섬들을 탐방하는 힐링 여행',
                    highlights: ['사량도/비진도/욕지도 등 방문', '섬 산책', '해양 생태 관찰'],
                    price: '80,000원',
                    note: '1인 기준, 점심 포함',
                },
                {
                    id: 3.5,
                    name: '힐링 섬 탐방 (하루종일)',
                    duration: '8시간',
                    description: '아름다운 한려수도의 섬들을 탐방하는 힐링 여행 (하루 종일 코스)',
                    highlights: [
                        '사량도/비진도/욕지도 등 방문',
                        '섬 산책',
                        '해양 생태 관찰',
                        '다도해 경관 감상',
                        '해변 휴식',
                    ],
                    price: '120,000원',
                    note: '1인 기준, 점심 포함',
                },
                {
                    id: 4,
                    name: '선셋 체험',
                    duration: '1시간 30분',
                    description: '아름다운 통영 바다의 석양을 감상하는 로맨틱 크루즈',
                    highlights: ['석양 감상', '야경 촬영'],
                    price: '35,000원',
                    note: '1인 기준',
                },
            ],
            yachts: [
                {
                    name: '바다의땅 3호',
                    capacity: '35인승',
                    features: ['대형 데크', '음향 시설', '안전 장비'],
                },
                {
                    name: '바다의땅 5호',
                    capacity: '12인승',
                    features: ['소규모 그룹용', '친밀한 분위기', '개인 맞춤 서비스'],
                },
                {
                    name: '바다의땅 6호',
                    capacity: '12인승',
                    features: ['소규모 그룹용', '친밀한 분위기', '개인 맞춤 서비스'],
                },
            ],
        };
    },
};
</script>

<style scoped>
.cruise-experience {
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

.programs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.program-card {
    background: white;
    border: 2px solid #f0f0f0;
    border-radius: 15px;
    overflow: hidden;
    transition: all 0.3s;
}

.program-card:hover {
    border-color: #2c5aa0;
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(44, 90, 160, 0.1);
}

.program-header {
    background: linear-gradient(135deg, #2c5aa0, #1e3d6f);
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.program-header h3 {
    font-size: 1.3rem;
    margin: 0;
}

.duration {
    background: rgba(255, 255, 255, 0.2);
    padding: 5px 15px;
    border-radius: 15px;
    font-size: 0.9rem;
}

.program-content {
    padding: 25px;
}

.program-content > p {
    color: #666;
    margin-bottom: 20px;
    line-height: 1.6;
}

.program-highlights {
    margin-bottom: 20px;
}

.highlight {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 0.95rem;
}

.highlight .icon {
    color: #2c5aa0;
    margin-right: 10px;
    font-weight: bold;
}

.pricing {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #f0f0f0;
}

.price {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2c5aa0;
}

.note {
    font-size: 0.9rem;
    color: #999;
}

.fleet-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 25px;
}

.yacht-card {
    background: #f8f9fa;
    padding: 25px;
    border-radius: 15px;
    text-align: center;
}

.yacht-card h4 {
    color: #2c5aa0;
    font-size: 1.3rem;
    margin-bottom: 10px;
}

.capacity {
    font-size: 1.1rem;
    font-weight: bold;
    color: #666;
    margin-bottom: 15px;
}

.features {
    list-style: none;
    padding: 0;
    margin: 0;
}

.features li {
    color: #666;
    margin-bottom: 8px;
    font-size: 0.95rem;
}

.features li:before {
    content: '• ';
    color: #2c5aa0;
    margin-right: 5px;
}

.booking-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 25px;
}

.booking-item {
    background: #f8f9fa;
    padding: 25px;
    border-radius: 15px;
    text-align: center;
}

.booking-item h4 {
    color: #2c5aa0;
    margin-bottom: 15px;
    font-size: 1.1rem;
}

.booking-item p {
    color: #666;
    line-height: 1.6;
    margin: 0;
}

.action-section {
    text-align: center;
    gap: 20px;
    display: flex;
    justify-content: center;
}

.apply-btn,
.contact-btn {
    padding: 15px 40px;
    border: none;
    border-radius: 25px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.apply-btn {
    background: linear-gradient(135deg, #2c5aa0, #1e3d6f);
    color: white;
}

.contact-btn {
    background: white;
    color: #2c5aa0;
    border: 2px solid #2c5aa0;
}

.apply-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(44, 90, 160, 0.3);
}

.contact-btn:hover {
    background: #2c5aa0;
    color: white;
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 2.2rem;
    }

    .hero-subtitle {
        font-size: 1.1rem;
    }

    .programs-grid,
    .fleet-grid,
    .booking-details {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .program-header {
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }

    .action-section {
        flex-direction: column;
        align-items: center;
    }
}
</style>
