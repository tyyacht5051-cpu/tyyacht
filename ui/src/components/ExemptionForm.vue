<template>
    <div class="exemption-form">
        <form @submit.prevent="submitForm" class="form-container">
            <div class="form-header">
                <h2>면제교육 신청서</h2>
                <p>요트면허 면제교육 신청을 위한 정보를 입력해주세요</p>
            </div>

            <!-- 개인정보 섹션 -->
            <div class="form-section">
                <h3>개인정보</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="name">성명 *</label>
                        <input
                            type="text"
                            id="name"
                            v-model="form.name"
                            required
                            placeholder="예: 김요트"
                        />
                    </div>
                    <div class="form-group">
                        <label for="birthDate">생년월일 *</label>
                        <input type="date" id="birthDate" v-model="form.birthDate" required />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="gender">성별 *</label>
                        <select id="gender" v-model="form.gender" required>
                            <option value="">선택해주세요</option>
                            <option value="male">남성</option>
                            <option value="female">여성</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="phone">연락처 *</label>
                        <input
                            type="tel"
                            id="phone"
                            v-model="form.phone"
                            required
                            placeholder="010-1234-5678"
                        />
                    </div>
                </div>

                <div class="form-group">
                    <label for="email">이메일</label>
                    <input
                        type="email"
                        id="email"
                        v-model="form.email"
                        placeholder="example@email.com (선택사항)"
                    />
                </div>

                <div class="form-group">
                    <label for="address">주소 *</label>
                    <input
                        type="text"
                        id="address"
                        v-model="form.address"
                        required
                        placeholder="전체 주소를 입력해주세요"
                    />
                </div>

                <div class="form-group">
                    <label for="license">자격증 보유 유무</label>
                    <select id="license" v-model="form.license">
                        <option value="">선택해주세요</option>
                        <option value="general1">일반 조종 1급</option>
                        <option value="general2">일반 조종 2급</option>
                    </select>
                </div>
            </div>

            <!-- 교육과정 섹션 -->
            <div class="form-section">
                <h3>신청 교육과정</h3>
                <div class="course-options">
                    <label class="course-option">
                        <input
                            type="radio"
                            name="course"
                            value="general"
                            v-model="form.courseType"
                            required
                        />
                        <span class="course-info">
                            <strong>면제교육</strong>
                            <span class="course-price">70만원</span>
                            <p>5일 과정 (이론 + 실기)</p>
                        </span>
                    </label>
                    <label class="course-option">
                        <input
                            type="radio"
                            name="course"
                            value="practical"
                            v-model="form.courseType"
                            required
                        />
                        <span class="course-info">
                            <strong>실기 연수</strong>
                            <span class="course-price">50만원</span>
                            <p>3일 과정 (실기 위주)</p>
                        </span>
                    </label>
                </div>
            </div>

            <!-- 교육일정 섹션 -->
            <div class="form-section">
                <h3>교육일정</h3>
                <div class="form-group">
                    <label>교육일정 * (최대 5일 선택 가능)</label>
                    <div class="calendar-container">
                        <div class="month-navigation">
                            <button type="button" @click="previousMonth" class="nav-btn">
                                &lt;
                            </button>
                            <h4>{{ currentMonthYear }}</h4>
                            <button type="button" @click="nextMonth" class="nav-btn">&gt;</button>
                        </div>

                        <div class="calendar">
                            <div class="calendar-header">
                                <div class="day-header">일</div>
                                <div class="day-header">월</div>
                                <div class="day-header">화</div>
                                <div class="day-header">수</div>
                                <div class="day-header">목</div>
                                <div class="day-header">금</div>
                                <div class="day-header">토</div>
                            </div>

                            <div class="calendar-body">
                                <div
                                    v-for="day in calendarDays"
                                    :key="day.date"
                                    :class="[
                                        'calendar-day',
                                        {
                                            'other-month': !day.isCurrentMonth,
                                            selected: day.isSelected,
                                            available: day.isAvailable,
                                            disabled:
                                                !day.isAvailable ||
                                                !day.isCurrentMonth ||
                                                day.isPast,
                                        },
                                    ]"
                                    @click="toggleDateSelection(day)"
                                >
                                    {{ day.day }}
                                </div>
                            </div>
                        </div>

                        <div class="selected-dates" v-if="selectedDates.length > 0">
                            <h5>선택된 날짜 ({{ selectedDates.length }}/5)</h5>
                            <div class="date-tags">
                                <span
                                    v-for="date in selectedDates"
                                    :key="date"
                                    class="date-tag"
                                    @click="removeSelectedDate(date)"
                                >
                                    {{ formatSelectedDate(date) }}
                                    <span class="remove-btn">×</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="discountEligibility">할인 혜택 가능여부</label>
                    <select id="discountEligibility" v-model="form.discountEligibility">
                        <option value="">해당사항 없음</option>
                        <option value="tongyeong">통영시민할인 20%</option>
                        <option value="partner">협력단체 20%</option>
                        <option value="disabled">장애인할인 50%</option>
                    </select>
                </div>
            </div>

            <!-- 개인정보 동의 섹션 -->
            <div class="form-section">
                <h3>개인정보 처리 동의</h3>
                <div class="agreement-box">
                    <label class="checkbox-group">
                        <input type="checkbox" v-model="form.privacyAgreed" required />
                        <span>개인정보 수집 및 이용에 동의합니다 *</span>
                    </label>
                    <div class="agreement-details">
                        <p><strong>수집 목적:</strong> 면제교육 신청 접수 및 처리</p>
                        <p><strong>수집 항목:</strong> 성명, 생년월일, 연락처, 이메일, 주소</p>
                        <p><strong>보유 기간:</strong> 교육 완료 후 1년</p>
                    </div>
                </div>
            </div>

            <!-- 제출 버튼 -->
            <div class="form-actions">
                <button type="button" class="btn-cancel" @click="resetForm">초기화</button>
                <button type="submit" class="btn-submit" :disabled="isSubmitting">
                    {{ isSubmitting ? '제출 중...' : '신청서 제출' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue';
import { useToast } from './Toast.vue';
import { API_BASE_URL } from '../config/env.js';
import axios from 'axios';

// Toast 알림
const toast = useToast();

// 폼 데이터
const form = reactive({
    name: '',
    birthDate: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    license: '',
    courseType: '',
    preferredDates: [] as string[],
    discountEligibility: '',
    experience: 'none',
    motivation: '',
    privacyAgreed: false,
});

const availableDates = ref<string[]>([]);
const selectedDates = ref<string[]>([]);
const currentDate = ref(new Date());

// 제출 상태
const isSubmitting = ref(false);

// 계산된 속성들
const currentMonthYear = computed(() => {
    return currentDate.value.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
});

interface CalendarDay {
    date: string;
    day: number;
    isCurrentMonth: boolean;
    isPast: boolean;
    isAvailable: boolean;
    isSelected: boolean;
}

const calendarDays = computed((): CalendarDay[] => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        const dateString = date.toISOString().split('T')[0];
        const isCurrentMonth = date.getMonth() === month;
        const isPast = date < today;
        const isAvailable = availableDates.value.includes(dateString);
        const isSelected = selectedDates.value.includes(dateString);

        days.push({
            date: dateString,
            day: date.getDate(),
            isCurrentMonth,
            isPast,
            isAvailable,
            isSelected,
        });
    }

    return days;
});

// 폼 제출
const submitForm = async () => {
    // 선택된 날짜를 폼에 반영
    form.preferredDates = selectedDates.value;

    if (!validateForm()) {
        return;
    }

    isSubmitting.value = true;

    try {
        // 백엔드 API가 기대하는 필드명으로 변환
        const submitData = {
            name: form.name,
            phone: form.phone,
            email: form.email,
            birthDate: form.birthDate,
            gender: form.gender,
            address: form.address,
            license: form.license,
            courseType: form.courseType,
            preferredDates: form.preferredDates,
            discountEligibility: form.discountEligibility,
        };

        const response = await axios.post(`${API_BASE_URL}/api/applications/exemption`, submitData);

        if (response.status === 201 && response.data.id) {
            toast.success(
                response.data.message || '면제교육 신청이 성공적으로 접수되었습니다!',
                '신청 완료'
            );
            resetForm();
        }
    } catch (error) {
        toast.error('신청 중 오류가 발생했습니다. 다시 시도해주세요.', '신청 오류');
    } finally {
        isSubmitting.value = false;
    }
};

// 폼 검증
const validateForm = (): boolean => {
    if (!form.name.trim()) {
        toast.error('성명을 입력해주세요.');
        return false;
    }

    if (!form.birthDate) {
        toast.error('생년월일을 선택해주세요.');
        return false;
    }

    if (!form.phone.trim()) {
        toast.error('연락처를 입력해주세요.');
        return false;
    }

    const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;
    if (!phoneRegex.test(form.phone.replace(/-/g, ''))) {
        toast.error('올바른 연락처 형식으로 입력해주세요.');
        return false;
    }

    // 이메일이 입력된 경우에만 형식 검증
    if (form.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            toast.error('올바른 이메일 형식으로 입력해주세요.');
            return false;
        }
    }

    if (!form.courseType) {
        toast.error('교육과정을 선택해주세요.');
        return false;
    }

    if (selectedDates.value.length === 0) {
        toast.error('교육일정을 최소 1일 이상 선택해주세요.');
        return false;
    }

    // 할인 혜택은 선택사항이므로 검증하지 않음

    if (!form.privacyAgreed) {
        toast.error('개인정보 처리 동의가 필요합니다.');
        return false;
    }

    return true;
};

// 폼 초기화
const resetForm = () => {
    Object.assign(form, {
        name: '',
        birthDate: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        license: '',
        courseType: '',
        preferredDates: [],
        discountEligibility: '',
        experience: 'none',
        motivation: '',
        privacyAgreed: false,
    });
    selectedDates.value = [];
    toast.info('폼이 초기화되었습니다.');
};

// 가능한 날짜 로드
const loadAvailableDates = async () => {
    try {
        const dates: string[] = [];
        const today = new Date();

        for (let i = 0; i < 6; i++) {
            // 현재월부터 6개월간
            const targetMonth = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const monthKey = `${targetMonth.getFullYear()}-${String(targetMonth.getMonth() + 1).padStart(2, '0')}`;

            try {
                const response = await axios.get(
                    `${API_BASE_URL}/api/schedules/available/${monthKey}`
                );
                const availableMonthDates: string[] = response.data.dates || [];
                dates.push(...availableMonthDates);
            } catch (error) {
                console.error(`Failed to load dates for ${monthKey}:`, error);
            }
        }

        availableDates.value = dates.sort();
    } catch (error) {
        console.error('Failed to load available dates:', error);
        toast.error('교육 가능 날짜를 불러오는데 실패했습니다.');
    }
};

// 달력 네비게이션
const previousMonth = () => {
    currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() - 1,
        1
    );
};

const nextMonth = () => {
    currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        1
    );
};

// 날짜 선택 토글
const toggleDateSelection = (day: CalendarDay) => {
    if (!day.isAvailable || !day.isCurrentMonth || day.isPast) return;

    const dateIndex = selectedDates.value.indexOf(day.date);

    if (dateIndex > -1) {
        selectedDates.value.splice(dateIndex, 1);
    } else if (selectedDates.value.length < 5) {
        selectedDates.value.push(day.date);
        selectedDates.value.sort();
    } else {
        toast.error('최대 5일까지만 선택할 수 있습니다.');
    }
};

// 선택된 날짜 제거
const removeSelectedDate = (date: string) => {
    const index = selectedDates.value.indexOf(date);
    if (index > -1) {
        selectedDates.value.splice(index, 1);
    }
};

// 선택된 날짜 포맷팅
const formatSelectedDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
    });
};

// 컴포넌트 마운트 시 가능한 날짜 로드
onMounted(() => {
    loadAvailableDates();
});
</script>

<style scoped>
.exemption-form {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.form-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 40px;
}

.form-header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;
}

.form-header h2 {
    color: #2c5aa0;
    font-size: 2rem;
    margin-bottom: 10px;
}

.form-header p {
    color: #666;
    font-size: 1.1rem;
}

.form-section {
    margin-bottom: 35px;
}

.form-section h3 {
    color: #2c5aa0;
    font-size: 1.3rem;
    margin-bottom: 20px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e0e0e0;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    transition:
        border-color 0.3s,
        box-shadow 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #2c5aa0;
    box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
}

.course-options {
    display: grid;
    gap: 15px;
}

.course-option {
    display: flex;
    align-items: flex-start;
    padding: 20px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
}

.course-option:hover {
    border-color: #2c5aa0;
    background: rgba(44, 90, 160, 0.02);
}

.course-option input[type='radio'] {
    width: auto;
    margin: 4px 16px 0 0;
}

.course-info {
    flex: 1;
}

.course-info strong {
    display: block;
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 5px;
}

.course-price {
    display: inline-block;
    background: #2c5aa0;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 8px;
}

.course-info p {
    color: #666;
    margin: 0;
    font-size: 0.95rem;
}

.agreement-box {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
}

.checkbox-group {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    cursor: pointer;
}

.checkbox-group input[type='checkbox'] {
    width: auto;
    margin-right: 12px;
    cursor: pointer;
}

.agreement-details {
    font-size: 0.9rem;
    color: #666;
    line-height: 1.6;
}

.agreement-details p {
    margin: 5px 0;
}

.form-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;
    padding-top: 30px;
    border-top: 1px solid #e0e0e0;
}

.btn-cancel,
.btn-submit {
    padding: 15px 30px;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s;
    min-width: 140px;
}

.btn-cancel {
    background: white;
    color: #666;
    border: 2px solid #ddd;
}

.btn-cancel:hover {
    background: #f8f9fa;
    border-color: #2c5aa0;
    color: #2c5aa0;
}

.btn-submit {
    background: #2c5aa0;
    color: white;
    border: 2px solid #2c5aa0;
}

.btn-submit:hover:not(:disabled) {
    background: #1e3d6f;
    border-color: #1e3d6f;
    transform: translateY(-2px);
}

.btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

/* 모바일 반응형 */
/* 달력 스타일 */
.calendar-container {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
}

.month-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
}

.nav-btn {
    background: #2c5aa0;
    color: white;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-btn:hover {
    background: #1e3d6f;
}

.month-navigation h4 {
    margin: 0;
    color: #2c5aa0;
    font-size: 1.1rem;
}

.calendar {
    padding: 15px;
}

.calendar-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    margin-bottom: 8px;
}

.day-header {
    text-align: center;
    font-weight: bold;
    padding: 8px;
    color: #2c5aa0;
    font-size: 0.9rem;
}

.calendar-body {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
}

.calendar-day {
    padding: 10px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    border-radius: 4px;
    font-weight: 500;
}

.calendar-day:hover:not(.disabled) {
    background: #e3f2fd;
}

.calendar-day.other-month {
    color: #ccc;
    background: transparent;
}

.calendar-day.available {
    background: #e8f5e8;
    color: #2e7d2e;
    border: 1px solid #4caf50;
}

.calendar-day.available:hover {
    background: #c8e6c9;
}

.calendar-day.selected {
    background: #2c5aa0 !important;
    color: white;
}

.calendar-day.disabled {
    color: #ccc;
    cursor: not-allowed;
    background: #f8f9fa;
}

.selected-dates {
    padding: 15px;
    border-top: 1px solid #e0e0e0;
    background: #f8f9fa;
}

.selected-dates h5 {
    color: #2c5aa0;
    margin: 0 0 10px 0;
    font-size: 0.9rem;
}

.date-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.date-tag {
    background: #2c5aa0;
    color: white;
    padding: 6px 10px;
    border-radius: 16px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 0.3s;
    display: flex;
    align-items: center;
    gap: 4px;
}

.date-tag:hover {
    background: #1e3d6f;
}

.remove-btn {
    font-size: 1rem;
    font-weight: bold;
    margin-left: 4px;
}

@media (max-width: 768px) {
    .exemption-form {
        padding: 10px;
    }

    .form-container {
        padding: 25px;
    }

    .form-row {
        grid-template-columns: 1fr;
        gap: 0;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn-cancel,
    .btn-submit {
        width: 100%;
    }

    .calendar {
        padding: 10px;
    }

    .calendar-day {
        padding: 8px;
        min-height: 36px;
        font-size: 0.85rem;
    }

    .month-navigation {
        padding: 10px 15px;
    }

    .month-navigation h4 {
        font-size: 1rem;
    }

    .date-tags {
        gap: 6px;
    }

    .date-tag {
        font-size: 0.75rem;
        padding: 5px 8px;
    }
}
</style>
