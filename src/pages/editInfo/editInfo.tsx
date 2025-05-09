import React, { useState, useEffect } from 'react'
import { View, Text, Input, Picker, Form, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './editInfo.scss'
import { useUserStore } from '../../store/userStore'
import { checkLogin } from '../../utils/auth'

import { Button } from 'antd-mobile'
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
  userid: string
  name: string
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
    userid: 'user123',
    name: '旅行达人小美',
    bio: '热爱旅行和摄影的90后，去过30+国家，喜欢记录旅途中的美好瞬间。',
    gender: 1,
    region: '上海市',
    birthday: '1995-01-01'
  })

  const [changePassword, setChangePassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // 获取全局状态更新方法和用户信息
  const { profile, updateProfile } = useUserStore();

  // 检查登录状态并初始化表单数据
  useEffect(() => {
    // 检查用户是否已登录
    const isLoggedIn = checkLogin();

    // 如果已登录，从全局状态获取用户信息
    if (isLoggedIn) {
      setUserInfo({
        userid: profile.userid,
        name: profile.name,
        bio: profile.bio || '',
        gender: profile.gender,
        region: profile.region,
        birthday: profile.birthday
      });
    }
  }, []); // 只在组件挂载时执行一次

  // 处理用户名变更
  const handleNameChange = (e) => {
    setUserInfo({
      ...userInfo,
      name: e.detail.value
    })
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

  // 处理旧密码输入
  const handleOldPasswordChange = (e) => {
    setUserInfo({
      ...userInfo,
      oldPassword: e.detail.value
    })
  }

  // 处理新密码输入
  const handleNewPasswordChange = (e) => {
    setUserInfo({
      ...userInfo,
      newPassword: e.detail.value
    })
  }

  // 处理确认密码输入
  const handleConfirmPasswordChange = (e) => {
    setUserInfo({
      ...userInfo,
      confirmPassword: e.detail.value
    })
  }

  // 表单提交
  const handleSubmit = () => {
    // 表单验证
    if (!userInfo.name.trim()) {
      Taro.showToast({
        title: '用户名不能为空',
        icon: 'none'
      })
      return
    }

    if (changePassword) {
      if (!userInfo.oldPassword) {
        Taro.showToast({
          title: '请输入旧密码',
          icon: 'none'
        })
        return
      }

      if (!userInfo.newPassword) {
        Taro.showToast({
          title: '请输入新密码',
          icon: 'none'
        })
        return
      }

      if (userInfo.newPassword !== userInfo.confirmPassword) {
        Taro.showToast({
          title: '两次输入的密码不一致',
          icon: 'none'
        })
        return
      }
    }

    // 提交数据
    setLoading(true)

    // 构建提交的数据对象，排除密码相关字段
    const submitData = {
      userid: userInfo.userid,
      name: userInfo.name,
      bio: userInfo.bio,
      gender: userInfo.gender,
      region: userInfo.region,
      birthday: userInfo.birthday
    }

    // 如果修改密码，添加密码相关字段
    if (changePassword) {
      Object.assign(submitData, {
        oldPassword: userInfo.oldPassword,
        newPassword: userInfo.newPassword
      })
    }

    // 模拟API请求
    setTimeout(() => {
      setLoading(false)

      // 更新全局状态（会自动更新到本地存储）
      updateProfile({
        name: userInfo.name,
        bio: userInfo.bio,
        gender: userInfo.gender,
        region: userInfo.region,
        birthday: userInfo.birthday
      });

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
    }, 1500)
  }

  // 取消修改，返回上一页
  const handleCancel = () => {
    Taro.navigateBack()
  }

  // 返回上一页
  const handleBack = () => {
    Taro.navigateBack()
  }

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
              value={userInfo.name}
              onInput={handleNameChange}
              placeholder='请输入用户名'
              maxlength={20}
            />
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
          <View className='form-section'>
            <View className='section-header' onClick={() => setChangePassword(!changePassword)}>
              <Text className='section-title'>修改密码</Text>
              <View className={`toggle-icon ${changePassword ? 'active' : ''}`} />
            </View>

            {changePassword && (
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
            )}
          </View>

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
