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

// 用户登录
exports.login = async (req, res) => {
    try {
        const { account, password } = req.body;

        // 查找用户
        const user = await User.findOne({ where: { account } });
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: '密码错误' });
        }

        // 生成 JWT
        const token = jwt.sign(
            { user_id: user.user_id, nickname: user.nickname },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        );

        // 返回用户信息与token（不包含密码）
        const userWithoutPassword = {
            user_id: user.user_id,
            nickname: user.nickname,
            account: user.account,
            avatar: user.avatar,
            created_at: user.created_at,
            updated_at: user.updated_at
        };

        res.json({
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误' });
    }
};