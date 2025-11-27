<template>
    <div class="dinghy-experience">
        <section class="hero-section">
            <div class="hero-background">
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <h1 class="hero-title">딩기 요트 체험</h1>
                <p class="hero-subtitle">초보자도 쉽게 즐길 수 있는 딩기 요트 체험 프로그램</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="experience-intro">
                    <h2>딩기 요트 체험이란?</h2>
                    <p>
                        딩기 요트 체험은 별도의 엔진 없이 바람의 힘만으로 항해하는 순수한 세일링의
                        즐거움을 경험할 수 있는 프로그램입니다. 전문 강사의 안전한 지도 아래 누구나
                        쉽게 참여할 수 있습니다.
                    </p>
                </div>

                <div class="experience-programs">
                    <h2>체험 프로그램</h2>
                    <div class="programs-container">
                        <div class="program-card" v-for="program in programs" :key="program.id" @click="applyProgram(program)" style="cursor: pointer;">
                            <div class="program-image">
                                <img :src="program.image" :alt="program.name" />
                            </div>
                            <div class="program-content">
                                <h3>{{ program.name }}</h3>
                                <p>{{ program.description }}</p>

                                <div class="program-highlights">
                                    <h4>포함 내용</h4>
                                    <ul>
                                        <li v-for="item in program.includes" :key="item">
                                            {{ item }}
                                        </li>
                                    </ul>
                                </div>

                                <div class="program-details">
                                    <div class="detail-item">
                                        <span class="icon">⏰</span>
                                        <span>{{ program.duration }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="icon">👥</span>
                                        <span>{{ program.capacity }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="icon">💰</span>
                                        <span class="price">{{ program.price }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="experience-flow">
                    <h2>체험 진행 과정</h2>
                    <div class="flow-steps">
                        <div class="step" v-for="(step, index) in experienceFlow" :key="index">
                            <div class="step-number">{{ index + 1 }}</div>
                            <div class="step-content">
                                <h4>{{ step.title }}</h4>
                                <p>{{ step.description }}</p>
                                <span class="step-time">{{ step.time }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="preparation-guide">
                    <h2>참여 준비사항</h2>
                    <div class="guide-grid">
                        <div class="guide-section">
                            <h3>🎒 준비물</h3>
                            <ul class="prep-list">
                                <li>편안한 운동복</li>
                                <li>미끄러지지 않는 신발</li>
                                <li>모자 및 선글라스</li>
                                <li>선크림</li>
                                <li>여벌 옷</li>
                                <li>수건</li>
                            </ul>
                        </div>

                        <div class="guide-section">
                            <h3>⚠️ 주의사항</h3>
                            <ul class="prep-list">
                                <li>기본적인 수영 능력 필요</li>
                                <li>음주 후 참여 불가</li>
                                <li>임신부 참여 제한</li>
                                <li>고혈압, 심장병 환자 주의</li>
                                <li>날씨에 따른 취소 가능</li>
                                <li>안전 수칙 준수 필수</li>
                            </ul>
                        </div>

                        <div class="guide-section">
                            <h3>📋 참여 조건</h3>
                            <ul class="prep-list">
                                <li>연령: 만 7세 이상</li>
                                <li>건강한 신체 조건</li>
                                <li>사전 예약 필수</li>
                                <li>안전 교육 이수</li>
                                <li>보호자 동의서 (미성년자)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="booking-info">
                    <h2>예약 및 문의</h2>
                    <div class="booking-details">
                        <div class="contact-card">
                            <h3>📞 전화 예약</h3>
                            <p class="phone-number">055-641-5051~2</p>
                            <p class="operating-hours">운영시간: 09:00 ~ 18:00</p>
                        </div>

                        <div class="contact-card">
                            <h3>🌐 온라인 예약</h3>
                            <p>홈페이지를 통한 간편 예약</p>
                            <button class="online-booking-btn" @click="goToApplication">
                                온라인 예약하기
                            </button>
                        </div>

                        <div class="contact-card">
                            <h3>📍 찾아오시는 길</h3>
                            <p>경상남도 통영시 도남로 269-28</p>
                            <p>통영요트학교</p>
                            <button class="location-btn" @click="showLocation">위치 보기</button>
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
import { useToast } from '../components/Toast.vue'
import { useRouter } from 'vue-router'

export default {
    name: 'DinghyExperience',
    setup() {
        const toast = useToast()
        const router = useRouter()
        
        const goToApplication = () => {
            router.push({ path: '/experience-apply', query: { type: '딩기요트체험' } })
        }

        const applyProgram = (program) => {
            // 프로그램 ID에 따라 value 매핑
            const programValueMap = {
                1: '호비겟어웨이체험',
                2: '토파즈오메가체험'
            };

            const subType = programValueMap[program.id];
            router.push({
                path: '/experience-apply',
                query: {
                    type: '딩기요트체험',
                    subType: subType
                }
            });
        }

        const contactUs = () => {
            toast.tip('전화: 055-641-5051~2\n운영시간: 09:00~18:00', '⛵ 딩기 체험 문의')
        }

        const showLocation = () => {
            toast.info('경상남도 통영시 산양읍 통영요트학교', '📍 위치 정보')
        }

        return {
            goToApplication,
            applyProgram,
            contactUs,
            showLocation
        }
    },
    data() {
        return {
            programs: [
                {
                    id: 1,
                    name: '호비 겟어웨이 체험',
                    description: '쌍동선 형태의 카타마란 딩기로 스릴 넘치는 고속 항해 체험',
                    duration: '2~4시간',
                    capacity: '2~6명',
                    price: '문의필요',
                    image: '/images/hobie-experience.jpg',
                    includes: [
                        '전문 강사 동승 지도',
                        '안전 장비 일체',
                        '기본 조작법 교육',
                        '자유 항해 시간',
                        '기념 촬영',
                    ],
                },
                {
                    id: 2,
                    name: '토파즈 오메가 체험',
                    description: '중급자를 위한 고성능 딩기로 역동적인 세일링 체험',
                    duration: '2~4시간',
                    capacity: '2~5명',
                    price: '문의필요',
                    image: '/images/toppers-omega-exp.jpg',
                    includes: [
                        '전문 강사 동승 지도',
                        '안전 교육',
                        '조작 실습',
                        '독립 항해 체험',
                        '자유 항해 시간',
                    ],
                },
            ],
            experienceFlow: [
                {
                    title: '접수 및 안전 교육',
                    description: '참가자 접수, 안전 수칙 교육, 구명조끼 착용',
                },
                {
                    title: '기본 이론 설명',
                    description: '딩기 요트 구조, 기본 조작법, 바람 이용법 설명',
                },
                {
                    title: '육상 시뮬레이션',
                    description: '육지에서 기본 동작 연습, 세일 조작법 익히기',
                },
                {
                    title: '강사 동승 체험',
                    description: '전문 강사와 함께하는 안전한 첫 항해 체험',
                },
                {
                    title: '독립 체험',
                    description: '강사 감독 하에 개인별 자유 항해 체험',
                },
                {
                    title: '마무리 및 정리',
                    description: '장비 정리, 체험 소감 나누기, 기념 촬영',
                },
            ],
        };
    },
};
</script>

<style scoped>
.dinghy-experience {
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

.experience-intro p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #666;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
}

.programs-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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

.program-image {
    height: 250px;
    overflow: hidden;
}

.program-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.program-card:hover .program-image img {
    transform: scale(1.05);
}

.program-content {
    padding: 30px;
}

.program-content h3 {
    color: #2c5aa0;
    font-size: 1.5rem;
    margin-bottom: 15px;
}

.program-content > p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 25px;
}

.program-highlights h4 {
    color: #333;
    font-size: 1.1rem;
    margin-bottom: 15px;
}

.program-highlights ul {
    list-style: none;
    padding: 0;
    margin-bottom: 25px;
}

.program-highlights li {
    color: #666;
    margin-bottom: 8px;
    padding-left: 20px;
    position: relative;
}

.program-highlights li:before {
    content: '✓';
    color: #2c5aa0;
    position: absolute;
    left: 0;
    font-weight: bold;
}

.program-details {
    display: flex;
    justify-content: space-between;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
}

.detail-item .icon {
    font-size: 1.2rem;
}

.price {
    color: #2c5aa0;
    font-weight: bold;
}

.flow-steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.step {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 25px;
    background: #f8f9fa;
    border-radius: 15px;
    transition: transform 0.3s;
}

.step:hover {
    transform: translateY(-3px);
}

.step-number {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #2c5aa0, #1e3d6f);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: bold;
    flex-shrink: 0;
}

.step-content h4 {
    color: #2c5aa0;
    margin-bottom: 10px;
    font-size: 1.1rem;
}

.step-content p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 10px;
}

.step-time {
    color: #999;
    font-size: 0.9rem;
    font-weight: 500;
}

.guide-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.guide-section {
    background: #f8f9fa;
    padding: 30px;
    border-radius: 15px;
}

.guide-section h3 {
    color: #2c5aa0;
    margin-bottom: 20px;
    font-size: 1.2rem;
}

.prep-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.prep-list li {
    color: #666;
    margin-bottom: 10px;
    padding-left: 20px;
    position: relative;
    line-height: 1.5;
}

.prep-list li:before {
    content: '•';
    color: #2c5aa0;
    position: absolute;
    left: 0;
    font-weight: bold;
}

.booking-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
}

.contact-card {
    background: #f8f9fa;
    padding: 30px;
    border-radius: 15px;
    text-align: center;
}

.contact-card h3 {
    color: #2c5aa0;
    margin-bottom: 20px;
    font-size: 1.2rem;
}

.phone-number {
    font-size: 1.3rem;
    font-weight: bold;
    color: #2c5aa0;
    margin-bottom: 10px;
}

.operating-hours {
    color: #666;
    font-size: 0.95rem;
}

.online-booking-btn,
.location-btn {
    background: linear-gradient(135deg, #2c5aa0, #1e3d6f);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 15px;
}

.online-booking-btn:hover,
.location-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(44, 90, 160, 0.3);
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

    .programs-container,
    .flow-steps,
    .guide-grid,
    .booking-details {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .program-details {
        flex-direction: column;
        gap: 10px;
    }

    .step {
        flex-direction: column;
        text-align: center;
    }

    .action-section {
        flex-direction: column;
        align-items: center;
    }
}
</style>
