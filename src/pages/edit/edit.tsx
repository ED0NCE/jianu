import React, { useState } from 'react';
import { View, Text, Input, Textarea, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { DateRange } from 'react-date-range';
import { zhCN } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { TextArea } from '@nutui/nutui-react-taro';
import './edit.scss';

const Edit: React.FC = () => {
  // 图片/视频列表
  const [mediaList, setMediaList] = useState<any[]>([]);
  // 标题、正文、位置、日期、人数、花费
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [people, setPeople] = useState('');
  const [budget, setBudget] = useState('');

  // 日期区间选择
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  // 选择图片/视频
  const handleAddMedia = () => {
    Taro.chooseMedia({
      count: 9 - mediaList.length,
      mediaType: ['image', 'video'],
      success: res => {
        if (res.tempFiles && res.tempFiles.length > 0) {
          setMediaList([...mediaList, ...res.tempFiles]);
        }
      },
      fail: err => {
        console.log('选择媒体失败', err);
      }
    });
  };
  // 删除
  const handleRemoveMedia = (idx: number) => {
    setMediaList(mediaList.filter((_, i) => i !== idx));
  };
  // 位置
  const handleChooseLocation = () => {
    Taro.chooseLocation({
      success: res => setLocation(res.name || ''),
    });
  };
  // 发布
  const handleSubmit = () => {
    // 表单验证
    if (!title.trim()) {
      Taro.showToast({
        title: '请输入标题',
        icon: 'none'
      });
      return;
    }
    if (!content.trim()) {
      Taro.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    // 准备提交数据
    const submitData = {
      title: title.trim(),
      content: content.trim(),
      location,
      startDate: format(dateRange[0].startDate, 'yyyy-MM-dd'),
      endDate: format(dateRange[0].endDate, 'yyyy-MM-dd'),
      people: people || '2',
      budget: budget || '1.5',
      mediaList
    };

    // 提交到后端
    Taro.request({
      url: 'YOUR_API_URL', // 替换为实际的API地址
      method: 'POST',
      data: submitData,
      success: () => {
        Taro.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 2000,
          success: () => {
            // 延迟返回，让用户看到成功提示
            setTimeout(() => {
              Taro.navigateTo({
                url: '/pages/index/index?needRefresh=true',
                success: () => {
                  // 关闭当前页面
                  Taro.navigateBack({
                    delta: 1
                  });
                }
              });
            }, 2000);
          }
        });
      },
      fail: (err) => {
        console.error('发布失败', err);
        Taro.showToast({
          title: '发布失败，请重试',
          icon: 'none'
        });
      }
    });
  };
  // 返回
  const handleBack = () => {
    Taro.navigateBack();
  };

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
        {mediaList.map((item, idx) => (
          <View className="media-item" key={idx}>
            {item.type === 'video' ? (
              <View className="media-video">
                <Image className="media-thumb" src={item.thumbTempFilePath || item.tempFilePath} mode="aspectFill" />
                <View className="icon play" />
              </View>
            ) : (
              <Image className="media-thumb" src={item.tempFilePath} mode="aspectFill" />
            )}
            {mediaList.length > 1 && <View className="icon close" onClick={() => handleRemoveMedia(idx)} />}
          </View>
        ))}
        {mediaList.length < 9 && (
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
        <View className="edit-row date-row" onClick={() => setShowDatePicker(!showDatePicker)}>
          <View className="icon calendar" />
          <View className="date-col">
            <Text className="edit-row-label">开始日期</Text>
            <Text className="date-value">{format(dateRange[0].startDate, 'yyyy-MM-dd')}</Text>
          </View>
          <Text className="edit-row-label">-</Text>
          <View className="date-col">
            <Text className="edit-row-label">结束日期</Text>
            <Text className="date-value">{format(dateRange[0].endDate, 'yyyy-MM-dd')}</Text>
          </View>
        </View>
        <View className={`date-picker-popup${showDatePicker ? '' : ' hide'}`}>
          <View className="date-picker-popup-header">
            <Text className="date-picker-reset" onClick={() => setDateRange([{ startDate: new Date(), endDate: new Date(), key: 'selection' }])}>重置</Text>
            <Text className="date-picker-ok" onClick={() => setShowDatePicker(false)}>完成</Text>
          </View>
          <DateRange
            editableDateInputs={true}
            onChange={item => setDateRange([item.selection])}
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
      <View className="edit-row" onClick={() => {
        const input = document.querySelector('.people-input') as HTMLInputElement;
        input?.focus();
      }}>
        <View className="icon people" />
        <Text className="edit-row-label">同行人数</Text>
        <Input 
          className="edit-input people-input"
          type="number"
          value={people} 
          onInput={e => setPeople(e.detail.value)} 
          placeholder="2"
          style={{ display: 'none' }}
        />
        <Text className="edit-input-value">{people || '2'}</Text>
        <Text className="edit-row-unit">人</Text>
      </View>
      <View className="custom-divider" />

      <View className="edit-row" onClick={() => {
        const input = document.querySelector('.budget-input') as HTMLInputElement;
        input?.focus();
      }}>
        <View className="icon budget" />
        <Text className="edit-row-label">总花费</Text>
        <Input 
          className="edit-input budget-input"
          type="digit"
          value={budget} 
          onInput={e => setBudget(e.detail.value)} 
          placeholder="1.5"
          style={{ display: 'none' }}
        />
        <Text className="edit-input-value">{budget || '1.5'}</Text>
        <Text className="edit-row-unit">千元</Text>
      </View>
      <View className="custom-divider" />

      {/* 发布按钮 */}
      <Button className="edit-submit" onClick={handleSubmit}>发布</Button>
    </View>
  );
};

export default Edit; 