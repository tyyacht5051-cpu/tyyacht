"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./src/db/database");
const home_1 = __importDefault(require("./src/routes/home"));
const auth_1 = __importDefault(require("./src/routes/auth"));
const admin_1 = __importDefault(require("./src/routes/admin"));
const notices_1 = __importDefault(require("./src/routes/notices"));
const photos_1 = __importDefault(require("./src/routes/photos"));
const videos_1 = __importDefault(require("./src/routes/videos"));
const applications_1 = __importDefault(require("./src/routes/applications"));
const schedules_1 = __importDefault(require("./src/routes/schedules"));
const app = (0, express_1.default)();
const PORT = 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
(0, database_1.initDatabase)();
app.use('/api/home', home_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/notices', notices_1.default);
app.use('/api/photos', photos_1.default);
app.use('/api/videos', videos_1.default);
app.use('/api/applications', applications_1.default);
app.use('/api/schedules', schedules_1.default);
app.get("/", (req, res) => {
    res.send("Yacht School API Running...");
});
app.get("/api/calendar", (req, res) => {
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
app.get("/api/related-sites", (req, res) => {
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
app.get("/api/company-info", (req, res) => {
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
//# sourceMappingURL=index.js.map