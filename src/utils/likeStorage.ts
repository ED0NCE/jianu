import Taro from '@tarojs/taro';
import type { WaterfallCardProps } from '../types/waterfallCard';

/**
 * 喜欢列表的存储键
 */
const STORAGE_KEY = 'likedTravelogues';

/**
 * 从本地存储获取喜欢列表
 * @returns 喜欢的游记数据列表
 */
export const getLikedTravelogues = (): WaterfallCardProps[] => {
  try {
    const likedStr = Taro.getStorageSync(STORAGE_KEY);
    return likedStr ? JSON.parse(likedStr) : [];
  } catch (error) {
    console.error('获取喜欢列表失败:', error);
    return [];
  }
};

/**
 * 检查游记是否被喜欢
 * @param id 游记ID
 * @returns 是否被喜欢
 */
export const isLiked = (id: string): boolean => {
  if (!id) return false;
  const likedList = getLikedTravelogues();
  return likedList.some(item => item.travel_id === id);
};

/**
 * 添加游记到喜欢列表
 * @param travelogue 游记数据
 */
export const addLikedTravelogue = (travelogue: WaterfallCardProps): void => {
  if (!travelogue || !travelogue.travel_id) return;

  try {
    const likedList = getLikedTravelogues();
    // 如果已存在，先移除旧的
    const filteredList = likedList.filter(item => item.travel_id !== travelogue.travel_id);
    // Add to the beginning of the list
    const newList = [travelogue, ...filteredList];
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(newList));
  } catch (error) {
    console.error('添加喜欢的游记失败', error);
  }
};


