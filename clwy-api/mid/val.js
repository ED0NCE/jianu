const Joi = require('joi');

// 用户注册验证
const signupSchema = Joi.object({
    nickname: Joi.string().min(2).max(255).required(),
    account: Joi.string().min(6).max(255).required(),
    password: Joi.string().min(6).required(),
});

// 用户登录验证
const loginSchema = Joi.object({
    account: Joi.string().min(6).max(255).required(),
    password: Joi.string().min(6).required(),
});

module.exports = {
    signupSchema,
    loginSchema,
};