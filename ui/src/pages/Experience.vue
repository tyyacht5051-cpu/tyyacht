<template>
    <!-- 프로그램 이용안내 테이블 -->
    <section>
        <div class="table-container">
            <h1 class="table-title">< 프로그램 이용안내 ></h1>
            <table class="program-table">
                <thead>
                    <tr>
                        <th>구분</th>
                        <th>요트/기구명</th>
                        <th>상세내용</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td rowspan="3" class="program-type">크루즈 요트 교육/체험</td>
                        <td>바다의땅 3호(35인승)</td>
                        <td>
                            <button class="detail-btn" @click="goToDetail('cruise-education')">
                                확인하기
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td>바다의땅 5호(12인승)</td>
                        <td>
                            <button class="detail-btn" @click="goToDetail('cruise-education')">
                                확인하기
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td>바다의땅 6호(12인승)</td>
                        <td>
                            <button class="detail-btn" @click="goToDetail('cruise-experience')">
                                확인하기
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td rowspan="2" class="program-type">딩기 요트 교육/체험</td>
                        <td>호비 캣어케이</td>
                        <td>
                            <button class="detail-btn" @click="goToDetail('dinghy-education')">
                                확인하기
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td>토퍼스 오메가</td>
                        <td>
                            <button class="detail-btn" @click="goToDetail('dinghy-experience')">
                                확인하기
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td rowspan="2" class="program-type">패들보드 교육/체험</td>
                        <td>6인승 패들보드</td>
                        <td>
                            <button class="detail-btn" @click="goToDetail('paddleboard-experience')">
                                확인하기
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td>1인승 패들보드</td>
                        <td>
                            <button class="detail-btn" @click="goToDetail('paddleboard-experience')">
                                확인하기
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="apply-button-container">
                <button class="apply-button" @click="goToApplication">신청하기</button>
            </div>
        </div>
    </section>

    <!-- 프로그램 요금안내 테이블 -->
    <section>
        <div class="table-container">
            <h1 class="table-title">< 프로그램 요금안내 ></h1>
            <table class="price-table">
                <thead>
                    <tr>
                        <th>구분</th>
                        <th>프로그램 명</th>
                        <th>이용시간</th>
                        <th>비용</th>
                        <th>비고</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td rowspan="9" class="program-type">크루즈 요트 교육/체험</td>
                        <td>한산대첩 승전항로 (1h)</td>
                        <td>1h</td>
                        <td>1인 25,000원</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>한산대첩 승전항로 (1h 30m)</td>
                        <td>1h 30m</td>
                        <td>1인 30,000원</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>이순신 역사 탐방</td>
                        <td>2h</td>
                        <td>1인 35,000원</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>힐링 통영 "섬" 탐방 (4시간)</td>
                        <td>4h</td>
                        <td>1인 80,000원</td>
                        <td>안전도,비진도,욕지도,매물도,사량도</td>
                    </tr>
                    <tr>
                        <td>힐링 통영 "섬" 탐방 (8시간)</td>
                        <td>8h</td>
                        <td>1인 120,000원</td>
                        <td>안전도,비진도,욕지도,매물도,사량도</td>
                    </tr>
                    <tr>
                        <td>선셋 체험</td>
                        <td>1h 30m</td>
                        <td>1인 35,000원</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>호핑 체험</td>
                        <td>5h</td>
                        <td>1인 60,000원</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>섬 간(코스탈 레이스)교육 (1박)</td>
                        <td>1d</td>
                        <td>300,000원 부터</td>
                        <td>사량도 코스, 매물도코스</td>
                    </tr>
                    <tr>
                        <td>섬 간(코스탈 레이스)교육 (2박)</td>
                        <td>2d</td>
                        <td>450,000원 부터</td>
                        <td>사량도 코스, 매물도코스</td>
                    </tr>
                    <tr>
                        <td rowspan="5" class="program-type">딩기 요트 교육/체험</td>
                        <td>호비 캣어케이</td>
                        <td>2h</td>
                        <td>문의 필요</td>
                        <td>문의 필요</td>
                    </tr>
                    <tr>
                        <td>토퍼스 우노 LV.1</td>
                        <td>1d(7h)</td>
                        <td>1인 70,000원</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>토퍼스 우노 LV.2</td>
                        <td>1d(7h)</td>
                        <td>1인 70,000원</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>토퍼스 우노 LV.3</td>
                        <td>1d(7h)</td>
                        <td>1인 70,000원</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>토퍼스 오메가</td>
                        <td>2h</td>
                        <td>문의 필요</td>
                        <td>문의 필요</td>
                    </tr>
                    <tr>
                        <td rowspan="2" class="program-type">패들보드 교육/체험</td>
                        <td>패들보드 6인용</td>
                        <td>2h</td>
                        <td>문의 필요</td>
                        <td>문의 필요</td>
                    </tr>
                    <tr>
                        <td>패들보드 1~2인용</td>
                        <td>2h</td>
                        <td>문의 필요</td>
                        <td>문의 필요</td>
                    </tr>
                </tbody>
            </table>
            <div class="price-note">
                <p>※ 상기 요금은 1인 기준입니다.</p>
                <p>※ 날씨 상황에 따라 운항이 취소될 수 있습니다.</p>
                <p>※ 사전 예약 필수 (전화: 055-641-5051~2)</p>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToApplication = () => {
    router.push('/experience-apply')
}

const goToDetail = (page: string) => {
    router.push(`/${page}`)
}
</script>

<style scoped>
section {
    text-align: center;
    margin-top: 100px;
}

.table-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    text-align: center;
}

/* 테이블 컨테이너 스타일 */
.table-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Noto Sans KR', sans-serif;
}

/* 프로그램 테이블 스타일 */
.program-table,
.price-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px auto;
    font-size: 16px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
}

.program-table th,
.price-table th {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white;
    padding: 15px 10px;
    text-align: center;
    font-weight: 600;
    font-size: 16px;
}

.program-table td,
.price-table td {
    padding: 12px 10px;
    text-align: center;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: middle;
}

.program-table tbody tr:nth-child(even),
.price-table tbody tr:nth-child(even) {
    background-color: #f8fafc;
}

.program-table tbody tr:hover,
.price-table tbody tr:hover {
    background-color: #e2e8f0;
    transition: background-color 0.3s ease;
}

.program-type {
    background-color: #f1f5f9 !important;
    font-weight: 600;
    color: #1e40af;
}

/* 확인하기 버튼 스타일 */
.detail-btn {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.detail-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.detail-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

/* 가격 안내 하단 설명 */
.price-note {
    margin-top: 20px;
    padding: 15px;
    background-color: #f8fafc;
    border-left: 4px solid #3b82f6;
    border-radius: 4px;
}

.price-note p {
    margin: 5px 0;
    color: #64748b;
    font-size: 14px;
    text-align: left;
}

/* 신청하기 버튼 스타일 */
.apply-button-container {
    text-align: center;
    margin-top: 30px;
    margin-bottom: 20px;
}

.apply-button {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white;
    border: none;
    padding: 15px 40px;
    font-size: 18px;
    font-weight: 600;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    font-family: 'Noto Sans KR', sans-serif;
}

.apply-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.apply-button:active {
    transform: translateY(0);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
    .table-container {
        max-width: 500px;
        padding: 15px;
    }

    .table-title {
        font-size: 1.5rem;
    }

    .program-table,
    .price-table {
        font-size: 14px;
    }

    .program-table th,
    .price-table th {
        padding: 10px 5px;
        font-size: 14px;
    }

    .program-table td,
    .price-table td {
        padding: 8px 5px;
    }

    .detail-btn {
        padding: 6px 12px;
        font-size: 12px;
    }

    .apply-button {
        padding: 12px 30px;
        font-size: 16px;
    }
}

@media (max-width: 480px) {
    section {
        margin-top: 80px;
        padding: 0 15px;
    }

    .table-container {
        padding: 10px;
    }

    .table-title {
        font-size: 1.2rem;
    }

    .program-table,
    .price-table {
        font-size: 12px;
    }

    .program-table th,
    .price-table th {
        padding: 8px 3px;
        font-size: 12px;
    }

    .program-table td,
    .price-table td {
        padding: 6px 3px;
    }

    .detail-btn {
        padding: 4px 8px;
        font-size: 10px;
    }

    .price-note {
        padding: 10px;
    }

    .price-note p {
        font-size: 12px;
    }

    .apply-button {
        padding: 10px 25px;
        font-size: 14px;
    }
}
</style>