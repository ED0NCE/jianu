import React, { useState, useEffect } from 'react'
import { View, ScrollView, Text, Image, Textarea } from '@tarojs/components'
import WaterfallCard, { WaterfallCardProps } from '../../components/WaterfallCard/WaterfallCard'
import CustomTabBar from '../../components/CustomTabBar'
import './personal.scss'

interface Profile {
  avatar: string
  name: string
  travels: number
  likes: string
  bio: string
}

const mockProfile: Profile = {
  avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  name: '旅行达人小美',
  travels: 128,
  likes: '2.4k',
  bio: '热爱旅行和摄影的90后，去过30+国家，喜欢记录旅途中的美好瞬间。热爱旅行和摄影的90后，去过30+国家，喜欢记录旅途中的美好瞬间。',
}

const mockPosts: WaterfallCardProps[] = [
  {
    tag: '',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    title: '圣托里尼的日落时光',
    days: 0,
    people: 0,
    cost: '',
    likes: 1.2,
    date: '2023-05-15',
  },
  {
    tag: '',
    imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
    title: '悉尼歌剧院黄昏悉尼歌剧院黄昏悉尼歌剧院黄昏悉尼歌剧院黄昏悉尼歌剧院黄昏',
    days: 0,
    people: 0,
    cost: '',
    likes: 1.3,
    date: '2023-02-10',
  },
  // ... 更多
]

const tabs = ['已发布', '审核中', '未通过']

const PersonalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [posts, setPosts] = useState<WaterfallCardProps[]>([])

  useEffect(() => {
    // TODO: 根据 activeTab 请求不同状态的数据
    setPosts(activeTab === 0 ? mockPosts : [])
  }, [activeTab])

  return (
    <View className="page page-personal">
      <View className="profile">
        <View className="profile-info">
          <Image src={mockProfile.avatar} className="avatar" />
          <View className="info">
            <View className="name">{mockProfile.name}</View>
            <View className="meta">
              <Text>{mockProfile.travels} 游记</Text>
              <Text className="meta-likes">{mockProfile.likes} 获赞</Text>
            </View>
          </View>
        </View>
        <View className="bio">
          <Text>{mockProfile.bio}</Text>
        </View>
      </View>

      <View className="tabs">
        {tabs.map((t, i) => (
          <Text
            key={i}
            className={`tab-item ${activeTab === i ? 'active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {t}
          </Text>
        ))}
      </View>

      <ScrollView scrollY className="wf-container">
        <View className="wf-column">
          {posts.filter((_, i) => i % 2 === 0).map((item, idx) => (
            <WaterfallCard key={idx} {...item} />
          ))}
        </View>
        <View className="wf-column">
          {posts.filter((_, i) => i % 2 === 1).map((item, idx) => (
            <WaterfallCard key={idx} {...item} />
          ))}
        </View>
      </ScrollView>

      <CustomTabBar />
    </View>
  )
}

export default PersonalPage
