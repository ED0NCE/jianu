import React, { useState } from 'react';
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './travelogue.scss';
import dayjs from 'dayjs';

const currentUserId = 'user123';
const travelogueData = {
  id: 'travelogue001', // 假设游记id
  images: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
  ],
  location: '大理',
  days: 5,
  people: 2,
  budget: 5,
  title: '大理5天4夜慢生活之旅 | 洱海边的风花雪月',
  content: [
    '这次旅行选择了淡季出行，避开了人潮，真正体验到了大理的慢生活。住在洱海边的民宿，每天醒来就能看到波光粼粼的湖面，心情特别舒畅。',
    '第一天到达后就奔往洱海湿地，尝了当地的乳扇和柠檬水，味道很特别。第二天租了电动车环洱海，沿途风景美不胜收，特别是双廊古镇段，随手一拍就是大片。',
    '第三天去了大理古城，坐缆车上山，云雾缭绕如仙境。下山后去大理寺祈福，夕阳下的三塔格外壮观。期待下次再来！',
  ],
  author: {
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    name: '旅行达人小美',
    userId: 'user123', // 作者id
    publishTime: '2025-05-03 09:30:00', // 示例：真实发布时间
  },
  likes: 1200,
};

const Travelogue: React.FC = () => {
  const [currentImg, setCurrentImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(travelogueData.likes);
  const [showMenu, setShowMenu] = useState(false);
  const { images, location, days, people, budget, title, content, author } = travelogueData;
  const isAuthor = author.userId === currentUserId;

  // 轮播切换
  const handleSwiperChange = (e) => setCurrentImg(e.detail.current);

  // 全屏预览
  const handlePreview = (idx: number) => {
    Taro.previewImage({
      current: images[idx],
      urls: images
    });
  };

  // 点赞功能
  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(likeCount - 1);
      Taro.showToast({ title: '已取消点赞', icon: 'none' });
    } else {
      setLiked(true);
      setLikeCount(likeCount + 1);
      Taro.showToast({ title: '已点赞', icon: 'none' });
    }
  };

  // 返回按钮事件
  const handleBack = () => {
    Taro.redirectTo({ url: '/pages/index/index' });
  };

  // 菜单按钮事件
  const handleMenu = () => {
    setShowMenu(true);
  };

  // 菜单相关
  const handleMenuClose = () => {
    setShowMenu(false);
  };
  const handleShare = () => {
    setShowMenu(false);
    Taro.showToast({ title: '分享游记', icon: 'none' });
  };
  const handleEdit = () => {
    setShowMenu(false);
    Taro.navigateTo({ url: `/pages/edit/edit?id=${travelogueData.id}` });
  };
  const handleDelete = () => {
    setShowMenu(false);
    Taro.showModal({
      title: '提示',
      content: '确定要删除游记吗？',
      success: res => {
        if (res.confirm) {
          // 假设后端接口为 /api/travelogue/delete?id=xxx
          Taro.request({
            url: `https://your-backend-domain.com/api/travelogue/delete`,
            method: 'POST',
            data: { id: travelogueData.id },
            success: (resp) => {
              if (resp.statusCode === 200 && resp.data.success) {
                Taro.showToast({ title: '已删除', icon: 'none' });
                setTimeout(() => {
                  Taro.redirectTo({ url: '/pages/index/index' });
                }, 800);
              } else {
                Taro.showToast({ title: '删除失败', icon: 'none' });
              }
            },
            fail: () => {
              Taro.showToast({ title: '网络错误', icon: 'none' });
            }
          });
        }
      }
    });
  };

  // 发布时间智能显示
  const getDisplayTime = (publishTime: string) => {
    const now = dayjs();
    const pub = dayjs(publishTime);
    const diffHour = now.diff(pub, 'hour');
    const diffDay = now.startOf('day').diff(pub.startOf('day'), 'day');
    if (diffDay === 0) {
      if (diffHour < 12) {
        const diff = now.diff(pub, 'hour');
        return `${diff}小时前`;
      } else {
        return pub.format('HH:mm');
      }
    } else if (diffDay === 1) {
      return `昨天 ${pub.format('HH:mm')}`;
    } else {
      if (now.year() === pub.year()) {
        return pub.format('MM-DD HH:mm');
      } else {
        return pub.format('YYYY-MM-DD HH:mm');
      }
    }
  };

  return (
    <View className="travelogue-page">
      {/* 顶部固钉栏 */}
      <View className="travelogue-navbar">
        <View className="nav-btn left" onClick={handleBack}>
          <View className="icon nav-back" />
        </View>
        <View className="nav-title"></View>
        <View className="nav-btn right" onClick={handleMenu}>
          <View className="icon nav-menu" />
        </View>
      </View>

      {/* 右上角菜单弹窗 */}
      {showMenu && (
        <View className="popup-menu-mask" onClick={handleMenuClose}>
          <View className="popup-menu" onClick={e => e.stopPropagation()}>
            <View className="popup-menu-item" onClick={handleShare}>
              <View className="popup-menu-icon" style={{backgroundImage: `url(data:image/svg+xml;utf8,<svg fill='%234FC3F7' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.03-.47-.09-.7l7.02-4.11A2.99 2.99 0 0 0 18 7.91c1.66 0 3 1.34 3 3s-1.34 3-3 3zm-12 2c-1.66 0-3-1.34-3-3s1.34-3 3-3c.24 0 .47.04.7.09l7.02-4.11A2.99 2.99 0 0 1 12 7.91c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3c-.76 0-1.44.3-1.96.77L4.91 11.3c-.05.23-.09.46-.09.7s.03.47.09.7l7.02 4.11c.52.47 1.2.77 1.96.77 1.66 0 3-1.34 3-3s-1.34-3-3-3z'/></svg>)`}} />
              分享游记
            </View>
            {isAuthor && <View className="popup-menu-item" onClick={handleEdit}>
              <View className="popup-menu-icon" style={{backgroundImage: `url(data:image/svg+xml;utf8,<svg fill='%23FFB300' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/></svg>)`}} />
              编辑游记
            </View>}
            {isAuthor && <View className="popup-menu-item delete" onClick={handleDelete}>
              <View className="popup-menu-icon" style={{backgroundImage: `url(data:image/svg+xml;utf8,<svg fill='%23FF5252' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1z'/></svg>)`}} />
              删除游记
            </View>}
          </View>
        </View>
      )}

      {/* 轮播图 */}
      <View className="carousel">
        <Swiper
          className="carousel-swiper"
          circular
          indicatorDots={false}
          current={currentImg}
          onChange={handleSwiperChange}
        >
          {images.map((img, idx) => (
            <SwiperItem key={img}>
              <Image
                className="carousel-img"
                src={img}
                mode="aspectFill"
                onClick={() => handlePreview(idx)}
              />
            </SwiperItem>
          ))}
        </Swiper>
        <View className="carousel-indicator">
          <Text>{currentImg + 1}/{images.length}</Text>
        </View>
        <View className="carousel-dots">
          {images.map((_, idx) => (
            <View
              key={idx}
              className={`dot${idx === currentImg ? ' active' : ''}`}
              onClick={() => setCurrentImg(idx)}
            />
          ))}
        </View>
      </View>

      {/* 信息卡片 */}
      <View className="info-card">
        <View className="info-item">
          <View className="icon location" />
          <Text>{location}</Text>
        </View>
        <View className="info-item">
          <View className="icon days" />
          <Text>{days}天</Text>
        </View>
        <View className="info-item">
          <View className="icon people" />
          <Text>{people}人</Text>
        </View>
        <View className="info-item">
          <View className="icon budget" />
          <Text>约{budget}k</Text>
        </View>
      </View>

      {/* 标题与正文 */}
      <View className="travelogue-title">{title}</View>
      <View className="travelogue-content">
        {content.map((p, i) => (
          <Text className="paragraph" key={i}>{p}</Text>
        ))}
      </View>

      {/* 作者与点赞 固钉到底部 */}
      <View className="travelogue-footer travelogue-footer-fixed">
        <Image className="avatar" src={author.avatar} />
        <View className="author-info">
          <Text className="author-name">{author.name}</Text>
          <Text className="date">{getDisplayTime(author.publishTime)}</Text>
        </View>
        <View className="likes" onClick={handleLike}>
          <View className={`icon like${liked ? ' liked' : ''}`} />
          <Text>{(likeCount / 1000).toFixed(1)}k</Text>
        </View>
      </View>
    </View>
  );
};

export default Travelogue; 