import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDatabase } from './src/db/database';
import homeRoutes from './src/routes/home';
import authRoutes from './src/routes/auth';
import adminRoutes from './src/routes/admin';
import noticesRoutes from './src/routes/notices';
import photosRoutes from './src/routes/photos';
import videosRoutes from './src/routes/videos';
import applicationsRoutes from './src/routes/applications';
import schedulesRoutes from './src/routes/schedules';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 정적 파일 서비스 (업로드된 파일들)
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

initDatabase();

app.use('/api/home', homeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/photos', photosRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/schedules', schedulesRoutes);

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Yacht School API Running...");
});

// 캘린더 이벤트 API (임시)
app.get("/api/calendar", (req: any, res: any) => {
  res.json([
    { 
      id: 1, 
      title: "요트면허 교육", 
      date: "2025-08-25", 
      type: "education",
      description: "2급 요트조종면허 교육 과정"
    },
    { 
      id: 2, 
      title: "체험프로그램", 
      date: "2025-08-27", 
      type: "experience",
      description: "가족 단위 요트 체험"
    },
    { 
      id: 3, 
      title: "클럽대항전", 
      date: "2025-09-05", 
      type: "competition",
      description: "전국 요트클럽 대항전"
    }
  ]);
});

// 관련 사이트 정보 API
app.get("/api/related-sites", (req: any, res: any) => {
  res.json([
    { 
      name: "해양수산부", 
      url: "https://www.mof.go.kr", 
      logo: "/images/mof-logo.png" 
    },
    { 
      name: "한국요트협회", 
      url: "https://www.sailing.or.kr", 
      logo: "/images/sailing-logo.png" 
    },
    { 
      name: "해양경찰청", 
      url: "https://www.kcg.go.kr", 
      logo: "/images/kcg-logo.png" 
    }
  ]);
});

// 회사 정보 API
app.get("/api/company-info", (req: any, res: any) => {
  res.json({
    name: "통영요트학교",
    address: "경남 통영시 도남로 260-28",
    phone: "055-641-5051~2",
    email: "ty6415051@hanmail.net",
    business: "123-45-67890",
    ceo: "서성덕",
    established: "2010년",
    services: ["요트면허교육", "체험프로그램", "클럽운영"],
    hours: "평일 09:00 - 18:00"
  });
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});