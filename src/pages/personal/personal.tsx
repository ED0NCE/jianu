import React, { useState, useEffect } from 'react'
import { View, ScrollView, Text, Image, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro';
import './personal.scss'

import WaterfallCard, { WaterfallCardProps } from '../../components/WaterfallCard/WaterfallCard'
import CustomTabBar from '../../components/CustomTabBar'
import { userInfo } from 'os';

interface Profile {
  userid: string
  avatar: string
  name: string
  travels: number
  likes: string
  bio: string
}

const mockProfile: Profile = {
  userid: 'user123',
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
    likes: 1200,
    date: '2023-05-15',
  },
  {
    tag: '',
    imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
    title: '悉尼歌剧院黄昏悉尼歌剧院黄昏悉尼歌剧院黄昏悉尼歌剧院黄昏悉尼歌剧院黄昏',
    days: 0,
    people: 0,
    cost: '',
    likes: 1300,
    date: '2023-02-10',
  },
  // ... 更多
]

const tabs = ['已发布', '审核中', '未通过']

const PersonalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [posts, setPosts] = useState<WaterfallCardProps[]>([])
  const [showMenu, setShowMenu] = useState(false)

  // 点赞事件
  const handleLikeChange = (index: number, newLikes: number) => {
    setPosts(prevPosts => {
      const updatedPosts = [...prevPosts]
      updatedPosts[index].likes = newLikes
      return updatedPosts
    })
  }
  // 菜单事件
  const handleMenu = () => {
    setShowMenu(true)
  }
  const handleMenuClose = () => {
    setShowMenu(false)
  }
  const handleMsg = () => {
    setShowMenu(false)
    Taro.showToast({ title: '消息列表', icon: 'none' })
  }
  const handleEdit = () => {
    setShowMenu(false)
    Taro.showToast({ title: '编辑成功', icon: 'none' })
  }
  const handleLogout = () => {
    setShowMenu(false)
    Taro.showModal({
          title: '提示',
          content: '确定要删除游记吗？',
          success: res => {
            if (res.confirm) {
              // 假设后端接口为 /api/travelogue/delete?id=xxx
              Taro.request({
                url: `https://your-backend-domain.com/api/travelogue/delete`,
                method: 'POST',
                data: { id: mockProfile.userid },
                success: (resp) => {
                  if (resp.statusCode === 200 && resp.data.success) {
                    Taro.showToast({ title: '成功退出登录', icon: 'none' });
                    setTimeout(() => {
                      Taro.redirectTo({ url: '/pages/login/login' });
                    }, 800);
                  } else {
                    Taro.showToast({ title: '退出失败', icon: 'none' });
                  }
                },
                fail: () => {
                  Taro.showToast({ title: '网络错误', icon: 'none' });
                }
              });
            }
          }
        });
  }
  useEffect(() => {
    // TODO: 根据 activeTab 请求不同状态的数据
    setPosts(activeTab === 0 ? mockPosts : [])
  }, [activeTab])


  return (
    <View className="page page-personal">
      {/* 顶部固钉栏 */}
      <View className="personal-navbar" onClick={handleMenu}>
        <View className="icon nav-menu" />
      </View>

      {/* 右上角菜单弹窗 */}
      {showMenu && (
        <View className="popup-menu-mask" onClick={handleMenuClose}>
          <View className="popup-menu" onClick={e => e.stopPropagation()}>
            <View className="popup-menu-item" onClick={handleMsg}>
              <View className="popup-menu-icon" style={{backgroundImage: `url(data:image/svg+xml;utf8,<svg fill='%234FC3F7' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.03-.47-.09-.7l7.02-4.11A2.99 2.99 0 0 0 18 7.91c1.66 0 3 1.34 3 3s-1.34 3-3 3zm-12 2c-1.66 0-3-1.34-3-3s1.34-3 3-3c.24 0 .47.04.7.09l7.02-4.11A2.99 2.99 0 0 1 12 7.91c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3c-.76 0-1.44.3-1.96.77L4.91 11.3c-.05.23-.09.46-.09.7s.03.47.09.7l7.02 4.11c.52.47 1.2.77 1.96.77 1.66 0 3-1.34 3-3s-1.34-3-3-3z'/></svg>)`}} />
              消息列表
            </View>
            {<View className="popup-menu-item" onClick={handleEdit}>
              <View className="popup-menu-icon" style={{backgroundImage: `url(data:image/svg+xml;utf8,<svg fill='%23FFB300' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/></svg>)`}} />
              编辑资料
            </View>}
            {<View className="popup-menu-item delete" onClick={handleLogout}>
              <View className="popup-menu-icon" style={{backgroundImage: `url(data:image/svg+xml;utf8,<svg fill='%23FF5252' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1z'/></svg>)`}} />
              退出登录
            </View>}
          </View>
        </View>
      )}
      {/* 个人信息简介 */}
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

      {/* 标题-已发布/审核中/未通过 */}
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

      {/* 内容 */}
      <ScrollView scrollY className="wf-container">
        <View className="wf-column">
          {posts.filter((_, i) => i % 2 === 0).map((item, idx) => (
            <WaterfallCard key={idx} {...item} onLikeChange={(newLikes) => handleLikeChange(idx * 2, newLikes)}/>
          ))}
        </View>
        <View className="wf-column">
          {posts.filter((_, i) => i % 2 === 1).map((item, idx) => (
            <WaterfallCard key={idx} {...item} onLikeChange={(newLikes) => handleLikeChange(idx * 2 + 1, newLikes)}/>
          ))}
        </View>
      </ScrollView>

      {/* tabbar栏 */}
      <CustomTabBar />
    </View>
  )
}

export default PersonalPage
