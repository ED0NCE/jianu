import React, { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!username || !password) {
      Taro.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }

    // TODO: 调用登录接口
    Taro.request({
      url: 'YOUR_LOGIN_API',
      method: 'POST',
      data: { username, password },
      success: (res) => {
        if (res.data.success) {
          Taro.setStorageSync('adminToken', res.data.token);
          Taro.navigateTo({
            url: '/pages/admin/index'
          });
        } else {
          Taro.showToast({
            title: res.data.message || '登录失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        Taro.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  };

  return (
    <View className="admin-login">
      <View className="login-container">
        <View className="login-header">
          <Text className="title">管理员登录</Text>
        </View>
        <View className="login-form">
          <View className="form-item">
            <Text className="label">用户名</Text>
            <Input
              className="input"
              type="text"
              value={username}
              onInput={e => setUsername(e.detail.value)}
              placeholder="请输入用户名"
            />
          </View>
          <View className="form-item">
            <Text className="label">密码</Text>
            <Input
              className="input"
              type="password"
              value={password}
              onInput={e => setPassword(e.detail.value)}
              placeholder="请输入密码"
            />
          </View>
          <Button className="login-btn" onClick={handleLogin}>登录</Button>
        </View>
      </View>
    </View>
  );
};

export default AdminLogin; 