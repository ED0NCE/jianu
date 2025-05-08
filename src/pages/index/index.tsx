import React, { useState, useEffect } from 'react'
import { View, ScrollView, Text, Input } from '@tarojs/components'
import WaterfallCard, { WaterfallCardProps } from '../../components/WaterfallCard/WaterfallCard'
import { SearchBar } from 'antd-mobile'
import Taro from '@tarojs/taro'
import './index.scss'

import CustomTabBar from '../../components/CustomTabBar'

const sampleData: WaterfallCardProps[] = [
  {
    id: 'travelogue001',
    tag: '日本',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    title: '日本樱花季｜漫步京都古寺，感受春日浪漫',
    days: 7,
    people: 2,
    cost: '15k',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    nickname: 'Jane Doe',
    likes: 2800,
  },
  {
    id: 'travelogue002',
    tag: '马尔代夫',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    title: '马尔代夫｜水上屋的奢华度假体验',
    days: 5,
    people: 2,
    cost: '30k',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    nickname: 'Jane Doe',
    likes: 4500,
  },
  {
    id: 'travelogue003',
    tag: '马尔代夫',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    title: '马尔代夫｜水上屋的奢华度假体验',
    days: 5,
    people: 2,
    cost: '30k',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    nickname: 'Jane Doe',
    likes: 4500,
  },
  {
    id: 'travelogue004',
    tag: '马尔代夫',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    title: '马尔代夫｜水上屋的奢华度假体验',
    days: 5,
    people: 2,
    cost: '30k',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    nickname: 'Jane Doe',
    likes: 4500,
  },
  {
    id: 'travelogue005',
    tag: '日本',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    title: '日本樱花季｜漫步京都古寺，感受春日浪漫',
    days: 7,
    people: 2,
    cost: '15k',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    nickname: 'Jane Doe',
    likes: 2800,
  },
  {
    id: 'travelogue006',
    tag: '日本',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    title: '日本樱花季｜漫步京都古寺，感受春日浪漫',
    days: 7,
    people: 2,
    cost: '15k',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    nickname: 'Jane Doe',
    likes: 2800,
  },
  {
    id: 'travelogue007',
    tag: '马尔代夫',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    title: '马尔代夫｜水上屋的奢华度假体验',
    days: 5,
    people: 2,
    cost: '30k',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    nickname: 'Jane Doe',
    likes: 4500,
  },{
    id: 'travelogue008',
    tag: '马尔代夫',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    title: '马尔代夫｜水上屋的奢华度假体验水上屋的奢华度假体验水上屋的奢华度假体验水上屋的奢华度假体验水上屋的奢华度假体验',
    days: 5,
    people: 2,
    cost: '30k',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    nickname: 'Jane Doe',
    likes: 4500,
  },{
    id: 'travelogue009',
    tag: '马尔代夫',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    title: '马尔代夫｜水上屋的奢华度假体验',
    days: 5,
    people: 2,
    cost: '30k',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    nickname: 'Jane Doe',
    likes: 4500,
  },
]

const HomePage: React.FC = () => {
  const [list, setList] = useState<WaterfallCardProps[]>([])
  const handleLikeChange = (index: number, newLikes: number) => {
    setList(prevPosts => {
      const updatedPosts = [...prevPosts]
      updatedPosts[index].likes = newLikes
      return updatedPosts
    })
  }
  
  useEffect(() => {
    // TODO: 替换成真实接口调用
    setList(sampleData)
  }, [])

  // 处理搜索框点击，跳转到搜索页面
  const handleSearchClick = () => {
    Taro.navigateTo({ url: '/pages/search/search' })
  }
  
  // 处理卡片点击，跳转到详情页
  const handleCardClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/travelogue/travelogue?id=${id}`
    })
  }

  return (
    <View className="page page-index">

      {/* 搜索框 */}
      <View className="search-wrapper">
        <SearchBar
          placeholder="搜索游记/目的地"
          className="search-input"
          onFocus={handleSearchClick}
        />
      </View>

      {/* 瀑布流内容部分 */}
      <ScrollView scrollY className="wf-container" style={{ flexDirection: 'row' }}>
        <View className="wf-column">
          {list.filter((_, i) => i % 2 === 0).map((item, idx) => (
            <WaterfallCard 
              key={idx} 
              {...item} 
              onClick={item.id ? () => handleCardClick(item.id!) : undefined}
              onLikeChange={(newLikes) => handleLikeChange(idx * 2, newLikes)}
            />
          ))}
        </View>
        <View className="wf-column">
          {list.filter((_, i) => i % 2 === 1).map((item, idx) => (
            <WaterfallCard 
              key={idx} 
              {...item} 
              onClick={item.id ? () => handleCardClick(item.id!) : undefined}
              onLikeChange={(newLikes) => handleLikeChange(idx * 2 + 1, newLikes)}
            />
          ))}
        </View>
      </ScrollView>

      {/* 自定义TabBar */}
      <CustomTabBar />
    </View>
  )
}

export default HomePage

