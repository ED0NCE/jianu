import Taro from '@tarojs/taro'
import { useUserStore } from '../store/userStore'

// 需要登录才能访问的页面路径
const authRequiredPages = [
  '/pages/personal/personal',
  '/pages/editInfo/editInfo',
  '/pages/edit/edit',
  '/pages/messages/messages'
]

/**
 * 检查当前页面是否需要登录权限
 * @param path 当前页面路径
 * @returns boolean
 */
export const isAuthRequired = (path: string): boolean => {
  if (!path) return false

  // 获取不包含参数的路径部分
  const cleanPath = path.split('?')[0]

  // 检查是否匹配任何需要权限的页面
  for (const authPath of authRequiredPages) {
    if (cleanPath === authPath || cleanPath.startsWith(authPath)) {
      return true
    }
  }

  return false
}

/**
 * 检查用户是否已登录，未登录则跳转到登录页
 * @param redirect 是否自动重定向到登录页
 * @returns boolean 用户是否已登录
 */
export const checkLogin = (redirect = true): boolean => {
  const { isLoggedIn, initFromStorage } = useUserStore.getState()

  // 如果已登录，直接返回true
  if (isLoggedIn) return true

  // 尝试从本地存储恢复登录状态
  initFromStorage()

  // 再次检查登录状态
  const currentLoginState = useUserStore.getState().isLoggedIn
  if (currentLoginState) return true

  // 如果需要重定向且未登录，跳转到登录页
  if (redirect) {
    Taro.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 1500,
      success: () => {
        setTimeout(() => {
          // 获取当前页面作为跳转参数，以便登录后能返回
          const pages = Taro.getCurrentPages()
          const currentPage = pages.length > 0 ? pages[pages.length - 1] : null
          let loginUrl = '/pages/login/login'

          // 如果有当前页面信息，添加返回地址参数
          if (currentPage && currentPage.route) {
            const returnUrl = currentPage.route
            loginUrl = `${loginUrl}?returnUrl=${encodeURIComponent(returnUrl)}`
          }

          Taro.navigateTo({
            url: loginUrl
          })
        }, 1500)
      }
    })
  }

  return false
}

/**
 * 检查是否为直接URL访问（非通过页面导航进入）
 * 通常用于判断在应用初始化阶段
 * @returns boolean
 */
export const isDirectAccess = (): boolean => {
  const pages = Taro.getCurrentPages()
  return pages.length === 1 // 只有一个页面说明是直接访问
}
