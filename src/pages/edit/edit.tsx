import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Button, Image, Video } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { DateRange } from 'react-date-range';
import { zhCN } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { TextArea } from '@nutui/nutui-react-taro';
import './edit.scss';
import { getTravelogueDetail, saveTravelogue, uploadImage, uploadVideo, uploadVideoPoster } from '../../api/user';

// 定义API请求和响应的类型
interface TravelogueImage {
  image_id: number;
  image_url: string;
  order: number;
}

interface TravelogueData {
  travel_id: number | null;
  title: string;
  content: string;
  images: TravelogueImage[];
  location: string;
  start_date: string;
  end_date: string;
  participants: number;
  expenditure: number;
  video_url: string;
  video_poster: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const Edit: React.FC = () => {
  const router = useRouter();
  const { id } = router.params;
  const isEdit = !!id;

  const [formData, setFormData] = useState<TravelogueData>({
    travel_id: null,
    title: '',
    content: '',
    images: [],
    location: '',
    start_date: '',
    end_date: '',
    participants: 1,
    expenditure: 0,
    video_url: '',
    video_poster: '',
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchTravelogueDetail();
    }
  }, [isEdit]);

  const fetchTravelogueDetail = async () => {
    try {
      const res = await getTravelogueDetail(Number(id)) as ApiResponse<TravelogueData>;
      if (res.success) {
        setFormData(res.data);
      }
    } catch (error) {
      console.error('获取游记详情失败:', error);
    }
  };

  const handleInputChange = (field: keyof TravelogueData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (e: any) => {
    const file = e.detail.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadImage(file) as ApiResponse<{ image_id: number; image_url: string }>;
      if (res.success) {
        setFormData(prev => ({
          ...prev,
          images: [
            ...prev.images,
            {
              image_id: res.data.image_id,
              image_url: res.data.image_url,
              order: prev.images.length,
            },
          ],
        }));
      }
    } catch (error) {
      console.error('上传图片失败:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleVideoPosterUpload = async (e: any) => {
    const file = e.detail.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadVideoPoster(file) as ApiResponse<{ poster_url: string }>;
      if (res.success) {
        setFormData(prev => ({
          ...prev,
          video_poster: res.data.poster_url,
        }));
      }
    } catch (error) {
      console.error('上传视频封面失败:', error);
      Taro.showToast({ title: '上传封面失败', icon: 'none' });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: any) => {
    const file = e.detail.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadVideo(file) as ApiResponse<{ video_url: string }>;
      if (res.success) {
        setFormData(prev => ({
          ...prev,
          video_url: res.data.video_url,
          video_poster: prev.video_poster || `${res.data.video_url}?x-oss-process=video/snapshot,t_1000,f_jpg,w_0,h_0,m_fast`,
        }));
      }
    } catch (error) {
      console.error('上传视频失败:', error);
      Taro.showToast({ title: '上传视频失败', icon: 'none' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      Taro.showToast({ title: '请填写标题和内容', icon: 'none' });
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        travel_id: isEdit ? Number(id) : null,
        title: formData.title,
        content: formData.content,
        images: formData.images.map(img => ({
          image_id: img.image_id,
          order: img.order,
        })),
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date,
        participants: formData.participants,
        expenditure: formData.expenditure,
        video_url: formData.video_url,
        video_poster: formData.video_poster,
      };
      const res = await saveTravelogue(submitData) as ApiResponse<{ travel_id: number }>;
      if (res.success) {
        Taro.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      }
    } catch (error) {
      console.error('保存游记失败:', error);
      Taro.showToast({ title: '保存失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 选择图片/视频
  const handleAddMedia = () => {
    Taro.chooseMedia({
      count: 9 - formData.images.length,
      mediaType: ['image', 'video'],
      success: res => {
        if (res.tempFiles && res.tempFiles.length > 0) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...res.tempFiles.map(file => ({
              image_id: 0,
              image_url: file.tempFilePath,
              order: prev.images.length,
            }))],
          }));
        }
      },
      fail: err => {
        console.log('选择媒体失败', err);
      }
    });
  };

  // 删除
  const handleRemoveMedia = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  // 位置
  const handleChooseLocation = () => {
    Taro.chooseLocation({
      success: res => setFormData(prev => ({ ...prev, location: res.name || '' })),
    });
  };

  // 返回
  const handleBack = () => {
    Taro.switchTab({
      url: '/pages/index/index'
    });
  };

  if (loading) {
    return (
      <View className="edit-page loading">
        <View className="loading-spinner" />
      </View>
    );
  }

  return (
    <View className="edit-page">
      {/* 顶部返回 */}
      <View className="edit-navbar">
        <View className="nav-btn left" onClick={handleBack}>
          <View className="icon nav-back" />
        </View>
      </View>

      {/* 媒体上传区 */}
      <View className="media-list">
        {formData.images.map((item, idx) => (
          <View className="media-item" key={item.image_id}>
            <Image className="media-thumb" src={item.image_url} mode="aspectFill" />
            {formData.images.length > 1 && <View className="icon close" onClick={() => handleRemoveImage(idx)} />}
          </View>
        ))}
        {formData.images.length < 9 && (
          <View className="media-item add" onClick={handleAddMedia}>
            <View className="icon add" />
            <Text>添加照片/视频</Text>
          </View>
        )}
      </View>

      {/* 标题 */}
      <Input
        className="edit-title"
        placeholder="添加标题"
        value={formData.title}
        onInput={e => handleInputChange('title', e.detail.value)}
        maxlength={30}
      />
      <View className="custom-divider" />

      {/* 正文 */}
      <Textarea
        className="edit-content"
        placeholder="分享你的故事..."
        value={formData.content}
        onInput={e => handleInputChange('content', e.detail.value)}
        maxlength={1000}
        autoHeight
        style={{
          fontSize: '4.2vw',
          padding: '2vw 0.5vw 0 0.5vw',
          lineHeight: '1.5',
          color: '#888',
          backgroundColor: '#fafbfc',
          border: 'none',
          outline: 'none',
          minHeight: '18vw',
          width: '100%',
          boxSizing: 'border-box'
        }}
      />
      <View className="custom-divider" />

      {/* 位置 */}
      <View className="edit-row" onClick={handleChooseLocation}>
        <View className="icon location" />
        <Text className="edit-row-label">{formData.location ? formData.location : '添加位置'}</Text>
        <View className="icon arrow" />
      </View>
      <View className="custom-divider" />

      {/* 日期 */}
      <View className="date-row-wrapper">
        <View className="edit-row date-row">
          <View className="icon calendar" />
          <View className="date-col">
            <Text className="edit-row-label">开始日期</Text>
            <Text className="date-value">{formData.start_date}</Text>
          </View>
          <Text className="edit-row-label">-</Text>
          <View className="date-col">
            <Text className="edit-row-label">结束日期</Text>
            <Text className="date-value">{formData.end_date}</Text>
          </View>
        </View>
      </View>
      <View className="custom-divider" />

      {/* 同行人数、花费 */}
      <View className="edit-row">
        <View className="icon people" />
        <Text className="edit-row-label">同行人数</Text>
        <Text className="edit-input-value">{formData.participants || '1'}</Text>
        <Text className="edit-row-unit">人</Text>
      </View>
      <View className="custom-divider" />

      <View className="edit-row">
        <View className="icon budget" />
        <Text className="edit-row-label">总花费</Text>
        <Text className="edit-input-value">{formData.expenditure || '0'}</Text>
        <Text className="edit-row-unit">千元</Text>
      </View>
      <View className="custom-divider" />

      {/* 视频 */}
      <View className='form-item'>
        <Text className='label'>视频</Text>
        <View className='video-upload'>
          {formData.video_url ? (
            <View className='video-preview'>
              <Video 
                className='video' 
                src={formData.video_url}
                poster={formData.video_poster}
              />
              <View className='video-controls'>
                <View className='upload-btn' onClick={() => document.getElementById('poster-upload')?.click()}>
                  <Text className='icon'>📷</Text>
                  <Text>更换封面</Text>
                </View>
                <View className='remove-btn' onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    video_url: '',
                    video_poster: '',
                  }));
                }}>
                  <Text className='icon'>×</Text>
                </View>
              </View>
              <input
                id='poster-upload'
                type='file'
                accept='image/*'
                onChange={handleVideoPosterUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </View>
          ) : (
            <View className='upload-btn'>
              <Text className='icon'>+</Text>
              <input
                type='file'
                accept='video/*'
                onChange={handleVideoUpload}
                disabled={uploading}
              />
            </View>
          )}
        </View>
      </View>

      {/* 发布按钮 */}
      <Button className="edit-submit" onClick={handleSubmit}>发布</Button>
    </View>
  );
};

export default Edit; 