import React, { useEffect, useState } from 'react';
import { View, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './admin.scss';

interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  desc: string;
  img: string;
  status: 'passed' | 'pending' | 'rejected';
}

const statusMap = {
  all: '全部游记',
  pending: '待审核',
  passed: '已通过',
  rejected: '已拒绝',
};

const Admin: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({ passed: 0, pending: 0, rejected: 0 });
  const [statusFilter, setStatusFilter] = useState<'all'|'pending'|'passed'|'rejected'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'latest'|'hot'>('latest');
  const [selected, setSelected] = useState<string[]>([]);

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
        desc: '京都的樱花季总是让人心驰神往，这次我特意选择了哲学之道作为赏樱起点...',
        img: 'https://img.example.com/1.jpg',
        status: 'passed',
      },
      {
        id: '2',
        title: '云南大理古城深度游',
        author: '张远航',
        date: '2023-05-22',
        views: 876,
        likes: 215,
        desc: '在大理古城住了一整周，每天漫步在青石板路上，感受白族文化的独特魅力...',
        img: 'https://img.example.com/2.jpg',
        status: 'pending',
      },
      {
        id: '3',
        title: '西藏拉萨朝圣之旅',
        author: '王小明',
        date: '2023-06-10',
        views: 1500,
        likes: 400,
        desc: '布达拉宫的雄伟壮观令人震撼，八廓街的转经人流让人感受到信仰的力量...',
        img: 'https://img.example.com/3.jpg',
        status: 'pending',
      },
      {
        id: '4',
        title: '厦门鼓浪屿慢生活',
        author: '李晓霞',
        date: '2023-03-18',
        views: 600,
        likes: 120,
        desc: '鼓浪屿的咖啡馆和小巷子让人流连忘返，适合放慢脚步享受生活...',
        img: 'https://img.example.com/4.jpg',
        status: 'passed',
      },
      {
        id: '5',
        title: '新疆伊犁草原自驾游',
        author: '赵天宇',
        date: '2023-07-01',
        views: 980,
        likes: 300,
        desc: '伊犁的草原辽阔壮美，赛里木湖的蓝色令人陶醉...',
        img: 'https://img.example.com/5.jpg',
        status: 'rejected',
      },
      {
        id: '6',
        title: '青岛啤酒节狂欢记',
        author: '孙佳',
        date: '2023-08-12',
        views: 1100,
        likes: 250,
        desc: '青岛的夏天因为啤酒节而变得热闹非凡，海边的夜晚很美...',
        img: 'https://img.example.com/6.jpg',
        status: 'passed',
      },
    ];
    setPosts(mockPosts);
    setStats({
      passed: mockPosts.filter(p => p.status === 'passed').length,
      pending: mockPosts.filter(p => p.status === 'pending').length,
      rejected: mockPosts.filter(p => p.status === 'rejected').length,
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
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value as any)}>
            <option value="latest">最新发布</option>
            <option value="hot">最热</option>
          </select>
          <Button className="logout-btn" onClick={() => Taro.redirectTo({ url: '/pages/admin/adminlogin' })}>退出登录</Button>
        </div>
      </div>
      <div className="admin-main">
        {/* 左侧栏 */}
        <div className="admin-sidebar">
          <div className="card status-card">
            <div className="card-title">审核状态</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li><input type="radio" checked={statusFilter==='all'} onChange={()=>setStatusFilter('all')} /> 全部游记 ({total})</li>
              <li><input type="radio" checked={statusFilter==='pending'} onChange={()=>setStatusFilter('pending')} /> 待审核 ({stats.pending})</li>
              <li><input type="radio" checked={statusFilter==='passed'} onChange={()=>setStatusFilter('passed')} /> 已通过 ({stats.passed})</li>
              <li><input type="radio" checked={statusFilter==='rejected'} onChange={()=>setStatusFilter('rejected')} /> 已拒绝 ({stats.rejected})</li>
            </ul>
          </div>
          <div className="card chart-card">
            <div className="card-title">审核统计</div>
            {/* 简单SVG环形图 */}
            <svg width="100%" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="48" stroke="#eee" strokeWidth="16" fill="none" />
              <circle cx="60" cy="60" r="48" stroke="#4caf50" strokeWidth="16" fill="none" strokeDasharray={`${(stats.passed/total)*301.6||0} 301.6`} strokeDashoffset="0" />
              <circle cx="60" cy="60" r="48" stroke="#ff9800" strokeWidth="16" fill="none" strokeDasharray={`${(stats.pending/total)*301.6||0} 301.6`} strokeDashoffset={`-${(stats.passed/total)*301.6||0}`} />
              <circle cx="60" cy="60" r="48" stroke="#f44336" strokeWidth="16" fill="none" strokeDasharray={`${(stats.rejected/total)*301.6||0} 301.6`} strokeDashoffset={`-${((stats.passed+stats.pending)/total)*301.6||0}`} />
            </svg>
            <div className="chart-legend">
              <span className="passed"></span>已通过
              <span className="pending"></span>待审核
              <span className="rejected"></span>已拒绝
            </div>
          </div>
          <div className="card quick-card">
            <div className="card-title">快捷操作</div>
            <Button className="export-btn" onClick={()=>Taro.showToast({title:'导出成功',icon:'success'})}>导出审核报表</Button>
            <Button className="batch-pass-btn" disabled={selected.length===0} onClick={()=>handleBatch('approve')}>批量通过</Button>
            <Button className="batch-reject-btn" disabled={selected.length===0} onClick={()=>handleBatch('reject')}>批量拒绝</Button>
          </div>
        </div>
        {/* 右侧内容区 */}
        <div className="admin-content">
          <div className="result-title">搜索结果：共 {filteredPosts.length} 篇游记</div>
          <div className="travel-list">
            {filteredPosts.map(post => (
              <div className={`travel-card ${post.status}`} key={post.id}>
                <div className="card-header">
                  <input type="checkbox" checked={selected.includes(post.id)} onChange={e => {
                    setSelected(sel => e.target.checked ? [...sel, post.id] : sel.filter(id => id !== post.id));
                  }} />
                  <span className="travel-title">{post.title}</span>
                  <span className="travel-meta">{post.author} {post.date} 14:30</span>
                  <span className={`status ${post.status}`}>{post.status === 'passed' ? '已通过' : post.status === 'pending' ? '待审核' : '已拒绝'}</span>
                </div>
                <div className="card-desc">{post.desc}</div>
                <div className="card-img"><img src={post.img} alt={post.title} /></div>
                <div className="card-actions">
                  <Button>查看详情</Button>
                  {post.status === 'pending' && (
                    <>
                      <Button className="pass-btn" onClick={() => handleApprove(post.id)}>通过</Button>
                      <Button className="reject-btn" onClick={() => handleReject(post.id)}>拒绝</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin; 