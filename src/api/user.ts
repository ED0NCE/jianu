import { http } from './request';

// 获取游记详情
export const getTravelogueDetail = (travelId: number) => {
  return http.get(`/travelogue/${travelId}`);
};

// 点赞/取消点赞
export const toggleLike = (travelId: number) => {
  return http.post(`/travelogue/${travelId}/like`);
};

// 上传图片
export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return http.post('/upload/image', formData, {
    header: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 上传视频
export const uploadVideo = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return http.post('/upload/video', formData, {
    header: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 创建/编辑游记
export const saveTravelogue = (data: object) => {
  return http.post('/travelogue/save', data);
};

// 删除游记
export const deleteTravelogue = (travelId: number) => {
  return http.post(`/travelogue/${travelId}`);
};

// 发布草稿
export const publishDraft = (travelId: number) => {
  return http.post(`/travelogue/${travelId}/publish`);
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






