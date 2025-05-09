import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'

import { UserOutline, CompassOutline, AddCircleOutline } from 'antd-mobile-icons'
const CustomTabBar = () => {
  const router = useRouter();
  const [selected, setSelected] = useState(0);

  const tabs = [
    { path: '/pages/index/index', name: '游记', icon: <CompassOutline className='icon icon-index'/>},
    { path: '/pages/edit/edit',   name: '发布', icon: <AddCircleOutline className='icon icon-add'/> },
    { path: '/pages/personal/personal', name: '我的',icon: <UserOutline className='icon icon-user'/> },
  ];

  useDidShow(() => {
    const current = router.path.split('?')[0];
    const idx = tabs.findIndex(tab => tab.path === current);
    if (idx >= 0) setSelected(idx);
  });
  const switchTab = (index: number) => {
    // 直接通过 Taro.getCurrentInstance().router 拿最新路由
    const inst = Taro.getCurrentInstance();
    const current = inst?.router?.path?.split('?')[0] || '';
    if (current === tabs[index].path) return;
    Taro.redirectTo({ url: tabs[index].path });
  };

  return (
    <View className="tab-bar">
      {tabs.map((tab, index) => (
        <View
          key={tab.path}
          className={`tab-item ${selected === index ? 'active' : ''}`}
          onClick={() => switchTab(index) }
        >
          {tab.icon}
          <Text className={`tab-text ${ index === 1 ? 'edit-text' : ''}`}>{tab.name}</Text>
        </View>
      ))}
    </View>
  );
};

export default CustomTabBar;
