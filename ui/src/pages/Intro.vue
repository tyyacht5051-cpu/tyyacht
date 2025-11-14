<template>
    <div class="intro-page">
        <!-- 히어로 섹션 -->
        <section class="hero-section">
            <div class="hero-background">
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <h1 class="hero-title">학교 소개</h1>
                <p class="hero-subtitle">통영요트학교를 소개합니다</p>
            </div>
        </section>

        <!-- 메인 컨텐츠 -->
        <section class="main-content">
            <div class="container">
                <!-- 인사말 섹션 -->
                <div class="content-section">
                    <h2 class="section-title">인사말</h2>
                    <div class="greeting-content">
                        <p>
                            남해안 해양 문화의 중심지인 우리 통영은 도내에서 최초로 정규 요트 계류
                            및 부대시설의 인프라를 갖추고
                        </p>
                        <p>
                            요트 대중화와 이를 통한 해양 관광 활성화를 위하여 통영요트학교를
                            개교하게 되었습니다.
                        </p>
                    </div>
                </div>
                <!-- 찾아오시는 길 섹션 -->
                <div class="content-section">
                    <h2 class="section-title">찾아오시는 길</h2>

                    <!-- 이미지 표시 섹션 -->
                    <div class="image-section">
                        <!-- 기본 이미지 표시 -->
                        <div class="map-image" v-if="mapImageSrc">
                            <img :src="mapImageSrc" alt="찾아오시는 길 지도" />
                        </div>

                        <!-- 이미지가 없을 때 -->
                        <div class="no-image" v-else>
                            <svg
                                class="map-icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                ></path>
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                ></path>
                            </svg>
                            <p>지도 이미지를 준비 중입니다</p>
                        </div>
                    </div>
                </div>

                <!-- 요트학교 시설 섹션 -->
                <div class="content-section">
                    <h2 class="section-title">요트학교 시설</h2>

                    <div class="facility-images">
                        <div
                            class="facility-image"
                            v-for="(image, index) in facilityImages"
                            :key="index"
                        >
                            <img :src="image.src" :alt="image.alt" v-if="image.src" />
                            <div class="placeholder-image" v-else>
                                <svg
                                    class="facility-icon"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    ></path>
                                </svg>
                                <p>{{ image.alt }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 요트 소개 섹션 -->
                <div class="content-section">
                    <h2 class="section-title">요트 소개</h2>

                    <!-- 크루즈 요트 섹션 -->
                    <div class="yacht-subsection">
                        <h2>크루즈 요트</h2>
                        <div class="cruise-yacht-gallery">
                            <div
                                class="cruise-yacht-row"
                                v-for="(row, rowIndex) in cruiseYachtImages"
                                :key="rowIndex"
                            >
                                <div
                                    class="cruise-yacht-image"
                                    v-for="(image, imageIndex) in row"
                                    :key="imageIndex"
                                >
                                    <img :src="image.src" :alt="image.alt" v-if="image.src" />
                                    <div class="placeholder-image" v-else>
                                        <svg
                                            class="yacht-icon"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                                            ></path>
                                        </svg>
                                        <p>{{ image.alt }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 딩기 요트 섹션 -->
                    <div class="yacht-subsection">
                        <h2>딩기 요트</h2>
                        <div class="dinghy-yacht-gallery">
                            <div
                                class="dinghy-yacht-image"
                                v-for="(image, index) in dinghyYachtImages"
                                :key="index"
                            >
                                <img :src="image.src" :alt="image.alt" v-if="image.src" />
                                <div class="placeholder-image" v-else>
                                    <svg
                                        class="yacht-icon"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        ></path>
                                    </svg>
                                    <p>{{ image.alt }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 구조선 섹션 -->
                    <div class="yacht-subsection">
                        <h2>구조선</h2>
                        <div class="rescue-boat-gallery">
                            <div class="rescue-boat-image">
                                <img
                                    :src="rescueBoatImage.src"
                                    :alt="rescueBoatImage.alt"
                                    v-if="rescueBoatImage.src"
                                />
                                <div class="placeholder-image" v-else>
                                    <svg
                                        class="yacht-icon"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                                        ></path>
                                    </svg>
                                    <p>{{ rescueBoatImage.alt }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const mapImageSrc = ref<string>('');
const facilityImages = ref([
    { src: '', alt: '시설 1' },
    { src: '', alt: '시설 2' },
]);

// 크루즈 요트 이미지 배열 (바다의땅 1,2 / 바다의땅 3 / 바다의땅 5,6)
const cruiseYachtImages = ref([
    [
        { src: '', alt: '바다의땅 1' },
        { src: '', alt: '바다의땅 2' },
    ],
    [{ src: '', alt: '바다의땅 3' }],
    [
        { src: '', alt: '바다의땅 5' },
        { src: '', alt: '바다의땅 6' },
    ],
]);

// 딩기 요트 이미지 배열 (세로로 3개)
const dinghyYachtImages = ref([
    { src: '', alt: '딩기 요트 1' },
    { src: '', alt: '딩기 요트 2' },
    { src: '', alt: '딩기 요트 3' },
]);

// 구조선 이미지 (1개)
const rescueBoatImage = ref({ src: '', alt: '구조선' });

// 이미지 파일 경로 설정
const loadMapImage = () => {
    const imagePath = '/images/map.png';

    const img = new Image();
    img.onload = () => {
        mapImageSrc.value = imagePath;
    };
    img.onerror = () => {
        mapImageSrc.value = '';
    };
    img.src = imagePath;
};

// 시설 이미지 로드
const loadFacilityImages = () => {
    const facilityPaths = ['/images/facility1.jpg', '/images/facility2.jpg'];

    facilityPaths.forEach((path, index) => {
        const img = new Image();
        img.onload = () => {
            facilityImages.value[index].src = path;
        };
        img.onerror = () => {
            facilityImages.value[index].src = '';
        };
        img.src = path;
    });
};

// 크루즈 요트 이미지 로드 (바다의땅 1,2,3,5,6)
const loadCruiseYachtImages = () => {
    const cruiseYachtPaths = [
        '/images/cruise1.JPG',
        '/images/cruise2.jpg',
        '/images/cruise3.jpg',
        '/images/cruise5.jpg',
        '/images/cruise6.JPG',
    ];

    // 첫 번째 줄: 바다의땅 1, 2
    const firstRowImages = [cruiseYachtPaths[0], cruiseYachtPaths[1]];
    firstRowImages.forEach((path, index) => {
        const img = new Image();
        img.onload = () => {
            cruiseYachtImages.value[0][index].src = path;
        };
        img.onerror = () => {
            cruiseYachtImages.value[0][index].src = '';
        };
        img.src = path;
    });

    // 두 번째 줄: 바다의땅 3 (혼자)
    const img3 = new Image();
    img3.onload = () => {
        cruiseYachtImages.value[1][0].src = cruiseYachtPaths[2];
    };
    img3.onerror = () => {
        cruiseYachtImages.value[1][0].src = '';
    };
    img3.src = cruiseYachtPaths[2];

    // 세 번째 줄: 바다의땅 5, 6
    const thirdRowImages = [cruiseYachtPaths[3], cruiseYachtPaths[4]];
    thirdRowImages.forEach((path, index) => {
        const img = new Image();
        img.onload = () => {
            cruiseYachtImages.value[2][index].src = path;
        };
        img.onerror = () => {
            cruiseYachtImages.value[2][index].src = '';
        };
        img.src = path;
    });
};

// 딩기 요트 이미지 로드
const loadDinghyYachtImages = () => {
    const dinghyYachtPaths = ['/images/dinghy1.jpg', '/images/dinghy2.jpg', '/images/dinghy3.jpg'];

    dinghyYachtPaths.forEach((path, index) => {
        const img = new Image();
        img.onload = () => {
            dinghyYachtImages.value[index].src = path;
        };
        img.onerror = () => {
            dinghyYachtImages.value[index].src = '';
        };
        img.src = path;
    });
};

// 구조선 이미지 로드 (1개)
const loadRescueBoatImages = () => {
    const rescueBoatPath = '/images/rescue1.jpg';

    const img = new Image();
    img.onload = () => {
        rescueBoatImage.value.src = rescueBoatPath;
    };
    img.onerror = () => {
        rescueBoatImage.value.src = '';
    };
    img.src = rescueBoatPath;
};

onMounted(() => {
    loadMapImage();
    loadFacilityImages();
    loadCruiseYachtImages();
    loadDinghyYachtImages();
    loadRescueBoatImages();
});
</script>

<style scoped>
.intro-page {
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
    padding: 80px 0;
    background: #f8f9fa;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.content-section {
    background: white;
    border-radius: 15px;
    padding: 50px;
    margin-bottom: 40px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.section-title {
    font-size: 2rem;
    color: #2c5aa0;
    margin-bottom: 40px;
    position: relative;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(135deg, #2c5aa0, #1e3d6f);
    border-radius: 2px;
}

.greeting-content {
    max-width: 800px;
    margin: 0 auto;
}

.greeting-content p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #666;
    margin-bottom: 20px;
}

/* 이미지 섹션 */
.image-section {
    margin-top: 40px;
}

/* 지도 이미지 스타일 */
.map-image {
    display: inline-block;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    background: white;
    padding: 8px;
}

.map-image img {
    max-width: 100%;
    max-height: 500px;
    display: block;
    border-radius: 8px;
}

/* 이미지가 없을 때 스타일 */
.no-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 40px;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 12px;
    border: 2px dashed #cbd5e1;
    color: #64748b;
    max-width: 400px;
    margin: 0 auto;
}

.map-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    color: #94a3b8;
}

.no-image p {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
}

/* 요트학교 시설 스타일 */
.facility-images {
    display: flex;
    gap: 30px;
    justify-content: center;
    margin-top: 40px;
    flex-wrap: wrap;
}

.facility-image {
    flex: 1;
    max-width: 400px;
    min-width: 300px;
}

.facility-image img {
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
}

.facility-image img:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

/* 요트 소개 서브섹션 스타일 */
.yacht-subsection {
    margin-top: 60px;
}

.yacht-subsection h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 30px;
    text-align: center;
    position: relative;
}

.yacht-subsection h2::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(to right, #3b82f6, #8b5cf6);
    border-radius: 2px;
}

/* 크루즈 요트 갤러리 스타일 - 시설과 동일한 스타일 적용 */
.cruise-yacht-gallery {
    margin-top: 30px;
}

.cruise-yacht-row {
    display: flex;
    gap: 30px;
    justify-content: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
}

.cruise-yacht-image {
    flex: 1;
    max-width: 400px;
    min-width: 300px;
}

.cruise-yacht-image img {
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
}

.cruise-yacht-image img:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

/* 바다의땅 3호 (혼자 있는 이미지) 중앙 정렬 및 크기 조정 */
.cruise-yacht-row:nth-child(2) {
    justify-content: center;
}

.cruise-yacht-row:nth-child(2) .cruise-yacht-image {
    max-width: 400px;
    min-width: 300px;
}

/* 딩기 요트 갤러리 스타일 - 시설과 동일한 스타일 적용 */
.dinghy-yacht-gallery {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
    margin-top: 30px;
}

.dinghy-yacht-image {
    max-width: 400px;
    min-width: 300px;
    width: 100%;
}

.dinghy-yacht-image img {
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
}

.dinghy-yacht-image img:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

/* 구조선 갤러리 스타일 - 시설과 동일한 스타일 적용 */
.rescue-boat-gallery {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

.rescue-boat-image {
    max-width: 400px;
    min-width: 300px;
    width: 100%;
}

.rescue-boat-image img {
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
}

.rescue-boat-image img:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

/* 각 서브섹션별 플레이스홀더 스타일 - 시설과 동일한 높이 */
.cruise-yacht-image .placeholder-image {
    height: 250px;
}

.dinghy-yacht-image .placeholder-image {
    height: 250px;
}

.rescue-boat-image .placeholder-image {
    height: 250px;
}

/* 플레이스홀더 이미지 스타일 */
.placeholder-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    color: #64748b;
    transition: all 0.3s ease;
}

.facility-image .placeholder-image {
    height: 250px;
}

.yacht-image .placeholder-image {
    height: 220px;
}

.placeholder-image:hover {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    border-color: #94a3b8;
}

.facility-icon,
.yacht-icon {
    width: 40px;
    height: 40px;
    margin-bottom: 12px;
    color: #94a3b8;
}

.placeholder-image p {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
    .hero-title {
        font-size: 2.2rem;
    }

    .hero-subtitle {
        font-size: 1.1rem;
    }

    .content-section {
        padding: 30px 20px;
        margin-bottom: 30px;
    }

    .section-title {
        font-size: 1.6rem;
    }

    .greeting-content p {
        font-size: 1rem;
    }
}
</style>
