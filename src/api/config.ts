// API 基础配置
export const BASE_URL = 'http://localhost:3000/api';

// API 超时时间（毫秒）
export const TIMEOUT = 10000;

// API 请求头
export const API_HEADERS = {
  'Content-Type': 'application/json',
};

// API 状态码
export const API_STATUS = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// Debug 模式
export const DEBUG = 1;  // 1: 开启调试模式，0: 关闭调试模式 