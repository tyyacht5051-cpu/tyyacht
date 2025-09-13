"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HomeRepository_1 = require("../repositories/HomeRepository");
const router = (0, express_1.Router)();
router.post('/save-data', async (req, res) => {
    try {
        const { data } = req.body;
        if (!data) {
            return res.status(400).json({
                success: false,
                message: '데이터가 필요합니다.'
            });
        }
        const savedData = HomeRepository_1.HomeRepository.saveData(JSON.stringify(data));
        res.json({
            success: true,
            message: '데이터가 성공적으로 저장되었습니다.',
            data: savedData
        });
    }
    catch (error) {
        console.error('데이터 저장 중 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/data', async (req, res) => {
    try {
        const allData = HomeRepository_1.HomeRepository.getAllData();
        res.json({
            success: true,
            data: allData.map(item => ({
                ...item,
                data: JSON.parse(item.data)
            }))
        });
    }
    catch (error) {
        console.error('데이터 조회 중 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/data/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = HomeRepository_1.HomeRepository.getById(Number(id));
        if (!data) {
            return res.status(404).json({
                success: false,
                message: '데이터를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: {
                ...data,
                data: JSON.parse(data.data)
            }
        });
    }
    catch (error) {
        console.error('데이터 조회 중 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=home.js.map