import React, { useState, useCallback, useEffect } from 'react'
import Taro, { getCurrentPages, useRouter } from '@tarojs/taro'
import { View, Text, Input, Button, Image } from '@tarojs/components'
import { debounce } from 'lodash'
import './login.scss'
import { useUserStore } from '../../store/userStore'

import { UserOutline, CameraOutline,PicturesOutline } from 'antd-mobile-icons'
import { login, register } from '@/api/login'
import { UserProfile } from '@/store/userStore'
import type{ ApiResponse } from '@/types/user'
const LoginPage: React.FC = () => {
  const [avatar, setAvatar] = useState<string>('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [state, setState] = useState<'login' | 'register'>('login')
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isUsernameRight, setIsUsernameRight] = useState<boolean>(true);
  const [returnUrl, setReturnUrl] = useState<string>(''); // 记录返回的URL

  // 引入用户store
  const { localLogin } = useUserStore()
  // 获取路由参数
  const router = useRouter();

  useEffect(() => {
    // 获取returnUrl参数
    if (router.params && router.params.returnUrl) {
      console.log(router.params.returnUrl)
      // 确保returnUrl有正确的格式（以/开头）
      let formattedUrl = decodeURIComponent(router.params.returnUrl as string);
      if (!formattedUrl.startsWith('/')) {
        formattedUrl = '/' + formattedUrl;
      }
      setReturnUrl(formattedUrl);
    }
  }, [router.params]);

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
  const handleRegisterOrLogin = async(state: string) => {
    if (formValidate(state)) {
      // 校验成功，则发请求
      if(state === 'login') {
        // 显示加载
        Taro.showLoading({ title: '登录中...' })
        try {
          // const res = await login({
          //   username,
          //   password
          // }) as { data: { token: string, profile: UserProfile } }
          const res = {
            status: 200,
            message: '登录成功',
            data: {
                "token": "est Ut",
                "profile": {
                    "nickname": "骑中海",
                    "avatar": "https://avatars.githubusercontent.com/u/42030813",
                    "travels": 123,
                    "likes": 250,
                    "bio": "长椅粉丝，哲学家🐭",
                    "gender": 0,
                    "region": "华南",
                    "birthday": "2025-02-07"
                }
            }
          }
          // 存入本地和store
          localLogin({ token: res.data.token, profile: res.data.profile })
          Taro.hideLoading()
        }catch (err) {
          console.error(err)
          Taro.hideLoading()
          Taro.showToast({
            title: '登录失败',
            icon: 'none',
            duration: 500
          })
          return
        }
      } else {
        // 注册接口
        Taro.showLoading({ title: '注册中...' })
        try {
          // const res = await register({ nickname: username, password, avatar }) as ApiResponse
          const res = {
            status: 200,
            message: '注册成功',
            data: {
              "token": "est Ut",
              "profile": {
                "nickname": "骑中海",
                "avatar": "https://avatars.githubusercontent.com/u/42030813",
                "travels": 123,
                "likes": 2500,
                "bio": "长椅粉丝，哲学家🐭",
                "gender": 0,
                "region": "华南",
                "birthday": "2025-02-07"
              }
            }
          }
          localLogin({ token: res.data.token, profile: res.data.profile })
          Taro.hideLoading()
        }catch (err) {
          console.error(err)
          Taro.hideLoading()
          Taro.showToast({
            title: '注册失败',
            icon: 'none',
            duration: 500
          })
          return
        }
      }
      Taro.showToast({
        title: state === 'login' ? '登录成功' : '注册成功',
        icon: 'success',
        duration: 500,
        success: () => {
          // 获取页面历史
          const pages = getCurrentPages()

          console.log(returnUrl)
          // 如果有返回地址参数，优先使用它
          if (returnUrl) {
            setTimeout(() => {
              // 确保returnUrl格式正确
              Taro.redirectTo({
                url: returnUrl
              })
            }, 600)
            return;
          }

          // 如果有上一个页面，则返回
          if (pages.length > 1) {
            setTimeout(() => {
              Taro.navigateBack()
            }, 600)
          } else {
            // 否则跳转到首页
            setTimeout(() => {
              Taro.redirectTo({
                url: '/pages/index/index'
              })
            }, 600)
          }
        }
      })
    }
  }

  // 表单校验
  const formValidate = (state: string) => {
    // 确认密码校验（仅在注册时）
    if (state === 'register') {
      if (!avatar) {
        Taro.showToast({
          title: '请上传头像',
          icon: 'none'
        });
        return false;
      }
      if (!username || !isUsernameAvailable || !isUsernameRight) {
        Taro.showToast({
          title: '请输入正确的用户名',
          icon: 'none'
        })
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
    // 密码校验
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,15}$/;
    if (!passwordRegex.test(password)) {
      Taro.showToast({
        title: '密码必须包含至少一个字母和一个数字，且长度为6到15个字符',
        icon: 'none'
      })
      return false;
    }
    return true
  }
  // 检查用户名是否可用
  const checkUsername = async(username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    if (!usernameRegex.test(username)) {
      setIsUsernameRight(false);
    }else {
      setIsUsernameRight(true);
    }
    try {
      await register({ nickname: username })
      setIsUsernameAvailable(true);
    }catch (err) {
      console.error('用户名重复', err);
      setIsUsernameAvailable(true); // 如果请求失败，默认认为用户名不可用
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

