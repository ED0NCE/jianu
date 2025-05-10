import React, { useEffect, useState } from 'react';
import { View, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { travelogueApi } from '../../api/admin';
import { Radio, Button, TextArea } from '@nutui/nutui-react';
import '@nutui/nutui-react/dist/style.css';
import './admin.scss';

interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  desc: string;
  img: string[];
  status: number;  // 修改为number: 0草稿 1待审核 2已过审 3已拒绝 4已删除
}

const statusMap = {
  all: '全部游记',
  0: '草稿',
  1: '待审核',
  2: '已过审',
  3: '已拒绝',
  4: '已删除'
};

const Admin: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 });
  const [statusFilter, setStatusFilter] = useState<'all'|0|1|2|3|4>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'latest'|'hot'>('latest');
  const [selected, setSelected] = useState<string[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<Record<string, number>>({});
  const [reviewReason, setReviewReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 模拟数据
    const mockPosts: Post[] = [
      {
        id: '1',
        title: '春日京都赏樱之旅',
        author: '林丽丽',
        date: '2023-04-15',
        views: 1245,
        likes: 328,
        desc: '京都的樱花季总是让人心驰神往，这次我特意选择了哲学之道作为赏樱起点。清晨的阳光透过樱花树洒在石板路上，粉白的花瓣随风飘落，美得让人屏息。沿着小路漫步，两旁是古老的寺庙和民居，偶尔还能遇到穿着和服的当地人。傍晚时分，我来到祇园，这里的夜樱别有一番风味，灯光映照下的樱花显得格外梦幻。',
        img: [
          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&auto=format&fit=crop'
        ],
        status: 2,
      },
      {
        id: '2',
        title: '云南大理古城深度游',
        author: '张远航',
        date: '2023-05-22',
        views: 876,
        likes: 215,
        desc: '在大理古城住了一整周，每天漫步在青石板路上，感受白族文化的独特魅力。清晨，我会去古城北门外的菜市场，看当地人采购新鲜食材，品尝地道的早餐。白天，我喜欢在古城的小巷子里闲逛，探访各种手工艺品店，和店主聊天。傍晚时分，坐在洱海边，看着夕阳西下，远处的苍山云雾缭绕，美不胜收。晚上，古城变得热闹起来，各种酒吧和咖啡馆都亮起了温暖的灯光。',
        img: [
          'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1558032040-b55d2adb9745?w=800&auto=format&fit=crop'
        ],
        status: 1,
      },
      {
        id: '3',
        title: '西藏拉萨朝圣之旅',
        author: '王小明',
        date: '2023-06-10',
        views: 1500,
        likes: 400,
        desc: '布达拉宫的雄伟壮观令人震撼，八廓街的转经人流让人感受到信仰的力量。清晨，我跟随朝圣者一起转经，看着他们虔诚地磕长头，内心深受触动。在布达拉宫，我参观了历代达赖喇嘛的灵塔，了解了藏传佛教的历史。傍晚，我来到大昭寺广场，看着夕阳下的金顶熠熠生辉，周围的转经筒在阳光下闪闪发光。夜晚，我住在藏式客栈，体验了地道的藏餐，和当地人一起跳锅庄舞。',
        img: [
          'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1461501363336-d3f121d11c76?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1461503927419-4e8ced26c981?w=800&auto=format&fit=crop'
        ],
        status: 1,
      },
      {
        id: '4',
        title: '厦门鼓浪屿慢生活',
        author: '李晓霞',
        date: '2023-03-18',
        views: 600,
        likes: 120,
        desc: '鼓浪屿的咖啡馆和小巷子让人流连忘返，适合放慢脚步享受生活。每天清晨，我都会去龙头路买一杯咖啡，然后坐在海边看日出。岛上的建筑风格多样，有欧式别墅，也有闽南传统民居，每一栋建筑都有它的故事。我最喜欢在傍晚时分，漫步在钢琴码头，听着远处传来的钢琴声，看着夕阳映照在海面上。晚上，我会去岛上的小酒吧，和来自世界各地的游客聊天，分享旅行故事。',
        img: [
          'https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1576675784201-0e142b423952?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1576675784432-994941412b3d?w=800&auto=format&fit=crop'
        ],
        status: 2,
      },
      {
        id: '5',
        title: '新疆伊犁草原自驾游',
        author: '赵天宇',
        date: '2023-07-01',
        views: 980,
        likes: 300,
        desc: '伊犁的草原辽阔壮美，赛里木湖的蓝色令人陶醉。我们开着车在草原上驰骋，看着成群的牛羊在蓝天白云下悠闲地吃草。在赛里木湖边，我们搭起帐篷，看着湖水在阳光下泛着蓝宝石般的光芒。傍晚，我们参加了当地哈萨克族的篝火晚会，品尝了手抓羊肉，喝了马奶酒，和当地人一起跳起了欢快的舞蹈。夜晚，躺在帐篷里，看着满天繁星，听着远处传来的马头琴声，感受着草原的宁静与壮美。',
        img: [
          'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1496275068113-fff8c90750d1?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&auto=format&fit=crop'
        ],
        status: 3,
      },
      {
        id: '6',
        title: '青岛啤酒节狂欢记',
        author: '孙佳',
        date: '2023-08-12',
        views: 1100,
        likes: 250,
        desc: '青岛的夏天因为啤酒节而变得热闹非凡，海边的夜晚很美。啤酒节期间，整个城市都沉浸在欢乐的氛围中。我们去了啤酒博物馆，了解了青岛啤酒的历史，品尝了各种口味的啤酒。傍晚，我们来到五四广场，看着夕阳下的奥帆中心，海风轻拂，非常惬意。晚上，我们参加了啤酒节的开幕式，看着精彩的表演，和来自世界各地的游客一起举杯庆祝。在啤酒大棚里，我们品尝了各种美食，和当地人一起跳起了欢快的舞蹈。',
        img: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1520942702018-0862200e6873?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1534350752840-1b1b71b4b4fe?w=800&auto=format&fit=crop'
        ],
        status: 2,
      },
    ];
    setPosts(mockPosts);
    setStats({
      0: mockPosts.filter(p => p.status === 0).length,
      1: mockPosts.filter(p => p.status === 1).length,
      2: mockPosts.filter(p => p.status === 2).length,
      3: mockPosts.filter(p => p.status === 3).length,
      4: mockPosts.filter(p => p.status === 4).length,
    });
  };

  const handleApprove = async (id: string) => {
    await Taro.request({ url: `/mock/admin/posts/${id}/approve`, method: 'POST' });
    fetchData();
  };
  const handleReject = async (id: string) => {
    await Taro.request({ url: `/mock/admin/posts/${id}/reject`, method: 'POST' });
    fetchData();
  };
  const handleBatch = async (type: 'approve'|'reject') => {
    await Promise.all(selected.map(id => Taro.request({ url: `/mock/admin/posts/${id}/${type}`, method: 'POST' })));
    setSelected([]);
    fetchData();
  };

  const filteredPosts = posts
    .filter(post => statusFilter === 'all' || post.status === statusFilter)
    .filter(post => post.title.includes(search) || post.author.includes(search))
    .sort((a, b) => sort === 'latest' ? b.date.localeCompare(a.date) : b.views - a.views);

  // 统计总数
  const total = posts.length;

  // 查看详情
  const handleViewDetail = (post: Post) => {
    setCurrentPost(post);
    setShowReviewModal(true);
    setReviewReason('');
  };

  // 审核游记
  const handleReview = async (status: number) => {
    if (!currentPost) return;
    
    try {
      await travelogueApi.review(Number(currentPost.id), {
        status,
        reason: reviewReason || null
      });
      setShowReviewModal(false);
      fetchData();
      Taro.showToast({ title: '审核成功', icon: 'success' });
    } catch (error) {
      console.error('审核失败:', error);
      Taro.showToast({ title: '审核失败', icon: 'error' });
    }
  };

  // 删除游记
  const handleDelete = async (id: string) => {
    try {
      await Taro.showModal({
        title: '确认删除',
        content: '确定要删除这篇游记吗？',
        success: async (res) => {
          if (res.confirm) {
            // 这里修改为设置status为4（已删除）
            await travelogueApi.review(Number(id), {
              status: 4,
              reason: null
            });
            fetchData();
            Taro.showToast({ title: '删除成功', icon: 'success' });
          }
        }
      });
    } catch (error) {
      console.error('删除失败:', error);
      Taro.showToast({ title: '删除失败', icon: 'error' });
    }
  };

  // 添加滚动处理函数
  const handleScroll = (postId: string, event: any) => {
    const scrollLeft = event.target.scrollLeft;
    const itemWidth = event.target.children[0].offsetWidth + 16; // 16px 是 gap
    const newIndex = Math.round(scrollLeft / itemWidth);
    setActiveImageIndex(prev => ({
      ...prev,
      [postId]: newIndex
    }));
  };

  // 滑动到指定图片
  const scrollToImage = (postId: string, index: number, event: any) => {
    const scrollContainer = event.currentTarget.parentElement.previousSibling;
    const itemWidth = scrollContainer.children[0].offsetWidth + 16; // 16px 是 gap
    scrollContainer.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth'
    });
    setActiveImageIndex(prev => ({
      ...prev,
      [postId]: index
    }));
  };

  // 获取状态文字
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

  // 获取状态类名
  const getStatusClass = (status: number) => {
    switch (status) {
      case 0: return 'draft';
      case 1: return 'pending';
      case 2: return 'passed';
      case 3: return 'rejected';
      case 4: return 'deleted';
      default: return '';
    }
  };

  return (
    <div className="admin-page">
      {/* 顶部栏 */}
      <div className="admin-header">
        <div className="admin-title">游记审核平台</div>
        <div className="admin-search">
          <span className="search-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="M20 20L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </span>
          <Input className="search-input" value={search} onInput={e => setSearch(e.detail.value)} placeholder="搜索游记或作者..." />
          <Button className="search-btn" onClick={() => {}}>搜索</Button>
        </div>
        <div className="admin-actions">
          {/* 
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value as any)}>
            <option value="latest">最新发布</option>
            <option value="hot">最热</option>
          </select>
          */}
          <Button className="logout-btn" onClick={() => Taro.redirectTo({ url: '/pages/admin/adminlogin' })}>退出登录</Button>
        </div>
      </div>
      <div className="admin-main">
        {/* 左侧栏 */}
        <div className="admin-sidebar">
          <div className="card status-card">
            <div className="card-title">审核状态</div>
            <Radio.Group value={statusFilter} onChange={val => setStatusFilter(val as any)}>
              <Radio value="all">全部游记 ({total})</Radio>
              <Radio value={1}>待审核 ({stats[1]})</Radio>
              <Radio value={2}>已过审 ({stats[2]})</Radio>
              <Radio value={3}>已拒绝 ({stats[3]})</Radio>
              <Radio value={0}>草稿 ({stats[0]})</Radio>
              <Radio value={4}>已删除 ({stats[4]})</Radio>
            </Radio.Group>
          </div>
          <div className="card chart-card">
            <div className="card-title">审核统计</div>
            {/* 简单SVG环形图 */}
            <svg width="100%" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="48" stroke="#eee" strokeWidth="16" fill="none" />
              <circle cx="60" cy="60" r="48" stroke="#4caf50" strokeWidth="16" fill="none" strokeDasharray={`${(stats[2]/total)*301.6||0} 301.6`} strokeDashoffset="0" />
              <circle cx="60" cy="60" r="48" stroke="#ff9800" strokeWidth="16" fill="none" strokeDasharray={`${(stats[1]/total)*301.6||0} 301.6`} strokeDashoffset={`-${(stats[2]/total)*301.6||0}`} />
              <circle cx="60" cy="60" r="48" stroke="#f44336" strokeWidth="16" fill="none" strokeDasharray={`${(stats[3]/total)*301.6||0} 301.6`} strokeDashoffset={`-${((stats[2]+stats[1])/total)*301.6||0}`} />
            </svg>
            <div className="chart-legend">
              <span className="passed"></span>已过审
              <span className="pending"></span>待审核
              <span className="rejected"></span>已拒绝
            </div>
          </div>
          {/*
          <div className="card quick-card">
            <div className="card-title">快捷操作</div>
            <Button className="export-btn" onClick={()=>Taro.showToast({title:'导出成功',icon:'success'})}>导出审核报表</Button>
            <Button className="batch-pass-btn" disabled={selected.length===0} onClick={()=>handleBatch('approve')}>批量通过</Button>
            <Button className="batch-reject-btn" disabled={selected.length===0} onClick={()=>handleBatch('reject')}>批量拒绝</Button>
          </div>
          */}
        </div>
        {/* 右侧内容区 */}
        <div className="admin-content">
          <div className="result-title">搜索结果：共 {filteredPosts.length} 篇游记</div>
          <div className="travel-list">
            {filteredPosts.map(post => (
              <div className={`travel-card ${getStatusClass(post.status)}`} key={post.id}>
                <div className="card-header">
                  <div className="header-left">
                    <span className="travel-title">{post.title}</span>
                    <span className="travel-meta">{post.author} {post.date} 14:30</span>
                  </div>
                  <div className="header-status">
                    <span className={`status ${getStatusClass(post.status)}`}>
                      {getStatusText(post.status)}
                    </span>
                  </div>
                </div>
                <div className="card-desc">{post.desc}</div>
                <div className="card-img">
                  <div 
                    className="img-scroll"
                    onScroll={(e) => handleScroll(post.id, e)}
                  >
                    {post.img.map((imgUrl, index) => (
                      <img key={index} src={imgUrl} alt={`${post.title}-${index + 1}`} />
                    ))}
                  </div>
                  {post.img.length > 1 && (
                    <div className="scroll-indicator">
                      {post.img.map((_, index) => (
                        <span 
                          key={index} 
                          className={`dot ${index === (activeImageIndex[post.id] || 0) ? 'active' : ''}`}
                          onClick={(e) => scrollToImage(post.id, index, e)}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <span className="view-detail" onClick={() => handleViewDetail(post)}>查看详情</span>
                  <div className="card-actions">
                    {post.status === 1 && (
                      <Button type="primary" size="small" style={{ minWidth: '5vw' }} className="review-btn" onClick={() => handleViewDetail(post)}>审核</Button>
                    )}
                    <Button type="danger" size="small" style={{ minWidth: '5vw' }} className="delete-btn" onClick={() => handleDelete(post.id)}>删除</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 审核弹窗 */}
      {showReviewModal && currentPost && (
        <div className="review-modal">
          <div className="modal-content">
            <div className="modal-header">
              <div className="title">游记详情</div>
              <div className="close-btn" onClick={() => setShowReviewModal(false)}>×</div>
            </div>
            <div className="modal-body">
              <div className="info-item">
                <div className="modal-label">标题</div>
                <div className="value">{currentPost.title}</div>
              </div>
              <div className="info-item">
                <div className="modal-label">作者</div>
                <div className="value">{currentPost.author}</div>
              </div>
              <div className="info-item">
                <div className="modal-label">发布时间</div>
                <div className="value">{currentPost.date} 14:30</div>
              </div>
              <div className="info-item">
                <div className="modal-label">内容</div>
                <div className="content">{currentPost.desc}</div>
              </div>
              <div className="images">
                <div 
                  className="img-scroll"
                  onScroll={(e) => handleScroll(currentPost.id, e)}
                >
                  {currentPost.img.map((imgUrl, index) => (
                    <img key={index} src={imgUrl} alt={`${currentPost.title}-${index + 1}`} />
                  ))}
                </div>
                {currentPost.img.length > 1 && (
                  <div className="scroll-indicator">
                    {currentPost.img.map((_, index) => (
                      <span 
                        key={index} 
                        className={`dot ${index === (activeImageIndex[currentPost.id] || 0) ? 'active' : ''}`}
                        onClick={(e) => scrollToImage(currentPost.id, index, e)}
                      />
                    ))}
                  </div>
                )}
              </div>
              {/* 分割线 */}
              {currentPost.status === 1 && (
                <>
                  <hr style={{ margin: '1vh 0 0.5vh 0', border: 'none', borderTop: '1px solid #eee' }} />
                  <div className="modal-label review-reason-title">审核意见</div>
                  <TextArea
                    className="review-reason"
                    placeholder="请输入审核意见（可选）"
                    autoSize
                    value={reviewReason}
                    onChange={(val) => setReviewReason(val)}
                    style={{ marginTop: '0.5vh', marginBottom: '2vh' }}
                  />
                </>
              )}
            </div>
            {currentPost.status === 1 && (
              <div className="modal-footer">
                <Button type="primary" color="#4caf50" size="small" style={{ minWidth: '6vw' }} className="pass-btn" onClick={() => handleReview(2)}>通过</Button>
                <Button type="danger" size="small" style={{ minWidth: '6vw' }} className="reject-btn" onClick={() => handleReview(3)}>拒绝</Button>
                <Button type="default" size="small" style={{ minWidth: '6vw' }} className="cancel-btn" onClick={() => setShowReviewModal(false)}>取消</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 