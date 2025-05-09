import { http } from './request';

//登录
export const adminLogin = (data: {
  username: string;
  password: string;
}) => {
  return http.post('/admin/login', data);
};

export const travelogueApi = {
  // 游记列表
  getList: (params: {
    page: number;
    pageSize: number;
    status: number;
    keyword: string | null;
  }) => {
    return http.get('/admin/travelogue/list', { data: params });
  },

  // 游记详情
  getDetail: (id: number) => {
    return http.get(`/admin/travelogue/${id}`);
  },

  // 审核游记
  review: (id: number, data: {
    status: number;
    reason: string | null;
  }) => {
    return http.post(`/admin/travelogue/${id}/review`, data);
  },

  // 批量审核
  batchReview: (data: {
    ids: number[];
    status: 'passed' | 'rejected';
    reason: string | null;
  }) => {
    return http.post('/admin/travelogue/batch-review', data);
  },

  // 导出报表
//   exportReport: (params: {
//     startDate: string | null;
//     endDate: string | null;
//     status: 'all' | 'pending' | 'passed' | 'rejected' | null;
//   }) => {
//     return http.get('/admin/travelogue/export', { data: params });
//   }
}; 