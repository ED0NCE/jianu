import React, { useState } from 'react'
import { View, Image, Text } from '@tarojs/components'
import { HeartOutline, HeartFill } from 'antd-mobile-icons'
import './WaterfallCard.scss'

export interface WaterfallCardProps {
  /** 顶部小标签，比如 “日本”、“希腊” */
  tag?: string
  /** 卡片图片 */
  imageUrl: string
  /** 标题 */
  title: string
  /** 天数 */
  days?: number
  /** 人数 */
  people?: number
  /** 花销，如 "15k" */
  cost?: string
  /** 点赞数，如 2.8k */
  likes: number
  /** 可选：发布日期，用于个人页面 */
  date?: string
  /** 头像 */
  avatarUrl?: string
  /** 作者昵称 */
  nickname?: string
  /** 点击回调 */
  onClick?: () => void
}

const WaterfallCard: React.FC<WaterfallCardProps> = ({
  tag,
  imageUrl,
  title,
  days,
  people,
  cost,
  likes,
  date,
  avatarUrl,
  nickname,
  onClick,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const handleLikeClick = () => {
    setIsLiked(!isLiked);
  };
  return (
    <View className="wf-card" onClick={onClick}>
      <View className="wf-card__img-wrap">
        <Image src={imageUrl} className="wf-card__img" mode="aspectFill" />
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
                <Text className="wf-card__meta-num">{people}</Text>
              </View>
              <View className="wf-card__meta">
                <Text>花销</Text>
                <Text className="wf-card__meta-num">{cost}</Text>
              </View>
            </>
          )}
        </View>

        <View className="wf-card__footer">
          {avatarUrl && <Image src={avatarUrl} className="wf-card__avatar" mode="aspectFill" />}
          {nickname && <Text className="wf-card__nickname">{nickname}</Text>}
          <Text
            className={`wf-card__likes ${isLiked ? 'wf-card__likes--active' : ''}`}
            onClick={handleLikeClick}
          >
            {isLiked ? <HeartFill /> : <HeartOutline />}
            <Text className="wf-card__likes-num">
              {likes}k
            </Text>
          </Text>
        </View>

      </View>
    </View>
  )
}

export default WaterfallCard
