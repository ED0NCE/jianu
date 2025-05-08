import React, { useState, useEffect } from 'react'
import { View, ScrollView, Text, Image, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro';
import './personal.scss'

import WaterfallCard, { WaterfallCardProps } from '../../components/WaterfallCard/WaterfallCard'
import CustomTabBar from '../../components/CustomTabBar'
import { useUserStore } from '../../store/userStore'
import { FillinOutline } from 'antd-mobile-icons';

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
    id: 'travelogue101',
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
    id: 'travelogue102',
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
  const [avatarActive, setAvatarActive] = useState(false)
  
  // 从全局状态获取用户资料
  const { profile, updateProfile } = useUserStore()

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
    Taro.navigateTo({ url: '/pages/messages/messages' })
  }
  
  const handleEdit = () => {
    setShowMenu(false)
    Taro.navigateTo({ url: `/pages/editInfo/editInfo` })
  }
  
  const handleLogout = () => {
    setShowMenu(false)
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: res => {
        if (res.confirm) {
          // 假设后端接口为 /api/user/logout
          Taro.request({
            url: `https://your-backend-domain.com/api/user/logout`,
            method: 'POST',
            data: { id: profile.userid },
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
  
  // 头像上传处理
  const handleAvatarUpload = () => {
    // 添加点击反馈
    setAvatarActive(true)
    setTimeout(() => setAvatarActive(false), 300)
    
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const tempFilePaths = res.tempFilePaths[0]
        
        // 显示上传中
        Taro.showLoading({
          title: '上传中...',
        })
        
        // 上传图片到服务器（-------接口）
        Taro.uploadFile({
          url: 'https://your-backend-domain.com/api/upload/avatar',
          filePath: tempFilePaths,
          name: 'avatar',
          formData: {
            'userId': profile.userid
          },
          success: function (uploadRes) {
            Taro.hideLoading()
            
            // 解析返回的数据
            const data = JSON.parse(uploadRes.data)
            if (data.success) {
              // 更新头像到全局状态
              updateProfile({
                avatar: data.url || tempFilePaths
              })
              
              Taro.showToast({
                title: '头像更新成功',
                icon: 'success'
              })
            } else {
              Taro.showToast({
                title: '上传失败',
                icon: 'none'
              })
            }
          },
          fail: function () {
            Taro.hideLoading()
            
            // 开发环境下，直接使用本地路径更新头像预览
            updateProfile({
              avatar: tempFilePaths
            })
            
            Taro.showToast({
              title: '头像已更新（本地预览）',
              icon: 'none'
            })
          }
        })
      }
    })
  }
  
  // 处理卡片点击，跳转到详情页
  const handleCardClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/travelogue/travelogue?id=${id}`
    })
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
              <View className="popup-menu-icon">
                <FillinOutline />
              </View>
              消息列表
            </View>
            {<View className="popup-menu-item" onClick={handleEdit}>
              <View className="popup-menu-icon">
                <FillinOutline />
              </View>
              编辑资料
            </View>}
            {<View className="popup-menu-item delete" onClick={handleLogout}>
              <View className='popup-menu-icon'>
                <FillinOutline />
              </View>
              退出登录
            </View>}
          </View>
        </View>
      )}
      {/* 个人信息简介 */}
      <View className="profile">
        <View className="profile-info">
          <Image 
            src={profile.avatar} 
            className={`avatar ${avatarActive ? 'avatar-active' : ''}`} 
            onClick={handleAvatarUpload}
          />
          <View className="info">
            <View className="name">{profile.name}</View>
            <View className="meta">
              <Text>{profile.travels} 游记</Text>
              <Text className="meta-likes">{profile.likes} 获赞</Text>
            </View>
          </View>
        </View>
        <View className="bio">
          <Text>{profile.bio || ''}</Text>
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
            <WaterfallCard 
              key={idx} 
              {...item} 
              onClick={item.id ? () => handleCardClick(item.id!) : undefined}
              onLikeChange={(newLikes) => handleLikeChange(idx * 2, newLikes)}
            />
          ))}
        </View>
        <View className="wf-column">
          {posts.filter((_, i) => i % 2 === 1).map((item, idx) => (
            <WaterfallCard 
              key={idx} 
              {...item} 
              onClick={item.id ? () => handleCardClick(item.id!) : undefined}
              onLikeChange={(newLikes) => handleLikeChange(idx * 2 + 1, newLikes)}
            />
          ))}
        </View>
      </ScrollView>

      {/* tabbar栏 */}
      <CustomTabBar />
    </View>
  )
}

export default PersonalPage
