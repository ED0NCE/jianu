import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface AdminProfile {
  adminId: string
  role: string
}

interface AdminState {
  profile: AdminProfile | null
  isLoggedIn: boolean
  updateProfile: (data: Partial<AdminProfile>) => void
  setLoggedIn: (status: boolean) => void
  logout: () => void
}

// 创建持久化的 store
export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      // 初始状态
      profile: null,
      isLoggedIn: false,

      // 更新管理员资料
      updateProfile: (data) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          ...data
        } : data as AdminProfile
      })),

      // 设置登录状态
      setLoggedIn: (status) => set(() => ({ isLoggedIn: status })),

      // 登出
      logout: () => set(() => ({
        profile: null,
        isLoggedIn: false
      }))
    }),
    {
      name: 'admin-storage', // 存储的键名
      storage: createJSONStorage(() => localStorage), // 使用 localStorage 存储
      partialize: (state) => ({ // 只持久化这些字段
        profile: state.profile,
        isLoggedIn: state.isLoggedIn
      })
    }
  )
) 