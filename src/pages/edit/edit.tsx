import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { DateRange } from 'react-date-range';
import { zhCN } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { TextArea } from '@nutui/nutui-react-taro';
import { checkLogin } from '../../utils/auth';
import './edit.scss';
import { getTravelogueDetail, saveTravelogue } from '../../api/user';
import { TravelogueData } from '../../types/travelogue';

const Edit: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [participants, setParticipants] = useState(1);
  const [expenditure, setExpenditure] = useState(0);
  const [loading, setLoading] = useState(false);

  const { id } = Taro.getCurrentInstance().router?.params || {};
  const isEdit = !!id;  // 直接通过是否有 id 参数来判断

  // 获取游记数据
  useEffect(() => {
    if (isEdit) {
      const loadTravelogueData = async () => {
        try {
          const data = await getTravelogueDetail(parseInt(id)) as TravelogueData;
          setTitle(data.title);
          setContent(data.content);
          setImages(data.images.map(img => img.image_url));
          setLocation(data.location);
          setStartDate(data.start_date);
          setEndDate(data.end_date);
          setParticipants(data.participants);
          setExpenditure(data.expenditure);
        } catch (error) {
          console.error('加载游记数据失败:', error);
        }
      };
      loadTravelogueData();
    }
  }, [id]);

  // 提交表单
  const handleSubmit = async () => {
    if (!title || !content) {
      Taro.showToast({ title: '请填写标题和内容', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      const data = {
        title,
        content,
        images,
        location,
        start_date: startDate,
        end_date: endDate,
        participants,
        expenditure
      };

      if (isEdit) {
        await saveTravelogue({ ...data, travel_id: parseInt(id) });
        Taro.showToast({ title: '更新成功', icon: 'success' });
      } else {
        await saveTravelogue(data);
        Taro.showToast({ title: '发布成功', icon: 'success' });
      }

      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('提交失败:', error);
      Taro.showToast({ title: '提交失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 选择图片/视频
  const handleAddMedia = () => {
    Taro.chooseMedia({
      count: 9 - images.length,
      mediaType: ['image', 'video'],
      success: res => {
        if (res.tempFiles && res.tempFiles.length > 0) {
          setImages([...images, ...res.tempFiles.map(file => file.tempFilePath)]);
        }
      },
      fail: err => {
        console.log('选择媒体失败', err);
      }
    });
  };
  // 删除
  const handleRemoveMedia = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };
  // 位置
  const handleChooseLocation = () => {
    Taro.chooseLocation({
      success: res => setLocation(res.name || ''),
    });
  };
  // 返回
  const handleBack = () => {
    Taro.switchTab({
      url: '/pages/index/index'
    });
  };

  // 如果正在加载数据，显示加载状态
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
        {images.map((item, idx) => (
          <View className="media-item" key={idx}>
            <Image className="media-thumb" src={item} mode="aspectFill" />
            {images.length > 1 && <View className="icon close" onClick={() => handleRemoveMedia(idx)} />}
          </View>
        ))}
        {images.length < 9 && (
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
        value={title}
        onInput={e => setTitle(e.detail.value)}
        maxlength={30}
      />
      <View className="custom-divider" />

      {/* 正文 */}
      <Textarea
        className="edit-content"
        placeholder="分享你的故事..."
        value={content}
        onInput={e => setContent(e.detail.value)}
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
        <Text className="edit-row-label">{location ? location : '添加位置'}</Text>
        <View className="icon arrow" />
      </View>
      <View className="custom-divider" />

      {/* 日期 */}
      <View className="date-row-wrapper">
        <View className="edit-row date-row">
          <View className="icon calendar" />
          <View className="date-col">
            <Text className="edit-row-label">开始日期</Text>
            <Text className="date-value">{startDate}</Text>
          </View>
          <Text className="edit-row-label">-</Text>
          <View className="date-col">
            <Text className="edit-row-label">结束日期</Text>
            <Text className="date-value">{endDate}</Text>
          </View>
        </View>
      </View>
      <View className="custom-divider" />

      {/* 同行人数、花费 */}
      <View className="edit-row">
        <View className="icon people" />
        <Text className="edit-row-label">同行人数</Text>
        <Text className="edit-input-value">{participants || '1'}</Text>
        <Text className="edit-row-unit">人</Text>
      </View>
      <View className="custom-divider" />

      <View className="edit-row">
        <View className="icon budget" />
        <Text className="edit-row-label">总花费</Text>
        <Text className="edit-input-value">{expenditure || '0'}</Text>
        <Text className="edit-row-unit">千元</Text>
      </View>
      <View className="custom-divider" />

      {/* 发布按钮 */}
      <Button className="edit-submit" onClick={handleSubmit}>发布</Button>
    </View>
  );
};

export default Edit;
