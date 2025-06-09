import { View, Input, Button } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { useAdminStore } from '../../store/adminStore';
import { adminLogin } from '../../api/admin';
import './adminLogin.scss';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { setLoggedIn, updateProfile } = useAdminStore();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Taro.showToast({
        title: '请输入用户名和密码',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    setLoading(true);
    try {
      // 调用登录接口
      const response = await adminLogin({
        username,
        password
      });

      // 后端返回格式为 { adminId: string, role: string }
      const { adminId, role } = response.data;

      // 更新状态
      updateProfile({ adminId, role });
      setLoggedIn(true);

      Taro.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000
      });

      // 登录成功后跳转到管理页面
      setTimeout(() => {
        Taro.redirectTo({
          url: '/pages/admin/admin'
        });
      }, 2000);

    } catch (error) {
      console.error('登录失败:', error);
      Taro.showToast({
        title: '用户名或密码错误',
        icon: 'error',
        duration: 2000
      });
    } finally {
      setLoading(false);
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
        <Button 
          className='login-btn' 
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? '登录中...' : '登录'}
        </Button>
      </View>
    </View>
  );
};

export default AdminLogin;
