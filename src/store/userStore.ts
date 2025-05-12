import { create } from 'zustand'
import Taro from '@tarojs/taro'

export interface UserProfile {
  nickname: string
  avatar: string
  travels: number
  likes: number
  bio?: string  // 设置为可选，允许为空
  gender: number // 0: 男, 1: 女, 2: 保密
  region: string
  birthday: string
}

interface UserState {
  profile: UserProfile
  token: string | null
  isLoggedIn: boolean
  updateProfile: (data: Partial<UserProfile>) => void
  setLoggedIn: (status: boolean) => void
  localLogin: (userData: { token: string, profile: UserProfile }) => void
  localLogout: () => void
  initFromStorage: () => boolean
}

// 默认用户数据
const defaultProfile: UserProfile = {
  avatar: '',
  nickname: '',
  travels: 0,
  likes: 0,
  bio: '',
  gender: 2,
  region: '',
  birthday: ''
}

// 创建store
export const useUserStore = create<UserState>((set, get) => {
  // 初始化时尝试从本地存储加载数据
  let initialProfile = defaultProfile;
  let initialToken = null;
  let initialLoggedIn = false;

  try {
    const token = Taro.getStorageSync('token');
    const profileStr = Taro.getStorageSync('userProfile');
    const isLoggedIn = Taro.getStorageSync('isLoggedIn') === 'true';

    if (token && profileStr && isLoggedIn) {
      initialToken = token;
      initialProfile = JSON.parse(profileStr);
      initialLoggedIn = true;
    }
  } catch (error) {
    console.error('初始化本地存储数据失败:', error);
  }

  return {
    profile: initialProfile,
    token: initialToken,
    isLoggedIn: initialLoggedIn,

    // 更新个人资料（同时更新状态和本地存储）
    updateProfile: (data) => {
      const state = get();
      const updatedProfile = {
        ...state.profile,
        ...data
      };

      // 更新本地存储
      try {
        Taro.setStorageSync('userProfile', JSON.stringify(updatedProfile));
      } catch (error) {
        console.error('更新本地存储失败:', error);
      }

      // 更新状态
      set({ profile: updatedProfile });
    },

    // 设置登录状态
    setLoggedIn: (status) => set(() => ({ isLoggedIn: status })),

    // 登录并保存用户信息到本地
    localLogin: (userData) => {
      // 更新状态
      set(() => ({
        isLoggedIn: true,
        token: userData.token,
        profile: userData.profile
      }));

      // 保存到本地存储
      try {
        Taro.setStorageSync('token', userData.token);
        Taro.setStorageSync('userProfile', JSON.stringify(userData.profile));
        Taro.setStorageSync('isLoggedIn', 'true');
      } catch (error) {
        console.error('保存登录信息到本地失败:', error);
      }
    },

    // 登出并清除本地用户信息
    localLogout: () => {
      // 清除状态
      set(() => ({
        isLoggedIn: false,
        token: null,
        profile: defaultProfile
      }));

      // 清除本地存储
      try {
        Taro.removeStorageSync('token');
        Taro.removeStorageSync('userProfile');
        Taro.removeStorageSync('isLoggedIn');
      } catch (error) {
        console.error('清除本地存储失败:', error);
      }
    },

    // 从本地存储初始化用户状态
    initFromStorage: () => {
      try {
        const token = Taro.getStorageSync('token');
        const profileStr = Taro.getStorageSync('userProfile');
        const isLoggedIn = Taro.getStorageSync('isLoggedIn') === 'true';

        if (token && profileStr && isLoggedIn) {
          const profile = JSON.parse(profileStr);
          set(() => ({
            token,
            profile,
            isLoggedIn
          }));
          return true;
        }
        return false;
      } catch (error) {
        console.error('从本地存储初始化失败:', error);
        return false;
      }
    }
  };
});
