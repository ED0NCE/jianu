import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Button, Image, Video, Canvas } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { DateRange } from 'react-date-range';
import { zhCN } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { TextArea } from '@nutui/nutui-react-taro';
import './edit.scss';
import { getTravelogueDetail, saveTravelogue, uploadImage, uploadVideo } from '../../api/user';

const Edit: React.FC = () => {
  const router = useRouter();
  const { id } = router.params;
  const isEdit = !!id;

  const [formData, setFormData] = useState<any>({
    travel_id: null,
    title: '',
    content: '',
    images: [],
    location: '',
    start_date: '',
    end_date: '',
    participants: null,
    expenditure: null,
    video_url: '',
    video_poster: '',
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 日期区间选择
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  const [showDateValue, setShowDateValue] = useState(false);

  //关闭日期选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.date-row-wrapper')) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isEdit) {
      fetchTravelogueDetail();
    }
  }, [isEdit]);

  const fetchTravelogueDetail = async () => {
    try {
      const res = await getTravelogueDetail(Number(id)) as any;
      if (res.success) {
        setFormData(res.data);
      }
    } catch (error) {
      console.error('获取游记详情失败:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
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
      const isVideo = file.type.startsWith('video/');
      const uploadFunction = isVideo ? uploadVideo : uploadImage;
      const res = await uploadFunction(file) as any;
      
      if (res.success) {
        if (isVideo) {
          setFormData(prev => ({
            ...prev,
            video_url: res.data.video_url,
            video_poster: prev.video_poster || `${res.data.video_url}?x-oss-process=video/snapshot,t_1000,f_jpg,w_0,h_0,m_fast`,
          }));
        } else {
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
      }
    } catch (error) {
      console.error('上传失败:', error);
      Taro.showToast({ 
        title: '上传失败', 
        icon: 'none' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoPosterUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    
    setFormData(prev => ({
      ...prev,
      video_poster: fileUrl
    }));

    const input = document.getElementById('poster-upload') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  const handleVideoUpload = async (e: any) => {
    const file = e.detail.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadVideo(file) as any;
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

    if (!formData.video_url && formData.images.length === 0) {
      Taro.showToast({ title: '请至少上传一张图片或一个视频', icon: 'none' });
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
        start_date: format(dateRange[0].startDate, 'yyyy-MM-dd'),
        end_date: format(dateRange[0].endDate, 'yyyy-MM-dd'),
        participants: formData.participants,
        expenditure: formData.expenditure,
        video_url: formData.video_url,
        video_poster: formData.video_poster,
      };
      const res = await saveTravelogue(submitData) as any;
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
          // 检查是否包含视频
          const hasVideo = res.tempFiles.some(file => file.tempFilePath.includes('video'));
          if (hasVideo && formData.video_url) {
            Taro.showToast({
              title: '只能上传一个视频',
              icon: 'none'
            });
            return;
          }

          // 先处理视频
          const videoFile = res.tempFiles.find(file => file.tempFilePath.includes('video'));
          if (videoFile) {
            const videoUrl = videoFile.tempFilePath;
            
            // 创建视频元素来获取封面
            const video = document.createElement('video');
            
            // 使用 Blob 和 URL.createObjectURL
            fetch(videoUrl)
              .then(response => response.blob())
              .then(blob => {
                const objectUrl = URL.createObjectURL(blob);
                video.src = objectUrl;
                video.currentTime = 0.1;
                video.crossOrigin = 'anonymous';

                video.onloadeddata = () => {
                  if (video.videoWidth === 0 || video.videoHeight === 0) return;

                  // 创建 canvas 来获取视频帧
                  const canvas = document.createElement('canvas');
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                  const ctx = canvas.getContext('2d');
                  
                  if (ctx) {
                    try {
                      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                      const posterUrl = canvas.toDataURL('image/jpeg', 0.7);
                      
                      setFormData(prev => ({
                        ...prev,
                        video_url: videoUrl,
                        video_poster: posterUrl
                      }));

                      // 清理 URL 对象
                      URL.revokeObjectURL(objectUrl);
                    } catch (error) {
                      console.error('绘制视频帧失败:', error);
                    }
                  }
                };

                // 强制加载视频
                video.load();
              })
              .catch(error => {
                console.error('获取视频文件失败:', error);
              });
          }

          // 处理图片
          const newImages = res.tempFiles
            .filter(file => !file.tempFilePath.includes('video'))
            .map((file, index) => ({
              image_id: 0,
              image_url: file.tempFilePath,
              order: index,
              temp_id: Date.now() + index // 添加临时唯一ID
            }));

          if (newImages.length > 0) {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, ...newImages]
            }));
          }
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

  // 搜索地址
  const searchLocation = async (keyword: string) => {
    if (!keyword) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(keyword)}&limit=5`
      );
      const data = await response.json();
      setLocationSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('搜索地址失败:', error);
    }
  };

  // 选择地址
  const handleLocationSelect = (location: any) => {
    setFormData(prev => ({
      ...prev,
      location: location.display_name
    }));
    setLocationInput(location.display_name);
    setShowSuggestions(false);
  };

  // 位置
  const handleChooseLocation = () => {
    Taro.chooseLocation({
      success: res => setFormData(prev => ({
        ...prev,
        location: res.name || ''
      })),
    });
  };

  // 返回
  const handleBack = () => {
    Taro.navigateBack();
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

      {/* 隐藏的视频元素和画布 */}
      <Video
        id="tempVideo"
        src={formData.video_url}
        style={{ display: 'none' }}
      />
      <Canvas
        id="tempCanvas"
        style={{ display: 'none' }}
      />

      {/* 媒体上传区 */}
      <View className="media-list">
        {formData.video_url && (
          <View className="media-item video-item">
            <Image 
              className="media-thumb" 
              src={formData.video_poster || formData.video_url}
              mode="aspectFill"
            />
            <View className="video-controls">
              <View className="upload-btn" onClick={() => document.getElementById('poster-upload')?.click()}>
                <View className="icon play" />
                <Text>点击更换封面图</Text>
              </View>
            </View>
            {formData.images.length > 0 && (
              <View className="icon close" onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  video_url: '',
                  video_poster: '',
                }));
              }} />
            )}
            <input
              id="poster-upload"
              type="file"
              accept="image/*"
              onChange={handleVideoPosterUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </View>
        )}
        {formData.images.map((item, idx) => (
          <View className="media-item" key={item.temp_id || item.image_id}>
            <Image className="media-thumb" src={item.image_url} mode="aspectFill" />
            {(formData.images.length > 1 || formData.video_url) && <View className="icon close" onClick={() => handleRemoveImage(idx)} />}
          </View>
        ))}
        {(formData.images.length < 9 || !formData.video_url) && (
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
        style={{
          fontFamily: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: '4.2vw',
          fontWeight: 500,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}
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
          color: '#333',
          backgroundColor: '#fff',
          border: 'none',
          outline: 'none',
          minHeight: '18vw',
          width: '100%',
          boxSizing: 'border-box'
        }}
      />
      <View className="custom-divider" />

      {/* 位置 */}
      <View className="edit-row location-row">
        <View className="icon location" />
        <View className="location-input-wrapper">
          <Input
            className="location-input"
            value={locationInput}
            placeholder="输入并搜索地址"
            onInput={e => {
              const value = e.detail.value;
              setLocationInput(value);
              searchLocation(value);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && locationSuggestions.length > 0 && (
            <View className="location-suggestions">
              {locationSuggestions.map((item, index) => (
                <View
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleLocationSelect(item)}
                >
                  <Text>{item.display_name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      <View className="custom-divider" />

      {/* 日期 */}
      <View className="date-row-wrapper">
        <View className="edit-row date-row" onClick={() => setShowDatePicker(!showDatePicker)}>
          <View className="icon calendar" />
          <View className="date-col">
            <Text className="edit-row-label">开始日期</Text>
            <Text className="date-value">{showDateValue ? format(dateRange[0].startDate, 'yyyy-MM-dd') : '待选择'}</Text>
          </View>
          <Text className="edit-row-label">-</Text>
          <View className="date-col">
            <Text className="edit-row-label">结束日期</Text>
            <Text className="date-value">{showDateValue ? format(dateRange[0].endDate, 'yyyy-MM-dd') : '待选择'}</Text>
          </View>
        </View>
        <View className={`date-picker-popup${showDatePicker ? '' : ' hide'}`}>
          <View className="date-picker-popup-header">
            <Text className="date-picker-reset" onClick={() => {
              setDateRange([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
              setShowDateValue(false);
            }}>重置</Text>
            <Text className="date-picker-ok" onClick={() => setShowDatePicker(false)}>完成</Text>
          </View>
          <DateRange
            editableDateInputs={true}
            onChange={item => {
              setDateRange([item.selection]);
              setShowDateValue(true);
            }}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            locale={zhCN}
            maxDate={new Date('2100-12-31')}
            minDate={new Date('2000-01-01')}
            showDateDisplay={false}
          />
        </View>
      </View>
      <View className="custom-divider" />

      {/* 同行人数、花费 */}
      <View className="edit-row">
        <View className="icon people" />
        <Text className="edit-row-label">同行人数</Text>
        <Text className={`edit-input-value ${!formData.participants ? 'placeholder' : ''}`}>
          {formData.participants || '请填写'}
        </Text>
        <Text className="edit-row-unit">人</Text>
      </View>
      <View className="custom-divider" />

      <View className="edit-row">
        <View className="icon budget" />
        <Text className="edit-row-label">总花费</Text>
        <Text className={`edit-input-value ${!formData.expenditure ? 'placeholder' : ''}`}>
          {formData.expenditure || '请填写'}
        </Text>
        <Text className="edit-row-unit">千元</Text>
      </View>
      <View className="custom-divider" />

      {/* 发布按钮 */}
      <Button className="edit-submit" onClick={handleSubmit}>发布</Button>
    </View>
  );
};

export default Edit;