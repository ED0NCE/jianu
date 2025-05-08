import { http } from './request';

// 用户登录
export const login = (data: { username: string; password: string }) =>
  http.post('/user/login', data, { loading: true });

// 用户注册
export const register = (data: { username: string; password: string; email: string }) =>
  http.post('/user/register', data, { loading: true });

// 获取用户信息
export const getUserInfo = () =>
  http.get('/user/info', { loading: true });

// 修改用户信息
export const updateUserInfo = (data: { nickname?: string; avatar?: string; bio?: string }) =>
  http.put('/user/info', data, { loading: true });

// 获取游记列表
export const getTravelogueList = (params?: any) => {
  return http.get('/travelogue/list', { data: params });
};

// 获取游记详情
export const getTravelogueDetail = (travelId: number) => {
  return http.get(`/travelogue/${travelId}`);
};

// 点赞/取消
export const toggleLike = (travelId: number) =>
  http.post(`/travelogue/${travelId}/like`, null, { loading: true });

// 创建/编辑游记
export const saveTravelogue = (data: {
  travel_id?: number;  // 有值时为编辑，无值时为创建
  title: string;
  content: string;
  images?: string[];
  location?: string;
  start_date?: string;
  end_date?: string;
  participants?: number;
  expenditure?: number;
  video_url?: string;
}) => http.post('/travelogue/save', data, { loading: true });

// 删除游记
export const deleteTravelogue = (travelId: number) => {
  return http.delete(`/travelogue/${travelId}`);
};
