import { http } from './request'

// 获取游记列表(status: 已发布/审核中/未通过)
export const getTravelogueList = (params: {
  page: number;
  limit: number;
  status: string;
}) => http.get(`/travelogue/list`, {data: params});

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



