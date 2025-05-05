import React, { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'

const CustomTabBar = () => {
  const [selected, setSelected] = useState(0);

  const tabs = [
    { path: '/pages/index/index', name: '首页' },
    { path: '/pages/edit/edit', name: '编辑' },
    { path: '/pages/personal/personal', name: '个人' },
  ];

  const switchTab = (index: number) => {
    setSelected(index);
    Taro.switchTab({ url: tabs[index].path });
  };

  return (
    <View className="tab-bar">
      {tabs.map((tab, index) => (
        <View
          key={tab.path}
          className={`tab-item ${selected === index ? 'active' : ''}`}
          onClick={() => switchTab(index)}
        >
          <Text>{tab.name}</Text>
        </View>
      ))}
    </View>
  );
};

export default CustomTabBar;
