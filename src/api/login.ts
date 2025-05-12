import { http } from './request';

// 登录
export const login = (data: { nickname: string; password: string }) =>
  http.post('/login', data, { loading: true });

// 注册
export const register = (data: { nickname: string; password?: string; avatar?: string }) =>
  http.post('/register', data, { loading: true });

// 退出登录
export const logout = () => http.post('/logout', {}, { loading: true });
