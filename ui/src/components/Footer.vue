<template>
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <!-- 회사 정보 -->
                <div class="footer-section">
                    <div class="footer-logo">
                        <img src="/images/logo-white.png" alt="통영요트학교" class="logo-img" />
                        <span class="logo-text"></span>
                    </div>
                    <p class="footer-description">바다에서 꿈을 펼치는 최고의 요트교육기관</p>
                    <div class="social-links">
                        <a
                            href="https://www.instagram.com/ty_yacht/"
                            class="social-link"
                            title="Instagram"
                        >
                            <i class="fab fa-instagram"></i>
                        </a>
                    </div>
                </div>

                <!-- 빠른 링크 -->
                <div class="footer-section">
                    <h4>교육/체험 프로그램</h4>
                    <ul class="footer-links">
                        <li><router-link to="/program-guide">프로그램안내</router-link></li>
                        <li><router-link to="/cruise-education">크루저 요트 교육</router-link></li>
                        <li><router-link to="/cruise-experience">크루저 요트 체험</router-link></li>
                        <li><router-link to="/dinghy-education">딩기 요트 교육</router-link></li>
                        <li><router-link to="/dinghy-experience">딩기 요트 체험</router-link></li>
                        <li>
                            <router-link to="/paddleboard-experience">패들보드 체험</router-link>
                        </li>
                    </ul>
                </div>

                <!-- 서비스 -->
                <div class="footer-section">
                    <h4>서비스</h4>
                    <ul class="footer-links">
                        <li><router-link to="/license-education">요트면허취득과정</router-link></li>
                        <li><router-link to="/community">커뮤니티</router-link></li>
                        <li><router-link to="/crew-recruitment">크루 모집</router-link></li>
                        <li><router-link to="/review-board">후기게시판</router-link></li>
                        <li><router-link to="/notice">공지사항</router-link></li>
                        <li><router-link to="/experience-apply">승선체험 신청</router-link></li>
                        <li><router-link to="/exemption-apply">면제교육 신청</router-link></li>
                    </ul>
                </div>

                <!-- 연락처 정보 -->
                <div class="footer-section">
                    <h4>연락처</h4>
                    <div class="contact-info">
                        <div class="contact-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>경남 통영시 도남로 260-28</span>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-phone"></i>
                            <span>055-641-5051~2</span>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-envelope"></i>
                            <span>ty6415051@hanmail.net</span>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-clock"></i>
                            <span>평일 09:00 - 18:00</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 저작권 정보 -->
            <div class="footer-bottom">
                <div class="footer-bottom-content">
                    <div class="copyright">
                        <p>&copy; {{ currentYear }} 통영요트학교. All rights reserved.</p>
                        <p>대표 | 서성덕</p>
                    </div>
                    <div class="footer-links-bottom">
                        <a href="/privacy" class="footer-link">개인정보처리방침</a>
                        <a href="/terms" class="footer-link">이용약관</a>
                        <a href="/sitemap" class="footer-link">사이트맵</a>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'Footer',
    computed: {
        currentYear() {
            return new Date().getFullYear();
        },
    },
};
</script>

<style scoped>
.footer {
    background: linear-gradient(135deg, #1e3d6f 0%, #2c5aa0 100%);
    color: white;
    margin-top: auto;
}

.footer-content {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr;
    gap: 40px;
    padding: 60px 0 40px 0;
}

.footer-section h4 {
    color: white;
    margin-bottom: 20px;
    font-size: 1.2rem;
    font-weight: 600;
}

.footer-logo {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.logo-img {
    height: 160px;
    margin-right: 30px;
}

.logo-text {
    font-size: 24px;
    font-weight: bold;
}

.footer-description {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    margin-bottom: 25px;
}

.social-links {
    display: flex;
    gap: 15px;
}

.social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: white;
    text-decoration: none;
    transition: all 0.3s ease;
}

.social-link:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-links li {
    margin-bottom: 12px;
}

.footer-links a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: color 0.3s ease;
    font-size: 14px;
}

.footer-links a:hover {
    color: white;
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.contact-item {
    display: flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
}

.contact-item i {
    width: 20px;
    margin-right: 12px;
    color: rgba(255, 255, 255, 0.6);
}

.footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 25px 0;
}

.footer-bottom-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.copyright p {
    margin: 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    line-height: 1.4;
}

.footer-links-bottom {
    display: flex;
    gap: 20px;
}

.footer-link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 13px;
    transition: color 0.3s ease;
}

.footer-link:hover {
    color: white;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
    .footer-content {
        grid-template-columns: 1fr 1fr;
        gap: 30px;
    }
}

@media (max-width: 768px) {
    .footer-content {
        grid-template-columns: 1fr;
        gap: 40px;
        padding: 40px 0 30px 0;
    }

    .footer-bottom-content {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }

    .footer-links-bottom {
        flex-direction: column;
        gap: 10px;
    }
}

@media (max-width: 480px) {
    .footer-logo {
        justify-content: center;
    }

    .footer-description {
        text-align: center;
    }

    .social-links {
        justify-content: center;
    }

    .footer-section {
        text-align: center;
    }

    .contact-item {
        justify-content: center;
    }
}
</style>
