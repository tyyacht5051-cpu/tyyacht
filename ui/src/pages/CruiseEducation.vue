<template>
    <div class="cruise-education">
        <section class="hero-section">
            <div class="hero-background">
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <h1 class="hero-title">크루져 요트 교육</h1>
                <p class="hero-subtitle">전문 강사와 함께하는 체계적인 크루져 요트 교육 프로그램</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="program-info">
                    <h2>교육 프로그램 소개</h2>
                    <p>
                        크루져 요트 교육은 대형 요트의 조종법부터 항해술까지 체계적으로 배울 수 있는
                        전문 교육 과정입니다. 경험이 풍부한 전문 강사진이 안전하고 효과적인 교육을
                        제공합니다.
                    </p>

                    <div class="curriculum">
                        <h3>교육 커리큘럼</h3>
                        <div class="curriculum-grid">
                            <div class="curriculum-item">
                                <div class="step-number">01</div>
                                <h4>기초 이론 교육</h4>
                                <p>요트의 구조, 항해 원리, 안전 규칙 학습</p>
                            </div>
                            <div class="curriculum-item">
                                <div class="step-number">02</div>
                                <h4>실습 교육</h4>
                                <p>돛 조작, 조타법, 정박법 실습</p>
                            </div>
                            <div class="curriculum-item">
                                <div class="step-number">03</div>
                                <h4>항해 실습</h4>
                                <p>실제 바다에서의 항해 경험</p>
                            </div>
                        </div>
                    </div>

                    <div class="program-details">
                        <h3>프로그램 상세 정보</h3>
                        <div class="programs-table">
                            <table class="detail-table">
                                <thead>
                                    <tr>
                                        <th>프로그램명</th>
                                        <th>교육기간</th>
                                        <th>교육비용</th>
                                        <th>비고</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>요트 자격증 면제 교육</td>
                                        <td>5일(40시간)</td>
                                        <td>요트면허취득과정 참고</td>
                                        <td>자격증 취득 가능</td>
                                    </tr>
                                    <tr>
                                        <td>실기 시험 연수 과정</td>
                                        <td>2일(12시간)</td>
                                        <td>요트면허취득과정 참고</td>
                                        <td>실무 중심 교육</td>
                                    </tr>
                                    <tr>
                                        <td>크루져 초급과정</td>
                                        <td>1일(7시간)</td>
                                        <td>1인 100,000원</td>
                                        <td>기초 과정</td>
                                    </tr>
                                    <tr>
                                        <td>크루져 중급과정</td>
                                        <td>2일(14시간)</td>
                                        <td>1인 200,000원</td>
                                        <td>중급자 대상</td>
                                    </tr>
                                    <tr>
                                        <td>크루져 고급과정</td>
                                        <td>2일(14시간)</td>
                                        <td>1인 300,000원</td>
                                        <td>고급자 대상</td>
                                    </tr>
                                    <tr>
                                        <td rowspan="2">섬 간(코스탈 레이스)항해 교육</td>
                                        <td>1박 2일</td>
                                        <td>300,000원부터</td>
                                        <td>사량도/매물도 코스</td>
                                    </tr>
                                    <tr>
                                        <td>2박 3일</td>
                                        <td>450,000원부터</td>
                                        <td>사량도/매물도 코스</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="additional-info">
                            <h4>📋 추가 안내사항</h4>
                            <div class="info-cards">
                                <div class="info-card">
                                    <div class="card-icon">👥</div>
                                    <div class="card-content">
                                        <h5>참여 인원</h5>
                                        <p>
                                            최소 모집인원이 정해진 프로그램이 있으니 신청 전 필히
                                            문의하시기 바랍니다.
                                        </p>
                                    </div>
                                </div>
                                <div class="info-card">
                                    <div class="card-icon">🎒</div>
                                    <div class="card-content">
                                        <h5>준비물</h5>
                                        <p>편한 복장, 운동화, 모자, 선크림</p>
                                    </div>
                                </div>
                                <div class="info-card">
                                    <div class="card-icon">📍</div>
                                    <div class="card-content">
                                        <h5>교육 장소</h5>
                                        <p>통영요트학교 및 실습해역</p>
                                    </div>
                                </div>
                                <div class="info-card">
                                    <div class="card-icon">📞</div>
                                    <div class="card-content">
                                        <h5>예약 문의</h5>
                                        <p>055-641-5051~2</p>
                                    </div>
                                </div>
                            </div>

                            <div class="notice-box">
                                <div class="notice-icon">⚠️</div>
                                <div class="notice-content">
                                    <h5>중요 안내</h5>
                                    <ul>
                                        <li>날씨 상황에 따라 교육이 연기/취소될 수 있습니다</li>
                                        <li>사전 예약 없이는 참여가 불가능합니다</li>
                                        <li>교육 시작 30분 전까지 도착해주세요</li>
                                        <li>안전을 위해 음주 후 참여는 금지됩니다</li>
                                    </ul>
                                </div>
                            </div>
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
import { useToast } from '../components/Toast.vue';
import { useRouter } from 'vue-router';

export default {
    name: 'CruiseEducation',
    setup() {
        const toast = useToast();
        const router = useRouter();

        const goToApplication = () => {
            router.push('/education-apply');
        };

        const contactUs = () => {
            toast.tip('전화: 055-641-5051~2\n운영시간: 09:00~18:00', '🚢 크루져 교육 문의');
        };

        return {
            goToApplication,
            contactUs,
        };
    },
};
</script>

<style scoped>
.cruise-education {
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
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
}

.program-info h2,
.program-info h3 {
    color: #2c5aa0;
    margin-bottom: 20px;
}

.program-info h2 {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 30px;
}

.program-info > p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #666;
    margin-bottom: 50px;
    text-align: center;
}

.curriculum {
    margin-bottom: 50px;
}

.curriculum-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    margin-top: 30px;
}

.curriculum-item {
    text-align: center;
    padding: 30px 20px;
    border-radius: 15px;
    background: #f8f9fa;
    transition: transform 0.3s;
}

.curriculum-item:hover {
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
    margin: 0 auto 20px;
}

.curriculum-item h4 {
    color: #2c5aa0;
    margin-bottom: 15px;
    font-size: 1.2rem;
}

.curriculum-item p {
    color: #666;
    line-height: 1.6;
}

.program-details {
    margin-bottom: 50px;
}

.details-table {
    background: #f8f9fa;
    border-radius: 15px;
    padding: 30px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #e0e0e0;
}

.detail-row:last-child {
    border-bottom: none;
}

.label {
    font-weight: 600;
    color: #2c5aa0;
    flex: 1;
}

.value {
    color: #666;
    flex: 2;
    text-align: right;
}

/* 프로그램 테이블 스타일 */
.programs-table {
    margin-top: 20px;
    overflow-x: auto;
}

.detail-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.detail-table th {
    background: linear-gradient(135deg, #2c5aa0, #1e3d6f);
    color: white;
    padding: 15px 12px;
    text-align: center;
    font-weight: 600;
    font-size: 1rem;
}

.detail-table td {
    padding: 12px;
    text-align: center;
    border-bottom: 1px solid #e0e0e0;
    vertical-align: middle;
}

.detail-table tbody tr:nth-child(even) {
    background-color: #f8f9fa;
}

.detail-table tbody tr:hover {
    background-color: #e2e8f0;
    transition: background-color 0.3s ease;
}

.additional-info {
    margin-top: 30px;
    background: linear-gradient(135deg, #f8f9fa, #e3f2fd);
    padding: 30px;
    border-radius: 20px;
    border: 1px solid #e0e0e0;
}

.additional-info h4 {
    color: #2c5aa0;
    margin-bottom: 25px;
    font-size: 1.4rem;
    text-align: center;
    font-weight: 700;
}

.info-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.info-card {
    background: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(44, 90, 160, 0.1);
    display: flex;
    align-items: flex-start;
    gap: 15px;
    transition: all 0.3s ease;
    border: 1px solid #f0f0f0;
}

.info-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(44, 90, 160, 0.15);
    border-color: #2c5aa0;
}

.card-icon {
    font-size: 2rem;
    flex-shrink: 0;
    margin-top: 5px;
}

.card-content h5 {
    color: #2c5aa0;
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    font-weight: 600;
}

.card-content p {
    color: #666;
    margin: 0;
    line-height: 1.5;
    font-size: 0.95rem;
}

.notice-box {
    background: linear-gradient(135deg, #fff3cd, #ffeaa7);
    border: 2px solid #f39c12;
    border-radius: 15px;
    padding: 20px;
    display: flex;
    align-items: flex-start;
    gap: 15px;
}

.notice-icon {
    font-size: 2rem;
    flex-shrink: 0;
}

.notice-content h5 {
    color: #d35400;
    margin: 0 0 15px 0;
    font-size: 1.2rem;
    font-weight: 600;
}

.notice-content ul {
    margin: 0;
    padding-left: 20px;
    color: #8b4513;
}

.notice-content li {
    margin-bottom: 8px;
    line-height: 1.4;
}

.notice-content li:last-child {
    margin-bottom: 0;
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

    .curriculum-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .value {
        text-align: left;
    }

    .action-section {
        flex-direction: column;
        align-items: center;
    }

    .programs-table {
        overflow-x: scroll;
    }

    .detail-table {
        font-size: 0.9rem;
    }

    .detail-table th,
    .detail-table td {
        padding: 8px 6px;
    }

    .info-cards {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .info-card {
        padding: 15px;
    }

    .card-content h5 {
        font-size: 1rem;
    }

    .card-content p {
        font-size: 0.9rem;
    }

    .notice-box {
        flex-direction: column;
        text-align: center;
        gap: 10px;
    }

    .notice-content {
        text-align: left;
    }
}
</style>
