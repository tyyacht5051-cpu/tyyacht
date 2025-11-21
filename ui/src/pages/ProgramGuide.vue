<template>
    <div class="program-guide">
        <section class="hero-section">
            <div class="hero-background">
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <h1 class="hero-title">프로그램안내</h1>
                <p class="hero-subtitle">통영요트학교의 다양한 교육/체험 프로그램을 소개합니다</p>
            </div>
        </section>

        <section class="programs-overview">
            <div class="container">
                <div class="programs-grid">
                    <div class="program-card" v-for="program in programs" :key="program.id">
                        <div class="card-image">
                            <img :src="program.image" :alt="program.name" />
                        </div>
                        <div class="card-content">
                            <h3>{{ program.name }}</h3>
                            <p>{{ program.description }}</p>
                            <div class="program-details">
                                <span class="duration">{{ program.duration }}</span>
                                <span class="price">{{ program.price }}</span>
                            </div>
                            <router-link :to="program.link" class="detail-btn"
                                >상세보기</router-link
                            >
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
export default {
    name: 'ProgramGuide',
    data() {
        return {
            programs: [
                {
                    id: 1,
                    name: '크루져 요트 교육',
                    description: '전문 강사와 함께하는 체계적인 크루져 요트 교육 프로그램',
                    duration: '1일 ~ 5일',
                    price: '100,000원부터',
                    image: '/images/cruise-education.jpg',
                    link: '/cruise-education',
                },
                {
                    id: 2,
                    name: '크루져 요트 체험',
                    description: '가족, 친구와 함께하는 모두가 즐거운 크루져 요트 체험',
                    duration: '1시간 ~ 8시간',
                    price: '25,000원부터',
                    image: '/images/cruise-experience.jpg',
                    link: '/cruise-experience',
                },
                {
                    id: 3,
                    name: '딩기 요트 교육',
                    description: '소형 요트(Dinghy)의 기초부터 고급까지 단계별 교육',
                    duration: '1일 (7시간)',
                    price: '70,000원',
                    image: '/images/dinghy-education.jpg',
                    link: '/dinghy-education',
                },
                {
                    id: 4,
                    name: '딩기 요트 체험',
                    description: '초보자도 쉽게 즐길 수 있는 전문 강사가 함께하는 딩기 요트 체험',
                    duration: '2시간',
                    price: '문의필요',
                    image: '/images/dinghy-experience.jpg',
                    link: '/dinghy-experience',
                },
                {
                    id: 5,
                    name: '패들보드 체험',
                    description: '누구나 쉽게 배울 수 있는 패들보드 체험 프로그램',
                    duration: '2시간',
                    price: '문의필요',
                    image: '/images/paddleboard.jpg',
                    link: '/paddleboard-experience',
                },
            ],
        };
    },
};
</script>

<style scoped>
.program-guide {
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

.programs-overview {
    padding: 80px 0;
    background: #f8f9fa;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.programs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
}

.program-card {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition:
        transform 0.3s,
        box-shadow 0.3s;
}

.program-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-image {
    height: 250px;
    overflow: hidden;
}

.card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.program-card:hover .card-image img {
    transform: scale(1.05);
}

.card-content {
    padding: 25px;
}

.card-content h3 {
    font-size: 1.5rem;
    color: #2c5aa0;
    margin-bottom: 15px;
    font-weight: 600;
}

.card-content p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
}

.program-details {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.duration,
.price {
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}

.duration {
    background: #e3f2fd;
    color: #1976d2;
}

.price {
    background: #f3e5f5;
    color: #7b1fa2;
}

.detail-btn {
    display: inline-block;
    background: linear-gradient(135deg, #2c5aa0, #1e3d6f);
    color: white;
    text-decoration: none;
    padding: 12px 30px;
    border-radius: 25px;
    font-weight: 600;
    transition: all 0.3s;
    text-align: center;
    width: 100%;
}

.detail-btn:hover {
    background: linear-gradient(135deg, #1e3d6f, #2c5aa0);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(44, 90, 160, 0.3);
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
        gap: 20px;
    }

    .program-card {
        margin: 0 10px;
    }
}
</style>
