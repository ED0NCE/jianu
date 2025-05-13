const express = require('express');
const router = express.Router();
const travelController = require('../controllers/travel');

// 获取所有游记
router.get('/', travelController.getAllTravels);

// 创建游记
router.post('/', travelController.createTravel);

// 更新游记
router.put('/:id', travelController.updateTravel);

// 删除游记
router.delete('/:id', travelController.deleteTravel);

module.exports = router;