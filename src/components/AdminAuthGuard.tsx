import { FC, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useAdminStore } from '../store/adminStore'

interface Props {
  children: React.ReactNode
}

const AdminAuthGuard: FC<Props> = ({ children }) => {
  const { isLoggedIn, profile } = useAdminStore()

  useEffect(() => {
    // 检查登录状态
    if (!isLoggedIn || !profile?.adminId) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      })
      // 重定向到登录页
      setTimeout(() => {
        Taro.redirectTo({
          url: '/pages/admin/adminLogin'
        })
      }, 2000)
    }
  }, [isLoggedIn, profile])

  // 如果未登录，返回 null
  if (!isLoggedIn || !profile?.adminId) {
    return null
  }

  // 已登录则渲染子组件
  return <>{children}</>
}

export default AdminAuthGuard 