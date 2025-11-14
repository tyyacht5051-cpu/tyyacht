<template>
    <div class="paddleboard-experience">
        <section class="hero-section">
            <div class="hero-background">
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <h1 class="hero-title">패들보드 체험</h1>
                <p class="hero-subtitle">누구나 쉽게 배울 수 있는 패들보드 체험 프로그램</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="intro-section">
                    <h2>패들보드(SUP)란?</h2>
                    <div class="intro-content">
                        <div class="intro-text">
                            <p>
                                SUP(Stand Up Paddle)는 서핑보드 위에 서서 패들을 이용해 물 위를
                                나아가는 수상 스포츠입니다. 배우기 쉽고 안전하여 남녀노소 누구나
                                즐길 수 있으며, 전신 운동 효과가 뛰어나 최근 인기가 급상승하고 있는
                                스포츠입니다.
                            </p>
                            <div class="benefits">
                                <h3>패들보드의 장점</h3>
                                <ul>
                                    <li>배우기 쉬워 초보자도 금방 익힐 수 있습니다</li>
                                    <li>전신 근육을 사용하는 최고의 운동입니다</li>
                                    <li>스트레스 해소와 힐링 효과가 있습니다</li>
                                    <li>아름다운 바다 위에서 자연을 만끽할 수 있습니다</li>
                                    <li>가족, 친구와 함께 즐길 수 있는 액티비티입니다</li>
                                </ul>
                            </div>
                        </div>
                        <div class="intro-image">
                            <img src="/images/paddleboard-intro.jpg" alt="패들보드 체험" />
                        </div>
                    </div>
                </div>

                <div class="programs-section">
                    <h2>체험 프로그램</h2>
                    <div class="programs-grid">
                        <div class="program-card" v-for="program in programs" :key="program.id">
                            <div class="program-header">
                                <h3>{{ program.name }}</h3>
                                <div class="program-type">{{ program.type }}</div>
                            </div>
                            <div class="program-content">
                                <div class="program-image">
                                    <img :src="program.image" :alt="program.name" />
                                </div>
                                <p>{{ program.description }}</p>
                                <div class="program-features">
                                    <div
                                        class="feature-item"
                                        v-for="feature in program.features"
                                        :key="feature"
                                    >
                                        <span class="feature-icon">✓</span>
                                        <span>{{ feature }}</span>
                                    </div>
                                </div>
                                <div class="program-info">
                                    <div class="info-row">
                                        <span class="info-label">체험 시간:</span>
                                        <span>{{ program.duration }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">참여 인원:</span>
                                        <span>{{ program.capacity }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">체험 비용:</span>
                                        <span class="price">{{ program.price }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="safety-section">
                    <h2>안전 수칙 & 준비사항</h2>
                    <div class="safety-grid">
                        <div class="safety-card">
                            <h3>🛡️ 안전 수칙</h3>
                            <ul>
                                <li>구명조끼 착용 필수</li>
                                <li>강사의 안전 교육 이수</li>
                                <li>지정된 구역 내에서만 체험</li>
                                <li>날씨 상황 확인 후 진행</li>
                                <li>체험 전 음주 금지</li>
                                <li>응급상황 시 즉시 신호</li>
                            </ul>
                        </div>

                        <div class="safety-card">
                            <h3>🎒 준비사항</h3>
                            <ul>
                                <li>수영복 또는 래쉬가드</li>
                                <li>여벌옷과 수건</li>
                                <li>방수 선크림</li>
                                <li>모자 및 선글라스</li>
                                <li>물과 간단한 간식</li>
                                <li>방수 케이스 (휴대폰용)</li>
                            </ul>
                        </div>

                        <div class="safety-card">
                            <h3>⚠️ 참여 제한</h3>
                            <ul>
                                <li>만 10세 이상 참여 가능</li>
                                <li>기본적인 수영 능력 필요</li>
                                <li>임신부는 참여 불가</li>
                                <li>심장질환자 주의 필요</li>
                                <li>음주 상태 시 참여 금지</li>
                                <li>날씨에 따른 취소 가능</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="booking-section">
                    <h2>예약 및 문의</h2>
                    <div class="booking-info">
                        <div class="contact-info">
                            <div class="contact-item">
                                <h3>📞 전화 예약</h3>
                                <p class="contact-value">055-641-5051~2</p>
                                <p class="contact-note">평일 09:00 ~ 18:00</p>
                            </div>

                            <div class="contact-item">
                                <h3>🕒 운영 시간</h3>
                                <p class="contact-value">09:00 ~ 17:00</p>
                                <p class="contact-note">체험 시작 시간 기준</p>
                            </div>

                            <div class="contact-item">
                                <h3>📍 체험 장소</h3>
                                <p class="contact-value">통영요트학교 앞바다</p>
                                <p class="contact-note">경남 통영시 도남로269-28</p>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="action-section">
                    <button class="apply-btn" @click="goToApplication">체험 신청하기</button>
                    <button class="contact-btn" @click="contactUs">전화 문의</button>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { useToast } from '../components/Toast.vue';
import { useRouter } from 'vue-router';

export default {
    name: 'PaddleboardExperience',
    setup() {
        const toast = useToast();
        const router = useRouter();

        const goToApplication = () => {
            router.push('/experience-apply');
        };

        const contactUs = () => {
            toast.tip('전화: 055-641-5051~2\n운영시간: 09:00~18:00', '🏄‍♂️ 패들보드 체험 문의');
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
                    name: '6인용 패들보드 체험',
                    type: '단체형',
                    description: '큰 보드 위에서 여러 명이 함께 즐기는 협동 패들보드 체험',
                    duration: '2시간',
                    capacity: '최대 6명',
                    price: '문의필요',
                    image: '/images/paddleboard-6person.jpg',
                    features: [
                        '팀워크가 중요한 협동 체험',
                        '가족, 친구들과 함께 즐기기 좋음',
                        '안정성이 높아 초보자에게 적합',
                        '단체 사진 촬영에 최적',
                        '커뮤니케이션 향상 효과',
                    ],
                },
                {
                    id: 2,
                    name: '1~2인용 패들보드 체험',
                    type: '개인형',
                    description: '개인 또는 커플이 즐기는 자유로운 패들보드 체험',
                    duration: '2시간',
                    capacity: '1~2명',
                    price: '문의필요',
                    image: '/images/paddleboard-personal.jpg',
                    features: [
                        '개인 맞춤형 지도',
                        '자유로운 이동과 체험',
                        '개인 기량 향상 집중',
                        '프라이빗한 체험 가능',
                        '사진 촬영 자유로움',
                    ],
                },
            ],
            processSteps: [
                {
                    title: '체험 접수 및 준비',
                    description: '참가자 접수, 안전 교육, 장비 지급 및 착용',
                    duration: '20분',
                },
                {
                    title: '기본 교육',
                    description: '패들보드 기본 이론, 패들 사용법, 균형 잡는 법 교육',
                    duration: '20분',
                },
                {
                    title: '육상 연습',
                    description: '해변에서 보드 위에 서는 연습, 패들링 동작 연습',
                    duration: '15분',
                },
                {
                    title: '수상 체험',
                    description: '얕은 곳에서 시작하여 점차 깊은 곳으로 이동하며 체험',
                    duration: '45분',
                },
                {
                    title: '자유 체험',
                    description: '익숙해진 후 자유롭게 패들보드 즐기기, 사진 촬영',
                    duration: '15분',
                },
                {
                    title: '정리 및 마무리',
                    description: '장비 정리, 샤워, 체험 후기 나누기',
                    duration: '5분',
                },
            ],
        };
    },
};
</script>

<style scoped>
.paddleboard-experience {
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

.intro-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 40px;
    align-items: center;
}

.intro-text p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #666;
    margin-bottom: 30px;
}

.benefits h3 {
    color: #2c5aa0;
    margin-bottom: 20px;
    font-size: 1.3rem;
}

.benefits ul {
    list-style: none;
    padding: 0;
}

.benefits li {
    color: #666;
    margin-bottom: 12px;
    padding-left: 25px;
    position: relative;
    line-height: 1.6;
}

.benefits li:before {
    content: '🏄‍♀️';
    position: absolute;
    left: 0;
    top: 0;
}

.intro-image {
    text-align: center;
}

.intro-image img {
    width: 100%;
    max-width: 400px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.programs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 40px;
}

.program-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
}

.program-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

.program-header {
    background: linear-gradient(135deg, #2c5aa0, #1e3d6f);
    color: white;
    padding: 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.program-header h3 {
    margin: 0;
    font-size: 1.4rem;
}

.program-type {
    background: rgba(255, 255, 255, 0.2);
    padding: 8px 16px;
    border-radius: 15px;
    font-size: 0.9rem;
}

.program-content {
    padding: 30px;
}

.program-image {
    width: 100%;
    height: 200px;
    margin-bottom: 20px;
    border-radius: 10px;
    overflow: hidden;
}

.program-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.program-content > p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 25px;
}

.program-features {
    margin-bottom: 25px;
}

.feature-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    color: #666;
}

.feature-icon {
    color: #2c5aa0;
    margin-right: 12px;
    font-weight: bold;
}

.program-info {
    border-top: 1px solid #f0f0f0;
    padding-top: 20px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.info-label {
    font-weight: 600;
    color: #333;
}

.price {
    color: #2c5aa0;
    font-weight: bold;
    font-size: 1.1rem;
}

.process-timeline {
    position: relative;
    max-width: 800px;
    margin: 0 auto;
}

.timeline-item {
    display: flex;
    margin-bottom: 40px;
    align-items: flex-start;
}

.timeline-marker {
    flex-shrink: 0;
    margin-right: 25px;
}

.step-number {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #2c5aa0, #1e3d6f);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    font-weight: bold;
}

.timeline-content {
    flex: 1;
    background: #f8f9fa;
    padding: 25px;
    border-radius: 15px;
}

.timeline-content h4 {
    color: #2c5aa0;
    margin-bottom: 15px;
    font-size: 1.2rem;
}

.timeline-content p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 10px;
}

.step-duration {
    color: #999;
    font-size: 0.9rem;
    font-weight: 500;
}

.equipment-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
}

.equipment-card {
    background: #f8f9fa;
    border-radius: 15px;
    overflow: hidden;
    transition: transform 0.3s;
}

.equipment-card:hover {
    transform: translateY(-5px);
}

.equipment-image {
    height: 200px;
    overflow: hidden;
}

.equipment-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.equipment-info {
    padding: 25px;
}

.equipment-info h3 {
    color: #2c5aa0;
    margin-bottom: 15px;
    font-size: 1.3rem;
}

.equipment-info > p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
}

.equipment-specs {
    border-top: 1px solid #e0e0e0;
    padding-top: 15px;
}

.spec-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.spec-label {
    font-weight: 600;
    color: #333;
}

.spec-value {
    color: #666;
}

.safety-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.safety-card {
    background: #f8f9fa;
    padding: 30px;
    border-radius: 15px;
}

.safety-card h3 {
    color: #2c5aa0;
    margin-bottom: 20px;
    font-size: 1.2rem;
}

.safety-card ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.safety-card li {
    color: #666;
    margin-bottom: 12px;
    padding-left: 20px;
    position: relative;
    line-height: 1.5;
}

.safety-card li:before {
    content: '•';
    color: #2c5aa0;
    position: absolute;
    left: 0;
    font-weight: bold;
}

.booking-info {
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.contact-item {
    background: #f8f9fa;
    padding: 25px;
    border-radius: 15px;
    text-align: center;
}

.contact-item h3 {
    color: #2c5aa0;
    margin-bottom: 15px;
    font-size: 1.1rem;
}

.contact-value {
    font-size: 1.2rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
}

.contact-note {
    color: #666;
    font-size: 0.9rem;
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

    .intro-content,
    .booking-info {
        grid-template-columns: 1fr;
        gap: 30px;
    }

    .programs-grid,
    .equipment-grid,
    .safety-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .program-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }

    .timeline-item {
        flex-direction: column;
        text-align: center;
        gap: 20px;
    }

    .timeline-marker {
        margin-right: 0;
    }

    .action-section {
        flex-direction: column;
        align-items: center;
    }
}
</style>
