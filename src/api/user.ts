import { http } from './request';

// 获取游记详情
export const getTravelogueDetail = (travelId: number) => {
  return http.get<ApiResponse<TravelogueDetail>>(`/travelogue/${travelId}`);
};

// 点赞/取消点赞
export const toggleLike = (travelId: number) => {
  return http.post<ApiResponse<void>>(`/travelogue/${travelId}/like`);
};

// 上传图片
export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return http.post<ApiResponse<{ image_id: number; image_url: string }>>('/upload/image', formData, {
    header: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 获取视频第一帧
const getVideoFirstFrame = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      video.currentTime = 0;
    };
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }
        const posterFile = new File([blob], 'poster.jpg', { type: 'image/jpeg' });
        resolve(posterFile);
      }, 'image/jpeg');
    };
    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
    video.src = URL.createObjectURL(file);
  });
};

// 上传视频
export const uploadVideo = async (file: File) => {
  // 上传视频文件
  const formData = new FormData();
  formData.append('file', file);
  const videoResponse = await http.post<ApiResponse<{ video_url: string }>>('/upload/video', formData, {
    header: {
      'Content-Type': 'multipart/form-data'
    }
  });

  // 获取视频第一帧并上传
  try {
    const posterFile = await getVideoFirstFrame(file);
    const posterFormData = new FormData();
    posterFormData.append('file', posterFile);
    const posterResponse = await http.post<ApiResponse<{ poster_url: string }>>('/upload/video/poster', posterFormData, {
      header: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return {
      success: videoResponse.success && posterResponse.success,
      data: {
        video_url: videoResponse.data.video_url,
        poster_url: posterResponse.data.poster_url
      }
    };
  } catch (error) {
    console.error('Failed to generate video poster:', error);
    return videoResponse;
  }
};

// 上传视频封面
export const uploadVideoPoster = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return http.post<ApiResponse<{ poster_url: string }>>('/upload/video/poster', formData, {
    header: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 创建/编辑游记
export const saveTravelogue = (data: {
  travel_id: number | null;
  title: string;
  content: string;
  images: Array<{ image_id: number; order: number }>;
  location: string;
  start_date: string;
  end_date: string;
  participants: number;
  expenditure: number;
  video_url: string;
  video_poster: string;
}) => {
  return http.post<ApiResponse<{ travel_id: number }>>('/travelogue/save', data);
};

// 删除游记
export const deleteTravelogue = (travelId: number) => {
  return http.post<ApiResponse<void>>(`/travelogue/${travelId}`);
};

// 类型定义
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface TravelogueDetail {
  travel_id: number;
  title: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  location: string;
  start_date: string;
  end_date: string;
  participants: number;
  expenditure: number;
  likes: number;
  video_url: string;
  video_poster: string;
  rejection_reason: string;
  author: {
    user_id: string;
    nickname: string;
    avatar: string;
  };
  images: Array<{
    image_id: number;
    image_url: string;
    order: number;
  }>;
}
