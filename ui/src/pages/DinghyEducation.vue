<template>
    <div class="dinghy-education">
        <section class="hero-section">
            <div class="hero-background">
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <h1 class="hero-title">딩기 요트 교육</h1>
                <p class="hero-subtitle">소형 요트의 기초부터 고급까지 단계별 교육 프로그램</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="education-overview">
                    <h2>딩기 요트 교육 소개</h2>
                    <p>
                        딩기 요트는 오로지 바람의 힘만으로 이용하여 항해하는 소형 요트로, 요트의
                        기본 원리를 가장 잘 이해할 수 있는 최적의 교육용 요트입니다. 순수한 세일링의
                        즐거움을 경험할 수 있습니다.
                    </p>
                </div>

                <div class="education-levels">
                    <h2>교육 단계</h2>
                    <div class="levels-grid">
                        <div class="level-card" v-for="level in educationLevels" :key="level.id">
                            <div class="level-header">
                                <div class="level-number">{{ level.level }}</div>
                                <h3>{{ level.name }}</h3>
                            </div>
                            <div class="level-content">
                                <p>{{ level.description }}</p>
                                <div class="curriculum">
                                    <h4>교육 내용</h4>
                                    <ul>
                                        <li v-for="item in level.curriculum" :key="item">
                                            {{ item }}
                                        </li>
                                    </ul>
                                </div>
                                <div class="level-info">
                                    <div class="info-item">
                                        <span class="label">교육 시간:</span>
                                        <span>{{ level.duration }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">교육 비용:</span>
                                        <span class="price">{{ level.price }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="level-up">
                            <h3>강사진 판단에 따라 기준에 부합하였을때 레벨업 가능</h3>
                        </div>
                    </div>
                </div>

                <div class="boats-info">
                    <h2>교육용 딩기 요트</h2>
                    <div class="boats-grid">
                        <div class="boat-card" v-for="boat in boats" :key="boat.name">
                            <div class="boat-image">
                                <img :src="boat.image" :alt="boat.name" />
                            </div>
                            <div class="boat-content">
                                <h3>{{ boat.name }}</h3>
                                <p>{{ boat.description }}</p>
                                <div class="boat-specs">
                                    <div class="spec-item">
                                        <span class="spec-label">승선 인원:</span>
                                        <span>{{ boat.capacity }}</span>
                                    </div>
                                    <div class="spec-item">
                                        <span class="spec-label">특징:</span>
                                        <span>{{ boat.features }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="safety-info">
                    <h2>안전 수칙</h2>
                    <div class="safety-grid">
                        <div class="safety-item">
                            <div class="safety-icon">🦺</div>
                            <h4>구명조끼 착용</h4>
                            <p>교육 중 항상 구명조끼를 착용해야 합니다</p>
                        </div>
                        <div class="safety-item">
                            <div class="safety-icon">👨‍🏫</div>
                            <h4>강사 지시 준수</h4>
                            <p>안전을 위해 강사의 지시를 반드시 따라야 합니다</p>
                        </div>
                        <div class="safety-item">
                            <div class="safety-icon">🌊</div>
                            <h4>기상 조건 확인</h4>
                            <p>악천후 시 교육이 연기될 수 있습니다</p>
                        </div>
                    </div>
                </div>

                <div class="action-section">
                    <button class="apply-btn" @click="goToApplication">교육 신청하기</button>
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
    name: 'DinghyEducation',
    setup() {
        const toast = useToast()
        const router = useRouter()
        
        const goToApplication = () => {
            router.push('/education-apply')
        }
        
        const contactUs = () => {
            toast.tip('전화: 055-641-5051~2\n운영시간: 09:00~18:00', '⛵ 딩기 교육 문의')
        }
        
        return {
            goToApplication,
            contactUs
        }
    },
    data() {
        return {
            educationLevels: [
                {
                    id: 1,
                    level: 'LV.1',
                    name: '토파즈 우노 기초',
                    description: '딩기 요트의 기본 조작법을 배우는 입문 과정',
                    curriculum: [
                        '딩기 요트 구조 이해',
                        '기본 세일링 이론',
                        '풍향과 풍속 이해',
                        '기본 조타법',
                        '캡사이즈(전복, 복원)',
                    ],
                    duration: '1일 (7시간)',
                    price: '70,000원',
                },
                {
                    id: 2,
                    level: 'LV.2',
                    name: '토파즈 우노 중급',
                    description: '기본 조작을 익혀 자유로운 항해를 배우는 과정',
                    curriculum: [
                        '택킹과 자이빙',
                        '풍상 항해법',
                        '정밀 조타 기술',
                        '응급 상황 대처법',
                        '독립 항해 실습',
                    ],
                    duration: '1일 (7시간)',
                    price: '70,000원',
                },
                {
                    id: 3,
                    level: 'LV.3',
                    name: '토파즈 우노 고급',
                    description: '경쟁 항해와 고급 기술을 배우는 상급 과정',
                    curriculum: [
                        '레이싱 기술',
                        '고급 세일 트림',
                        '전술적 항해',
                        '기상 판독',
                        '경기 규칙',
                    ],
                    duration: '1일 (7시간)',
                    price: '70,000원',
                },
            ],
            boats: [
                {
                    name: '토파즈 우노',
                    description: '초보자를 위한 안전하고 안정적인 교육용 딩기',
                    length: '3.4m',
                    capacity: '1~2명',
                    features: '안정성, 조작 용이성',
                    image: '/images/toppers-uno.jpg',
                },
                {
                    name: '토파즈 오메가',
                    description: '중급자를 위한 고성능 교육용 딩기',
                    length: '3.8m',
                    capacity: '2~5명',
                    features: '고성능, 스포츠 지향',
                    image: '/images/toppers-omega.jpg',
                },
                {
                    name: '호비 겟어웨이',
                    description: '쌍동선 형태의 카타마란 딩기',
                    length: '4.2m',
                    capacity: '2~6명',
                    features: '고속 항해, 스릴',
                    image: '/images/hobie-caterkay.jpg',
                },
            ],
        };
    },
};
</script>

<style scoped>
.dinghy-education {
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

.levels-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
}

.level-card {
    background: white;
    border: 2px solid #f0f0f0;
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s;
}

.level-card:hover {
    border-color: #2c5aa0;
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(44, 90, 160, 0.1);
}

.level-header {
    background: linear-gradient(135deg, #2c5aa0, #1e3d6f);
    color: white;
    padding: 25px;
    text-align: center;
}

.level-number {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 10px;
}

.level-header h3 {
    margin: 0;
    font-size: 1.3rem;
}

.level-content {
    padding: 25px;
}

.level-content > p {
    color: #666;
    margin-bottom: 25px;
    line-height: 1.6;
}

.curriculum h4 {
    color: #2c5aa0;
    margin-bottom: 15px;
    font-size: 1.1rem;
}

.curriculum ul {
    list-style: none;
    padding: 0;
    margin-bottom: 25px;
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

.level-info {
    border-top: 1px solid #f0f0f0;
    padding-top: 20px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.level-up {
    display: flex;
    position: static;
    color: crimson;
    text-align: center;
    justify-content: center;
    margin: 20px 0;
    grid-column: 1 / -1;
}

.label {
    font-weight: 600;
    color: #333;
}

.price {
    color: #2c5aa0;
    font-weight: bold;
    font-size: 1.1rem;
}

.boats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.boat-card {
    background: #f8f9fa;
    border-radius: 15px;
    overflow: hidden;
    transition: transform 0.3s;
}

.boat-card:hover {
    transform: translateY(-5px);
}

.boat-image {
    height: 200px;
    overflow: hidden;
}

.boat-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.boat-content {
    padding: 25px;
}

.boat-content h3 {
    color: #2c5aa0;
    margin-bottom: 15px;
    font-size: 1.3rem;
}

.boat-content > p {
    color: #666;
    margin-bottom: 20px;
    line-height: 1.6;
}

.boat-specs {
    border-top: 1px solid #e0e0e0;
    padding-top: 15px;
}

.spec-item {
    display: flex;
    margin-bottom: 8px;
}

.spec-label {
    font-weight: 600;
    color: #333;
    min-width: 80px;
}

.safety-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 25px;
}

.safety-item {
    text-align: center;
    padding: 25px;
    background: #f8f9fa;
    border-radius: 15px;
}

.safety-icon {
    font-size: 3rem;
    margin-bottom: 15px;
}

.safety-item h4 {
    color: #2c5aa0;
    margin-bottom: 15px;
    font-size: 1.2rem;
}

.safety-item p {
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

    .levels-grid,
    .boats-grid,
    .safety-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .action-section {
        flex-direction: column;
        align-items: center;
    }

    .info-item,
    .spec-item {
        flex-direction: column;
        text-align: center;
        gap: 5px;
    }
}
</style>
