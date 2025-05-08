import { View, Input, Button } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import './adminLogin.scss';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // 这里简单实现，实际项目中应该调用后端API进行验证
    if (username === 'admin' && password === 'admin123') {
      Taro.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000
      });
      // 登录成功后跳转到管理页面
      Taro.navigateTo({
        url: '/pages/admin/admin'
      });
    } else {
      Taro.showToast({
        title: '用户名或密码错误',
        icon: 'error',
        duration: 2000
      });
    }
  };

  return (
    <View className='admin-login'>
      <View className='login-form'>
        <View className='form-item'>
          <Input
            type='text'
            placeholder='请输入用户名'
            value={username}
            onInput={e => setUsername(e.detail.value)}
          />
        </View>
        <View className='form-item'>
          <Input
            type='password'
            placeholder='请输入密码'
            value={password}
            onInput={e => setPassword(e.detail.value)}
          />
        </View>
        <Button className='login-btn' onClick={handleLogin}>
          登录
        </Button>
      </View>
    </View>
  );
};

export default AdminLogin;
