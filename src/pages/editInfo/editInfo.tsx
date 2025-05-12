import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, Input, Picker, Form, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './editInfo.scss'
import { useUserStore } from '../../store/userStore'
import { checkLogin } from '../../utils/auth'
import { debounce } from 'lodash'

import { Button } from 'antd-mobile'
import { updateUserInfo } from '@/api/user'
import { register } from '@/api/login'
// 中国省份列表
const provinces = [
  '北京市', '上海市', '天津市', '重庆市', '河北省', '山西省', '辽宁省',
  '吉林省', '黑龙江省', '江苏省', '浙江省', '安徽省', '福建省', '江西省',
  '山东省', '河南省', '湖北省', '湖南省', '广东省', '海南省', '四川省',
  '贵州省', '云南省', '陕西省', '甘肃省', '青海省', '台湾省', '内蒙古自治区',
  '广西壮族自治区', '西藏自治区', '宁夏回族自治区', '新疆维吾尔自治区', '香港特别行政区', '澳门特别行政区'
]

// 性别选项
const genders = ['男', '女', '保密']

interface UserInfo {
  nickname: string
  bio?: string
  gender: number // 0: 男, 1: 女, 2: 保密
  region: string
  birthday: string
  oldPassword?: string
  newPassword?: string
  confirmPassword?: string
}

const EditInfoPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    nickname: '',
    bio: '',
    gender: 2,
    region: '',
    birthday: ''
  })

  // const [changePassword, setChangePassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<boolean | null>(null)
  const [originalNickname, setOriginalNickname] = useState('')

  // 获取全局状态更新方法和用户信息
  const { profile, updateProfile } = useUserStore();

  // 检查登录状态并初始化表单数据
  useEffect(() => {
    // 检查用户是否已登录
    const isLoggedIn = checkLogin();

    // 如果已登录，从全局状态获取用户信息
    if (isLoggedIn) {
      setUserInfo({
        nickname: profile.nickname,
        bio: profile.bio || '',
        gender: profile.gender,
        region: profile.region,
        birthday: profile.birthday
      });
      setOriginalNickname(profile.nickname);
    }
  }, []); // 只在组件挂载时执行一次

  // 检查用户名是否可用
  const checkNickname = async(nickname: string) => {
    // 如果用户名与原用户名相同，不需要检查
    if (nickname === originalNickname) {
      setIsNicknameAvailable(true);
      return true;
    }

    try {
      await register({nickname})
      setIsNicknameAvailable(true);
      return true;
    } catch (error) {
      console.error('用户名重复', error);
      setIsNicknameAvailable(false);
      return false;
    }
  }

  // 防抖处理用户名检查
  const debouncedCheckNickname = useCallback(
    debounce(checkNickname, 500, { leading: false, trailing: true }),
    [originalNickname]
  );

  // 处理用户名变更
  const handleNameChange = (e) => {
    const value = e.detail.value;
    setUserInfo({
      ...userInfo,
      nickname: value
    });

    if (value.trim()) {
      debouncedCheckNickname(value);
    } else {
      setIsNicknameAvailable(null);
    }
  }

  // 处理个人简介变更
  const handleBioChange = (e) => {
    setUserInfo({
      ...userInfo,
      bio: e.detail.value
    })
  }

  // 处理性别选择
  const handleGenderChange = (e) => {
    setUserInfo({
      ...userInfo,
      gender: parseInt(e.detail.value)
    })
  }

  // 处理地区选择
  const handleRegionChange = (e) => {
    setUserInfo({
      ...userInfo,
      region: provinces[e.detail.value]
    })
  }

  // 处理生日选择
  const handleBirthdayChange = (e) => {
    setUserInfo({
      ...userInfo,
      birthday: e.detail.value
    })
  }

  // // 处理旧密码输入
  // const handleOldPasswordChange = (e) => {
  //   setUserInfo({
  //     ...userInfo,
  //     oldPassword: e.detail.value
  //   })
  // }

  // // 处理新密码输入
  // const handleNewPasswordChange = (e) => {
  //   setUserInfo({
  //     ...userInfo,
  //     newPassword: e.detail.value
  //   })
  // }

  // // 处理确认密码输入
  // const handleConfirmPasswordChange = (e) => {
  //   setUserInfo({
  //     ...userInfo,
  //     confirmPassword: e.detail.value
  //   })
  // }

  // 表单提交
  const handleSubmit = async () => {
    // 表单验证
    if (!userInfo.nickname.trim()) {
      Taro.showToast({
        title: '用户名不能为空',
        icon: 'none'
      })
      return
    }

    // 检查用户名是否可用
    if (isNicknameAvailable === false) {
      Taro.showToast({
        title: '用户名已存在，请更换',
        icon: 'none'
      })
      return
    }

    // 检查用户名是否与原用户名不同且尚未验证
    if (userInfo.nickname !== originalNickname && isNicknameAvailable === null) {
      const isAvailable = await checkNickname(userInfo.nickname);
      if (!isAvailable) {
        Taro.showToast({
          title: '用户名已存在，请更换',
          icon: 'none'
        })
        return;
      }
    }



    // 提交数据
    setLoading(true)

    // 构建提交的数据对象，排除密码相关字段
    const submitData = {
      nickname: userInfo.nickname,
      bio: userInfo.bio,
      gender: userInfo.gender,
      region: userInfo.region,
      birthday: userInfo.birthday
    }


    setLoading(false)

    // 更新全局状态（会自动更新到本地存储）
    try{
      // await updateUserInfo({
      //   ...userInfo})
      updateProfile({
        nickname: userInfo.nickname,
        bio: userInfo.bio,
        gender: userInfo.gender,
        region: userInfo.region,
        birthday: userInfo.birthday
      })
      Taro.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            // 返回到个人信息页
            Taro.redirectTo({
              url: '/pages/personal/personal'
            });
          }, 2000)
        }
      })
    } catch (error) {
      console.error('更新用户信息失败:', error);
      Taro.showToast({
        title: '更新失败',
        icon: 'none'
      });
      return
    }
  }

  // 取消修改，返回上一页
  const handleCancel = () => {
    Taro.navigateBack()
  }

  // 返回上一页
  const handleBack = () => {
    Taro.navigateBack()
  }

  // 组件销毁时清除防抖函数
  useEffect(() => {
    return () => {
      debouncedCheckNickname.cancel();
    };
  }, [debouncedCheckNickname]);

  return (
    <View className='edit-info-page'>
      {/* 导航栏 */}
      <View className='nav-bar'>
        <View className='nav-bar-left' onClick={handleBack}>
          <View className='back-icon' />
        </View>
        <View className='nav-bar-title'>编辑资料</View>
      </View>

      <View className='page-content'>
        <Form className='info-form'>
          {/* 用户名 */}
          <View className='form-item'>
            <Text className='form-label'>用户名</Text>
            <Input
              className='form-input'
              value={userInfo.nickname}
              onInput={handleNameChange}
              placeholder='请输入用户名'
              maxlength={20}
            />
            {isNicknameAvailable === false && (
              <Text className='error-text'>用户名已存在，请更换</Text>
            )}
            {isNicknameAvailable === true && userInfo.nickname !== originalNickname && (
              <Text className='success-text'>用户名可用</Text>
            )}
          </View>

          {/* 个人简介 */}
          <View className='form-item'>
            <Text className='form-label'>个人简介</Text>
            <Textarea
              className='form-textarea'
              value={userInfo.bio}
              onInput={handleBioChange}
              placeholder='介绍一下自己吧'
              maxlength={200}
            />
            <Text className='char-count'>{userInfo.bio?.length}/200</Text>
          </View>

          {/* 性别 */}
          <View className='form-item'>
            <Text className='form-label'>性别</Text>
            <Picker
              mode='selector'
              range={genders}
              value={userInfo.gender}
              onChange={handleGenderChange}
            >
              <View className='picker-value'>
                {genders[userInfo.gender]}
                <View className='arrow-right' />
              </View>
            </Picker>
          </View>

          {/* 地区 */}
          <View className='form-item'>
            <Text className='form-label'>地区</Text>
            <Picker
              mode='selector'
              range={provinces}
              value={provinces.indexOf(userInfo.region)}
              onChange={handleRegionChange}
            >
              <View className='picker-value'>
                {userInfo.region}
                <View className='arrow-right' />
              </View>
            </Picker>
          </View>

          {/* 生日 */}
          <View className='form-item'>
            <Text className='form-label'>生日</Text>
            <Picker
              mode='date'
              value={userInfo.birthday}
              onChange={handleBirthdayChange}
              start='1900-01-01'
              end='2023-12-31'
            >
              <View className='picker-value'>
                {userInfo.birthday}
                <View className='arrow-right' />
              </View>
            </Picker>
          </View>

          {/* 密码修改 */}
          {/* <View className='form-section'>
            <View className='section-header' onClick={() => setChangePassword(!changePassword)}>
              <Text className='section-title'>修改密码</Text>
              <View className={`toggle-icon ${changePassword ? 'active' : ''}`} />
            </View> */}

            {/* {changePassword && (
              <View className='password-section'>
                <View className='form-item'>
                  <Text className='form-label'>旧密码</Text>
                  <Input
                    className='form-input'
                    password
                    value={userInfo.oldPassword || ''}
                    onInput={handleOldPasswordChange}
                    placeholder='请输入旧密码'
                  />
                </View>

                <View className='form-item'>
                  <Text className='form-label'>新密码</Text>
                  <Input
                    className='form-input'
                    password
                    value={userInfo.newPassword || ''}
                    onInput={handleNewPasswordChange}
                    placeholder='请输入新密码'
                  />
                </View>

                <View className='form-item'>
                  <Text className='form-label'>确认新密码</Text>
                  <Input
                    className='form-input'
                    password
                    value={userInfo.confirmPassword || ''}
                    onInput={handleConfirmPasswordChange}
                    placeholder='请再次输入新密码'
                  />
                </View>
              </View>
            )} */}
          {/* </View> */}

          {/* 按钮区 */}
          <View className='form-buttons'>
            <View className='btn-cancel'><Button color='primary' fill='outline' onClick={handleCancel}>取消</Button></View>
            <View className='btn-submit'><Button color='primary' fill='solid' loading={loading} onClick={handleSubmit}>保存</Button></View>
          </View>
        </Form>
      </View>
    </View>
  )
}

export default EditInfoPage
