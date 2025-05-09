import { http } from './request';

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

// 获取用户信息
export const getUserInfo = () => {
  return http.get('/user/info');
};

// 更新用户信息(换头像/编辑资料)
export const updateUserInfo = (data: {
  nickname?: string;
  avatar?: string;
  gender?: string;
  signature?: string;
  birthday?: string;
  location?: string;
  password?: string;
}) => http.post('/user/update', data, { loading: true });






