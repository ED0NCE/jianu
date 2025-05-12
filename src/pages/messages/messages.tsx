import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro'
import './messages.scss'

import { checkLogin } from '../../utils/auth'
import { LeftOutline } from 'antd-mobile-icons'
import { getMessageList } from '@/api/user'
import type{ Message, ApiResponse } from '@/types/user'
import { MessageType, ReviewStatus } from '@/types/user'


// 模拟消息数据
const mockMessages: Message[] = [
  {
    id: '1',
    type: MessageType.REVIEW,
    title: '游记审核通过',
    content: '您的游记《北京三日游攻略》已审核通过，现在可在平台展示。',
    status: ReviewStatus.APPROVED,
    createdAt: '2023-11-15 10:30',
    isRead: false,
    thumbnail: 'https://images.unsplash.com/photo-1613677135043-a2512fbf49fa',
  },
  {
    id: '2',
    type: MessageType.REVIEW,
    title: '游记审核中',
    content: '您的游记《上海外滩一日游》正在审核中，请耐心等待。',
    status: ReviewStatus.PENDING,
    createdAt: '2023-11-14 16:45',
    isRead: false,
    thumbnail: 'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403',
  },
  {
    id: '3',
    type: MessageType.REVIEW,
    title: '游记审核未通过',
    content: '您的游记《香港迪士尼攻略》未通过审核，原因：内容包含广告信息，请修改后重新提交。',
    status: ReviewStatus.REJECTED,
    createdAt: '2023-11-10 09:15',
    isRead: false,
    thumbnail: 'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403',
  },
  {
    id: '4',
    type: MessageType.LIKE,
    title: '获得点赞',
    content: '旅行者小明点赞了您的游记《北京三日游攻略》',
    createdAt: '2023-11-14 08:30',
    isRead: false,
    thumbnail: 'https://images.unsplash.com/photo-1613677135043-a2512fbf49fa',
    fromUser: {
      nickname: '旅行者小明',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    },
  },
  {
    id: '5',
    type: MessageType.LIKE,
    title: '获得点赞',
    content: '旅行达人张三点赞了您的游记《上海外滩一日游》',
    createdAt: '2023-11-13 14:20',
    isRead: false,
    thumbnail: 'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403',
    fromUser: {
      nickname: '旅行达人张三',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
    },
  },
  {
    id: '6',
    type: MessageType.LIKE,
    title: '获得点赞',
    content: '摄影师李四点赞了您的游记《香港迪士尼攻略》',
    createdAt: '2023-11-12 20:10',
    isRead: false,
    thumbnail: 'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403',
    fromUser: {
      nickname: '摄影师李四',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
    },
  }
]


const MessagePage: React.FC = () => {

  const [activeTab, setActiveTab] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [nickname, setNickname] = useState('')

  // 检查登录状态
  useEffect(() => {
    checkLogin();
  }, []);

  // 页面显示时获取消息
  useDidShow(() => {
    fetchMessages();
    const userInfo = Taro.getStorageSync('userProfile')
    setNickname(userInfo.nickname)
  });

  // 从服务器获取消息
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await getMessageList({nickname}) as ApiResponse;
      // 如果API返回成功，使用API数据
      if (response && response.data) {
        setMessages(response.data);
        // 保存到本地存储
        Taro.setStorageSync('messages', JSON.stringify(response.data));
      } else {
        // 如果API返回为空，尝试使用本地存储数据
        loadLocalMessages();
      }
    } catch (error) {
      console.error('获取消息列表失败:', error);
      // 如果API请求失败，尝试使用本地存储数据
      loadLocalMessages();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 从本地存储加载消息
  const loadLocalMessages = () => {
    try {
      const messagesStr = Taro.getStorageSync('messages');
      if (messagesStr) {
        // 如果存在，使用存储的消息
        const savedMessages = JSON.parse(messagesStr);
        setMessages(savedMessages);
      } else {
        // 如果不存在，使用模拟数据并保存到本地
        setMessages(mockMessages);
        Taro.setStorageSync('messages', JSON.stringify(mockMessages));
      }
    } catch (error) {
      console.error('初始化消息失败:', error);
      // 出错时使用模拟数据
      setMessages(mockMessages);
    }
  };

  // 标签页
  const tabs = ['全部消息', '审核通知', '点赞']

  // 根据标签筛选消息
  useEffect(() => {
    let filtered = [...messages];

    // 根据标签筛选消息
    if (activeTab === 1) {
      filtered = messages.filter(msg => msg.type === MessageType.REVIEW)
    } else if (activeTab === 2) {
      filtered = messages.filter(msg => msg.type === MessageType.LIKE)
    }

    setFilteredMessages(filtered)
  }, [activeTab, messages])

  // 标记消息为已读
  const markAsRead = (id: string) => {
    const updatedMessages = messages.map(msg =>
      msg.id === id ? { ...msg, isRead: true } : msg
    )
    setMessages(updatedMessages)

    // 更新本地存储
    try {
      Taro.setStorageSync('messages', JSON.stringify(updatedMessages))
    } catch (error) {
      console.error('更新消息状态到本地存储失败:', error)
    }
  }

  // 全部标记为已读
  const markAllAsRead = () => {
    const updatedMessages = messages.map(msg => ({ ...msg, isRead: true }))
    setMessages(updatedMessages)

    // 更新本地存储
    try {
      Taro.setStorageSync('messages', JSON.stringify(updatedMessages))
    } catch (error) {
      console.error('更新全部消息状态到本地存储失败:', error)
    }
  }

  // 点击消息
  const handleMessageClick = (message: Message) => {
    // 标记为已读
    if (!message.isRead) {
      markAsRead(message.id)
    }

    // 根据消息类型执行不同操作
    if (message.type === MessageType.REVIEW) {
      // 跳转到对应游记详情
      Taro.navigateTo({ url: `/pages/travelogue/travelogue?id=${message.id}` })
    } else if (message.type === MessageType.LIKE) {
      // 跳转到对应游记详情
      Taro.navigateTo({ url: `/pages/travelogue/travelogue?id=${message.id}` })
    }
  }

  // 获取消息图标
  const getMessageIcon = (message: Message) => {
    if (message.type === MessageType.REVIEW) {
      if (message.status === ReviewStatus.APPROVED) {
        return 'message-icon-success'
      } else if (message.status === ReviewStatus.REJECTED) {
        return 'message-icon-reject'
      } else {
        return 'message-icon-pending'
      }
    } else {
      return 'message-icon-like'
    }
  }

  // 获取未读消息数
  const getUnreadCount = () => {
    return filteredMessages.filter(msg => !msg.isRead).length
  }

  // 处理下拉刷新
  usePullDownRefresh(() => {
    setRefreshing(true);
    fetchMessages().then(() => {
      Taro.stopPullDownRefresh();
    });
  });

  return (
    <View className="page page-messages">
      {/* 顶部标题栏 */}
      <View className="message-header">
        <View className='message-header-left' onClick={() => Taro.navigateBack()}>
            <LeftOutline />
        </View>
        {getUnreadCount() > 0 && (
          <Text className="mark-read" onClick={markAllAsRead}>全部标为已读</Text>
        )}
      </View>

      {/* 标签页 */}
      <View className="tabs">
        {tabs.map((tab, idx) => (
          <Text
            key={idx}
            className={`tab-item ${activeTab === idx ? 'active' : ''}`}
            onClick={() => setActiveTab(idx)}
          >
            {tab}
          </Text>
        ))}
      </View>

      {/* 消息列表 */}
      <ScrollView
        scrollY
        className="message-list"
      >
        {(loading && !refreshing) ? (
          <View className="loading-container">
            <View className="loading-state">加载中...</View>
          </View>
        ) : filteredMessages.length > 0 ? (
          filteredMessages.map(message => (
            <View
              key={message.id}
              className={`message-item ${!message.isRead ? 'unread' : ''}`}
              onClick={() => handleMessageClick(message)}
            >
              <View className="message-left">
                {message.type === MessageType.LIKE && message.fromUser ? (
                  <Image className="user-avatar" src={message.fromUser.avatar} />
                ) : (
                  <View className={`message-icon ${getMessageIcon(message)}`} />
                )}
              </View>
              <View className="message-content">
                <View className="message-item-header">
                  <Text className="message-title">{message.title}</Text>
                  <Text className="message-time">{message.createdAt}</Text>
                </View>
                <Text className="message-text">{message.content}</Text>
              </View>
              {message.thumbnail && (
                <Image className="message-thumbnail" src={message.thumbnail} mode="aspectFill" />
              )}
              {!message.isRead && <View className="unread-dot" />}
            </View>
          ))
        ) : (
          <View className="empty-state">
            <View className="empty-icon" />
            <Text className="empty-text">暂无消息</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default MessagePage
