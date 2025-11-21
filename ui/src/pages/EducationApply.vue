<template>
    <div class="page-content">
        <div class="container">
            <div class="education-apply">
                <!-- 페이지 헤더 -->
                <div class="page-header">
                    <h1 class="section-title">요트교육 신청</h1>
                    <p class="section-subtitle">요트면허 취득을 위한 교육 프로그램에 참여하세요</p>
                </div>

                <!-- 요트교육 프로그램 안내 -->
                <div class="info-section">
                    <div class="card">
                        <div class="card-header">
                            <h3>교육 프로그램 소개</h3>
                        </div>
                        <div class="card-body">
                            <div class="grid grid-2">
                                <div class="qualification-item">
                                    <div class="qualification-icon">
                                        <i class="fas fa-ship"></i>
                                    </div>
                                    <h4>크루져 요트 교육</h4>
                                    <p>대형 요트 면허 취득을 위한 전문 교육</p>
                                </div>
                                <div class="qualification-item">
                                    <div class="qualification-icon">
                                        <i class="fas fa-sailboat"></i>
                                    </div>
                                    <h4>딩기 요트 교육</h4>
                                    <p>소형 요트 면허 취득을 위한 실전 교육</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 신청 폼 -->
                <div class="form-section">
                    <div class="card">
                        <div class="card-header">
                            <h3>교육 신청서 작성</h3>
                        </div>
                        <div class="card-body">
                            <EducationForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import EducationForm from '../components/EducationForm.vue'

export default {
    name: 'EducationApply',
    components: {
        EducationForm
    }
}
</script>

<style scoped>
.education-apply {
    max-width: 1000px;
    margin: 0 auto;
}

.page-header {
    text-align: center;
    margin-bottom: 3rem;
}

.info-section {
    margin-bottom: 3rem;
}

.qualification-item {
    text-align: center;
    padding: 20px;
}

.qualification-icon {
    font-size: 3rem;
    color: #2c5aa0;
    margin-bottom: 1rem;
}

.qualification-item h4 {
    color: #2c5aa0;
    margin-bottom: 0.5rem;
}
</style>