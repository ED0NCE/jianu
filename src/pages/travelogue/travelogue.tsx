import React, { useState, useEffect, useRef } from 'react';
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './travelogue.scss';
import dayjs from 'dayjs';
import { useUserStore } from '../../store/userStore';
import { getTravelogueDetail, toggleLike, deleteTravelogue, publishDraft } from '../../api/user';

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

    <View className="travelogue-footer">
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
  const [travelogueData, setTravelogueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [videoActive, setVideoActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { profile } = useUserStore();
  const currentUserId = profile?.userid || '1';

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
          const data = await getTravelogueDetail(parseInt(id)) as any;
          setTravelogueData(data);
          setLikeCount(data.likes);
          setLiked(data.is_liked);
          // 在数据加载完成后输出作者检查信息
          console.log('Debug - isAuthor check:', {
            authorId: data.author.user_id,
            currentUserId,
            isAuthor: data.author.user_id === currentUserId
          });
        } catch (apiError) {
          console.warn('API调用失败，使用模拟数据:', apiError);
          setTravelogueData(mockTravelogueData);
          setLikeCount(mockTravelogueData.likes);
          setLiked(mockTravelogueData.is_liked);
          // 使用模拟数据时也输出作者检查信息
          console.log('Debug - isAuthor check:', {
            authorId: mockTravelogueData.author.user_id,
            currentUserId,
            isAuthor: mockTravelogueData.author.user_id === currentUserId
          });
        }
      } catch (error) {
        console.error('加载游记数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTravelogueData();
  }, [currentUserId]);

  // 获取缓存的播放进度
  const getVideoProgress = async (videoUrl: string) => {
    try {
      const { data } = await Taro.getStorage({ key: `video_progress_${videoUrl}` });
      return data ? parseFloat(data) : 0;
    } catch (error) {
      console.warn('获取视频进度失败:', error);
      return 0;
    }
  };

  // 保存播放进度
  const saveVideoProgress = async (videoUrl: string, time: number) => {
    try {
      await Taro.setStorage({
        key: `video_progress_${videoUrl}`,
        data: time.toString()
      });
    } catch (error) {
      console.warn('保存视频进度失败:', error);
    }
  };

  // 播放视频
  const playVideo = async () => {
    if (!videoRef.current || !travelogueData?.video_url) return;

    try {
      // 设置视频源
      if (videoRef.current.src !== travelogueData.video_url) {
        videoRef.current.src = travelogueData.video_url;
        // 设置已保存的播放进度
        const savedProgress = await getVideoProgress(travelogueData.video_url);
        if (savedProgress > 0) {
          videoRef.current.currentTime = savedProgress;
        }
      }

      // 设置必要的属性
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('webkit-playsinline', 'true');
      videoRef.current.setAttribute('x5-video-player-type', 'h5');
      videoRef.current.setAttribute('x5-video-player-fullscreen', 'false');
      videoRef.current.setAttribute('x-webkit-airplay', 'allow');
      
      // 激活视频
      setVideoActive(true);
      
      // 等待DOM更新后播放
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(error => {
            console.error('视频播放失败:', error);
            handleBack();
            Taro.showToast({
              title: '视频播放失败',
              icon: 'none'
            });
          });
        }
      });
    } catch (error) {
      console.error('视频初始化失败:', error);
      handleBack();
      Taro.showToast({
        title: '视频初始化失败',
        icon: 'none'
      });
    }
  };

  // 处理返回按钮
  const handleBack = async () => {
    if (videoActive && videoRef.current) {
      // 保存当前播放进度
      await saveVideoProgress(travelogueData.video_url, videoRef.current.currentTime);
      // 重置视频元素
      videoRef.current.pause();
      setIsPlaying(false);
      setVideoActive(false);
    } else {
      Taro.navigateBack();
    }
  };

  // 监听视频状态变化
  useEffect(() => {
    if (!videoActive && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [videoActive]);

  // 组件卸载时保存进度
  useEffect(() => {
    return () => {
      if (videoRef.current && travelogueData?.video_url) {
        saveVideoProgress(travelogueData.video_url, videoRef.current.currentTime);
      }
    };
  }, [travelogueData?.video_url]);

  // 切换播放/暂停
  const togglePlay = (e: any) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        });
      }
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return '草稿';
      case 1: return '待审核';
      case 2: return '已过审';
      case 3: return '已拒绝';
      case 4: return '已删除';
      default: return '未知';
    }
  };

  // 模拟数据
  const mockTravelogueData = {
    travel_id: 1,
    title: '大理古城与洱海的完美邂逅',
    content: '第一天，我们抵达大理古城，入住了古城内的一家特色客栈。客栈的庭院里种满了多肉植物，环境非常舒适。放下行李后，我们就在古城里闲逛，感受这座千年古城的魅力。\n\n第二天，我们租了电动车环洱海。一路上风景如画，蓝天白云，青山绿水，让人心旷神怡。我们在双廊古镇停留，品尝了当地特色美食。\n\n第三天，我们去了崇圣寺三塔，这是大理的标志性建筑。下午去了喜洲古镇，体验了白族扎染工艺。\n\n第四天，我们去了苍山，乘坐缆车上山，欣赏了壮丽的山景。晚上回到古城，在酒吧街感受夜生活。\n\n最后一天，我们在古城里买了一些特产，然后依依不舍地离开了这座美丽的城市。',
    status: 0,
    created_at: '2024-03-15T10:30:00Z',
    updated_at: '2024-03-15T10:30:00Z',
    location: '云南大理',
    start_date: '2024-03-10T00:00:00Z',
    end_date: '2024-03-15T00:00:00Z',
    participants: 3,
    expenditure: 3500,
    likes: 1234,
    rejection_reason: '1111111111111111111111111111111111122222222222222',
    video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    video_poster: 'https://images.unsplash.com/photo-1590452224879-867e8012a828?q=80&w=1470&auto=format&fit=crop',
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

  // 轮播切换
  const handleSwiperChange = (e) => setCurrentImg(e.detail.current);

  // 全屏预览
  const handlePreview = (idx: number) => {
    // 只预览图片，不包括视频封面
    const imageUrls = travelogueData.images.map(img => img.image_url);
    Taro.previewImage({
      current: imageUrls[idx],
      urls: imageUrls
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

  // 发布游记
  const handlePublish = () => {
    setShowMenu(false);
    Taro.showModal({
      title: '提示',
      content: '确定要发布游记吗？发布后将进入审核状态',
      success: res => {
        if (res.confirm) {
          publishDraft(travelogueData.travel_id).then(() => {
            Taro.showToast({ title: '发布成功', icon: 'success' });
            setTimeout(() => {
              Taro.redirectTo({ url: '/pages/index/index' });
            }, 800);
          }).catch(error => {
            console.error('发布失败:', error);
            Taro.showToast({ title: '发布失败', icon: 'error' });
          });
        }
      }
    });
  };

  // 如果数据还在加载中，显示骨架屏
  if (loading || !travelogueData) {
    return <SkeletonScreen onBack={handleBack} />;
  }

  const { images, location, participants, expenditure, title, content, author, start_date, end_date } = travelogueData;
  const isAuthor = author.user_id === currentUserId;
  const days = dayjs(end_date).diff(dayjs(start_date), 'day') + 1;
  const budget = Math.round(expenditure / 1000);

  // 视频元素渲染
  const renderVideo = () => (
    <video 
      ref={videoRef}
      className={`hidden-video${videoActive ? ' active' : ''}`}
      src={travelogueData?.video_url}
      poster={travelogueData?.video_poster}
      playsInline
      webkit-playsinline="true"
      x5-video-player-type="h5"
      x5-video-player-fullscreen="false"
      preload="metadata"
      onTimeUpdate={() => {
        if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
          // 每秒保存一次进度
          if (Math.floor(videoRef.current.currentTime) % 1 === 0) {
            saveVideoProgress(travelogueData.video_url, videoRef.current.currentTime);
          }
        }
      }}
      onEnded={async () => {
        setIsPlaying(false);
        setVideoActive(false);
        // 视频结束时清除进度缓存
        try {
          await Taro.removeStorage({ key: `video_progress_${travelogueData.video_url}` });
        } catch (error) {
          console.warn('清除视频进度失败:', error);
        }
      }}
      onError={(e) => {
        console.error('视频错误:', e);
        if (videoActive) {
          handleBack();
          Taro.showToast({
            title: '视频加载失败',
            icon: 'none'
          });
        }
      }}
      onClick={togglePlay}
    />
  );

  return (
    <View className={`travelogue-page${videoActive ? ' video-playing' : ''}`}>
      {/* 视频遮罩层 */}
      <View className="video-mask" />

      {/* 导航栏 */}
      <View className="travelogue-navbar">
        <View className="nav-btn left" onClick={handleBack}>
          <View className="icon nav-back" />
        </View>
        <View className="nav-title">
          {travelogueData.status === 0 && <Text className="draft-tag">草 稿</Text>}
        </View>
        <View className="nav-btn right" onClick={handleMenu}>
          <View className="icon nav-menu" />
        </View>
      </View>

      {/* 状态提示条 */}
      {travelogueData.status === 1 && (
        <View className="status-bar pending">
          <View className="status-icon" />
          <Text className="status-text">游记正在审核中，请耐心等待</Text>
        </View>
      )}
      {travelogueData.status === 3 && (
        <View className="status-bar rejected">
          <View className="status-icon" />
          <Text className="status-text">游记未过审，请编辑后重新发布。原因：{travelogueData.rejection_reason}</Text>
        </View>
      )}

      <View className="travelogue-content-container">
        {/* 轮播图 */}
        <View className="carousel">
          <Swiper
            className="carousel-swiper"
            circular
            indicatorDots={false}
            current={currentImg}
            onChange={handleSwiperChange}
          >
            {travelogueData?.video_url && travelogueData.video_poster && (
              <SwiperItem key="video">
                <View 
                  className="video-container" 
                  onClick={playVideo}
                >
                  <Image
                    className="carousel-img"
                    src={travelogueData.video_poster}
                    mode="aspectFill"
                  />
                  <View 
                    className="video-play-icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      playVideo();
                    }}
                  />
                </View>
              </SwiperItem>
            )}
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
            <Text>{currentImg + 1}/{travelogueData.video_url ? images.length + 1 : images.length}</Text>
          </View>
          <View className="carousel-dots">
            {travelogueData.video_url && (
              <View
                key="video-dot"
                className={`dot${currentImg === 0 ? ' active' : ''}`}
                onClick={() => setCurrentImg(0)}
              />
            )}
            {images.map((_, idx) => (
              <View
                key={idx}
                className={`dot${idx === (travelogueData.video_url ? currentImg - 1 : currentImg) ? ' active' : ''}`}
                onClick={() => setCurrentImg(travelogueData.video_url ? idx + 1 : idx)}
              />
            ))}
          </View>
        </View>

        {/* 数据卡片 */}
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

        {/* 标题和正文 */}
        <View className="travelogue-title">{title}</View>
        <View className="travelogue-content">
          {content.split('\n\n').map((p, i) => (
            <Text className="paragraph" key={i}>{p}</Text>
          ))}
        </View>
      </View>

      {/* 底部栏 */}
      {travelogueData.status === 2 && (
        <View className="travelogue-footer">
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
      )}

      {/* 视频播放器 */}
      {travelogueData?.video_url && (
        <View className={`video-wrapper${videoActive ? ' active' : ''}`}>
          {renderVideo()}
          {videoActive && (
            <View className="custom-video-controls" onClick={e => e.stopPropagation()}>
              {/* <View 
                className={`play-pause-btn${isPlaying ? ' playing' : ''}`} 
                onClick={togglePlay}
              /> */}
            </View>
          )}
        </View>
      )}

      {/* 菜单弹窗 */}
      {showMenu && (
        <View className="popup-menu-mask" onClick={handleMenuClose}>
          <View className="popup-menu" onClick={e => e.stopPropagation()}>
            {travelogueData.status === 2 && (
              <View className="popup-menu-item" onClick={handleShare}>
                <View className="popup-menu-icon" style={{backgroundImage: `url(data:image/svg+xml;utf8,<svg fill='%234FC3F7' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.03-.47-.09-.7l7.02-4.11A2.99 2.99 0 0 0 18 7.91c1.66 0 3 1.34 3 3s-1.34 3-3 3zm-12 2c-1.66 0-3-1.34-3-3s1.34-3 3-3c.24 0 .47.04.7.09l7.02-4.11A2.99 2.99 0 0 1 12 7.91c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3c-.76 0-1.44.3-1.96.77L4.91 11.3c-.05.23-.09.46-.09.7s.03.47.09.7l7.02 4.11c.52.47 1.2.77 1.96.77 1.66 0 3-1.34 3-3s-1.34-3-3-3z'/></svg>)`}} />
                分享游记
              </View>
            )}
            {isAuthor && (
              <>
                {travelogueData.status === 0 && (
                  <View className="popup-menu-item" onClick={handlePublish}>
                    <View className="popup-menu-icon" style={{backgroundImage: `url(data:image/svg+xml;utf8,<svg fill='%234CAF50' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M5 4v2h14V4H5zm0 10h4v6h6v-6h4l-7-7-7 7z'/></svg>)`}} />
                    立即发布
                  </View>
                )}
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
    </View>
  );
};

export default Travelogue; 
