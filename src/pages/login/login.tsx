<<<<<<< HEAD
import React, { useState, useCallback, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Input, Button, Image } from '@tarojs/components'
import { debounce } from 'lodash'
import './login.scss'

import { UserOutline, CameraOutline,PicturesOutline } from 'antd-mobile-icons'

const LoginPage: React.FC = () => {
  const [avatar, setAvatar] = useState<string>('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [state, setState] = useState<'login' | 'register'>('login')
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isUsernameRight, setIsUsernameRight] = useState<boolean>(true);
  // 处理上传头像
  const chooseAvatar = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      if (res.tempFilePaths.length > 0) {
        setAvatar(res.tempFilePaths[0])
      }
    } catch (err) {
      console.error(err)
    }
  }

  // 点击登录/注册
  const handleRegisterOrLogin = (state: string) => {
    if (formValidate(state)) {
      // 校验成功，则发请求
      // TODO: 调用注册接口
      if(state === 'login') {
        // 登录接口--用户名密码后端校验
        console.log('登录信息：', { username, password })
      }else {
        // 注册接口
        console.log('注册信息：', { username, password, confirmPwd, avatar })
      }
      Taro.navigateTo({
        url: '/pages/index/index'
      })
    }
  }

  // 表单校验
  const formValidate = (state: string) => {
    // 密码校验
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,15}$/;
    if (!passwordRegex.test(password)) {
      Taro.showToast({
        title: '密码必须包含至少一个字母和一个数字，且长度为6到15个字符',
        icon: 'none'
      })
      return false;
    }
    // 确认密码校验（仅在注册时）
    if (state === 'register') {
      if (!avatar) {
        Taro.showToast({
          title: '请上传头像',
          icon: 'none'
        });
        return false;
      }
      if (password !== confirmPwd) {
        Taro.showToast({
          title: '两次输入的密码不一致',
          icon: 'none'
        });
        return false;
      }
    }
    return true
  }
  // 检查用户名是否可用
  const checkUsername =  (username: string) => {
    // try {
    //   const res = await Taro.request({
    //     url: '/api/checkUsername',
    //     method: 'POST',
    //     data: { username },
    //   });
    //   setIsUsernameAvailable(res.data.isAvailable); // 假设后端返回 { isAvailable: boolean }
    // } catch (err) {
    //   console.error('检查用户名失败', err);
    //   setIsUsernameAvailable(false); // 如果请求失败，默认认为用户名不可用
    // }
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    if (!usernameRegex.test(username)) {
      setIsUsernameRight(false);
    }else {
      setIsUsernameRight(true);
    }
    // 模拟
    if (username === 'yanshil') {
      setIsUsernameAvailable(false)
    } else {
      setIsUsernameAvailable(true)
    }
  }

  // 防抖后的用户名校验函数，useCallback包裹，确保组件重新渲染时不会重新创建函数实例
  const debouncedCheckUsername = useCallback(
    debounce(checkUsername, 500, { leading: false, trailing: true }),
    [] // 依赖项为空数组，确保防抖函数在组件生命周期内只创建一次
  );

  // 处理用户名输入
  const handleUsernameInput = (e: any) => {
    const value = e.detail.value as string;
    setUsername(value);
    if (state === 'register') {
      if (value.trim()) {
        debouncedCheckUsername(value); // 调用防抖后的校验函数
      } else {
        setIsUsernameAvailable(null); // 清空校验状态
      }
    }
  };

  // 切换状态
  const handleToggle = () => {
    if(state === 'login') {
      setState('register')
    }else {
      setState('login')
    }
  }

  // 组件销毁时清除防抖函数
  useEffect(() => {
    // 清除防抖
    return () => {
      debouncedCheckUsername.cancel();
    };
  }, [debouncedCheckUsername]);

  return (
    <View className="page-register">

      {/* logo */}
      <View className='logo-container'>
        <View className='logo'>
        </View>
      </View>

      {/* 上传头像/登录图标显示 */}
      { state === 'register' ? (
        <View className="avatar-wrapper" onClick={chooseAvatar}>
        {avatar ? (<Image
          className="avatar"
          src={avatar}
          mode="aspectFill"
        />) : (
          <PicturesOutline
            className="avatar-placeholder"
            mode="aspectFill"
          />)}
        <View className="avatar-overlay">
          <CameraOutline
            className="camera-icon"
            mode="widthFix"
            color='#1a202c'
          />
        </View>
        <Text className="avatar-text">点击上传头像</Text>
      </View>
    ): (
      <View className="logo-icon">
        <UserOutline className='icon-useroutline' mode='aspectFill'/>
        <Text className="icon-text">用户登录</Text>
      </View>
    )}

      {/* 表单输入项 */}
      <View className="form">
        <View className="form-item">
          <Text className="label">用户名</Text>
          <Input
            className="input"
            placeholder="请输入用户名"
            value={username}
            onInput={handleUsernameInput}
          />
          {isUsernameAvailable === false && isUsernameRight === true && (
            <Text className="error-text">用户名已存在，请更换</Text>
          )}
          {isUsernameAvailable === true && isUsernameRight === false && (
            <Text className="error-text">用户名只能包含字母、数字和下划线，且长度为3到15个字符</Text>
          )}
          {isUsernameAvailable === true && isUsernameRight === true &&(
            <Text className="success-text">用户名可用</Text>
          )}
        </View>

        <View className="form-item">
          <Text className="label">密码</Text>
          <Input
            className="input"
            placeholder="请输入密码"
            password
            value={password}
            onInput={e => setPassword(e.detail.value)}
          />
        </View>

        { state === 'register' && (
          <View className="form-item">
            <Text className="label">确认密码</Text>
            <Input
              className="input"
              placeholder="请再次输入密码"
              password
              value={confirmPwd}
              onInput={e => setConfirmPwd(e.detail.value)}
            />
          </View>
        )}
      </View>

      {/* 注册按钮 */}
      <Button className="btn-submit" onClick={() => handleRegisterOrLogin(state)}>
        {state === 'register' ? '注册' : '登录'}
      </Button>

      {/* 底部跳转提示 */}
      <View className="footer-tips">
        <Text>
          { state === 'register' ? '已有账号？' : '还没有账号？'}
        </Text>
        <Text className="link" onClick={handleToggle}>
          { state === 'register' ? '立即登录' : '立即注册'}
        </Text>
      </View>
    </View>
  )
}

export default LoginPage

=======
import React from 'react';
import './login.scss';

const Login: React.FC = () => {
  return (
    <div className="login-container">
      <h1>Login Page</h1>
    </div>
  );
};

export default Login; 
>>>>>>> a8427a0291c2a259c1bb4b33480604a96e069aa2
