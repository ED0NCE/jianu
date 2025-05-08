import http from './request';

// 管理员登录
export const adminLogin = (data: { username: string; password: string }) =>
  http.post('/admin/login', data, { loading: true });

// 获取管理员信息
export const getAdminInfo = () =>
  http.get('/admin/info', { loading: true });

// 获取游记列表（管理端）
export const getTravelogueList = (params: {
  page: number;
  pageSize: number;
  status?: 'draft' | 'pending' | 'published' | 'rejected';
  keyword?: string;
}) => http.get('/admin/travelogue', { data: params, loading: true });

// 审核游记
export const reviewTravelogue = (travelId: number, data: {
  action: 'approve' | 'reject';
  rejectionReason?: string;
}) => http.post(`/admin/travelogue/${travelId}/review`, data, { 
  loading: true, 
  loadingText: '处理中...' 
});

// 获取审核记录
export const getReviewHistory = (travelId: number) =>
  http.get(`/admin/travelogue/${travelId}/reviews`, { loading: true });

// 获取统计数据
export const getStatistics = () =>
  http.get('/admin/statistics', { loading: true });

// 获取用户列表
export const getUserList = (params: {
  page: number;
  pageSize: number;
  keyword?: string;
}) => http.get('/admin/users', { data: params, loading: true });

// 禁用/启用用户
export const toggleUserStatus = (userId: number, status: 'active' | 'disabled') =>
  http.put(`/admin/users/${userId}/status`, { status }, { loading: true }); 