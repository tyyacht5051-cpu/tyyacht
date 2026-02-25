import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { initDatabase, db } from './src/db/database';
import { config } from './src/config/env';
import { globalErrorHandler, notFoundHandler } from './src/middleware/errorHandler';
import { generalLimiter } from './src/middleware/rateLimiter';
import { initializeUploadDirectories } from './src/utils/fileSystem';
import homeRoutes from './src/routes/home';
import authRoutes from './src/routes/auth';
import adminRoutes from './src/routes/admin';
import noticesRoutes from './src/routes/notices';
import photosRoutes from './src/routes/photos';
import videosRoutes from './src/routes/videos';
import applicationsRoutes from './src/routes/applications';
import schedulesRoutes from './src/routes/schedules';
import reviewsRoutes from './src/routes/reviews';
import crewsRoutes from './src/routes/crews';
import excelRoutes from './src/routes/excel';
import popupsRoutes from './src/routes/popups';

const app = express();

  app.use(
cors({
      credentials: true,
      origin: config.ALLOWED_ORIGINS,
  })
  );

  // Trust proxy (nginx 리버스 프록시 사용)
  app.set('trust proxy', 1);

app.use(express.json());
app.use(cookieParser());

// 전역 Rate Limiting 적용 (모든 API 요청에 대해)
app.use('/api', generalLimiter);

// 정적 파일 서비스 (업로드된 파일들)
app.use('/api/uploads', express.static(path.join(process.cwd(), config.UPLOAD_PATH)));

// 업로드 디렉토리 초기화
initializeUploadDirectories();

initDatabase();

app.use('/api/home', homeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/photos', photosRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/crews', crewsRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/popups', popupsRoutes);

app.get('/', (_req: express.Request, res: express.Response) => {
    res.send('Yacht School API Running...');
});

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

// 헬스체크 엔드포인트
app.get('/api/health', (_req: express.Request, res: express.Response) => {
    try {
        db.prepare('SELECT 1').get();
        const mem = process.memoryUsage();
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            db: 'connected',
            memory: {
                used: Math.round(mem.heapUsed / 1024 / 1024) + 'MB',
                total: Math.round(mem.heapTotal / 1024 / 1024) + 'MB'
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            db: 'disconnected'
        });
    }
});

// 404 에러 핸들러 (모든 라우트 이후에 배치)
app.use(notFoundHandler);

// 글로벌 에러 핸들러 (가장 마지막에 배치)
app.use(globalErrorHandler);

app.listen(config.PORT, () => {
    console.log(`✅ API Server is ready and listening on port ${config.PORT}`);
    console.log(`🌐 Access URL: http://localhost:${config.PORT}`);
});
