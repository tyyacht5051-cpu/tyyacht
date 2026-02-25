import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { initDatabase } from './src/db/database';
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

app.use(cors({ credentials: true, origin: config.ALLOWED_ORIGINS }));
app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());

app.use('/api', generalLimiter);
app.use('/api/uploads', express.static(path.join(process.cwd(), config.UPLOAD_PATH)));

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

app.get('/', (_req, res) => res.send('Yacht School API Running...'));

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
