import { http } from './request';

//登录
export const adminLogin = (data: {
  username: string;
  password: string;
}) => {
  return http.post('/admin/login', data);
};

export const travelogueApi = {
//   // 游记列表
//   getList: (params: {
//     page: number;
//     pageSize: number;
//     status: number;
//     keyword: string | null;
//   }) => {
//     return http.get('/admin/travelogue/list', { data: params });
//   },

  // 游记详情
//   getDetail: (id: number) => {
//     return http.get(`/admin/travelogue/${id}`);
//   },

  // 审核游记
  review: (travelId: number, data: {
    option: number; // 操作选项：0-通过 1-拒绝 2-删除
    reason: string | null;
  }) => {
    const adminId = localStorage.getItem('admin-storage') 
      ? JSON.parse(localStorage.getItem('admin-storage')!).state.profile?.adminId 
      : null;

    return http.post(`/admin/travelogue/${travelId}/review`, data, {
      header: {
        'X-Admin-Id': adminId
      }
    });
  },

  // 批量审核
//   batchReview: (data: {
//     ids: number[];
//     status: number; // 2-通过 3-拒绝
//     reason: string | null;
//   }) => {
//     return http.post('/admin/travelogue/batch-review', data);
//   },

  // 导出报表
//   exportReport: (params: {
//     startDate: string | null;
//     endDate: string | null;
//     status: 'all' | number | null;
//   }) => {
//     return http.get('/admin/travelogue/export', { data: params });
//   }
}; 