import React, { useMemo } from 'react'
import { View, ScrollView } from '@tarojs/components'
import WaterfallCard from '../WaterfallCard/WaterfallCard'
import type { WaterfallCardProps } from '../../types/waterfallCard'
import './VirtualWaterfallList.scss'

interface VirtualWaterfallListProps {
  data: WaterfallCardProps[]
  onCardClick?: (id: string) => void
  onLikeChange?: (index: number, newLikes: number) => void
  className?: string
  style?: React.CSSProperties
  itemHeight?: number
  onLoadMore?: () => void
}

const VirtualWaterfallList: React.FC<VirtualWaterfallListProps> = ({
  data,
  onCardClick,
  onLikeChange,
  className = '',
  style = {},
  itemHeight = 300,
  onLoadMore
}) => {
  // 分成左右两列
  const { leftColumn, rightColumn } = useMemo(() => {
    const left = data.filter((_, i) => i % 2 === 0);
    const right = data.filter((_, i) => i % 2 === 1);
    return { leftColumn: left, rightColumn: right };
  }, [data]);

  // 监听滚动到底部事件
  const handleScrollToLower = () => {
    if (onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <ScrollView
      scrollY
      className={`virtual-waterfall-container ${className}`}
      style={style}
      onScrollToLower={handleScrollToLower}
      lowerThreshold={100}
    >
      <View className="virtual-waterfall-content">
        <View className="virtual-waterfall-column">
          {leftColumn.map((item, idx) => (
            <WaterfallCard
              key={`left-${idx}`}
              {...item}
              onClick={item.id && onCardClick ? () => onCardClick(item.id!) : undefined}
              onLikeChange={(newLikes) => {
                const originalIndex = data.findIndex(d => d.id === item.id);
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
              onClick={item.id && onCardClick ? () => onCardClick(item.id!) : undefined}
              onLikeChange={(newLikes) => {
                const originalIndex = data.findIndex(d => d.id === item.id);
                onLikeChange && onLikeChange(originalIndex, newLikes);
              }}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default VirtualWaterfallList;
