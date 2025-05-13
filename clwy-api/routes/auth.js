const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// 用户注册
router.post('/signup', authController.signup);

// 用户登录
router.post('/login', authController.login);

module.exports = router; 