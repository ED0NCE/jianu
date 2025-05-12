import React, { useMemo } from 'react'
import { View, ScrollView } from '@tarojs/components'
import WaterfallCard from '../WaterfallCard/WaterfallCard'
import type { WaterfallListProps } from '../../types/waterfallCard'
import './WaterfallList.scss'

// 骨架屏组件
const WaterfallCardSkeleton: React.FC = () => {
  return (
    <View className="wf-card skeleton">
      <View className="wf-card__img-wrap skeleton-pulse" />
      <View className="wf-card__body">
        <View className="wf-card__title-skeleton skeleton-pulse" />
        <View className="wf-card__info-skeleton">
          <View className="wf-card__meta-skeleton skeleton-pulse" />
          <View className="wf-card__meta-skeleton skeleton-pulse" />
          <View className="wf-card__meta-skeleton skeleton-pulse" />
        </View>
        <View className="wf-card__footer-skeleton">
          <View className="wf-card__avatar-skeleton skeleton-pulse" />
          <View className="wf-card__nickname-skeleton skeleton-pulse" />
          <View className="wf-card__likes-skeleton skeleton-pulse" />
        </View>
      </View>
    </View>
  );
};

const WaterfallList: React.FC<WaterfallListProps> = ({
  data,
  onCardClick,
  onLikeChange,
  className = '',
  style = {},
  itemHeight = 300,
  onLoadMore,
  hasMore = true,
  loading = false
}) => {
  // 分成左右两列
  const { leftColumn, rightColumn } = useMemo(() => {
    const left = data.filter((_, i) => i % 2 === 0);
    const right = data.filter((_, i) => i % 2 === 1);
    return { leftColumn: left, rightColumn: right };
  }, [data]);

  // 监听滚动到底部事件
  const handleScrollToLower = () => {
    if (onLoadMore && hasMore && !loading) {
      onLoadMore();
    }
  }

  // 生成骨架屏
  const renderSkeletons = () => {
    // 显示6个骨架卡片（左右各2个）
    return (
      <View className="virtual-waterfall-content">
        <View className="virtual-waterfall-column">
          <WaterfallCardSkeleton />
          <WaterfallCardSkeleton />
          <WaterfallCardSkeleton />
        </View>
        <View className="virtual-waterfall-column">
          <WaterfallCardSkeleton />
          <WaterfallCardSkeleton />
          <WaterfallCardSkeleton />
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      scrollY
      className={`virtual-waterfall-container ${className}`}
      style={style}
      onScrollToLower={handleScrollToLower}
      lowerThreshold={100}
    >
      {/* 当没有数据且正在加载时显示骨架屏 */}
      {data.length === 0 && loading ? renderSkeletons() : (
        <View className="virtual-waterfall-content">
          <View className="virtual-waterfall-column">
            {leftColumn.map((item, idx) => (
              <WaterfallCard
                key={`left-${idx}`}
                {...item}
                onClick={item.travel_id && onCardClick ? () => onCardClick(item.travel_id!) : undefined}
                onLikeChange={(newLikes) => {
                  const originalIndex = data.findIndex(d => d.travel_id === item.travel_id);
                  onLikeChange && onLikeChange(originalIndex, newLikes);
                }}
              />
            ))}
          </View>
          <View className="virtual-waterfall-column">
            {rightColumn.map((item, idx) => (
              <WaterfallCard
                key={`right-${idx}`}
                {...item}
                onClick={item.travel_id && onCardClick ? () => onCardClick(item.travel_id!) : undefined}
                onLikeChange={(newLikes) => {
                  const originalIndex = data.findIndex(d => d.travel_id === item.travel_id);
                  onLikeChange && onLikeChange(originalIndex, newLikes);
                }}
              />
            ))}
          </View>
        </View>
      )}

      {/* 加载状态提示 */}
      {loading && data.length > 0 && (
        <View className="loading-indicator">加载中...</View>
      )}

      {/* 无更多数据提示 */}
      {!hasMore && data.length > 0 && (
        <View className="no-more-data">没有更多数据了</View>
      )}
    </ScrollView>
  );
};

export default WaterfallList;
