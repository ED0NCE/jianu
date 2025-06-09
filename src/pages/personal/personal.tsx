import React, { useState, useEffect } from 'react'
import { View, ScrollView, Text, Image, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro';
import './personal.scss'

import WaterfallCard from '../../components/WaterfallCard/WaterfallCard'
import type { WaterfallCardProps } from '../../types/waterfallCard'
import CustomTabBar from '../../components/CustomTabBar'
import { useUserStore } from '../../store/userStore'
import { checkLogin } from '../../utils/auth'
import { FillinOutline } from 'antd-mobile-icons';
// 从API模块中导入获取点赞列表方法
import { toggleLike } from '../../api/user';

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
    travel_id: 'travelogue001',
    tag: '日本',
    images: ['https://images.unsplash.com/photo-1469474968028-56623f02e42e'],
    title: '圣托里尼的日落时光',
    days: 0,
    participants: 0,
    expenditure: '',
    likes: 1200,
    date: '2023-05-15',
  },
  {
    travel_id: 'travelogue102',
    tag: '马来西亚',
    images: ['https://images.unsplash.com/photo-1500534314209-a25ddb2bd429'],
    title: '悉尼歌剧院黄昏悉尼歌剧院黄昏悉尼歌剧院黄昏悉尼歌剧院黄昏悉尼歌剧院黄昏',
    days: 0,
    participants: 0,
    expenditure: '',
    likes: 1300,
    date: '2023-02-10',
  },
  {
    travel_id: 'travelogue103',
    tag: '泰国',
    images: ['https://images.unsplash.com/photo-1516815231560-8f41ec531527'],
    title: '清迈的宁静时光',
    days: 0,
    participants: 0,
    expenditure: '',
    likes: 980,
    date: '2023-04-12',
  },
  {
    travel_id: 'travelogue104',
    tag: '法国',
    images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34'],
    title: '巴黎铁塔的黄昏',
    days: 0,
    participants: 0,
    expenditure: '',
    likes: 1450,
    date: '2023-03-25',
  },
  // ... 更多
]

// 添加"我喜欢"标签
const tabs = ['已发布', '审核中', '未通过', '我喜欢']

const PersonalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [posts, setPosts] = useState<WaterfallCardProps[]>([])
  const [likedPosts, setLikedPosts] = useState<WaterfallCardProps[]>([])
  const [showMenu, setShowMenu] = useState(false)
  const [avatarActive, setAvatarActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 从全局状态获取用户资料和登出方法 - store已自动从本地存储初始化
  const { profile, isLoggedIn, localLogout, updateProfile } = useUserStore()

  // 检查登录状态
  useEffect(() => {
    // 检查登录状态，如果未登录跳转到登录页
    checkLogin();
  }, [])

  // 页面显示时更新数据
  useEffect(() => {
    const onShow = () => {
      // 页面显示时，如果需要可以刷新数据
      if (isLoggedIn && activeTab === 3) {
        // 重新加载喜欢列表
        loadLikedPosts();
      }
    }

    Taro.eventCenter.on('PAGE_SHOW', onShow)

    return () => {
      Taro.eventCenter.off('PAGE_SHOW', onShow)
    }
  }, [isLoggedIn, activeTab])

  // 加载喜欢的游记
  const loadLikedPosts = () => {
    setIsLoading(true);
    // 从API获取喜欢的游记列表，而不是从本地存储
    // 假设这个API会返回用户喜欢的所有游记列表
    Taro.request({
      url: 'https://your-backend-domain.com/api/user/likes',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${Taro.getStorageSync('token')}`
      },
      success: function (res) {
        if (res.statusCode === 200) {
          // 假设API返回的数据结构是包含游记列表的对象
          setLikedPosts(res.data || []);
        } else {
          Taro.showToast({
            title: '获取点赞列表失败',
            icon: 'none'
          });
        }
      },
      fail: function () {
        Taro.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        // 开发环境下可以使用模拟数据
        setLikedPosts([]);
      },
      complete: function () {
        setIsLoading(false);
      }
    });
  }

  // 当切换到"我喜欢"标签时，加载喜欢的游记
  useEffect(() => {
    setIsLoading(true);
    if (activeTab === 3) {
      // 使用setTimeout延迟加载，确保UI先更新
      setTimeout(() => {
        loadLikedPosts();
      }, 10);
    } else {
      // 根据 activeTab 请求不同状态的数据
      setPosts(activeTab === 0 ? mockPosts : []);
      setIsLoading(false);
    }
  }, [activeTab])

  // 点赞事件
  const handleLikeChange = (index: number, newLikes: number) => {
    // 无论在哪个标签页，都更新当前显示的游记列表
    if (activeTab === 3) {
      // 在"我喜欢"标签页中，需要重新获取点赞列表
      // 这里可以给一个短暂的延迟，让API有时间处理完请求
      setTimeout(() => {
        loadLikedPosts();
      }, 300);
    } else {
      // 其他标签页正常更新状态
      setPosts(prevPosts => {
        const updatedPosts = [...prevPosts]
        if (updatedPosts[index]) {
          updatedPosts[index].likes = newLikes
        }
        return updatedPosts
      })
    }
  }

  // 处理标签切换
  const handleTabChange = (index: number) => {
    setIsLoading(true);
    setActiveTab(index);
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
          // 使用userStore的logout方法退出登录
          localLogout()

          Taro.showToast({
            title: '成功退出登录',
            icon: 'success',
            duration: 1500,
            success: () => {
              // 跳转到登录页面
              setTimeout(() => {
                Taro.navigateTo({
                  url: '/pages/index/index'
                })
              }, 1500)
            }
          });
        }
      }
    });
  }

  // 更新头像处理
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
            'nickname': profile.nickname
          },
          success: function (uploadRes) {
            Taro.hideLoading()

            // 解析返回的数据
            const data = JSON.parse(uploadRes.data)
            if (data.success) {
              const newAvatar = data.url || tempFilePaths

              // 更新头像到全局状态
              updateProfile({
                avatar: newAvatar
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

            const newAvatar = tempFilePaths

            // 开发环境下，直接使用本地路径更新头像预览
            updateProfile({
              avatar: newAvatar
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

  // 如果未登录状态，不显示内容
  if (!isLoggedIn) {
    return <View className="page page-personal loading"></View>
  }

  // 当前要显示的列表数据
  const currentPosts = activeTab === 3 ? likedPosts : posts;

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
            <View className="name">{profile.nickname}</View>
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

      {/* 标题-已发布/审核中/未通过/我喜欢 */}
      <View className="tabs">
        {tabs.map((t, i) => (
          <Text
            key={i}
            className={`tab-item ${activeTab === i ? 'active' : ''}`}
            onClick={() => handleTabChange(i)}
          >
            {t}
          </Text>
        ))}
      </View>

      {/* 内容 */}
      <ScrollView scrollY className="wf-container">
        {isLoading ? (
          <View className="loading-container">
            <View className="loading-state">加载中...</View>
          </View>
        ) : currentPosts && currentPosts.length > 0 ? (
          <>
            <View className="wf-column">
              {currentPosts.filter((_, i) => i % 2 === 0).map((item, idx) => (
                <WaterfallCard
                  key={`${activeTab}-${idx}-${item.travel_id}`}
                  {...item}
                  onClick={item.travel_id ? () => handleCardClick(item.travel_id!) : undefined}
                  onLikeChange={(newLikes) => handleLikeChange(idx * 2, newLikes)}
                />
              ))}
            </View>
            <View className="wf-column">
              {currentPosts.filter((_, i) => i % 2 === 1).map((item, idx) => (
                <WaterfallCard
                  key={`${activeTab}-${idx}-${item.travel_id}`}
                  {...item}
                  onClick={item.travel_id ? () => handleCardClick(item.travel_id!) : undefined}
                  onLikeChange={(newLikes) => handleLikeChange(idx * 2 + 1, newLikes)}
                />
              ))}
            </View>
          </>
        ) : (
          <View className="empty-state-container">
            <View className="empty-state">
              {activeTab === 3 ? '你还没有点赞过任何游记哦~' : '这里还没有内容哦~'}
            </View>
          </View>
        )}
      </ScrollView>

      {/* tabbar栏 */}
      <CustomTabBar />
    </View>
  )
}

export default PersonalPage
