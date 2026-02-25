import app from './app';
import { config } from './src/config/env';

// 캘린더 이벤트 API (임시)
app.get('/api/calendar', (_req: any, res: any) => {
    res.json([
        {
            id: 1,
            title: '요트면허 교육',
            date: '2025-08-25',
            type: 'education',
            description: '2급 요트조종면허 교육 과정',
        },
        {
            id: 2,
            title: '체험프로그램',
            date: '2025-08-27',
            type: 'experience',
            description: '가족 단위 요트 체험',
        },
        {
            id: 3,
            title: '클럽대항전',
            date: '2025-09-05',
            type: 'competition',
            description: '전국 요트클럽 대항전',
        },
    ]);
});

// 관련 사이트 정보 API
app.get('/api/related-sites', (_req: any, res: any) => {
    res.json([
        {
            name: '해양수산부',
            url: 'https://www.mof.go.kr',
            logo: '/images/mof-logo.png',
        },
        {
            name: '한국요트협회',
            url: 'https://www.sailing.or.kr',
            logo: '/images/sailing-logo.png',
        },
        {
            name: '해양경찰청',
            url: 'https://www.kcg.go.kr',
            logo: '/images/kcg-logo.png',
        },
    ]);
});

// 회사 정보 API
app.get('/api/company-info', (_req: any, res: any) => {
    res.json({
        name: '통영요트학교',
        address: '경남 통영시 도남로 260-28',
        phone: '055-641-5051~2',
        email: 'ty6415051@hanmail.net',
        business: '123-45-67890',
        ceo: '서성덕',
        established: '2010년',
        services: ['요트면허교육', '체험프로그램', '클럽운영'],
        hours: '평일 09:00 - 18:00',
    });
});

app.listen(config.PORT, () => {
    console.log(`✅ API Server is ready and listening on port ${config.PORT}`);
    console.log(`🌐 Access URL: http://localhost:${config.PORT}`);
});
