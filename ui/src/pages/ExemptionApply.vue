<template>
    <div class="exemption-apply">
        <!-- 히어로 섹션 -->
        <section class="hero-section">
            <div class="hero-background">
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <h1 class="hero-title">면제교육 신청</h1>
                <p class="hero-subtitle">요트면허 면제교육 신청을 위한 온라인 접수</p>
            </div>
        </section>

        <!-- 메인 컨텐츠 -->
        <section class="main-content">
            <div class="container">
                <div class="content-header">
                    <h2>면제교육 신청서</h2>
                    <p>
                        통영요트학교의 면제교육 신청서를 작성해주세요. 모든 항목을 정확히
                        입력해주시기 바랍니다.
                    </p>
                </div>

                <!-- ExemptionForm 컴포넌트 사용 -->
                <ExemptionForm />

                <!-- 추가 안내사항 -->
                <div class="info-section">
                    <h3>신청 안내사항</h3>
                    <div class="info-grid">
                        <div class="info-card">
                            <div class="info-icon">📋</div>
                            <h4>신청 절차</h4>
                            <ul>
                                <li>온라인 신청서 작성</li>
                                <li>관리자 승인 대기</li>
                                <li>교육비 납부</li>
                                <li>교육 참석</li>
                                <li class="warning-item">⚠️ 거동이 불편한 자는 신청할 수 없음</li>
                            </ul>
                        </div>
                        <div class="info-card">
                            <div class="info-icon">💰</div>
                            <h4>교육비 안내</h4>
                            <ul>
                                <li>면제교육: 70만원</li>
                                <li>실기 연수: 50만원</li>
                                <li>납부 방법: 계좌이체</li>
                                <li>환불 규정 준수</li>
                            </ul>
                        </div>
                        <div class="info-card">
                            <div class="info-icon">📞</div>
                            <h4>문의사항</h4>
                            <ul>
                                <li>전화: 055-641-5051~2</li>
                                <li>운영시간: 09:00~18:00</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- 뒤로가기 버튼 -->
                <div class="back-section">
                    <button @click="goHome" class="back-btn">← 홈으로 돌아가기</button>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import ExemptionForm from '../components/ExemptionForm.vue';

export default {
    name: 'ExemptionApply',
    components: {
        ExemptionForm,
    },
    methods: {
        goHome() {
            this.$router.push('/');
        },
    },
};
</script>

<style scoped>
.exemption-apply {
    padding-top: 70px;
}

/* 히어로 섹션 */
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

/* 메인 컨텐츠 */
.main-content {
    padding: 60px 0;
    background: #f8f9fa;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.content-header {
    text-align: center;
    margin-bottom: 50px;
}

.content-header h2 {
    font-size: 2.5rem;
    color: #2c5aa0;
    margin-bottom: 15px;
}

.content-header p {
    font-size: 1.1rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
}

/* 안내사항 섹션 */
.info-section {
    margin: 80px 0 60px;
    background: white;
    border-radius: 15px;
    padding: 50px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.info-section h3 {
    font-size: 2rem;
    color: #2c5aa0;
    text-align: center;
    margin-bottom: 40px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.info-card {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 30px;
    text-align: center;
    transition:
        transform 0.3s,
        box-shadow 0.3s;
}

.info-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(44, 90, 160, 0.15);
}

.info-icon {
    font-size: 3rem;
    margin-bottom: 20px;
}

.info-card h4 {
    font-size: 1.3rem;
    color: #2c5aa0;
    margin-bottom: 20px;
}

.info-card ul {
    list-style: none;
    padding: 0;
    text-align: left;
}

.info-card li {
    padding: 8px 0;
    border-bottom: 1px solid #e0e0e0;
    position: relative;
    padding-left: 20px;
}

.info-card li:last-child {
    border-bottom: none;
}

.info-card li:before {
    content: '•';
    color: #2c5aa0;
    position: absolute;
    left: 0;
    font-weight: bold;
}

.warning-item {
    color: #dc3545 !important;
    font-weight: 600;
    background: rgba(220, 53, 69, 0.1);
    padding: 8px 12px;
    border-radius: 6px;
    margin-top: 8px;
}

.warning-item:before {
    content: '';
    color: #dc3545;
}

/* 뒤로가기 섹션 */
.back-section {
    text-align: center;
    margin-top: 60px;
    padding-top: 40px;
    border-top: 1px solid #e0e0e0;
}

.back-btn {
    padding: 15px 30px;
    background: white;
    color: #2c5aa0;
    border: 2px solid #2c5aa0;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.back-btn:hover {
    background: #2c5aa0;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(44, 90, 160, 0.3);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
    .hero-title {
        font-size: 2.2rem;
    }

    .hero-subtitle {
        font-size: 1.1rem;
    }

    .content-header h2 {
        font-size: 2rem;
    }

    .info-section {
        padding: 30px 20px;
    }

    .info-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .info-card {
        padding: 25px;
    }
}
</style>
