import { http } from './request'

// 获取游记列表
export const getTravelogueList = (params: {
  page: number;
  limit: number;
  status: string;
}) => http.get('/travelogue/list');

// 获取用户游记列表(type: 已发布/审核中/未通过/我喜欢)
export const getUserTravelogueList = (params: {
  user_id: number;
  page: number;
  limit: number;
  type: string;
}) => http.get(`/travelogue/${params.user_id}/list`);

// 获取消息列表(status: 全部消息/审核通知/点赞)
export const getMessageList = (params: {
  user_id: number;
  status: string;
}) => http.get(`/message/${params.user_id}/list`);

// 搜索游记(keyword: 搜索游记/用户昵称)
export const searchTravelogue = (keyword: string) => http.get(`/travelogue/search?keyword=${keyword}`);

