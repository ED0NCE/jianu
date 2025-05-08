import React, { useState, useEffect } from 'react'
import { View, ScrollView, Text } from '@tarojs/components'
import { SearchBar, Empty, List, SwipeAction } from 'antd-mobile'
import Taro from '@tarojs/taro'
import WaterfallCard, { WaterfallCardProps } from '../../components/WaterfallCard/WaterfallCard'
import './search.scss'

const SearchPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<WaterfallCardProps[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // 获取搜索历史
  useEffect(() => {
    const history = Taro.getStorageSync('searchHistory') || []
    setSearchHistory(history)
  }, [])

  // 保存搜索历史
  const saveSearchHistory = (keyword: string) => {
    if (!keyword.trim()) return
    
    const history = [...searchHistory]
    // 如果已存在相同关键词，先移除
    const index = history.indexOf(keyword)
    if (index !== -1) {
      history.splice(index, 1)
    }
    // 将新关键词添加到开头
    history.unshift(keyword)
    // 只保留最近10条
    const newHistory = history.slice(0, 10)
    setSearchHistory(newHistory)
    Taro.setStorageSync('searchHistory', newHistory)
  }

  // 清空单条搜索历史
  const removeHistoryItem = (index: number) => {
    const newHistory = [...searchHistory]
    newHistory.splice(index, 1)
    setSearchHistory(newHistory)
    Taro.setStorageSync('searchHistory', newHistory)
  }

  // 清空所有搜索历史
  const clearAllHistory = () => {
    setSearchHistory([])
    Taro.removeStorageSync('searchHistory')
  }

  // 执行搜索
  const handleSearch = (value: string) => {
    if (!value.trim()) return
    
    setSearchValue(value)
    saveSearchHistory(value)
    setHasSearched(true)
    
    // TODO: 替换为实际API调用
    // 模拟搜索结果 - 在实际应用中，这里应该调用后端API
    const mockResults = [
      // 模拟搜索结果数据，这里假设根据游记标题或用户昵称过滤
      {
        tag: '日本',
        imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
        title: `${value}相关的游记`,
        days: 7,
        people: 2,
        cost: '15k',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        nickname: `与${value}相关的用户`,
        likes: 2800,
      },
      {
        tag: '马尔代夫',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        title: `含有${value}的另一个游记`,
        days: 5,
        people: 2,
        cost: '30k',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        nickname: '旅行者',
        likes: 4500,
      }
    ]
    
    setSearchResults(mockResults)
  }

  // 点击历史记录进行搜索
  const searchFromHistory = (keyword: string) => {
    setSearchValue(keyword)
    handleSearch(keyword)
  }

  const handleLikeChange = (index: number, newLikes: number) => {
    setSearchResults(prevResults => {
      const updatedResults = [...prevResults]
      updatedResults[index].likes = newLikes
      return updatedResults
    })
  }

  return (
    <View className="page search-page">
      {/* 顶部搜索框 */}
      <View className="search-header">
        <SearchBar
          value={searchValue}
          placeholder="搜索游记/用户昵称"
          onSearch={handleSearch}
          onChange={setSearchValue}
          className="search-input"
        />
        <Text className="cancel-btn" onClick={() => Taro.navigateBack()}>取消</Text>
      </View>

      {/* 内容区域 */}
      <ScrollView scrollY className="search-content">
        {/* 搜索历史区域 */}
        {!hasSearched && searchHistory.length > 0 && (
          <View className="search-history">
            <View className="history-header">
              <Text className="history-title">搜索历史</Text>
              <Text className="clear-history" onClick={clearAllHistory}>清空</Text>
            </View>
            <View className="history-list">
              {searchHistory.map((item, index) => (
                <SwipeAction
                  key={index}
                  rightActions={[
                    {
                      key: 'delete',
                      text: '删除',
                      color: 'danger',
                      onClick: () => removeHistoryItem(index)
                    }
                  ]}
                >
                  <View className="history-item" onClick={() => searchFromHistory(item)}>
                    <Text>{item}</Text>
                  </View>
                </SwipeAction>
              ))}
            </View>
          </View>
        )}

        {/* 搜索结果区域 */}
        {hasSearched && (
          <View className="search-results">
            {searchResults.length > 0 ? (
              <View className="result-list">
                <Text className="result-title">搜索结果</Text>
                <View className="wf-container">
                  <View className="wf-column">
                    {searchResults.filter((_, i) => i % 2 === 0).map((item, idx) => (
                      <WaterfallCard 
                        key={idx} 
                        {...item} 
                        onLikeChange={(newLikes) => handleLikeChange(idx * 2, newLikes)}
                      />
                    ))}
                  </View>
                  <View className="wf-column">
                    {searchResults.filter((_, i) => i % 2 === 1).map((item, idx) => (
                      <WaterfallCard 
                        key={idx} 
                        {...item} 
                        onLikeChange={(newLikes) => handleLikeChange(idx * 2 + 1, newLikes)}
                      />
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              <Empty description="暂无搜索结果" />
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default SearchPage 