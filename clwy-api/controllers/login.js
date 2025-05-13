const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/auth');

// 用户注册
exports.signup = async (req, res) => {
    try {
        const { nickname, account, password } = req.body;

        // 检查账号是否已存在
        const existingUser = await User.findOne({ where: { account } });
        if (existingUser) {
            return res.status(400).json({ message: '账号已存在' });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建新用户
        const user = await User.create({
            nickname,
            account,
            password: hashedPassword,
        });

        // 生成 JWT
        const token = jwt.sign(
            { user_id: user.user_id, nickname: user.nickname },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        );

        res.json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误' });
    }
};