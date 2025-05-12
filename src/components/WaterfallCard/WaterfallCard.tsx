import React, { useState, useEffect, useCallback } from 'react'
import { View, Image, Text } from '@tarojs/components'
import { HeartOutline, HeartFill } from 'antd-mobile-icons'
import Taro from '@tarojs/taro'
import type { WaterfallCardProps } from '../../types/waterfallCard'
import './WaterfallCard.scss'
import { isLiked, toggleLikedTravelogue } from '../../utils/likeStorage'
import { toggleLike } from '../../api/user'

// 重新导出WaterfallCardProps类型
export type { WaterfallCardProps };

/**
 * WaterfallCard 组件显示一个瀑布流布局的游记卡片
 */
const WaterfallCard: React.FC<WaterfallCardProps> = (props) => {
  const {
    travel_id,
    tag = '',
    images = [],
    title = '',
    days = 0,
    participants = 0,
    expenditure = '',
    likes = 0,
    date,
    avatarUrl,
    nickname,
    onClick,
    onLikeChange
  } = props;

  const [isLikedState, setIsLikedState] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);

  // 检查初始点赞状态
  useEffect(() => {
    if (travel_id) {
      setIsLikedState(isLiked(travel_id));
    }
  }, [travel_id]);

  // 同步传入的likes和本地状态
  useEffect(() => {
    setLocalLikes(likes);
  }, [likes]);

  /**
   * 使用指数退避重试点赞API调用
   */
  const retryToggleLike = useCallback((travelId: number, retry = 0) => {
    if (retry > 3) return; // Maximum 3 retries

    setTimeout(() => {
      toggleLike(travelId)
        .catch(error => {
          console.error(`重试点赞失败 (${retry + 1}/3):`, error);
          retryToggleLike(travelId, retry + 1);
        });
    }, 1000 * (retry + 1)); // 逐渐增加重试间隔
  }, []);

  /**
   * 处理点赞/取消点赞按钮点击
   */
  const handleLikeClick = useCallback((e) => {
    // 阻止事件冒泡到卡片点击
    e.stopPropagation();

    if (!travel_id) return;

    const newLikes = isLikedState ? localLikes - 1 : localLikes + 1;

    // 先更新UI状态，确保用户体验流畅
    setIsLikedState(!isLikedState);
    setLocalLikes(newLikes);

    // 显示Toast通知
    Taro.showToast({
      title: isLikedState ? '取消点赞' : '点赞成功',
      icon: 'none'
    });

    // 更新本地存储
    toggleLikedTravelogue({...props, likes: newLikes});

    // 点赞后立即通知父组件
    onLikeChange && onLikeChange(newLikes);

    // 异步调用API
    toggleLike(Number(travel_id))
      .catch(error => {
        console.error(isLikedState ? '取消点赞失败:' : '点赞失败:', error);
        // 错误时重试
        retryToggleLike(Number(travel_id));
      });
  }, [travel_id, isLikedState, localLikes, props, onLikeChange, retryToggleLike]);

  return (
    <View className="wf-card" onClick={onClick}>
      <View className="wf-card__img-wrap">
        <Image src={images && images.length > 0 ? images[0] : 'https://via.placeholder.com/300'} className="wf-card__img" mode="aspectFill" />
        <Text className="wf-card__tag">{tag}</Text>
      </View>
      <View className="wf-card__body">
        <Text className="wf-card__title">{title}</Text>
        <View className="wf-card__info">
          {date ? (
            <Text className="wf-card__date">{date}</Text>
          ) : (
            <>
              <View className="wf-card__meta">
                <Text>天数</Text>
                <Text className="wf-card__meta-num">{days}</Text>
              </View>
              <View className="wf-card__meta">
                <Text>人数</Text>
                <Text className="wf-card__meta-num">{participants}</Text>
              </View>
              <View className="wf-card__meta">
                <Text>花销</Text>
                <Text className="wf-card__meta-num">{expenditure}</Text>
              </View>
            </>
          )}
        </View>

        <View className="wf-card__footer">
          {avatarUrl && <Image src={avatarUrl} className="wf-card__avatar" mode="aspectFill" />}
          {nickname && <Text className="wf-card__nickname">{nickname}</Text>}
          <View
            className={`wf-card__likes ${isLikedState ? 'wf-card__likes--active' : ''}`}
            onClick={handleLikeClick}
          >
            {isLikedState ? <HeartFill /> : <HeartOutline />}
            <Text className="wf-card__likes-num">
              {localLikes}
            </Text>
          </View>
        </View>

      </View>
    </View>
  )
}

export default WaterfallCard
