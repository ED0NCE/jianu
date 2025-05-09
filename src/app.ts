import React, { useEffect } from 'react'
import { useDidShow, useDidHide, getCurrentPages, getCurrentInstance, redirectTo } from '@tarojs/taro'
import { useUserStore } from './store/userStore'
import { isAuthRequired, checkLogin } from './utils/auth'
// 全局样式
import './app.scss'

function App(props) {
  // 初始化用户状态
  useEffect(() => {
    // 尝试从本地存储恢复用户登录状态
    const { initFromStorage } = useUserStore.getState()
    const isRestored = initFromStorage()

    // 获取当前页面路径 - 直接通过URL进入时getCurrentPages可能为空
    const instance = getCurrentInstance()
    const router = instance?.router
    const currentPath = router ? `/${router.path}` : ''

    // 如果有有效路径且需要登录权限，检查登录状态
    if (currentPath && isAuthRequired(currentPath)) {
      const isLoggedIn = useUserStore.getState().isLoggedIn
      if (!isLoggedIn) {
        // 重定向到登录页面
        redirectTo({
          url: '/pages/login/login'
        })
      }
    }
  }, [])

  // 对应 onShow - 在这里检查页面访问权限
  useDidShow(() => {
    // 获取当前页面路径
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      const currentPath = `/${currentPage.route}`

      // 如果当前页面需要登录权限，检查登录状态
      if (isAuthRequired(currentPath)) {
        checkLogin()
      }
    }
  })

  // 对应 onHide
  useDidHide(() => {})

  return props.children
}

export default App
