import { http } from './request'

// 获取游记列表(status: 已发布/审核中/未通过)
export const getTravelogueList = (params: {
  page: number;
  limit: number;
  status: string;
}) => http.get(`/travelogue/list?page=${params.page}&limit=${params.limit}&status=${params.status}`);

// 获取用户游记列表(status: 已发布/审核中/未通过/我喜欢)
export const getUserTravelogueList = (params: {
  nickname: string;
  page: number;
  limit: number;
  status: number;
}) => http.get(`/travelogue/user/list`, {data: params});

// 搜索游记(keyword: 搜索游记/用户昵称)
export const searchTravelogue = (params:{
  keyword: string;
  page: number;
  limit: number;
  status: string;
} ) => http.get(`/travelogue/search`, {data: params});

// 点赞游记
export const asyncAddLikedTravelogue = (travel_id: string) => http.post(`/travelogue/addLike/${travel_id}`);

// 取消点赞游记
export const asyncRemoveLikedTravelogue = (travel_id: string) => http.post(`/travelogue/cancelLike/${travel_id}`);

