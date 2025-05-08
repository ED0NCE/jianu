import React, { useState, useEffect } from 'react';
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './travelogue.scss';
import dayjs from 'dayjs';
import { useUserStore } from '../../store/userStore';
import { getTravelogueDetail, toggleLike, deleteTravelogue } from '../../api/user';

interface TravelogueData {
  travel_id: number;
  title: string;
  content: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  created_at: string;
  updated_at: string;
  location: string;
  start_date: string;
  end_date: string;
  participants: number;
  expenditure: number;
  likes: number;
  video_url?: string;
  rejection_reason?: string;
  author: {
    user_id: string;
    nickname: string;
    avatar: string;
  };
  images: {
    image_id: number;
    image_url: string;
    order: number;
  }[];
  is_liked: boolean;
}

// 骨架屏
interface SkeletonScreenProps {
  onBack: () => void;
}

const SkeletonScreen: React.FC<SkeletonScreenProps> = ({ onBack }) => (
  <View className="travelogue-page">
    <View className="travelogue-navbar">
      <View className="nav-btn left" onClick={onBack}>
        <View className="icon nav-back" />
      </View>
      <View className="nav-title"></View>
      <View className="nav-btn right">
        <View className="icon nav-menu" />
      </View>
    </View>

    <View className="carousel skeleton">
      <View className="carousel-swiper skeleton" />
      <View className="carousel-indicator skeleton" />
    </View>

    <View className="travelogue-title skeleton" />

    <View className="travelogue-content">
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} className="paragraph skeleton" />
      ))}
    </View>

    <View className="travelogue-footer travelogue-footer-fixed">
      <View className="avatar skeleton" />
      <View className="author-info">
        <View className="author-name skeleton" />
        <View className="date skeleton" />
      </View>
      <View className="likes skeleton" />
    </View>
  </View>
);

const Travelogue: React.FC = () => {
  const [currentImg, setCurrentImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [travelogueData, setTravelogueData] = useState<TravelogueData | null>(null);
  const [loading, setLoading] = useState(true);

  const { profile } = useUserStore();
  const currentUserId = profile?.userid || '1';

  // 返回按钮
  const handleBack = () => {
    Taro.navigateBack();
  };

  // 模拟数据
  const mockTravelogueData: TravelogueData = {
    travel_id: 1,
    title: '大理古城与洱海的完美邂逅',
    content: '第一天，我们抵达大理古城，入住了古城内的一家特色客栈。客栈的庭院里种满了多肉植物，环境非常舒适。放下行李后，我们就在古城里闲逛，感受这座千年古城的魅力。\n\n第二天，我们租了电动车环洱海。一路上风景如画，蓝天白云，青山绿水，让人心旷神怡。我们在双廊古镇停留，品尝了当地特色美食。\n\n第三天，我们去了崇圣寺三塔，这是大理的标志性建筑。下午去了喜洲古镇，体验了白族扎染工艺。\n\n第四天，我们去了苍山，乘坐缆车上山，欣赏了壮丽的山景。晚上回到古城，在酒吧街感受夜生活。\n\n最后一天，我们在古城里买了一些特产，然后依依不舍地离开了这座美丽的城市。',
    status: 'published',
    created_at: '2024-03-15T10:30:00Z',
    updated_at: '2024-03-15T10:30:00Z',
    location: '云南大理',
    start_date: '2024-03-10T00:00:00Z',
    end_date: '2024-03-15T00:00:00Z',
    participants: 2,
    expenditure: 3500,
    likes: 1234,
    author: {
      user_id: currentUserId,
      nickname: profile?.name || '测试用户',
      avatar: profile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
    },
    images: [
      {
        image_id: 1,
        image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        order: 1
      },
      {
        image_id: 2,
        image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
        order: 2
      },
      {
        image_id: 3,
        image_url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d',
        order: 3
      }
    ],
    is_liked: false
  };

  // 获取游记数据
  useEffect(() => {
    const loadTravelogueData = async () => {
      try {
        const { id } = Taro.getCurrentInstance().router?.params || {};
        if (!id) {
          console.error('参数错误');
          return;
        }

        try {
          const data = await getTravelogueDetail(parseInt(id)) as TravelogueData;
          setTravelogueData(data);
          setLikeCount(data.likes);
          setLiked(data.is_liked);
        } catch (apiError) {
          console.warn('API调用失败，使用模拟数据:', apiError);
          setTravelogueData(mockTravelogueData);
          setLikeCount(mockTravelogueData.likes);
          setLiked(mockTravelogueData.is_liked);
        }
      } catch (error) {
        console.error('加载游记数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTravelogueData();
  }, [currentUserId]);

  // 如果数据还在加载中，显示骨架屏
  if (loading || !travelogueData) {
    return <SkeletonScreen onBack={handleBack} />;
  }

  const { images, location, participants, expenditure, title, content, author, start_date, end_date } = travelogueData;
  const isAuthor = author.user_id === currentUserId;
  console.log('Debug - isAuthor check:', {
    authorId: author.user_id,
    currentUserId,
    isAuthor
  });
  const days = dayjs(end_date).diff(dayjs(start_date), 'day') + 1;
  const budget = Math.round(expenditure / 1000);

  // 轮播切换
  const handleSwiperChange = (e) => setCurrentImg(e.detail.current);

  // 全屏预览
  const handlePreview = (idx: number) => {
    Taro.previewImage({
      current: images[idx].image_url,
      urls: images.map(img => img.image_url)
    });
  };

  // 点赞功能
  const handleLike = async () => {
    try {
      try {
        await toggleLike(travelogueData.travel_id);
        if (liked) {
          setLiked(false);
          setLikeCount(likeCount - 1);
        } else {
          setLiked(true);
          setLikeCount(likeCount + 1);
        }
      } catch (apiError) {
        console.warn('点赞API调用失败，使用本地模拟:', apiError);
        if (liked) {
          setLiked(false);
          setLikeCount(likeCount - 1);
        } else {
          setLiked(true);
          setLikeCount(likeCount + 1);
        }
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
    }
  };

  // 菜单按钮
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
    Taro.navigateTo({
      url: `/pages/edit/edit?id=${travelogueData.travel_id}`,
      success: () => {
        setShowMenu(false);
      },
      fail: (error) => {
        console.error('跳转失败:', error);
      }
    });
  };

  const handleDelete = () => {
    setShowMenu(false);
    Taro.showModal({
      title: '提示',
      content: '确定要删除游记吗？',
      success: res => {
        if (res.confirm) {
          deleteTravelogue(travelogueData.travel_id).then(() => {
            setTimeout(() => {
              Taro.redirectTo({ url: '/pages/index/index' });
            }, 800);
          }).catch(error => {
            console.error('删除失败:', error);
          });
        }
      }
    });
  };

  // 发布时间
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
      {/* 顶部 */}
      <View className="travelogue-navbar">
        <View className="nav-btn left" onClick={handleBack}>
          <View className="icon nav-back" />
        </View>
        <View className="nav-title"></View>
        <View className="nav-btn right" onClick={handleMenu}>
          <View className="icon nav-menu" />
        </View>
      </View>

      {/* 菜单弹窗 */}
      {showMenu && (
        <View className="popup-menu-mask" onClick={handleMenuClose}>
          <View className="popup-menu" onClick={e => e.stopPropagation()}>
            <View className="popup-menu-item" onClick={handleShare}>
              <View className="popup-menu-icon" style={{backgroundImage: `url(data:image/svg+xml;utf8,<svg fill='%234FC3F7' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.03-.47-.09-.7l7.02-4.11A2.99 2.99 0 0 0 18 7.91c1.66 0 3 1.34 3 3s-1.34 3-3 3zm-12 2c-1.66 0-3-1.34-3-3s1.34-3 3-3c.24 0 .47.04.7.09l7.02-4.11A2.99 2.99 0 0 1 12 7.91c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3c-.76 0-1.44.3-1.96.77L4.91 11.3c-.05.23-.09.46-.09.7s.03.47.09.7l7.02 4.11c.52.47 1.2.77 1.96.77 1.66 0 3-1.34 3-3s-1.34-3-3-3z'/></svg>)`}} />
              分享游记
            </View>
            {isAuthor && (
              <>
                <View className="popup-menu-item" onClick={handleEdit}>
                  <View className="popup-menu-icon" style={{backgroundImage: `url(data:image/svg+xml;utf8,<svg fill='%23FFB300' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/></svg>)`}} />
                  编辑游记
                </View>
                <View className="popup-menu-item delete" onClick={handleDelete}>
                  <View className="popup-menu-icon" style={{backgroundImage: `url(data:image/svg+xml;utf8,<svg fill='%23FF5252' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1z'/></svg>)`}} />
                  删除游记
                </View>
              </>
            )}
          </View>
        </View>
      )}

      {/* 图 */}
      <View className="carousel">
        <Swiper
          className="carousel-swiper"
          circular
          indicatorDots={false}
          current={currentImg}
          onChange={handleSwiperChange}
        >
          {images.map((img, idx) => (
            <SwiperItem key={img.image_id}>
              <Image
                className="carousel-img"
                src={img.image_url}
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

      {/* 数据 */}
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
          <Text>{participants}人</Text>
        </View>
        <View className="info-item">
          <View className="icon budget" />
          <Text>约{budget}k</Text>
        </View>
      </View>

      {/*正文 */}
      <View className="travelogue-title">{title}</View>
      <View className="travelogue-content">
        {content.split('\n\n').map((p, i) => (
          <Text className="paragraph" key={i}>{p}</Text>
        ))}
      </View>

      {/* 底部 */}
      <View className="travelogue-footer travelogue-footer-fixed">
        <Image className="avatar" src={author.avatar} />
        <View className="author-info">
          <Text className="author-name">{author.nickname}</Text>
          <Text className="date">{getDisplayTime(start_date)}</Text>
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
