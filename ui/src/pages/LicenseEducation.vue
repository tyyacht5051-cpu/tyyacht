<template>
    <div class="license-education">
        <section class="hero-section">
            <div class="hero-background">
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <h1 class="hero-title">요트 면허 취득 과정</h1>
                <p class="hero-subtitle">
                    해상 안전과 전문성을 갖춘 요트 운항자가 되기 위한 체계적인 교육
                </p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="education-overview">
                    <h2>요트 면허 교육 소개</h2>
                    <p>
                        요트 면허는 안전한 항해를 위한 필수 자격입니다. 체계적인 이론 교육과 실기
                        연수를 통해 전문적인 요트 운항 능력을 기를 수 있습니다.
                    </p>
                </div>

                <div class="education-programs">
                    <h2>교육 프로그램</h2>
                    <div class="programs-grid">
                        <div class="program-card" v-for="program in programs" :key="program.id">
                            <div class="program-header">
                                <div class="program-price">{{ program.price }}</div>
                                <h3>{{ program.name }}</h3>
                            </div>
                            <div class="program-content">
                                <div class="program-info">
                                    <div class="info-item">
                                        <span class="label">교육 기간:</span>
                                        <span>{{ program.duration }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">교육 시간:</span>
                                        <span>{{ program.hours }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">참가 조건:</span>
                                        <span>{{ program.requirement }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">혜택:</span>
                                        <span>{{ program.benefit }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">중식:</span>
                                        <span>{{ program.lunch }}</span>
                                    </div>
                                </div>
                                <div class="curriculum">
                                    <h4>교육 내용</h4>
                                    <ul>
                                        <li v-for="item in program.curriculum" :key="item">
                                            {{ item }}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="process-info">
                    <h2>교육 진행 과정</h2>
                    <div class="process-grid">
                        <div
                            class="process-step"
                            v-for="(step, index) in processSteps"
                            :key="step.id"
                        >
                            <div class="step-number">{{ index + 1 }}</div>
                            <div class="step-content">
                                <h4>{{ step.title }}</h4>
                                <p>{{ step.description }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="requirements">
                    <h2>면허 취득 요건</h2>
                    <div class="requirements-grid">
                        <div class="requirement-card">
                            <div class="requirement-icon">📚</div>
                            <h4>이론 교육</h4>
                            <p>해상교통법규, 선박조종법, 기관학 등 22시간 이론 교육 이수</p>
                        </div>
                        <div class="requirement-card">
                            <div class="requirement-icon">⛵</div>
                            <h4>실기 교육</h4>
                            <p>실제 요트를 이용한 조종 실습 18시간, 장거리 세일링</p>
                        </div>
                        <div class="requirement-card">
                            <div class="requirement-icon">📝</div>
                            <h4>시험 응시</h4>
                            <p>필기시험/실기시험/수상안전교육 면제</p>
                        </div>
                    </div>
                </div>

                <div class="facilities">
                    <h2>교육 시설 및 장비</h2>
                    <div class="facilities-grid">
                        <div class="facility-item">
                            <h4>이론 교육장</h4>
                            <p>강의실에서 체계적인 이론 교육</p>
                        </div>
                        <div class="facility-item">
                            <h4>실습용 요트</h4>
                            <p>안전하고 현대적인 교육용 요트로 실기 교육</p>
                        </div>
                        <div class="facility-item">
                            <h4>안전 장비</h4>
                            <p>구명조끼, 안전 장비 등 완벽한 안전 시설 구비</p>
                        </div>
                    </div>
                </div>

                <div class="action-section">
                    <button class="apply-btn" @click="goToApplication">면제교육 신청하기</button>
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
    name: 'LicenseEducation',
    setup() {
        const toast = useToast();
        const router = useRouter();

        const goToApplication = () => {
            router.push('/exemption-apply');
        };

        const contactUs = () => {
            toast.tip('전화: 055-641-5051~2\n운영시간: 09:00~18:00', '🎓 면허 교육 문의');
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
                    name: '면허 교육 과정',
                    price: '70만원',
                    duration: '5일간',
                    hours: '40시간 연수 (이론22, 실기18)',
                    requirement: '만14세 이상 4인이상 모집시 진행',
                    benefit: '신청서에 별도 표기',
                    lunch: '중식 별도',
                    curriculum: [
                        '관계 법령',
                        '수상 상식',
                        '구급 및 응급처치',
                        '요트 개요',
                        '항해 및 기관',
                        '범주법',
                    ],
                },
                {
                    id: 2,
                    name: '실기 연수 과정',
                    price: '50만원',
                    duration: '2일간',
                    hours: '12시간',
                    requirement: '3인 이상 모집시 진행',
                    benefit: '없음',
                    lunch: '중식 제공',
                    curriculum: ['접,이안', '매듭법', '기주', '범주'],
                },
            ],
            processSteps: [
                {
                    id: 1,
                    title: '교육 신청',
                    description: '온라인 또는 전화로 교육 과정 신청',
                },
                {
                    id: 2,
                    title: '이론 교육',
                    description: '22시간의 체계적인 이론 강의 수강',
                },
                {
                    id: 3,
                    title: '실기 교육',
                    description: '18시간의 실제 요트 조종 실습',
                },
                {
                    id: 4,
                    title: '자격증 발급',
                    description: '교육 이수 후 면허 발급 신청',
                },
            ],
        };
    },
};
</script>

<style scoped>
.license-education {
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

.education-overview p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #666;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
}

.programs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 40px;
}

.program-card {
    background: white;
    border: 2px solid #f0f0f0;
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s;
}

.program-card:hover {
    border-color: #2c5aa0;
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(44, 90, 160, 0.1);
}

.program-header {
    background: linear-gradient(135deg, #2c5aa0, #1e3d6f);
    color: white;
    padding: 25px;
    text-align: center;
}

.program-price {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 10px;
}

.program-header h3 {
    margin: 0;
    font-size: 1.5rem;
}

.program-content {
    padding: 25px;
}

.program-info {
    margin-bottom: 25px;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 20px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
}

.label {
    font-weight: 600;
    color: #333;
    min-width: 80px;
}

.curriculum h4 {
    color: #2c5aa0;
    margin-bottom: 15px;
    font-size: 1.1rem;
}

.curriculum ul {
    list-style: none;
    padding: 0;
}

.curriculum li {
    color: #666;
    margin-bottom: 8px;
    padding-left: 20px;
    position: relative;
}

.curriculum li:before {
    content: '•';
    color: #2c5aa0;
    position: absolute;
    left: 0;
    font-weight: bold;
}

.process-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
}

.process-step {
    display: flex;
    align-items: center;
    padding: 25px;
    background: #f8f9fa;
    border-radius: 15px;
    transition: transform 0.3s;
}

.process-step:hover {
    transform: translateY(-5px);
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
    font-size: 1.5rem;
    font-weight: bold;
    margin-right: 20px;
    flex-shrink: 0;
}

.step-content h4 {
    color: #2c5aa0;
    margin-bottom: 10px;
    font-size: 1.2rem;
}

.step-content p {
    color: #666;
    margin: 0;
    line-height: 1.6;
}

.requirements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 25px;
}

.requirement-card {
    text-align: center;
    padding: 25px;
    background: #f8f9fa;
    border-radius: 15px;
    transition: transform 0.3s;
}

.requirement-card:hover {
    transform: translateY(-5px);
}

.requirement-icon {
    font-size: 3rem;
    margin-bottom: 15px;
}

.requirement-card h4 {
    color: #2c5aa0;
    margin-bottom: 15px;
    font-size: 1.2rem;
}

.requirement-card p {
    color: #666;
    line-height: 1.6;
    margin: 0;
}

.facilities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.facility-item {
    padding: 25px;
    background: #f8f9fa;
    border-radius: 15px;
    text-align: center;
}

.facility-item h4 {
    color: #2c5aa0;
    margin-bottom: 15px;
    font-size: 1.2rem;
}

.facility-item p {
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

    .programs-grid {
        grid-template-columns: 1fr;
        gap: 30px;
    }

    .process-grid,
    .requirements-grid,
    .facilities-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .process-step {
        flex-direction: column;
        text-align: center;
    }

    .step-number {
        margin-right: 0;
        margin-bottom: 15px;
    }

    .action-section {
        flex-direction: column;
        align-items: center;
    }

    .info-item {
        flex-direction: column;
        text-align: center;
        gap: 5px;
    }
}
</style>
