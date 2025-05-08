import { create } from 'zustand'

export interface UserProfile {
  userid: string
  avatar: string
  name: string
  travels: number
  likes: string
  bio?: string  // 设置为可选，允许为空
  gender: number // 0: 男, 1: 女, 2: 保密
  region: string
  birthday: string
}

interface UserState {
  profile: UserProfile
  isLoggedIn: boolean
  updateProfile: (data: Partial<UserProfile>) => void
  setLoggedIn: (status: boolean) => void
}

// 默认用户数据
const defaultProfile: UserProfile = {
  userid: 'user123',
  avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  name: '旅行达人小美',
  travels: 128,
  likes: '2.4k',
  bio: '热爱旅行和摄影的90后，去过30+国家，喜欢记录旅途中的美好瞬间。',
  gender: 1,
  region: '上海市',
  birthday: '1995-01-01'
}

// 创建store
export const useUserStore = create<UserState>((set) => ({
  profile: defaultProfile,
  isLoggedIn: true,
  
  // 更新个人资料
  updateProfile: (data) => set((state) => ({
    profile: {
      ...state.profile,
      ...data
    }
  })),
  
  // 设置登录状态
  setLoggedIn: (status) => set(() => ({ isLoggedIn: status }))
})) 